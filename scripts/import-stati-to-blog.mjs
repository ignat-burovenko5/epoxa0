import { createHash } from "crypto";
import fs from "fs/promises";
import path from "path";

function blogUidFromSeed(seed) {
  const hash = createHash("sha256").update(`blog:${seed}`).digest();
  const digits = String(10000 + (hash.readUInt32BE(0) % 90000));
  const alphabet = "abcdefghijklmnopqrstuvwxyz";
  let suffix = "";
  for (let i = 0; i < 5; i += 1) {
    suffix += alphabet[hash[i + 4] % 26];
  }
  return `${digits}${suffix}`;
}

function entrySlug(sourcePath, title) {
  if (sourcePath) {
    const segment = sourcePath.split("/").filter(Boolean).pop();
    if (segment) return decodeURIComponent(segment);
  }
  return (title ?? "entry")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-|-$/g, "");
}

function toDdMmYyyy(dateStr) {
  if (!dateStr) return undefined;

  // Accept: dd/mm/yyyy or dd.mm.yyyy
  const m = /^(\d{2})[./](\d{2})[./](\d{4})$/.exec(String(dateStr).trim());
  if (m) {
    const dd = m[1];
    const mm = m[2];
    const yyyy = m[3];
    return `${dd}.${mm}.${yyyy}`;
  }

  // If it's already dd.mm.yyyy, keep it.
  if (/^\d{2}\.\d{2}\.\d{4}$/.test(dateStr)) return dateStr;
  return undefined;
}

function isoFromDdMmYyyy(ddMmYyyy) {
  if (!ddMmYyyy) return undefined;
  const m = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(ddMmYyyy);
  if (!m) return undefined;
  const dd = m[1];
  const mm = m[2];
  const yyyy = m[3];
  return `${yyyy}-${mm}-${dd}T10:00:00.000Z`;
}

async function main() {
  const ROOT = process.cwd();

  const epoxaPath = path.join(ROOT, "src", "data", "epoxa-sections.json");
  const blogStorePath = path.join(ROOT, "data", "blog", "store.json");

  const epoxaRaw = await fs.readFile(epoxaPath, "utf8");
  const epoxaData = JSON.parse(epoxaRaw);

  const stati = epoxaData?.sections?.stati;
  if (!stati?.entries || !Array.isArray(stati.entries)) {
    throw new Error('Не найден раздел "stati.entries" в epoxa-sections.json');
  }

  const storeRaw = await fs.readFile(blogStorePath, "utf8");
  /** @type {{ version: number; posts: any[]; settings: any; updatedAt?: string }} */
  const store = JSON.parse(storeRaw);

  const existingByUid = new Set(
    (store.posts ?? []).map((p) => String(p.uid)),
  );

  const now = new Date().toISOString();
  let added = 0;
  let skipped = 0;

  for (const [i, entry] of stati.entries.entries()) {
    const slug = entrySlug(entry.sourcePath, entry.title);
    const uid = blogUidFromSeed(entry.sourcePath || slug);

    if (existingByUid.has(uid) || store.posts.some((p) => p.slug === slug)) {
      skipped += 1;
      continue;
    }

    const dateDisplay = toDdMmYyyy(entry.date);
    const publishedAt = isoFromDdMmYyyy(dateDisplay) ?? now;

    store.posts.push({
      uid,
      slug,
      title: entry.title,
      excerpt: entry.excerpt ?? "",
      body: entry.body ?? entry.excerpt ?? "",
      bodyFormat: "plain",
      date: dateDisplay,
      publishedAt,
      createdAt: now,
      updatedAt: now,
      status: "published",
      author: undefined,
      coverImage: undefined,
      tags: undefined,
      seo: undefined,
      display: undefined,
      featured: false,
      sortOrder: 1000 + i,
    });

    existingByUid.add(uid);
    added += 1;
  }

  store.updatedAt = now;
  await fs.writeFile(
    blogStorePath,
    `${JSON.stringify(store, null, 2)}\n`,
    "utf8",
  );

  console.log(
    `[import-stati-to-blog] added=${added} skippedExisting=${skipped} totalPosts=${store.posts.length}`,
  );
}

void main().catch((e) => {
  console.error(e);
  process.exit(1);
});

