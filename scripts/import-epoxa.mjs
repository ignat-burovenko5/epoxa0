/**
 * Import all products from epoxa.ru/all-products into levushkin.art catalog.
 *
 * Usage: node scripts/import-epoxa.mjs
 * Resume: node scripts/import-epoxa.mjs --resume
 */

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const DATA_DIR = path.join(ROOT, "src", "data");
const IMAGES_DIR = path.join(ROOT, "public", "products");
const CATALOG_JSON = path.join(DATA_DIR, "catalog.json");
const CHECKPOINT = path.join(DATA_DIR, "import-checkpoint.json");

const BASE = "https://epoxa.ru";
const UA = "Mozilla/5.0 (compatible; LevushkinImport/1.0)";
const CONCURRENCY = 8;
const resume = process.argv.includes("--resume");

function decodeHtml(text) {
  return text
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/\s+/g, " ")
    .trim();
}

function stripTags(html) {
  return decodeHtml(html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim());
}

function parsePrice(raw) {
  const n = Number(String(raw).replace(/\s/g, "").replace(/[^\d]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

function thumbToFull(url) {
  return url
    .replace(/\.\d+x\d+\.(jpg|jpeg|png|webp)/i, ".$1")
    .replace(/(\.[a-z]+)$/i, ".800x600w$1");
}

function parseListing(html) {
  const items = [];
  const re =
    /<div class="products_item[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/g;
  let m;
  while ((m = re.exec(html))) {
    const block = m[0];
    const href = block.match(/class="product_name"[^>]*href="([^"]+)"/);
    const title = block.match(/class="product_name"[^>]*>([^<]+)/);
    const img = block.match(/class="fn_img preview_img"[^>]*src="([^"]+)"/);
    const price = block.match(/class="fn_price">([^<]+)/);
    const oldPrice = block.match(/class="fn_old_price">([^<]+)/);
    const oldHidden = block.includes('class="old_price hidden"');
    const prodanno = block.match(/class="prodanno">([\s\S]*?)<\/div>/);

    if (!href || !title) continue;

    const slug = href[1].replace(/^products\//, "");
    const eraRaw = prodanno ? stripTags(prodanno[1]) : "";
    const era = eraRaw.replace(/\s+/g, " ").trim();

    items.push({
      slug,
      title: decodeHtml(title[1]),
      era: era || "Антиквариат",
      price: parsePrice(price?.[1] ?? "0"),
      compareAtPrice:
        !oldHidden && oldPrice ? parsePrice(oldPrice[1]) : undefined,
      thumbUrl: img?.[1] ?? null,
    });
  }
  return items;
}

async function fetchText(url) {
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`${url} → ${res.status}`);
  return res.text();
}

async function fetchDetail(slug) {
  const html = await fetchText(`${BASE}/products/${slug}`);

  const categoryMatch = html.match(
    /class="category_link selected"[^>]*>([^<]+)/,
  );
  const category = categoryMatch ? decodeHtml(categoryMatch[1]) : "Антиквариат";

  const descMatch = html.match(
    /class="fn_description[^"]*"[^>]*>([\s\S]*?)<\/div>/,
  );
  const bodyMatch = html.match(
    /class="product_body[^"]*"[^>]*>([\s\S]*?)<\/div>/,
  );
  const ogDesc = html.match(/property="og:description" content='([^']*)'/);

  let description = "";
  if (descMatch) description = stripTags(descMatch[1]);
  else if (bodyMatch) description = stripTags(bodyMatch[1]);
  else if (ogDesc) description = decodeHtml(ogDesc[1]);

  const images = [];
  const mainImg = html.match(
    /class="fn_img product_img"[^>]*src="([^"]+)"/,
  );
  const mainLink = html.match(
    /class="product_image"[\s\S]*?href="([^"]+\.jpg[^"]*)"/,
  );
  if (mainLink) images.push(mainLink[1]);
  else if (mainImg) images.push(thumbToFull(mainImg[1]));

  const galleryRe =
    /class="images_link" href="(https:\/\/epoxa\.ru\/files\/products\/[^"]+)"/g;
  let gm;
  while ((gm = galleryRe.exec(html))) {
    if (!images.includes(gm[1])) images.push(gm[1]);
  }

  const priceContent = html.match(/class="fn_price"[^>]*content="(\d+)"/);
  const oldPriceBlock = html.match(
    /class="old_price(?!\s+hidden)[^"]*"[\s\S]*?class="fn_old_price">([^<]+)/,
  );

  return {
    category,
    description,
    images: images.slice(0, 6),
    price: priceContent ? Number(priceContent[1]) : undefined,
    compareAtPrice: oldPriceBlock ? parsePrice(oldPriceBlock[1]) : undefined,
  };
}

async function downloadImage(url, dest) {
  await fs.mkdir(path.dirname(dest), { recursive: true });
  try {
    await fs.access(dest);
    return dest;
  } catch {
    /* not cached */
  }

  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`Image ${url} → ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  await fs.writeFile(dest, buf);
  return dest;
}

function buildDescription(product, detail) {
  const parts = [];
  if (detail.description) parts.push(detail.description);
  else {
    parts.push(
      `${product.title}. ${product.era}. Предмет из коллекции антикварного салона «Эпоха».`,
    );
  }
  parts.push(
    "Возможен осмотр в шоуруме и доставка по Москве и регионам России.",
  );
  return parts.filter(Boolean);
}

async function mapPool(items, fn, limit) {
  const results = new Array(items.length);
  let idx = 0;

  async function worker() {
    while (idx < items.length) {
      const i = idx++;
      results[i] = await fn(items[i], i);
      if ((i + 1) % 50 === 0) {
        console.log(`  … ${i + 1}/${items.length}`);
      }
    }
  }

  await Promise.all(Array.from({ length: limit }, worker));
  return results;
}

async function main() {
  console.log("Fetching epoxa.ru/all-products/page-all …");
  const html = await fetchText(`${BASE}/all-products/page-all`);
  const listing = parseListing(html);
  console.log(`Found ${listing.length} products in listing.`);

  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.mkdir(IMAGES_DIR, { recursive: true });

  let done = new Set();
  let partial = [];

  if (resume) {
    try {
      const cp = JSON.parse(await fs.readFile(CHECKPOINT, "utf8"));
      done = new Set(cp.done ?? []);
      partial = cp.products ?? [];
      console.log(`Resuming: ${done.size} already imported.`);
    } catch {
      /* fresh start */
    }
  }

  const todo = listing.filter((p) => !done.has(p.slug));
  console.log(`Fetching details for ${todo.length} products …`);

  const enriched = await mapPool(
    todo,
    async (item) => {
      try {
        const detail = await fetchDetail(item.slug);
        const price = detail.price ?? item.price;
        let compareAtPrice = detail.compareAtPrice ?? item.compareAtPrice;
        if (compareAtPrice && compareAtPrice <= price) compareAtPrice = undefined;

        const imageUrls = detail.images.length
          ? detail.images
          : item.thumbUrl
            ? [thumbToFull(item.thumbUrl)]
            : [];

        const localImages = [];
        for (let i = 0; i < imageUrls.length; i++) {
          const ext = path.extname(new URL(imageUrls[i]).pathname) || ".jpg";
          const rel = `/products/${item.slug}/${i === 0 ? "main" : i}${ext}`;
          const dest = path.join(ROOT, "public", rel);
          try {
            await downloadImage(imageUrls[i], dest);
            localImages.push(rel);
          } catch (e) {
            console.warn(`  ⚠ image ${item.slug}[${i}]: ${e.message}`);
          }
        }

        const product = {
          slug: item.slug,
          title: item.title,
          era: item.era,
          category: detail.category,
          description: buildDescription(item, detail),
          price,
          ...(compareAtPrice ? { compareAtPrice } : {}),
          images: localImages,
          sourceUrl: `${BASE}/products/${item.slug}`,
        };

        done.add(item.slug);
        partial.push(product);

        if (partial.length % 25 === 0) {
          await fs.writeFile(
            CHECKPOINT,
            JSON.stringify({ done: [...done], products: partial }),
          );
        }

        return product;
      } catch (e) {
        console.error(`  ✗ ${item.slug}: ${e.message}`);
        return null;
      }
    },
    CONCURRENCY,
  );

  const products = [
    ...partial.filter((p) => p && !enriched.find((e) => e?.slug === p.slug)),
    ...enriched.filter(Boolean),
  ];

  // dedupe by slug, keep latest
  const bySlug = new Map();
  for (const p of products) bySlug.set(p.slug, p);
  const catalog = [...bySlug.values()].sort((a, b) =>
    a.title.localeCompare(b.title, "ru"),
  );

  await fs.writeFile(CATALOG_JSON, JSON.stringify(catalog, null, 2));
  await fs.unlink(CHECKPOINT).catch(() => {});

  console.log(`\nDone! ${catalog.length} products → ${CATALOG_JSON}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
