/** Livvo Design System — Tailwind config
 *  Tailwind v3: pega `theme.extend` en tu tailwind.config.js.
 *  Tailwind v4: usa tokens.css con @theme, o replica estos valores.
 *  Recuerda añadir las fuentes (Bricolage Grotesque / Instrument Sans / Geist Mono)
 *  en tu <head> o vía @import.
 */
module.exports = {
  theme: {
    extend: {
      colors: {
        teal:      { DEFAULT: '#00C7B4', deep: '#0099A8' },
        brandblue: { DEFAULT: '#3B9EFF', mid: '#A8D4FF', light: '#DEEEFF' },
        violet:    { DEFAULT: '#6C63FF', deep: '#4A44CC' }, // solo Luisa IA
        navy:      '#0D1424',
        dark:      '#070B14',
        ink:       '#111111', // texto de cuerpo
        muted:     '#6B7280',
        surface:   '#F1F3F8',
        graybg:    '#F8FAFC',
        line:      '#E5E7EB',
        success:   '#22C55E',
        warning:   '#FFB547',
        danger:    '#FF5470',
      },
      fontFamily: {
        display: ['"Bricolage Grotesque"', 'system-ui', 'sans-serif'],
        sans:    ['"Instrument Sans"', 'system-ui', 'sans-serif'],
        mono:    ['"Geist Mono"', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        btn:  '9px',
        card: '16px',
      },
      boxShadow: {
        sm:    '0 2px 8px rgba(13,20,36,0.08)',
        md:    '0 6px 20px rgba(13,20,36,0.12)',
        glow:  '0 6px 20px rgba(13,20,36,0.1), 0 0 20px rgba(0,199,180,0.18)',
        hover: '0 8px 32px rgba(0,0,0,0.07)',
      },
      backgroundImage: {
        'grad-cta':    'linear-gradient(135deg, #00C7B4 0%, #0099A8 100%)',
        'grad-flow':   'linear-gradient(135deg, #00C7B4 0%, #3B9EFF 100%)',
        'grad-violet': 'linear-gradient(135deg, #6C63FF 0%, #4A44CC 100%)',
      },
      spacing: {
        // escala de marca (además de la default de Tailwind)
        '1.livvo': '4px', '2.livvo': '8px', '3.livvo': '12px',
        '4.livvo': '16px', '6.livvo': '24px', '8.livvo': '32px', '12.livvo': '48px',
      },
      maxWidth: { site: '1280px' },
      transitionDuration: { brand: '200ms' },
    },
  },
};
