const BASE = "https://epoxa.ru";
const paths = [
  "/o-salone",
  "/news",
  "/skidki",
  "/dostavka-i-oplata",
  "/uslugi",
  "/sotrudnichestvo",
  "/blog",
  "/contact",
  "/all-products",
  "/catalog/aktsionnye-tovary",
  "/skidki/",
];

for (const p of paths) {
  const r = await fetch(BASE + p, { headers: { "User-Agent": "x" } });
  const h = await r.text();
  const h1 = h.match(/<h1[^>]*>([^<]+)/i)?.[1] ?? "";
  const posts = [...h.matchAll(/class="[^"]*post_title[^"]*"/gi)].length;
  const products = [...h.matchAll(/class="products_item/gi)].length;
  console.log(`${r.status} ${p} | h1=${h1.slice(0,40)} | posts=${posts} products=${products}`);
}
