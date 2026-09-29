// Avisa a IndexNow (Bing y buscadores/IAs que lo usan) de todas las URLs del sitemap en producción.
// Uso: npm run indexnow
const HOST = 'livvo.tech';
const KEY = 'ca2deac026c55a7087a3b3acdcb97a3a';

const xml = await (await fetch(`https://${HOST}/sitemap-0.xml`)).text();
const urlList = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
if (!urlList.length) throw new Error('El sitemap no devolvió URLs');

const res = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify({ host: HOST, key: KEY, keyLocation: `https://${HOST}/${KEY}.txt`, urlList }),
});
console.log(`IndexNow: ${urlList.length} URLs, HTTP ${res.status}`);
if (res.status !== 200 && res.status !== 202) process.exit(1);
