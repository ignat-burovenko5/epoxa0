const url = process.argv[2] ?? "https://epoxa.ru/news";
const r = await fetch(url, { headers: { "User-Agent": "x" } });
const h = await r.text();
// find content area hints
for (const pat of ["post", "news", "blog", "article", "page", "description", "fn_"]) {
  const re = new RegExp(`class="[^"]*${pat}[^"]*"`, "gi");
  const m = [...new Set([...h.matchAll(re)].map((x) => x[0]))].slice(0, 8);
  if (m.length) console.log(pat, m.join("\n  "));
}
const block = h.match(/<main[\s\S]{0,8000}/i)?.[0] ?? h.slice(0, 12000);
console.log("\n--- snippet ---\n", block.slice(0, 4000));
