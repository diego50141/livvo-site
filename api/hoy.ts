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
//   (opcionales) VERCEL_PROJECT_ID, VERCEL_TEAM_ID, POSTHOG_HOST

import { timingSafeEqual } from 'node:crypto';

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

async function vercelQuery(params: Record<string, string>): Promise<Row[]> {
  const url = new URL('https://api.vercel.com/v1/query/web-analytics/visits/aggregate');
  url.searchParams.set('projectId', env('VERCEL_PROJECT_ID') || 'prj_pqhGoEOOxnJdNKSEOAVN0xChrnuO');
  url.searchParams.set('teamId', env('VERCEL_TEAM_ID') || 'team_ClsuvLCecHsKlCFi442gayGb');
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${env('VERCEL_API_TOKEN')}` },
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${(await res.text()).slice(0, 160)}`);
  const json = (await res.json()) as { data?: Row[]; result?: { data?: Row[] } };
  return json.data ?? json.result?.data ?? [];
}

type Traffic = {
  today: number;
  todayViews: number;
  yesterday: number;
  last7: number;
  last7Views: number;
  completeDays: { day: string; visitors: number }[]; // días completos (sin hoy), más reciente primero
  referrers: { name: string; visitors: number }[];
  pages: { name: string; views: number }[];
};

async function loadTraffic(now: number): Promise<Source<Traffic>> {
  if (!env('VERCEL_API_TOKEN'))
    return { ok: false, missing: true, reason: 'Falta VERCEL_API_TOKEN' };
  try {
    const iso = (ms: number) => new Date(ms).toISOString();
    const since48 = iso(now - 48 * HOUR);
    const since7 = iso(now - 7 * DAY);
    const [hours, days, refs, paths] = await Promise.all([
      vercelQuery({ by: 'hour', since: since48, until: iso(now), limit: '100' }),
      vercelQuery({ by: 'day', since: since7, until: iso(now), limit: '100' }),
      vercelQuery({ by: 'referrerHostname', since: since7, until: iso(now), limit: '8' }),
      vercelQuery({ by: 'requestPath', since: since7, until: iso(now), limit: '8' }),
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
        referrers: refs.map((r) => ({
          name: String(r.referrerHostname || 'Directo / sin referrer'),
          visitors: Number(r.visitors ?? 0),
        })),
        pages: paths.map((r) => ({
          name: String(r.requestPath ?? ''),
          views: Number(r.pageviews ?? 0),
        })),
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
  leads: Source<Leads>
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
  const failed = [traffic, leads].filter((s) => !s.ok && !s.missing);
  if (failed.length)
    return { light: 'yellow', text: 'Una fuente de datos está fallando (ver abajo)' };

  const l = leads.ok ? leads.data.whatsapp24h + leads.data.forms24h : 0;
  const partial = [traffic, leads].some((s) => !s.ok) ? ' · datos incompletos' : '';
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
  leads: Source<Leads>
) {
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
.ok{color:var(--tealdeep)}.bad{color:var(--red);font-weight:700}.slow{color:var(--amber);font-weight:700}
</style></head><body><main>
<div class="top"><h1>Hoy · Livvo</h1><span class="when">${esc(day)} · actualizado ${esc(
    bogotaHM(now)
  )} (Bogotá) · se refresca cada 5 min</span></div>

<div class="light light--${v.light}"><span class="dot"></span><span class="light__t">${esc(v.text)}</span></div>
${leadBanner}

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
      )}</div></div>`
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
  const [traffic, leads, checks] = await Promise.all([
    loadTraffic(now),
    loadLeads(),
    Promise.all(CHECKS.map(runCheck)),
  ]);

  return new Response(render(now, verdict(checks, traffic, leads), checks, traffic, leads), {
    status: 200,
    headers: HEADERS,
  });
}
