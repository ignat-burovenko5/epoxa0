/**
 * Scrape all epoxa.ru nav sections into src/data/epoxa-sections.json
 * Usage: node scripts/scrape-epoxa-sections.mjs
 */

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const OUT = path.join(ROOT, "src", "data", "epoxa-sections.json");

const BASE = "https://epoxa.ru";
const UA = "Mozilla/5.0 (compatible; SiteAudit/1.0)";

/** Site id, epoxa path(s), title, internal href */
const SECTIONS = [
  { id: "o-salone", paths: ["o-salone"], title: "О салоне", href: "/o-salone", kind: "page" },
  { id: "novosti", paths: ["news"], title: "Новости", href: "/novosti", kind: "blog", blogBase: "news" },
  { id: "skidki", paths: ["skidki"], title: "Скидки", href: "/skidki", kind: "page" },
  {
    id: "dostavka-i-oplata",
    paths: ["dostavka-i-oplata"],
    title: "Доставка и оплата",
    href: "/dostavka-i-oplata",
    kind: "page",
  },
  { id: "uslugi", paths: ["uslugi"], title: "Услуги", href: "/uslugi", kind: "blog-embed" },
  {
    id: "sotrudnichestvo",
    paths: ["sotrudnichestvo"],
    title: "Сотрудничество",
    href: "/sotrudnichestvo",
    kind: "page",
  },
  { id: "stati", paths: ["blog"], title: "Статьи", href: "/stati", kind: "blog", blogBase: "blog" },
  { id: "adres", paths: ["contact"], title: "Адрес", href: "/adres", kind: "contact" },
  {
    id: "vse-tovary",
    paths: ["all-products"],
    title: "Все товары",
    href: "/collection",
    kind: "catalog",
    catalogHref: "/collection",
  },
  {
    id: "aktsionnye-tovary",
    paths: ["discounted"],
    title: "Акционные товары",
    href: "/aktsionnye-tovary",
    kind: "catalog",
    catalogHref: "/collection",
  },
];

const SKIP = [
  /персональных данных/i,
  /Заказать обратный звонок/i,
  /рассылк/i,
  /Подписаться/i,
  /Салон старинной мебели &copy/i,
  /^Главная$/i,
  /^&nbsp;$/,
];

function decodeHtml(text) {
  return text
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&laquo;/g, "«")
    .replace(/&raquo;/g, "»")
    .replace(/&nbsp;/g, " ")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/\s+/g, " ")
    .trim();
}

function stripTags(html) {
  return decodeHtml(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/p>/gi, "\n")
      .replace(/<\/h[1-6]>/gi, "\n")
      .replace(/<li[^>]*>/gi, "\n• ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\n\s*\n/g, "\n")
      .replace(/[ \t]+/g, " ")
      .trim(),
  );
}

function shouldSkip(text) {
  const t = text.trim();
  if (t.length < 2) return true;
  return SKIP.some((re) => re.test(t));
}

function metaDescription(html) {
  const m = html.match(/<meta\s+name="description"\s+content="([^"]*)"/i);
  return m ? decodeHtml(m[1]) : "";
}

function extractAjaxContent(html) {
  const m = html.match(
    /class="col-sm-9 fn_ajax_content"[^>]*>([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>\s*<div class="to_top"/i,
  );
  return m ? m[1] : "";
}

function extractPageBlocks(html) {
  const content = extractAjaxContent(html);
  const block =
    content.match(/<div class="block padding">([\s\S]*?)<\/div>\s*(?:<\/div>)?/i)?.[1] ?? content;
  const title = content.match(/<h1[^>]*>[\s\S]*?<span[^>]*>([^<]+)/i)?.[1];

  const blocks = [];
  const parts = block.split(/<h3[^>]*>/i);
  const intro = parts[0];
  const introPs = paragraphsFromHtml(intro);
  if (introPs.length) blocks.push({ heading: null, paragraphs: introPs });

  for (let i = 1; i < parts.length; i++) {
    const chunk = parts[i];
    const end = chunk.indexOf("</h3>");
    const heading = stripTags(chunk.slice(0, end > 0 ? end : 80));
    const body = chunk.slice(end > 0 ? end + 5 : 0);
    const paragraphs = paragraphsFromHtml(body);
    if (heading || paragraphs.length) {
      blocks.push({ heading: heading || null, paragraphs });
    }
  }

  if (!blocks.length) {
    const paragraphs = paragraphsFromHtml(block);
    if (paragraphs.length) blocks.push({ heading: null, paragraphs });
  }

  return { title: title ? decodeHtml(title) : null, blocks };
}

function paragraphsFromHtml(html) {
  const fromP = [...html.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)]
    .map((m) => stripTags(m[1]))
    .filter((p) => !shouldSkip(p) && p.length > 1);

  if (fromP.length) return fromP;

  const text = stripTags(html);
  return text
    .split(/\n+/)
    .map((s) => s.trim())
    .filter((p) => !shouldSkip(p) && p.length > 20);
}

function flattenBlocks(blocks) {
  const paragraphs = [];
  for (const b of blocks) {
    if (b.heading) paragraphs.push(b.heading);
    paragraphs.push(...b.paragraphs);
  }
  return paragraphs;
}

function parseBlogItems(html) {
  const items = [];
  const re = /<div class="blog_item[\s\S]*?(?=<div class="blog_item|<div class="pagination|<footer)/gi;
  let m;
  while ((m = re.exec(html))) {
    const chunk = m[0];
    const hrefM = chunk.match(/class="h5"[^>]*>\s*<a[^>]*href="([^"]+)"/i);
    const titleM = chunk.match(/class="h5"[^>]*>\s*<a[^>]*>([^<]+)/i);
    const dateM =
      chunk.match(/class="blog_date"[^>]*>\s*<span>([^<]+)/i) ??
      chunk.match(/class="blog_date"[^>]*>([^<]+)/i);
    const annM = chunk.match(/class="blog_annotation"[^>]*>([\s\S]*?)<\/div>/i);
    if (!titleM) continue;

    const rawHref = hrefM?.[1] ?? "";
    const path = rawHref.replace(/^\.\.\//, "").replace(/^\//, "");
    const excerpt = annM ? paragraphsFromHtml(annM[1]).join(" ") : "";

    items.push({
      title: decodeHtml(titleM[1]),
      date: dateM ? decodeHtml(dateM[1].replace(/<[^>]+>/g, "")) : undefined,
      excerpt,
      sourcePath: path,
      sourceUrl: `${BASE}/${path}`,
    });
  }
  return items;
}

function maxBlogPage(html) {
  const pages = [...html.matchAll(/href="\/news\?page=(\d+)"|href="\/blog\?page=(\d+)"/gi)].map((m) =>
    Number(m[1] || m[2]),
  );
  return pages.length ? Math.max(...pages) : 1;
}

async function fetchHtml(path) {
  const url = `${BASE}/${path.replace(/^\//, "")}`;
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`${url} → ${res.status}`);
  return { url, html: await res.text() };
}

async function fetchAllBlogPages(blogBase) {
  const first = await fetchHtml(blogBase);
  const all = parseBlogItems(first.html);
  const pages = maxBlogPage(first.html);
  const prefix = blogBase === "news" ? "news" : "blog";

  for (let p = 2; p <= pages; p++) {
    const { html } = await fetchHtml(`${prefix}?page=${p}`);
    all.push(...parseBlogItems(html));
    console.log(`    page ${p}: +${parseBlogItems(html).length} items`);
  }
  return { sourceUrl: first.url, items: dedupeEntries(all) };
}

function dedupeEntries(items) {
  const seen = new Set();
  return items.filter((item) => {
    const key = item.sourcePath ?? item.title;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function extractArticleBody(html) {
  const content = extractAjaxContent(html);
  const block = content.match(
    /<div class="block padding">([\s\S]*?)<div class="post_share"/i,
  )?.[1];
  if (!block) return "";
  const paragraphs = paragraphsFromHtml(block);
  return paragraphs.join("\n\n");
}

async function fetchArticleBody(sourcePath) {
  try {
    const { html } = await fetchHtml(sourcePath);
    return extractArticleBody(html);
  } catch {
    return "";
  }
}

async function enrichArticles(items, fetchFull) {
  if (!fetchFull) return items;
  const out = [];
  for (const item of items) {
    if (!item.sourcePath?.startsWith("blog/")) {
      out.push(item);
      continue;
    }
    process.stdout.write(`    article ${item.sourcePath}… `);
    const body = await fetchArticleBody(item.sourcePath);
    console.log(body ? "ok" : "skip");
    out.push({ ...item, body: body || item.excerpt });
    await sleep(120);
  }
  return out;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function parseContact(html) {
  const content = extractAjaxContent(html);
  const text = stripTags(content);
  const blocks = extractPageBlocks(html).blocks;
  const paragraphs = flattenBlocks(blocks);

  const address =
    text.match(
      /Московская область[^.]+\./i,
    )?.[0] ?? paragraphs.find((p) => /Московская|Одинцово|Внуковская/i.test(p));

  const hours = text.match(/понедельник[\s\S]*?воскресен\w*[^.]*\.?/i)?.[0];
  const phone = text.match(/\+?7\s*\(?\s*963\s*\)?\s*780[-\s]?64[-\s]?30/i)?.[0];
  const requisites = paragraphs.find((p) => /ИНН|ОГРН|Расчетный счет/i.test(p));

  return {
    paragraphs: paragraphs.filter((p) => !/ИНН|ОГРН|Расчетный счет/i.test(p)).slice(0, 6),
    contact: {
      address: address?.replace(/\s+/g, " ").trim(),
      hours: hours?.replace(/\s+/g, " ").trim(),
      phone: phone ? "+7 (963) 780-64-30" : undefined,
      requisites: requisites?.replace(/\s+/g, " ").trim(),
    },
  };
}

function parseCatalogIntro(html, def) {
  const desc = metaDescription(html);
  const productCount = [...html.matchAll(/class="products_item/gi)].length;
  const paragraphs = [];
  if (desc) paragraphs.push(desc);
  if (productCount > 0) {
    paragraphs.push(
      def.id === "aktsionnye-tovary"
        ? `В разделе представлены товары со скидкой (${productCount} на первой странице каталога).`
        : `Каталог антиквариата салона «Эпоха» — более тысячи предметов.`,
    );
  }
  return {
    description: desc,
    productCount,
    paragraphs,
    catalogHref: def.catalogHref,
  };
}

async function scrapeSection(def) {
  const path = def.paths[0];
  console.log(`  ${def.id} (${path})…`);

  if (def.kind === "blog") {
    const { sourceUrl, items } = await fetchAllBlogPages(def.blogBase);
    const fetchFull = def.id === "stati";
    const entries = await enrichArticles(items, fetchFull);
    const paragraphs = entries.slice(0, 4).map((e) =>
      e.date ? `${e.date} — ${e.title}. ${e.excerpt}`.trim() : `${e.title}. ${e.excerpt}`.trim(),
    );
    return {
      ...def,
      sourceUrl,
      paragraphs,
      entries,
    };
  }

  if (def.kind === "blog-embed") {
    const { url, html } = await fetchHtml(path);
    const entries = dedupeEntries(parseBlogItems(html));
    const enriched = await enrichArticles(entries, true);
    const paragraphs = enriched.map((e) => `${e.title}. ${e.excerpt}`.trim());
    return { ...def, sourceUrl: url, paragraphs, entries: enriched };
  }

  if (def.kind === "contact") {
    const { url, html } = await fetchHtml(path);
    const { paragraphs, contact } = parseContact(html);
    return { ...def, sourceUrl: url, paragraphs, contact };
  }

  if (def.kind === "catalog") {
    const { url, html } = await fetchHtml(path);
    const catalog = parseCatalogIntro(html, def);
    return { ...def, sourceUrl: url, paragraphs: catalog.paragraphs, catalog };
  }

  const { url, html } = await fetchHtml(path);
  const { blocks, title } = extractPageBlocks(html);
  const paragraphs = flattenBlocks(blocks);
  return {
    ...def,
    sourceUrl: url,
    title: title ?? def.title,
    paragraphs,
    blocks,
    description: metaDescription(html),
  };
}

async function main() {
  const scrapedAt = new Date().toISOString();
  const sections = {};

  for (const def of SECTIONS) {
    try {
      sections[def.id] = await scrapeSection(def);
    } catch (e) {
      console.error(`  FAILED ${def.id}:`, e.message);
      sections[def.id] = { ...def, error: e.message, paragraphs: [] };
    }
  }

  const homeTabIds = [
    "o-salone",
    "novosti",
    "skidki",
    "dostavka-i-oplata",
    "uslugi",
    "sotrudnichestvo",
    "stati",
    "adres",
  ];

  const payload = {
    scrapedAt,
    source: BASE,
    homeTabIds,
    sections,
  };

  await fs.writeFile(OUT, JSON.stringify(payload, null, 2), "utf8");
  console.log(`\nWrote ${OUT}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
