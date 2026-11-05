// Reporte privado "Hoy" — se abre con un enlace secreto: /api/hoy?k=<REPORT_TOKEN>
//
// Es una función de Vercel (no parte del sitio estático): consulta las fuentes en cada
// carga y devuelve una página HTML. Cada fuente es opcional; si falta su credencial, esa
// tarjeta lo dice y el resto sigue funcionando.
//
// Variables de entorno (Vercel → Settings → Environment Variables):
//   REPORT_TOKEN        obligatoria: el secreto del enlace
//   VERCEL_API_TOKEN    visitas/canales/páginas (Vercel Web Analytics)
//   POSTHOG_API_KEY     clics a WhatsApp y formularios (Personal API key, solo lectura)
//   POSTHOG_PROJECT_ID  id numérico del proyecto en PostHog
//   GSC_SERVICE_ACCOUNT_JSON  JSON completo de una cuenta de servicio con acceso de lectura a Search Console
//   (opcionales) VERCEL_PROJECT_ID, VERCEL_TEAM_ID, POSTHOG_HOST, GSC_SITE_URL

import { createSign, timingSafeEqual } from 'node:crypto';

const SITE = 'https://livvo.tech';
const TZ_OFFSET_MS = -5 * 3600 * 1000; // Bogotá = UTC-5, sin horario de verano
const HOUR = 3600 * 1000;
const DAY = 24 * HOUR;

const env = (k: string) => process.env[k]?.trim() || '';

// ---------- utilidades ----------

const esc = (s: unknown) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

const bogotaDay = (ms: number) => new Date(ms + TZ_OFFSET_MS).toISOString().slice(0, 10);
const bogotaHM = (ms: number) => new Date(ms + TZ_OFFSET_MS).toISOString().slice(11, 16);

function tokenOk(given: string, expected: string): boolean {
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

async function timed<T>(p: Promise<T>): Promise<{ value: T; ms: number }> {
  const t = Date.now();
  const value = await p;
  return { value, ms: Date.now() - t };
}

type Source<T> = { ok: true; data: T } | { ok: false; reason: string; missing?: boolean };

// ---------- fuente: Vercel Web Analytics ----------

type Row = Record<string, string | number>;

async function vercelQuery(
  params: Record<string, string>,
  customize?: (u: URL) => void
): Promise<Row[]> {
  const url = new URL('https://api.vercel.com/v1/query/web-analytics/visits/aggregate');
  url.searchParams.set('projectId', env('VERCEL_PROJECT_ID') || 'prj_pqhGoEOOxnJdNKSEOAVN0xChrnuO');
  url.searchParams.set('teamId', env('VERCEL_TEAM_ID') || 'team_ClsuvLCecHsKlCFi442gayGb');
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  customize?.(url);
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${env('VERCEL_API_TOKEN')}` },
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${(await res.text()).slice(0, 160)}`);
  const json = (await res.json()) as { data?: Row[]; result?: { data?: Row[] } };
  return json.data ?? json.result?.data ?? [];
}

// Consulta con 2 dimensiones: la API documenta `by` como lista; se prueban las codificaciones
// habituales (parámetro repetido, corchetes, coma) y se devuelve la primera que funcione.
let lastMultiError = '';
async function vercelQueryMulti(by: string[], params: Record<string, string>): Promise<Row[] | null> {
  const attempts: ((u: URL) => void)[] = [
    (u) => by.forEach((b) => u.searchParams.append('by', b)),
    (u) => by.forEach((b) => u.searchParams.append('by[]', b)),
    (u) => u.searchParams.set('by', by.join(',')),
  ];
  for (const apply of attempts) {
    try {
      return await vercelQuery(params, apply);
    } catch (e) {
      lastMultiError = (e as Error).message;
    }
  }
  return null;
}

function othersLast<T extends { name: string }>(rows: T[]): T[] {
  const rename = (r: T) => (r.name === 'Others' ? { ...r, name: 'Otras (menos vistas)' } : r);
  return [...rows.filter((r) => r.name !== 'Others'), ...rows.filter((r) => r.name === 'Others')].map(
    rename
  );
}

// Canal legible a partir del referrer y/o de utm_source (la UTM manda sobre el referrer).
// Asistentes de IA: cada uno es su propio canal. Van antes que "google" porque
// gemini.google.com también contiene "google".
const AI_CHANNELS: [string[], string][] = [
  [['chatgpt', 'openai'], 'ChatGPT'],
  [['gemini', 'bard.google'], 'Gemini'],
  [['claude'], 'Claude'],
  [['perplexity'], 'Perplexity'],
  [['copilot', 'bing.com/chat'], 'Copilot'],
];

function channelOf(host: string, utmSource: string): string {
  const src = utmSource.toLowerCase().trim();
  const h = host.toLowerCase().trim();
  const key = src || h;
  if (!key) return 'Directo / sin referrer';
  if (key === 'others') return 'Others';
  const ai = AI_CHANNELS.find(([hints]) => hints.some((x) => key.includes(x)));
  if (ai) return ai[1];
  if (key.includes('instagram') || key === 'ig') return 'Instagram';
  if (key.includes('linkedin') || key.includes('lnkd')) return 'LinkedIn';
  if (key.includes('facebook') || key === 'fb' || key.includes('fb.com')) return 'Facebook';
  if (key.includes('whatsapp') || key.includes('wa.me')) return 'WhatsApp';
  if (key.includes('google')) return 'Google';
  if (key.includes('youtube') || key === 'yt') return 'YouTube';
  if (key === 't.co' || key.includes('twitter') || key === 'x.com') return 'X / Twitter';
  if (key.includes('mail') || key.includes('correo') || key.includes('email')) return 'Correo';
  return src ? src.charAt(0).toUpperCase() + src.slice(1) : h;
}

function groupChannels(rows: Row[]): { name: string; visitors: number }[] {
  const acc = new Map<string, number>();
  for (const r of rows) {
    const name = channelOf(String(r.referrerHostname ?? ''), String(r.utmSource ?? ''));
    acc.set(name, (acc.get(name) ?? 0) + Number(r.visitors ?? 0));
  }
  const sorted = [...acc.entries()]
    .map(([name, visitors]) => ({ name, visitors }))
    .sort((a, b) => b.visitors - a.visitors);
  return othersLast(sorted);
}

type Traffic = {
  today: number;
  todayViews: number;
  yesterday: number;
  last7: number;
  last7Views: number;
  completeDays: { day: string; visitors: number }[]; // días completos (sin hoy), más reciente primero
  referrers: { name: string; visitors: number }[]; // canales agrupados
  campaigns: { source: string; campaign: string; visitors: number }[] | null; // null = no disponible
  pages: { name: string; views: number }[];
};

async function loadTraffic(now: number): Promise<Source<Traffic>> {
  if (!env('VERCEL_API_TOKEN'))
    return { ok: false, missing: true, reason: 'Falta VERCEL_API_TOKEN' };
  try {
    const iso = (ms: number) => new Date(ms).toISOString();
    const since48 = iso(now - 48 * HOUR);
    const since7 = iso(now - 7 * DAY);
    const [hours, days, refs, paths, refsUtm, utmRows] = await Promise.all([
      vercelQuery({ by: 'hour', since: since48, until: iso(now), limit: '100' }),
      vercelQuery({ by: 'day', since: since7, until: iso(now), limit: '100' }),
      vercelQuery({ by: 'referrerHostname', since: since7, until: iso(now), limit: '30' }),
      vercelQuery({ by: 'requestPath', since: since7, until: iso(now), limit: '8' }),
      // Dos dimensiones a la vez (referrer + utm_source) y campañas: si la API no las
      // acepta, el reporte sigue con lo básico en vez de fallar.
      vercelQueryMulti(['referrerHostname', 'utmSource'], {
        since: since7,
        until: iso(now),
        limit: '100',
      }),
      vercelQueryMulti(['utmSource', 'utmCampaign'], { since: since7, until: iso(now), limit: '20' }),
    ]);

    // Agrupar las horas por día de Bogotá
    const perDay = new Map<string, { visitors: number; views: number }>();
    for (const r of hours) {
      const key = bogotaDay(Date.parse(String(r.timestamp)));
      const cur = perDay.get(key) ?? { visitors: 0, views: 0 };
      cur.visitors += Number(r.visitors ?? 0);
      cur.views += Number(r.pageviews ?? 0);
      perDay.set(key, cur);
    }
    const todayKey = bogotaDay(now);
    const yKey = bogotaDay(now - DAY);
    const t = perDay.get(todayKey) ?? { visitors: 0, views: 0 };

    const completeDays = [1, 2].map((n) => {
      const day = bogotaDay(now - n * DAY);
      return { day, visitors: perDay.get(day)?.visitors ?? 0 };
    });

    return {
      ok: true,
      data: {
        today: t.visitors,
        todayViews: t.views,
        yesterday: perDay.get(yKey)?.visitors ?? 0,
        last7: days.reduce((s, r) => s + Number(r.visitors ?? 0), 0),
        last7Views: days.reduce((s, r) => s + Number(r.pageviews ?? 0), 0),
        completeDays,
        // La API agrupa lo menos frecuente en una fila "Others": se muestra al final.
        referrers: groupChannels(refsUtm ?? refs),
        campaigns: utmRows
          ? utmRows
              .filter((r) => String(r.utmSource ?? '') || String(r.utmCampaign ?? ''))
              .map((r) => ({
                source: String(r.utmSource ?? '') || '—',
                campaign: String(r.utmCampaign ?? '') || '—',
                visitors: Number(r.visitors ?? 0),
              }))
          : null,
        pages: othersLast(
          paths.map((r) => ({
            name: String(r.requestPath ?? ''),
            views: Number(r.pageviews ?? 0),
          }))
        ),
      },
    };
  } catch (e) {
    return { ok: false, reason: `Vercel Analytics: ${(e as Error).message}` };
  }
}

// ---------- fuente: PostHog (leads) ----------

type Leads = {
  whatsapp24h: number;
  forms24h: number;
  whatsapp7d: number;
  forms7d: number;
  recent: { when: number; event: string; page: string }[];
};

async function hogql(query: string): Promise<unknown[][]> {
  const host = env('POSTHOG_HOST') || 'https://us.posthog.com';
  const res = await fetch(`${host}/api/projects/${env('POSTHOG_PROJECT_ID')}/query/`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env('POSTHOG_API_KEY')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: { kind: 'HogQLQuery', query } }),
    signal: AbortSignal.timeout(12_000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${(await res.text()).slice(0, 160)}`);
  const json = (await res.json()) as { results?: unknown[][] };
  return json.results ?? [];
}

async function loadLeads(): Promise<Source<Leads>> {
  if (!env('POSTHOG_API_KEY') || !env('POSTHOG_PROJECT_ID'))
    return { ok: false, missing: true, reason: 'Faltan POSTHOG_API_KEY y POSTHOG_PROJECT_ID' };
  try {
    const events = `('whatsapp_clicked', 'demo_form_submitted')`;
    const [counts, recent] = await Promise.all([
      hogql(`
        SELECT event,
               countIf(timestamp > now() - INTERVAL 1 DAY),
               count()
        FROM events
        WHERE event IN ${events} AND timestamp > now() - INTERVAL 7 DAY
        GROUP BY event`),
      hogql(`
        SELECT toUnixTimestamp(timestamp), event, properties.page
        FROM events
        WHERE event IN ${events} AND timestamp > now() - INTERVAL 7 DAY
        ORDER BY timestamp DESC LIMIT 6`),
    ]);
    const get = (ev: string, i: 1 | 2) =>
      Number(counts.find((r) => r[0] === ev)?.[i] ?? 0);
    return {
      ok: true,
      data: {
        whatsapp24h: get('whatsapp_clicked', 1),
        whatsapp7d: get('whatsapp_clicked', 2),
        forms24h: get('demo_form_submitted', 1),
        forms7d: get('demo_form_submitted', 2),
        recent: recent.map((r) => ({
          when: Number(r[0]) * 1000,
          event: String(r[1]),
          page: String(r[2] ?? ''),
        })),
      },
    };
  } catch (e) {
    return { ok: false, reason: `PostHog: ${(e as Error).message}` };
  }
}

// ---------- fuente: Google Search Console + sugerencias "Para hoy" ----------

type Todo = { title: string; detail: string; path?: string; score: number };

type Search = {
  clicks: number;
  impressions: number;
  position: number;
  topQueries: { name: string; n: number }[];
  todo: Todo[];
  through: string; // última fecha con datos
};

const b64url = (b: Buffer | string) => Buffer.from(b).toString('base64url');

async function googleToken(sa: { client_email: string; private_key: string }): Promise<string> {
  const iat = Math.floor(Date.now() / 1000);
  const unsigned =
    b64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' })) +
    '.' +
    b64url(
      JSON.stringify({
        iss: sa.client_email,
        scope: 'https://www.googleapis.com/auth/webmasters.readonly',
        aud: 'https://oauth2.googleapis.com/token',
        iat,
        exp: iat + 3600,
      })
    );
  const sig = createSign('RSA-SHA256').update(unsigned).sign(sa.private_key);
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: `${unsigned}.${b64url(sig)}`,
    }),
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok) throw new Error(`token HTTP ${res.status} ${(await res.text()).slice(0, 140)}`);
  return ((await res.json()) as { access_token: string }).access_token;
}

type GscRow = { keys: string[]; clicks: number; impressions: number; ctr: number; position: number };

async function gscFetch<T>(token: string, url: string, body?: unknown): Promise<T> {
  const res = await fetch(url, {
    method: body ? 'POST' : 'GET',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(12_000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${(await res.text()).slice(0, 160)}`);
  return (await res.json()) as T;
}

// Posts publicados según el sitemap (lastmod = fecha del post).
async function blogPostsFromSitemap(): Promise<{ path: string; ts: number }[]> {
  try {
    const xml = await (await fetch(`${SITE}/sitemap-0.xml`, { signal: AbortSignal.timeout(8_000) })).text();
    const out: { path: string; ts: number }[] = [];
    for (const m of xml.matchAll(/<loc>([^<]+)<\/loc>\s*<lastmod>([^<]+)<\/lastmod>/g)) {
      const path = new URL(m[1]).pathname;
      if (/^\/blog\/[^/]+\/$/.test(path) && !path.startsWith('/blog/etiqueta/'))
        out.push({ path, ts: Date.parse(m[2]) });
    }
    return out;
  } catch {
    return [];
  }
}

async function loadSearch(now: number): Promise<Source<Search>> {
  const raw = env('GSC_SERVICE_ACCOUNT_JSON');
  if (!raw) return { ok: false, missing: true, reason: 'Falta GSC_SERVICE_ACCOUNT_JSON (Search Console)' };
  try {
    const sa = JSON.parse(raw) as { client_email: string; private_key: string };
    const token = await googleToken(sa);

    let siteUrl = env('GSC_SITE_URL');
    if (!siteUrl) {
      const { siteEntry = [] } = await gscFetch<{ siteEntry?: { siteUrl: string }[] }>(
        token,
        'https://www.googleapis.com/webmasters/v3/sites'
      );
      const mine = siteEntry.map((e) => e.siteUrl).filter((u) => u.includes('livvo.tech'));
      siteUrl = mine.find((u) => u.startsWith('sc-domain:')) ?? mine[0] ?? '';
      if (!siteUrl)
        throw new Error(
          `la cuenta de servicio no tiene acceso a livvo.tech en Search Console (${sa.client_email})`
        );
    }

    // Search Console llega con ~2 días de retraso.
    const end = new Date(now - 2 * DAY + TZ_OFFSET_MS).toISOString().slice(0, 10);
    const start = new Date(now - 29 * DAY + TZ_OFFSET_MS).toISOString().slice(0, 10);
    const endpoint = `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`;
    const q = (dimensions: string[], rowLimit: number) =>
      gscFetch<{ rows?: GscRow[] }>(token, endpoint, { startDate: start, endDate: end, dimensions, rowLimit });

    const [total, pages, queries, posts] = await Promise.all([
      q([], 1),
      q(['page'], 200),
      q(['query'], 200),
      blogPostsFromSitemap(),
    ]);

    const t = total.rows?.[0];
    const pageRows = (pages.rows ?? []).map((r) => ({ ...r, path: new URL(r.keys[0]).pathname }));
    const todo: Todo[] = [];

    // Con poco volumen los umbrales son bajos; se suben cuando crezca el sitio.
    for (const r of pageRows) {
      if (r.impressions >= 10 && r.position > 8 && r.position <= 20)
        todo.push({
          title: 'Sube esta página de la posición 8–20 a la primera página',
          detail: `${r.impressions} impresiones, posición ${r.position.toFixed(1)}. Refuerza enlaces internos hacia ella y revisa el título.`,
          path: r.path,
          score: r.impressions,
        });
      else if (r.impressions >= 20 && r.position <= 10 && r.ctr < 0.02)
        todo.push({
          title: 'Buena posición pero casi nadie hace clic',
          detail: `${r.impressions} impresiones, CTR ${(r.ctr * 100).toFixed(1)} %. Reescribe el título y la metadescripción.`,
          path: r.path,
          score: r.impressions * 0.8,
        });
    }

    for (const r of queries.rows ?? []) {
      if (r.impressions >= 10 && r.position > 20)
        todo.push({
          title: `Consulta sin buen contenido: «${r.keys[0]}»`,
          detail: `${r.impressions} impresiones en posición ${r.position.toFixed(0)}. Considera un post que la responda directamente.`,
          score: r.impressions * 0.5,
        });
    }

    const seen = new Set(pageRows.map((r) => r.path));
    for (const post of posts) {
      if (now - post.ts >= 7 * DAY && !seen.has(post.path))
        todo.push({
          title: 'Post publicado sin ninguna impresión en 28 días',
          detail:
            'Puede estar indexado y aun así no aparecer en búsquedas. Enlázalo desde posts relacionados y revisa que su título responda una búsqueda real; si dudas, comprueba su estado con Inspección de URL.',
          path: post.path,
          score: 5,
        });
    }

    todo.sort((a, b) => b.score - a.score);
    return {
      ok: true,
      data: {
        clicks: t?.clicks ?? 0,
        impressions: t?.impressions ?? 0,
        position: t?.position ?? 0,
        topQueries: (queries.rows ?? []).slice(0, 8).map((r) => ({ name: r.keys[0], n: r.impressions })),
        todo: todo.slice(0, 3),
        through: end,
      },
    };
  } catch (e) {
    return { ok: false, reason: `Search Console: ${(e as Error).message}` };
  }
}

// ---------- fuente: salud del sitio (sin credenciales) ----------

type Check = { name: string; url: string; status: number; ms: number; ok: boolean; slow: boolean };

const CHECKS: [string, string][] = [
  ['Inicio', `${SITE}/`],
  ['Agentes IA', `${SITE}/agentes-ia`],
  ['Planes', `${SITE}/planes`],
  ['Blog', `${SITE}/blog/`],
  ['Sitemap', `${SITE}/sitemap-index.xml`],
  ['llms.txt', `${SITE}/llms.txt`],
  ['Script del formulario (HubSpot)', 'https://js.hsforms.net/forms/embed/51192341.js'],
];

async function runCheck([name, url]: [string, string]): Promise<Check> {
  try {
    const { value: res, ms } = await timed(
      fetch(url, { redirect: 'follow', signal: AbortSignal.timeout(8_000) })
    );
    return { name, url, status: res.status, ms, ok: res.ok, slow: ms > 3000 };
  } catch {
    return { name, url, status: 0, ms: 8000, ok: false, slow: true };
  }
}

// ---------- semáforo ----------

type Light = 'green' | 'yellow' | 'red';

function verdict(
  checks: Check[],
  traffic: Source<Traffic>,
  leads: Source<Leads>,
  search: Source<Search>
): { light: Light; text: string } {
  const down = checks.filter((c) => !c.ok);
  if (down.length)
    return { light: 'red', text: `Falla: ${down.map((c) => c.name).join(', ')}` };

  if (traffic.ok && traffic.data.completeDays.every((d) => d.visitors === 0))
    return { light: 'red', text: 'Sin visitas en los últimos 2 días completos' };

  const slow = checks.filter((c) => c.slow);
  if (slow.length)
    return { light: 'yellow', text: `Lento (>3 s): ${slow.map((c) => c.name).join(', ')}` };

  // Fuente con error (no solo sin configurar): no se puede afirmar que todo está normal.
  const failed = [traffic, leads, search].filter((s) => !s.ok && !s.missing);
  if (failed.length)
    return { light: 'yellow', text: 'Una fuente de datos está fallando (ver abajo)' };

  const l = leads.ok ? leads.data.whatsapp24h + leads.data.forms24h : 0;
  const partial = [traffic, leads, search].some((s) => !s.ok) ? ' · datos incompletos' : '';
  const leadsTxt = l > 0 ? ` · ${l} lead${l === 1 ? '' : 's'} en 24 h` : '';
  return { light: 'green', text: `Todo normal${leadsTxt}${partial}` };
}

// ---------- HTML ----------

const LABEL: Record<string, string> = {
  whatsapp_clicked: 'Clic a WhatsApp',
  demo_form_submitted: 'Formulario de demo',
};

function stat(label: string, value: string | number, sub = '') {
  return `<div class="stat"><div class="stat__v">${esc(value)}</div><div class="stat__l">${esc(label)}</div>${
    sub ? `<div class="stat__s">${esc(sub)}</div>` : ''
  }</div>`;
}

function note(src: Source<unknown>) {
  if (src.ok) return '';
  return `<p class="note${src.missing ? '' : ' note--err'}">${esc(src.reason)}</p>`;
}

function bars(rows: { name: string; n: number }[]) {
  if (!rows.length) return '<p class="muted">Sin datos todavía.</p>';
  const max = Math.max(...rows.map((r) => r.n), 1);
  return `<ul class="bars">${rows
    .map(
      (r) =>
        `<li><span class="bars__n">${esc(r.name)}</span><span class="bars__b"><i style="width:${Math.max(
          4,
          (r.n / max) * 100
        )}%"></i></span><span class="bars__v">${r.n}</span></li>`
    )
    .join('')}</ul>`;
}

function render(
  now: number,
  v: { light: Light; text: string },
  checks: Check[],
  traffic: Source<Traffic>,
  leads: Source<Leads>,
  search: Source<Search>
) {
  const g = search.ok ? search.data : null;
  const t = traffic.ok ? traffic.data : null;
  const l = leads.ok ? leads.data : null;
  const leadCount = l ? l.whatsapp24h + l.forms24h : 0;

  const leadBanner =
    l && leadCount > 0
      ? `<div class="lead">${leadCount} lead${leadCount === 1 ? '' : 's'} en las últimas 24 h
         (${l.forms24h} formulario${l.forms24h === 1 ? '' : 's'}, ${l.whatsapp24h} clic${
           l.whatsapp24h === 1 ? '' : 's'
         } a WhatsApp)</div>`
      : '';

  const day = bogotaDay(now);
  return `<!doctype html>
<html lang="es"><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<meta name="referrer" content="no-referrer">
<meta http-equiv="refresh" content="300">
<title>Hoy · Livvo</title>
<style>
:root{--navy:#0D1424;--text:#111;--muted:#6B7280;--bg:#fff;--card:#F8FAFC;--border:#E5E7EB;--teal:#00C7B4;--tealdeep:#0099A8;--green:#22C55E;--red:#FF5470;--amber:#F5A524}
@media (prefers-color-scheme:dark){:root{--navy:#F0F4FF;--text:#F0F4FF;--muted:#8B96AF;--bg:#0A0F1C;--card:#070B14;--border:#1A2240;--tealdeep:#00C7B4}}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--text);font:15px/1.5 "Open Sans",system-ui,sans-serif}
main{max-width:880px;margin:0 auto;padding:28px 18px 56px}
h1{font-size:22px;margin:0;color:var(--navy);letter-spacing:-.3px}
h2{font-size:12px;text-transform:uppercase;letter-spacing:.08em;color:var(--muted);margin:30px 0 10px;font-family:ui-monospace,Menlo,monospace}
.top{display:flex;justify-content:space-between;align-items:baseline;gap:12px;flex-wrap:wrap}
.when{color:var(--muted);font:12px ui-monospace,Menlo,monospace}
.light{display:flex;align-items:center;gap:12px;margin-top:16px;padding:16px 18px;border-radius:14px;border:1px solid var(--border);background:var(--card)}
.dot{width:14px;height:14px;border-radius:50%;flex:none}
.light--green .dot{background:var(--green);box-shadow:0 0 0 5px color-mix(in srgb,var(--green) 22%,transparent)}
.light--yellow .dot{background:var(--amber);box-shadow:0 0 0 5px color-mix(in srgb,var(--amber) 22%,transparent)}
.light--red .dot{background:var(--red);box-shadow:0 0 0 5px color-mix(in srgb,var(--red) 22%,transparent)}
.light__t{font-weight:700;color:var(--navy);font-size:17px}
.lead{margin-top:12px;padding:12px 16px;border-radius:12px;background:color-mix(in srgb,var(--teal) 14%,transparent);border:1px solid var(--teal);color:var(--navy);font-weight:600}
.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px}
.stat{padding:14px 16px;border:1px solid var(--border);border-radius:12px;background:var(--card)}
.stat__v{font-size:30px;font-weight:700;color:var(--navy);line-height:1.1}
.stat__l{font-size:13px;color:var(--muted);margin-top:4px}
.stat__s{font:11px ui-monospace,Menlo,monospace;color:var(--muted);margin-top:2px}
.two{display:grid;grid-template-columns:1fr 1fr;gap:18px}
@media(max-width:700px){.two{grid-template-columns:1fr}}
.bars{list-style:none;margin:0;padding:0}
.bars li{display:grid;grid-template-columns:minmax(0,1.4fr) 1fr 32px;gap:10px;align-items:center;padding:4px 0;font-size:13px}
.bars__n{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.bars__b{height:8px;border-radius:99px;background:var(--border);overflow:hidden}
.bars__b i{display:block;height:100%;background:var(--teal);border-radius:99px}
.bars__v{text-align:right;font:12px ui-monospace,Menlo,monospace;color:var(--muted)}
.muted,.note{color:var(--muted);font-size:13px;margin:6px 0}
.note{padding:8px 12px;border:1px dashed var(--border);border-radius:10px}
.note--err{border-color:var(--red);color:var(--red)}
table{width:100%;border-collapse:collapse;font-size:13px}
td{padding:7px 4px;border-bottom:1px solid var(--border)}
td:last-child{text-align:right;font-family:ui-monospace,Menlo,monospace;color:var(--muted)}
.todo{margin:0;padding-left:20px}.todo li{margin:0 0 12px}.todo a{color:var(--tealdeep);font-size:13px;word-break:break-all}
.ok{color:var(--tealdeep)}.bad{color:var(--red);font-weight:700}.slow{color:var(--amber);font-weight:700}
</style></head><body><main>
<div class="top"><h1>Hoy · Livvo</h1><span class="when">${esc(day)} · actualizado ${esc(
    bogotaHM(now)
  )} (Bogotá) · se refresca cada 5 min</span></div>

<div class="light light--${v.light}"><span class="dot"></span><span class="light__t">${esc(v.text)}</span></div>
${leadBanner}

<h2>Para hoy</h2>
${
  g
    ? g.todo.length
      ? `<ol class="todo">${g.todo
          .map(
            (x) =>
              `<li><b>${esc(x.title)}</b><br><span class="muted">${esc(x.detail)}</span>${
                x.path
                  ? `<br><a href="${esc(SITE + x.path)}" target="_blank" rel="noopener">${esc(x.path)}</a>`
                  : ''
              }</li>`
          )
          .join('')}</ol>`
      : '<p class="muted">Nada urgente hoy.</p>'
    : ''
}
${note(search)}

<h2>Visitas</h2>
${
  t
    ? `<div class="grid">${stat('Visitantes hoy', t.today, `${t.todayViews} vistas`)}${stat(
        'Ayer',
        t.yesterday
      )}${stat('Últimos 7 días', t.last7, `${t.last7Views} vistas`)}</div>`
    : ''
}
${note(traffic)}

<h2>Leads del sitio</h2>
${
  l
    ? `<div class="grid">${stat('Formularios (24 h)', l.forms24h, `${l.forms7d} en 7 días`)}${stat(
        'Clics a WhatsApp (24 h)',
        l.whatsapp24h,
        `${l.whatsapp7d} en 7 días`
      )}</div>
       ${
         l.recent.length
           ? `<table style="margin-top:12px">${l.recent
               .map(
                 (r) =>
                   `<tr><td>${esc(LABEL[r.event] ?? r.event)}</td><td style="text-align:left">${esc(
                     r.page
                   )}</td><td>${esc(bogotaDay(r.when).slice(5))} ${esc(bogotaHM(r.when))}</td></tr>`
               )
               .join('')}</table>`
           : '<p class="muted">Todavía no hay eventos de leads.</p>'
       }`
    : ''
}
${note(leads)}

${
  t
    ? `<div class="two"><div><h2>Canales · 7 días</h2>${bars(
        t.referrers.map((r) => ({ name: r.name, n: r.visitors }))
      )}</div><div><h2>Páginas · 7 días</h2>${bars(
        t.pages.map((p) => ({ name: p.name, n: p.views }))
      )}</div></div>
<h2>Campañas (UTM) · 7 días</h2>${
        t.campaigns === null
          ? `<p class="muted">No se pudo leer el desglose por UTM (${esc(lastMultiError || 'sin detalle')}).</p>`
          : t.campaigns.length
            ? `<table>${t.campaigns
                .map(
                  (c) =>
                    `<tr><td>${esc(c.source)}</td><td style="text-align:left">${esc(c.campaign)}</td><td>${c.visitors}</td></tr>`
                )
                .join('')}</table>`
            : '<p class="muted">Aún no hay visitas con UTM. Añade <code>?utm_source=…&amp;utm_medium=…&amp;utm_campaign=…</code> a los enlaces que compartes.</p>'
      }`
    : ''
}

${
  g
    ? `<h2>Google · últimos 28 días (hasta ${esc(g.through)})</h2><div class="grid">${stat(
        'Impresiones',
        g.impressions
      )}${stat('Clics', g.clicks)}${stat('Posición media', g.position ? g.position.toFixed(1) : '—')}</div>
<h2>Consultas · impresiones</h2>${bars(g.topQueries.map((x) => ({ name: x.name, n: x.n })))}`
    : ''
}

<h2>Salud del sitio</h2>
<table>${checks
    .map(
      (c) =>
        `<tr><td class="${c.ok ? (c.slow ? 'slow' : 'ok') : 'bad'}">${c.ok ? (c.slow ? 'Lento' : 'OK') : 'Falla'}</td><td>${esc(
          c.name
        )}</td><td>${c.status || 'sin respuesta'} · ${c.ms} ms</td></tr>`
    )
    .join('')}</table>
</main></body></html>`;
}

// ---------- handler ----------

const HEADERS = {
  'Content-Type': 'text/html; charset=utf-8',
  'Cache-Control': 'private, no-store',
  'X-Robots-Tag': 'noindex, nofollow',
  'Referrer-Policy': 'no-referrer',
};

export async function GET(request: Request): Promise<Response> {
  const expected = env('REPORT_TOKEN');
  if (!expected)
    return new Response('Reporte no configurado (falta REPORT_TOKEN).', {
      status: 503,
      headers: HEADERS,
    });

  const given = new URL(request.url).searchParams.get('k') ?? '';
  if (!tokenOk(given, expected))
    return new Response('No encontrado', { status: 404, headers: HEADERS });

  const now = Date.now();
  const [traffic, leads, search, checks] = await Promise.all([
    loadTraffic(now),
    loadLeads(),
    loadSearch(now),
    Promise.all(CHECKS.map(runCheck)),
  ]);

  return new Response(
    render(now, verdict(checks, traffic, leads, search), checks, traffic, leads, search),
    { status: 200, headers: HEADERS }
  );
}
