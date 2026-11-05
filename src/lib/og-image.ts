// Generador de imágenes Open Graph (1200×630) para los posts del blog.
// Se ejecuta durante `astro build` desde src/pages/blog/og/[slug].png.ts: cada post
// publicado obtiene su imagen automáticamente a partir de título + categoría, sin
// subir nada a /public. Para un post con imagen propia basta con definir `image`
// en el frontmatter (tiene prioridad sobre esta).
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

export const OG_WIDTH = 1200;
export const OG_HEIGHT = 630;

// Mismo mapa de color que BlogCoverArt: el violeta es exclusivo de Luisa (Agentes de IA).
const ACCENTS: Record<string, { fill: string; text: string }> = {
  'Agentes de IA': { fill: '#6C63FF', text: '#4A44CC' },
  'WhatsApp para inmobiliarias': { fill: '#00C7B4', text: '#007F8D' },
  'Plataforma Livvo': { fill: '#3B7EFF', text: '#2A5FCC' },
  'Guías y casos de uso': { fill: '#0099A8', text: '#007F8D' },
  'Actualidad del sector': { fill: '#0D1424', text: '#0D1424' },
};

const root = process.cwd();
const fontFile = (weight: number) =>
  readFileSync(
    join(root, `node_modules/@fontsource/open-sans/files/open-sans-latin-${weight}-normal.woff`)
  );
const svgDataUri = (file: string, replaceCurrentColor: string) =>
  'data:image/svg+xml;base64,' +
  Buffer.from(
    readFileSync(join(root, 'public', file), 'utf-8').replaceAll('currentColor', replaceCurrentColor)
  ).toString('base64');

let cache: { fonts: any[]; logo: string; symbol: string } | undefined;
function assets() {
  cache ??= {
    fonts: [
      { name: 'Open Sans', data: fontFile(400), weight: 400, style: 'normal' },
      { name: 'Open Sans', data: fontFile(600), weight: 600, style: 'normal' },
      { name: 'Open Sans', data: fontFile(700), weight: 700, style: 'normal' },
    ],
    logo: svgDataUri('Livvo_logo.svg', '#0D1424'),
    symbol: svgDataUri('Livvo_symbol.svg', '#0D1424'),
  };
  return cache;
}

// Tamaño del título según su longitud, para que entre en 3 líneas como máximo.
function titleSize(title: string): number {
  if (title.length <= 55) return 68;
  if (title.length <= 80) return 58;
  return 50;
}

type Node = { type: string; props: Record<string, unknown> };
const el = (type: string, style: Record<string, unknown>, children?: unknown, extra = {}): Node => ({
  type,
  props: { style, children, ...extra },
});

export async function renderOgImage(opts: { title: string; category: string }): Promise<Buffer> {
  const { fonts, logo, symbol } = assets();
  const accent = ACCENTS[opts.category] ?? ACCENTS['Guías y casos de uso'];

  const tree = el(
    'div',
    {
      width: OG_WIDTH,
      height: OG_HEIGHT,
      display: 'flex',
      position: 'relative',
      backgroundColor: '#F7F9FC',
      backgroundImage: `radial-gradient(circle at 12% 8%, ${accent.fill}26 0%, transparent 42%), radial-gradient(circle at 95% 100%, ${accent.fill}1F 0%, transparent 45%)`,
      fontFamily: 'Open Sans',
    },
    [
      // Símbolo VV tenue como marca de agua, abajo a la derecha.
      el('img', { position: 'absolute', right: -40, bottom: -60, opacity: 0.07 }, undefined, {
        src: symbol,
        width: 420,
        height: 420,
      }),
      el(
        'div',
        {
          display: 'flex',
          flexDirection: 'column',
          width: OG_WIDTH,
          height: OG_HEIGHT,
          padding: '60px 76px',
        },
        [
          el('div', { display: 'flex', alignItems: 'center', justifyContent: 'space-between' }, [
            el('img', {}, undefined, { src: logo, width: 112, height: 72 }),
            el(
              'div',
              {
                display: 'flex',
                fontSize: 24,
                fontWeight: 600,
                color: accent.text,
                backgroundColor: `${accent.fill}1F`,
                padding: '10px 22px',
                borderRadius: 999,
              },
              opts.category
            ),
          ]),
          // El título ocupa el espacio central (flexGrow) y el pie queda siempre visible abajo.
          el('div', { display: 'flex', flexGrow: 1, alignItems: 'center', paddingBottom: 8 }, [
            el(
              'div',
              {
                display: 'flex',
                fontSize: titleSize(opts.title),
                fontWeight: 700,
                lineHeight: 1.14,
                letterSpacing: -1.5,
                color: '#0D1424',
                maxWidth: 1000,
              },
              opts.title
            ),
          ]),
        ]
      ),
      // Pie fijo al fondo del lienzo, fuera del flujo del contenido.
      el(
        'div',
        {
          position: 'absolute',
          left: 76,
          bottom: 52,
          display: 'flex',
          fontSize: 26,
          fontWeight: 600,
          color: '#5B6478',
        },
        'livvo.tech/blog'
      ),
    ]
  );

  const svg = await satori(tree as any, { width: OG_WIDTH, height: OG_HEIGHT, fonts });
  return new Resvg(svg, { fitTo: { mode: 'width', value: OG_WIDTH } }).render().asPng();
}
