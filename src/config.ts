// Configuración central del sitio: cambia el número o el mensaje aquí
// y se actualiza en todos los CTAs (hero, pricing, footer, etc.).
export const WHATSAPP_NUMBER = '573144267806';
export const WHATSAPP_MESSAGE = 'Hola equipo livvo, visité su pagina web y quisiera más información de sus servicios';

export const WHATSAPP_URL =
  `https://wa.me/${WHATSAPP_NUMBER}?text=` + encodeURIComponent(WHATSAPP_MESSAGE);

// Entrada a la plataforma: el botón "Ingresar" del header lleva directo
// al onboarding de la app (sin página intermedia de selección de producto).
export const APP_URL = 'https://app.livvo.tech';
