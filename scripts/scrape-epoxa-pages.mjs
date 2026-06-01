/**
 * Scrape info pages from epoxa.ru for homeSections content.
 * Usage: node scripts/scrape-epoxa-pages.mjs
 */

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const OUT = path.join(ROOT, "src", "data", "epoxa-pages.json");

const BASE = "https://epoxa.ru";
const UA = "Mozilla/5.0 (compatible; SiteAudit/1.0)";

const PAGES = [
  { id: "o-salone", paths: ["/o-salone"] },
  { id: "uslugi", paths: ["/uslugi"] },
  { id: "novosti", paths: ["/news"] },
  { id: "stati", paths: ["/blog"] },
  { id: "adres", paths: ["/contact"] },
  { id: "dostavka-i-oplata", paths: ["/dostavka-i-oplata"] },
  { id: "sotrudnichestvo", paths: ["/sotrudnichestvo"] },
];

const SKIP_PATTERNS = [
  /персональных данных/i,
  /Заказать обратный звонок/i,
  /открыть каталог/i,
  /^Главная\b/i,
  /^\d{2}\.\d{2}\.\d{4}$/,
  /^11\.05\./,
  /рассылк/i,
  /Подписаться/i,
  /Салон старинной мебели &copy/i,
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
      .replace(/<\/h[1-6][^>]*>/gi, "\n")
      .replace(/<\/h[1-6]>/gi, "\n")
      .replace(/<li[^>]*>/gi, "\n• ")
      .replace(/<\/li>/gi, "\n")
      .replace(/<[^>]+>/g, " ")
      .replace(/\n\s*\n/g, "\n")
      .replace(/[ \t]+/g, " ")
      .trim(),
  );
}

function shouldSkip(text) {
  const t = text.trim();
  if (t.length < 30) return true;
  return SKIP_PATTERNS.some((re) => re.test(t));
}

function extractMainBlock(html) {
  const m =
    html.match(/<div[^>]*class="[^"]*fn_description[^"]*"[^>]*>([\s\S]*?)<\/div>/i) ??
    html.match(/<div[^>]*class="[^"]*page_content[^"]*"[^>]*>([\s\S]*?)<\/div>/i);
  return m ? m[1] : html;
}

function paragraphsFromPs(html) {
  return [...html.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)]
    .map((m) => stripTags(m[1]))
    .filter((p) => !shouldSkip(p));
}

function paragraphsFromNews(html) {
  const block = extractMainBlock(html);
  const items = [];
  const re =
    /<div[^>]*class="[^"]*post[^"]*"[^>]*>[\s\S]*?<\/div>\s*<\/div>/gi;
  let m;
  while ((m = re.exec(block))) {
    const title = m[0].match(/class="[^"]*post_title[^"]*"[^>]*>([\s\S]*?)<\//i);
    const body = m[0].match(/class="[^"]*post_description[^"]*"[^>]*>([\s\S]*?)<\//i);
    if (title && body) {
      const t = stripTags(title[1]);
      const b = stripTags(body[1]);
      if (!shouldSkip(b)) items.push(`${t}. ${b}`);
    }
  }
  if (items.length === 0) {
    return paragraphsFromPs(block).slice(0, 4);
  }
  return items.slice(0, 4);
}

function paragraphsFromBlog(html) {
  const block = extractMainBlock(html);
  const items = [];
  const re =
    /<div[^>]*class="[^"]*(?:post|article)[^"]*"[^>]*>[\s\S]*?(?=<div[^>]*class="[^"]*(?:post|article)[^"]*"|$)/gi;
  let m;
  while ((m = re.exec(block))) {
    const chunk = m[0];
    const title = chunk.match(/class="[^"]*post_title[^"]*"[^>]*>([\s\S]*?)<\//i);
    const body = chunk.match(/class="[^"]*post_description[^"]*"[^>]*>([\s\S]*?)<\//i);
    if (title && body) {
      const t = stripTags(title[1]);
      const b = stripTags(body[1]);
      if (shouldSkip(b) || /оформлению интерьеров/i.test(b)) continue;
      if (t.length > 8 && !/^\d/.test(t)) {
        items.push(b.length > 60 ? `${t}. ${b}` : b);
      } else if (!shouldSkip(b)) {
        items.push(b);
      }
    }
  }
  if (items.length === 0) {
    return paragraphsFromPs(block)
      .filter((p) => !/оформлению интерьеров/i.test(p))
      .slice(0, 5);
  }
  return items.slice(0, 5);
}

function paragraphsFromDelivery(html) {
  const block = extractMainBlock(html);
  const sections = [...block.matchAll(/<h3[^>]*>([\s\S]*?)<\/h3>([\s\S]*?)(?=<h3|$)/gi)];
  const out = [];
  for (const [, heading, body] of sections) {
    const h = stripTags(heading);
    const bullets = stripTags(body)
      .split(/•|\n/)
      .map((s) => s.replace(/^[-–]\s*/, "").trim())
      .filter((s) => s.length > 15 && !shouldSkip(s));
    if (bullets.length) {
      out.push(`${h} ${bullets.join(" ")}`);
    }
  }
  return out.length ? out : paragraphsFromPs(block);
}

function paragraphsFromContact(html) {
  const block = extractMainBlock(html);
  const text = stripTags(block);
  const out = [];

  const addr = text.match(
    /Московская область[^.]+(?:ТЦ[^.]+)?[^.]*\./i,
  );
  if (addr) out.push(addr[0].replace(/\s+/g, " ").trim());

  const hours = text.match(
    /понедельник[^.]+воскресен[^.]*\.?/i,
  );
  if (hours) out.push(`Часы работы: ${hours[0].replace(/\s+/g, " ").trim()}`);

  const extra = text.match(
    /При предварительной договоренности[^.]+!/i,
  );
  if (extra) out.push(extra[0].trim());

  const phone = text.match(/\+7\s*\(?963\)?\s*780[- ]?64[- ]?30/);
  if (phone) {
    out.push(
      "Единая справочная и резервирование: телефон/WhatsApp +7 (963) 780-64-30.",
    );
  }

  return out.length ? out : paragraphsFromPs(block);
}

function extractForPage(id, html) {
  switch (id) {
    case "novosti":
      return paragraphsFromNews(html);
    case "stati":
      return paragraphsFromBlog(html);
    case "dostavka-i-oplata":
      return paragraphsFromDelivery(html);
    case "adres":
      return paragraphsFromContact(html);
    default:
      return paragraphsFromPs(extractMainBlock(html));
  }
}

async function fetchText(url) {
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  return { status: res.status, html: res.ok ? await res.text() : "" };
}

async function scrapePage(def) {
  for (const p of def.paths) {
    const url = `${BASE}${p}`;
    const { status, html } = await fetchText(url);
    if (status !== 200 || !html) {
      console.log(`  skip ${url} (${status})`);
      continue;
    }
    const paragraphs = extractForPage(def.id, html);
    if (paragraphs.length > 0) {
      console.log(`  ok ${url} → ${paragraphs.length} paragraphs`);
      return { id: def.id, url, paragraphs };
    }
    console.log(`  empty ${url}`);
  }
  return { id: def.id, url: null, paragraphs: [] };
}

async function main() {
  const results = {};
  for (const def of PAGES) {
    console.log(`Scraping ${def.id}…`);
    results[def.id] = await scrapePage(def);
  }
  await fs.writeFile(OUT, JSON.stringify(results, null, 2), "utf8");
  console.log(`\nWrote ${OUT}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
