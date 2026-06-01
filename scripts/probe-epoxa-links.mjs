const BASE = "https://epoxa.ru";
const paths = ["/", "/news", "/news/", "/kontakty", "/contact", "/o-salone", "/blog"];

for (const p of paths) {
  const r = await fetch(BASE + p, { headers: { "User-Agent": "x" } });
  const h = await r.text();
  const links = [...new Set([...h.matchAll(/href="(\/[^"#?]+)"/g)].map((m) => m[1]))];
  const info = links.filter(
    (l) =>
      !l.includes("product") &&
      !l.includes("cart") &&
      !l.includes("catalog") &&
      l.length < 35,
  );
  console.log(`\n${p} ${r.status}:`, info.join(", "));
}
