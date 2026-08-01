// Configuración central del sitio: cambia el número o el mensaje aquí
// y se actualiza en todos los CTAs (hero, pricing, footer, etc.).
export const WHATSAPP_NUMBER = '573144267806';
export const WHATSAPP_MESSAGE = 'Hola equipo livvo, visité su pagina web y quisiera más información de sus servicios';

export const WHATSAPP_URL =
  `https://wa.me/${WHATSAPP_NUMBER}?text=` + encodeURIComponent(WHATSAPP_MESSAGE);

// URLs de login de los productos (página /ingresar).
// Por ahora ambos viven en app.livvo.tech; cuando existan los subdominios
// crm.livvo.tech / agentes.livvo.tech, cambiar solo estas dos líneas.
export const CRM_LOGIN_URL = 'https://app.livvo.tech';
export const AGENTES_LOGIN_URL = 'https://app.livvo.tech';
