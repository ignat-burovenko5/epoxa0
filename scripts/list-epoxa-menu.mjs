const r = await fetch("https://epoxa.ru/", { headers: { "User-Agent": "x" } });
const h = await r.text();
const menu = [...h.matchAll(/menu_link[^>]*href="([^"]+)"[^>]*>([^<]+)/gi)];
for (const [, href, label] of menu) {
  console.log(label.trim(), "->", href);
}
const bottom = [...h.matchAll(/bottom_nav[^>]*>[\s\S]*?<\/nav>/gi)];
if (bottom[0]) {
  const links = [...bottom[0][0].matchAll(/href="([^"]+)"[^>]*>([^<]+)/gi)];
  console.log("\nBottom nav:");
  for (const [, href, label] of links) console.log(label.trim(), "->", href);
}
