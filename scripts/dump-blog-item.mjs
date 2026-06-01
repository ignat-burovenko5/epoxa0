const url = process.argv[2] ?? "https://epoxa.ru/news";
const r = await fetch(url, { headers: { "User-Agent": "x" } });
const h = await r.text();
const items = [...h.matchAll(/<div class="blog_item[\s\S]*?(?=<div class="blog_item|<\/div>\s*<\/div>\s*<\/div>\s*<div class="pagination)/gi)];
console.log("items", items.length);
if (items[0]) {
  const chunk = items[0][0];
  console.log(chunk.slice(0, 1500));
}
const pag = h.match(/pagination[\s\S]{0,800}/i);
console.log("\npag", pag?.[0]?.slice(0, 500));
