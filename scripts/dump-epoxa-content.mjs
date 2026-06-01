const url = process.argv[2];
const r = await fetch(url, { headers: { "User-Agent": "x" } });
const h = await r.text();
const m = h.match(/class="col-sm-9 fn_ajax_content"[^>]*>([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>\s*<footer/i)
  ?? h.match(/fn_ajax_content[\s\S]{0,15000}/i);
console.log(m ? (m[1] ?? m[0]).slice(0, 6000) : "not found");
