import { createHash } from "crypto";
import fs from "fs/promises";
import path from "path";

const BLOG_PUBLIC_UID_RE = /^\d{5}[a-z]{5}$/;

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

function uniqueUid(seed, used) {
  let uid = blogUidFromSeed(seed);
  let n = 0;
  while (used.has(uid)) {
    n += 1;
    uid = blogUidFromSeed(`${seed}:${n}`);
  }
  used.add(uid);
  return uid;
}

async function main() {
  const ROOT = process.cwd();
  const storePath = path.join(ROOT, "data", "blog", "store.json");
  const redirectsPath = path.join(ROOT, "data", "blog", "redirects.json");

  const store = JSON.parse(await fs.readFile(storePath, "utf8"));
  const used = new Set();
  const redirects = [];

  for (const post of store.posts) {
    const oldUid = post.uid;
    const seed = post.slug || post.title || oldUid;

    if (BLOG_PUBLIC_UID_RE.test(oldUid)) {
      used.add(oldUid);
      continue;
    }

    const newUid = uniqueUid(seed, used);
    post.uid = newUid;
    if (oldUid !== newUid) {
      redirects.push({ from: oldUid, to: newUid });
    }
  }

  store.updatedAt = new Date().toISOString();
  await fs.writeFile(storePath, `${JSON.stringify(store, null, 2)}\n`, "utf8");
  await fs.writeFile(
    redirectsPath,
    `${JSON.stringify({ redirects }, null, 2)}\n`,
    "utf8",
  );

  console.log(
    `[migrate-blog-uids] updated=${redirects.length} redirects=${redirects.length} total=${store.posts.length}`,
  );
}

void main().catch((e) => {
  console.error(e);
  process.exit(1);
});
