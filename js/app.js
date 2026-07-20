/* ═══════════════════════════════════════════════
   GRAN PATRÓN TAQUERÍA — app.js
   Lenis + GSAP ScrollTrigger + canvas scrubbing + carrito WhatsApp

   ARQUITECTURA A PRUEBA DE FALLOS:
   - El menú y el carrito se renderizan PRIMERO y no dependen del canvas,
     de GSAP ni de Lenis. Si algo falla, la carta se pinta sí o sí.
   - Cada módulo se inicializa dentro de su propio try/catch (safe()):
     un error en un módulo no tumba a los demás.
   - Si GSAP/ScrollTrigger/Lenis no cargan (CDN caído, red corporativa,
     navegador viejo), hay fallbacks nativos: scroll normal, contenido
     visible sin animaciones y scrub del hero con el evento scroll.
   - Los datos del menú van inline en este archivo (no hay fetch() ni
     JSON externo que pueda fallar por rutas o mayúsculas/minúsculas).
   ═══════════════════════════════════════════════ */

"use strict";

/* ── DETECCIÓN DE LIBRERÍAS ─────────────────── */
var HAS_GSAP = typeof gsap !== "undefined";
var HAS_ST = HAS_GSAP && typeof ScrollTrigger !== "undefined";
var HAS_LENIS = typeof Lenis !== "undefined";

function safe(name, fn) {
  try {
    fn();
  } catch (error) {
    // Nunca detenemos el resto de la página por un módulo roto.
    if (window.console && console.error) console.error("[GranPatrón] módulo «" + name + "» falló:", error);
  }
}

/* La página siempre debe abrir en el inicio (no a mitad de página).
   Desactivamos la restauración de scroll del navegador y forzamos el tope. */
safe("scroll-restoration", () => {
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  if (location.hash) history.replaceState(null, "", location.pathname + location.search);
  window.scrollTo(0, 0);
  window.addEventListener("beforeunload", () => window.scrollTo(0, 0));
});

if (HAS_ST) {
  gsap.registerPlugin(ScrollTrigger);
  // Evita que ScrollTrigger recuerde/restaure la posición previa (en desktop
  // esto hacía que la página abriera al final del hero, ya en el menú).
  ScrollTrigger.clearScrollMemory("manual");
}

/* LIBERACIÓN GLOBAL DE COMPONENTES:
   Si no hay motor de animaciones (GSAP/ScrollTrigger ausentes, CDN caído,
   navegador viejo), marcamos el <body> con .animations-disabled para que el
   CSS muestre TODO el contenido (textos, footer, feed de Instagram,
   decoraciones) al 100% de inmediato y estático. Nada queda amarrado a una
   animación que no va a ejecutarse. */
if (!HAS_GSAP || !HAS_ST) {
  safe("fallback sin animaciones", () => {
    if (document.body) document.body.classList.add("animations-disabled");
    else document.addEventListener("DOMContentLoaded", () => document.body.classList.add("animations-disabled"));
  });
}

/* Fuerza el tope tanto en el scroll nativo como en el estado interno de
   Lenis. Ambos deben coincidir o Lenis vuelve a saltar a su posición vieja. */
function forceScrollTop() {
  window.scrollTo(0, 0);
  if (window.lenis) window.lenis.scrollTo(0, { immediate: true, force: true });
}
// El navegador puede restaurar el scroll justo después de 'load'; lo pisamos.
window.addEventListener("load", () => {
  forceScrollTop();
  requestAnimationFrame(forceScrollTop);
});

/* ── CONFIG ─────────────────────────────────── */
const FRAME_COUNT = 27;
/* ASSET_V rompe cachés viejos: los frames se han reemplazado manteniendo el
   mismo nombre de archivo, y un celular con caché antiguo mezclaba secuencias
   (frames viejos + nuevos = parpadeos y "fantasmas"). Subir la versión
   obliga a todos los dispositivos a bajar la secuencia vigente. */
const ASSET_V = "8";
const FRAME_PATH = (i) => `assets/frames/frame_${String(i + 1).padStart(3, "0")}.webp?v=${ASSET_V}`;
const PRELOAD_CONCURRENCY = 8;   // descargas en paralelo del preload
const IMAGE_SCALE = 0.92;   // padded cover (taco protagonista)
const FRAME_SPEED = 1.6;    // el slogan se alcanza a ~62% del scroll y queda congelado el resto
const START_FRAME = 0;
const WA_NUMERO = "573143564723";
const IMG = (slug) => `assets/img/menu/${slug}.webp`;
const LICOR_IMG = (slug) => `assets/img/menu/${slug}.png`;

const fmt = (n) => "$" + n.toLocaleString("es-CO");

/* ── MENÚ (transcrito exacto de la carta 2026) ─ */
const MENU_COCINA = [
  {
    id: "entradas", tab: "Entradas", tagline: "“Para ir calentando motores”",
    items: [
      { n: "Volcanes", d: "Base de tortilla crujiente, queso gratinado, proteína a elegir.", p: 10000, img: IMG("volcanes") },
      { n: "Esquites", d: "Maíz desgranado, crema, queso, chicharrón, limón.", p: 25000, img: IMG("esquites") },
      { n: "Nachos Sencillos", d: "Totopos, frijoles refritos, guacamole.", p: 16000, img: IMG("nachos-sencillos") },
      { n: "Dorilocos", d: "Doritos, birria, lechuga, pico de gallo, guacamole, limón.", p: 21000, img: IMG("dorilocos") },
      { n: "Flautas x3", d: "Tinga de pollo, salsas y crema.", p: 20000, img: IMG("flautas") },
      { n: "Chicharrón con Guacamole", d: "Crujiente por fuera, jugoso por dentro, con guacamole de la casa.", p: 28000, img: IMG("chicharron-guacamole") }
    ]
  },
  {
    id: "especiales", tab: "Especiales", tagline: "“Las joyas de la casa”",
    items: [
      { n: "Torta Mexicana", d: "Pan bolillo, carne, guacamole, queso, lechuga, cebolla encurtida.", p: 24000, img: IMG("torta-mexicana") },
      { n: "Chilaquiles rojos o verdes", d: "Totopos, huevo, queso, crema.", p: 25000, img: IMG("chilaquiles") },
      { n: "Sopa Tarasca", d: "Pollo desmenuzado, mazorca, aguacate, tortilla frita, crema, queso costeño.", p: 25000, img: IMG("sopa-tarasca") },
      { n: "Birriamen", d: "Fideos japoneses en consomé de birria, carne desmechada, picadillo.", p: 25000, img: IMG("birriamen") },
      { n: "Nachos Gran Patrón", d: "Carne, queso, guacamole, pico de gallo, sour cream.", p: 30000, img: IMG("nachos-gran-patron") },
      { n: "Bandeja Gran Patrón", d: "2 tacos + 1 quesadilla + 2 flautas de pollo.", p: 48000, img: IMG("bandeja-gran-patron"), featured: true }
    ]
  },
  {
    id: "tacos", tab: "Tacos x3", tagline: "De a tres, como manda la tradición",
    items: [
      { n: "Taco individual", d: "Para los indecisos: uno solo, del sabor que quieras.", p: 10000, img: IMG("taco-suadero") },
      { n: "Birria", d: "El clásico jugoso de la casa, con su consomé.", p: 27000, img: IMG("taco-birria") },
      { n: "Pastor", d: "Marinado al estilo CDMX, con piña.", p: 25000, img: IMG("taco-pastor") },
      { n: "Carnitas", d: "Cerdo confitado, dorado y tierno.", p: 27000, img: IMG("taco-carnitas") },
      { n: "Tinga de pollo", d: "Pollo deshebrado en salsa de chipotle.", p: 25000, img: IMG("taco-tinga") },
      { n: "Gobernador", d: "Camarón, queso fundido y tortilla dorada.", p: 30000, img: IMG("taco-gobernador") },
      { n: "Suadero", d: "Res suave, sellada en el comal.", p: 25000, img: IMG("taco-suadero") },
      { n: "Asada", d: "Res a la parrilla, con guacamole.", p: 25000, img: IMG("taco-asada") },
      { n: "Choriqueso", d: "Chorizo con queso fundido.", p: 25000, img: IMG("taco-choriqueso") },
      { n: "Vegetariano", d: "De la huerta al comal.", p: 17000, img: IMG("taco-vegetariano") },
      { n: "Chinchulines", d: "Para los valientes de verdad.", p: 25000, img: IMG("taco-chinchulines") },
      { n: "Chicharrón", d: "Crocante, con su guacamole.", p: 25000, img: IMG("taco-chicharron") },
      { n: "Temporada", d: "Pregunta por el taco del momento.", p: 25000, img: IMG("taco-temporada") },
      { n: "Taquiza x12", d: "12 tacos surtidos para compartir en manada.", p: 110000, img: "assets/img/plato-tacos-1.jpg", featured: true }
    ]
  },
  {
    id: "burritos", tab: "Burritos & Quesadillas", tagline: "Abrazos envueltos en tortilla",
    note: "Proteínas disponibles para burrito/quesadilla: Birria, Pastor, Carnitas, Tinga, Suadero, Asada, Chorizo, Chinchulines, Hígado, Chicharrón.",
    items: [
      { n: "Burrito Gran Patrón", d: "Proteína a elegir, tortilla de harina, queso, arroz, frijol, guacamole, sour cream, pico de gallo, salsas.", p: 39000, img: IMG("burrito-gran-patron"), featured: true },
      { n: "Burrito", d: "220g proteína, guacamole, picadillo.", p: 30000, img: IMG("burrito") },
      { n: "Quesadilla", d: "Proteína a elegir, tortilla de maíz, queso, picadillo, salsas.", p: 18000, img: IMG("quesadilla") },
      { n: "Solo Queso", d: "Quesadilla clásica, pura felicidad fundida.", p: 12000, img: IMG("solo-queso") },
      { n: "Menú Infantil", d: "Miniquesadilla asada o pollo, sin picante, jugo de caja + huevo sorpresa.", p: 25000, img: IMG("menu-infantil") }
    ]
  },
  {
    id: "postres", tab: "Postres", tagline: "El final feliz",
    items: [
      { n: "Cajeta Tradicional", d: "Dulce de leche de cabra, como en México.", p: 12000, img: IMG("cajeta") },
      { n: "Churros", d: "Recién hechos, con azúcar y canela.", p: 16000, img: IMG("churros") },
      { n: "Bola de Fuego", d: "El postre con espectáculo incluido.", p: 17000, img: IMG("bola-de-fuego") },
      { n: "Nieves (helado)", d: "Para apagar la Salsa Fantasma.", p: 7000, img: IMG("nieves") }
    ]
  }
];

const MENU_BARRA = [
  {
    id: "bebidas", tab: "Aguas & Refrescos", tagline: "Aguas frescas y limonadas de la casa",
    items: [
      { n: "Horchata", d: "Arroz, canela y tradición.", p: 9000, img: IMG("horchata") },
      { n: "Agua de Jamaica", p: 8000, img: IMG("agua-jamaica") },
      { n: "Agua de Pepino", p: 8000, img: IMG("agua-pepino") },
      { n: "Agua Tamarindo", p: 8000, img: IMG("agua-tamarindo") },
      { n: "Gaseosa", p: 7000, img: IMG("gaseosa") },
      { n: "Agua Natural", p: 6000, img: IMG("agua-natural") },
      { n: "Limonada", p: 10000, img: IMG("limonada") },
      { n: "Limonada Cerezada", p: 14000, img: IMG("limonada-cerezada") },
      { n: "Limonada de Coco", p: 16000, img: IMG("limonada-coco") },
      { n: "Gatorade", p: 8000, img: IMG("gatorade") },
      { n: "Soda Saborizada", d: "Frutos rojos o amarillos.", p: 15000, img: IMG("soda-saborizada") }
    ]
  },
  {
    id: "cervezas", tab: "Cervezas", tagline: "Bien frías, como debe ser",
    items: [
      { n: "Cerveza Nacional", p: 12000, img: IMG("cerveza-nacional") },
      { n: "Coronita", p: 11000, img: IMG("coronita") },
      { n: "Cerveza Sol", p: 11000, img: IMG("cerveza-sol") },
      { n: "Stella Artois", p: 15000, img: IMG("stella-artois") },
      { n: "Corona", p: 18000, img: IMG("corona") },
      { n: "Cerveza Modelo", p: 20000, img: IMG("cerveza-modelo") }
    ]
  },
  {
    id: "cocteles", tab: "Cócteles", tagline: "Aquí empieza la rumba",
    items: [
      { n: "Paloma", d: "Tequila, toronja y tajín.", p: 20000, img: IMG("paloma") },
      { n: "El Azulito", d: "Azul eléctrico, con gomitas.", p: 20000, img: IMG("el-azulito") },
      { n: "Paloma Sinaloense", d: "La paloma, pero con carácter.", p: 24000, img: IMG("paloma-sinaloense") },
      { n: "Cantarito Personal", d: "Cítricos y tequila en jarrito de barro.", p: 25000, img: IMG("cantarito-personal") },
      { n: "Perla Negra", d: "Oscura, misteriosa y peligrosa.", p: 30000, img: IMG("perla-negra") },
      { n: "Cantarito x10 personas", d: "El jarro gigante para toda la mesa.", p: 200000, img: IMG("cantarito-x10"), featured: true }
    ]
  },
  {
    id: "licores", tab: "Licores & Botellas", tagline: "La reserva del patrón", premium: true,
    items: [
      { n: "½ Aguardiente Amarillo", p: 75000, img: LICOR_IMG("aguardiente-amarillo-media"), tag: "Media botella", type: "Aguardiente" },
      { n: "½ Aguardiente Ant. Azul", p: 75000, img: LICOR_IMG("aguardiente-antioqueno-media"), tag: "Media botella", type: "Aguardiente" },
      { n: "Aguardiente Néctar Verde", p: 110000, img: LICOR_IMG("nectar-verde"), tag: "Botella", type: "Aguardiente" },
      { n: "Aguardiente Ant. Azul", p: 130000, img: LICOR_IMG("aguardiente-antioqueno"), tag: "Botella", type: "Aguardiente" },
      { n: "Aguardiente Amarillo", p: 130000, img: LICOR_IMG("aguardiente-amarillo"), tag: "Botella", type: "Aguardiente" },
      { n: "Tequila Jimador Blanco", p: 180000, img: LICOR_IMG("jimador-blanco"), tag: "Botella", type: "Tequila" },
      { n: "Tequila Jimador Reposado", p: 190000, img: LICOR_IMG("jimador-reposado"), tag: "Botella", type: "Tequila" },
      { n: "Tequila Patrón Reposado", p: 450000, img: LICOR_IMG("patron-reposado"), tag: "Botella", type: "Tequila" },
      { n: "Don Julio 70 Cristalino", p: 600000, img: LICOR_IMG("don-julio-70"), tag: "Botella", type: "Tequila" },
      { n: "Whiskey Buchanans 12 Años", p: 250000, img: LICOR_IMG("buchanans-12"), tag: "Botella", type: "Whisky" },
      { n: "Whiskey Buchanans Two S", p: 360000, img: LICOR_IMG("buchanans-two-souls"), tag: "Botella", type: "Whisky" }
    ]
  }
];

const SALSAS = [
  { n: "Taquera verde", f: "La de siempre: fresca y confiable.", h: 1, label: "Suave" },
  { n: "Guayaba", f: "Dulce, con carácter escondido.", h: 2, label: "Media" },
  { n: "Maracuyá", f: "Tropical y engañosamente amable.", h: 2, label: "Media" },
  { n: "Lulo", f: "Ácida y brava, bien colombiana.", h: 3, label: "Fuerte" },
  { n: "Salsa Gran Patrón", f: "La receta secreta de la casa.", h: 3, label: "Fuerte" },
  { n: "Molcajeteada", f: "Molida en molcajete, con humo.", h: 4, label: "¡Extrema!" },
  { n: "Salsa Fantasma", f: "Solo para valientes de verdad.", h: 4, label: "¡Extrema!" }
];

const CHILE_SVG = `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M16.2 3.2c.5-.9 1.6-1.4 2.6-1.1-.2.8-.8 1.5-1.6 1.8.9.5 1.5 1.4 1.6 2.5.1 1.5-.7 8.2-5.4 12.9-3 3-6.9 4-9.9 3.4-.8-.2-1-.7-.3-1.1 4.8-2.6 7.4-5 8.9-8.7.8-2 .9-4.4.5-6.3-.2-1.2.4-2.4 1.5-2.9.7-.3 1.5-.3 2.1-.5z"/></svg>`;

/* ── LENIS + SCROLLTRIGGER (con fallback nativo) ── */
/* Si Lenis no cargó, usamos un shim con la misma interfaz sobre el scroll
   nativo del navegador: la página funciona igual, solo sin inercia suave. */
const lenis = HAS_LENIS
  ? new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true
    })
  : {
      on() {},
      raf() {},
      scrollTo(target, opts) {
        opts = opts || {};
        let y = 0;
        if (typeof target === "number") {
          y = target;
        } else {
          const el = typeof target === "string" ? document.querySelector(target) : target;
          if (el) y = el.getBoundingClientRect().top + window.pageYOffset + (opts.offset || 0);
        }
        window.scrollTo({ top: y, behavior: opts.immediate ? "auto" : "smooth" });
      }
    };

if (HAS_LENIS && HAS_ST) {
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
}
window.lenis = lenis;

/* ── CANVAS DEL HERO ────────────────────────── */
const canvas = document.getElementById("canvas");
/* alpha:false = canvas 100% opaco (nunca deja ver lo que hay detrás).
   OJO: quitamos `desynchronized: true` — en varios Android/iPhone esa vía
   se salta la sincronía vertical del compositor y era la causa real de los
   parpadeos ("el alma del taco") en scroll ultra rápido. Con el pipeline
   sincronizado, cada frame pintado queda retenido hasta el siguiente. */
const ctx = canvas ? canvas.getContext("2d", { alpha: false }) : null;
const frames = new Array(FRAME_COUNT).fill(null);
// Color de fondo pre-calculado por frame (una sola vez, al precargar). Evita
// getImageData() durante el scroll — ese readback GPU→CPU era el causante de
// micro-tirones en gama media/baja. En el hot path solo leemos de este array.
const bgColors = new Array(FRAME_COUNT).fill(null);
let currentFrame = 0;         // último frame entero solicitado
let lastDrawnFrame = -1;      // último frame REALMENTE pintado (debounce estricto)
let scrollTarget = 0;         // frame exacto que pide el scroll (float)
let renderedFrame = 0;        // frame interpolado que persigue a scrollTarget
let rafLoopActive = false;
let heroProgress = 0;         // progreso de scroll del hero (0..1)
let heroVisualsDirty = false; // pinta overlay/scrim dentro del rAF
let lastSloganOpacity = -1;   // cache para no tocar el DOM si no cambió
const LERP_FACTOR = 0.15;     // suavizado del scroll (currentFrame += (target - current) * 0.15)
const LERP_EPSILON = 0.01;    // umbral para considerar el lerp "asentado"
// El slogan aparece cuando la animación llega a sus frames finales
// (con FRAME_SPEED 1.6 los frames terminan en p = 1/1.6 ≈ 0.625).
const SLOGAN_IN_START = 0.56;
const SLOGAN_IN_END = 0.66;

/* Geometría de dibujo cacheada: como los 27 frames comparten tamaño (1280×720)
   y el canvas no cambia entre scrolls, el rectángulo destino (dw,dh,dx,dy) es
   idéntico en cada frame. Lo calculamos una vez por resize en vez de 60 veces
   por segundo durante el scroll. */
let drawRect = null;               // { dw, dh, dx, dy }
let geomKey = "";                  // firma cw|ch|iw|ih para invalidar el caché

/* Asignar canvas.width/height RESETEA todo el estado del contexto (smoothing,
   fillStyle, etc.). Centralizamos aquí la config para re-aplicarla tras cada
   resize. imageSmoothingQuality "low" = downscale más barato (imperceptible a
   este tamaño) → menos trabajo de GPU por frame en gama baja. */
function configureContext() {
  if (!ctx) return;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "low";
}

/* Solo reasigna width/height del canvas cuando cambian de verdad. Escribir
   canvas.width/height (aunque sea el mismo valor) limpia el buffer e invalida
   el caché de textura de la GPU, así que lo evitamos fuera de los resizes reales. */
function resizeCanvas() {
  if (!canvas || !ctx) return;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const w = Math.round(canvas.clientWidth * dpr);
  const h = Math.round(canvas.clientHeight * dpr);
  // Ventana aún sin tamaño (p. ej. pestaña en segundo plano): reintenta.
  if (!w || !h) { requestAnimationFrame(resizeCanvas); return; }
  if (canvas.width !== w || canvas.height !== h) {
    canvas.width = w;
    canvas.height = h;
    geomKey = "";            // el tamaño cambió: recalcular geometría al pintar
  }
  configureContext();        // el reset del buffer borró el estado; re-aplicar
  drawFrame(currentFrame);
}

function nearestLoadedIndex(index) {
  // Solo cuentan frames 100% listos (descargados Y decodificados). Si el
  // pedido aún no está, devolvemos el más cercano hacia atrás; si no hay
  // ninguno (-1), drawFrame no toca el lienzo y el último pintado queda retenido.
  for (let i = index; i >= 0; i--) {
    const f = frames[i];
    if (f && f.complete && f.naturalWidth > 0) return i;
  }
  return -1;
}

/* Muestrea el color de las 4 esquinas de una imagen ya decodicada. Se llama
   UNA vez por frame durante la precarga (fuera del scroll), nunca en el hot
   path — por eso el getImageData aquí no cuesta nada visible. */
function sampleBgColorFrom(img) {
  try {
    const off = document.createElement("canvas");
    off.width = 10; off.height = 10;
    const octx = off.getContext("2d");
    octx.drawImage(img, 0, 0, 10, 10);
    const corners = [[0, 0], [9, 0], [0, 9], [9, 9]];
    let r = 0, g = 0, b = 0;
    corners.forEach(([x, y]) => {
      const d = octx.getImageData(x, y, 1, 1).data;
      r += d[0]; g += d[1]; b += d[2];
    });
    return `rgb(${Math.round(r / 4)},${Math.round(g / 4)},${Math.round(b / 4)})`;
  } catch (e) {
    return "#e9e7e4"; // fallback neutro si el canvas se ensucia (CORS, etc.)
  }
}

/* REGLA DE RENDERIZADO (frame locking — escudo visual absoluto):
   - Aquí NO existe ningún clearRect ni borrado preventivo del lienzo.
   - El repintado es fillRect + drawImage contiguos, en el mismo tick, y
     SOLO cuando hay un frame completamente cargado y decodificado.
   - Si el scroll va más rápido que la red/decodificación, salimos sin
     tocar el canvas: el último frame pintado queda retenido en pantalla
     y el ojo jamás ve un fondo vacío, blanco o transparente.
   - Cero getImageData en el hot path: el color de fondo ya viene pre-calculado
     en bgColors[]; la geometría de dibujo viene cacheada en drawRect. */
function drawFrame(index) {
  if (!ctx) return;
  const useIndex = nearestLoadedIndex(index);
  if (useIndex < 0) return; // lienzo retenido: se conserva el último frame sólido
  const img = frames[useIndex];
  const cw = canvas.width, ch = canvas.height;
  const iw = img.naturalWidth, ih = img.naturalHeight;
  // Recalcula la geometría solo si cambió el tamaño de canvas o de imagen.
  const key = cw + "|" + ch + "|" + iw + "|" + ih;
  if (key !== geomKey) {
    const scale = Math.max(cw / iw, ch / ih) * IMAGE_SCALE;
    const dw = iw * scale, dh = ih * scale;
    drawRect = { dw, dh, dx: (cw - dw) / 2, dy: (ch - dh) / 2 };
    geomKey = key;
  }
  ctx.fillStyle = bgColors[useIndex] || "#e9e7e4";
  ctx.fillRect(0, 0, cw, ch);
  ctx.drawImage(img, drawRect.dx, drawRect.dy, drawRect.dw, drawRect.dh);
  lastDrawnFrame = index;
}

function scheduleFrameDraw() {
  if (rafLoopActive) return;
  rafLoopActive = true;
  requestAnimationFrame(frameLoop);
}

/* Todo el redibujado (canvas + overlays del hero) ocurre aquí, una sola
   vez por frame de pantalla, para no bloquear el hilo principal en móvil.
   El frame renderizado sigue al del scroll con interpolado lineal (lerp),
   de modo que un scroll brusco se traduce en una animación suave. */
function frameLoop() {
  const diff = scrollTarget - renderedFrame;
  if (Math.abs(diff) < LERP_EPSILON) {
    renderedFrame = scrollTarget;      // snap final para clavar el último frame
  } else {
    renderedFrame += diff * LERP_FACTOR;
  }
  const idx = Math.round(renderedFrame);
  currentFrame = idx;
  // Debounce estricto: solo dibujamos si el frame entero cambió respecto al
  // último pintado. Un scroll que no cruza un frame nuevo NO redibuja nada.
  // (drawFrame actualiza lastDrawnFrame internamente.)
  if (idx !== lastDrawnFrame) {
    drawFrame(idx);
  }
  if (heroVisualsDirty) {
    const p = heroProgress;
    const overlayOpacity = Math.max(0, 1 - p / 0.45);
    heroOverlay.style.opacity = overlayOpacity;
    heroOverlay.style.visibility = overlayOpacity <= 0.01 ? "hidden" : "visible";
    heroScrim.style.opacity = p < 0.5 ? 1 : Math.max(0, 1 - (p - 0.5) / 0.35);
    // Slogan sobre el taco abierto: entra suave y queda fijo en la zona
    // congelada del final del hero.
    const sloganOpacity = Math.max(0, Math.min(1, (p - SLOGAN_IN_START) / (SLOGAN_IN_END - SLOGAN_IN_START)));
    if (sloganOpacity !== lastSloganOpacity) {
      heroSlogan.style.opacity = sloganOpacity;
      heroSlogan.style.transform = `translateX(-50%) translateY(${(1 - sloganOpacity) * 28}px)`;
      heroSlogan.style.visibility = sloganOpacity <= 0.01 ? "hidden" : "visible";
      lastSloganOpacity = sloganOpacity;
    }
    heroVisualsDirty = false;
  }
  // Sigue corriendo mientras el lerp no se haya asentado o queden visuales.
  if (Math.abs(scrollTarget - renderedFrame) >= LERP_EPSILON || heroVisualsDirty) {
    requestAnimationFrame(frameLoop);
  } else {
    rafLoopActive = false;
  }
}

/* ── LOADER + PRELOAD DE TODOS LOS FRAMES ── */
const loader = document.getElementById("loader");
const loaderBar = document.getElementById("loader-bar");
const loaderPercent = document.getElementById("loader-percent");
let siteRevealed = false;

function loadFrame(i) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      // FRAME LOCKING: el frame solo entra al array cuando está DECODIFICADO
      // en RAM (no solo descargado). Así drawImage nunca espera un decode a
      // mitad de scroll ni pinta un bitmap a medias.
      const ready = () => {
        // Pre-cálculo del color de fondo AQUÍ (fuera del hot path del scroll).
        bgColors[i] = sampleBgColorFrom(img);
        frames[i] = img;   // publicar al array como último paso: ya está listo
        resolve(img);
      };
      if (img.decode) img.decode().then(ready, ready);
      else ready();
    };
    img.onerror = () => resolve(null);
    img.src = FRAME_PATH(i);
  });
}

/* Precarga inteligente: descarga TODOS los frames (con concurrencia
   limitada para no saturar la red del móvil) antes de revelar la
   animación, garantizando un scrub fluido sin tirones. */
async function preloadFrames() {
  let loaded = 0;
  let next = 0;

  const updateProgress = () => {
    const pct = Math.round((loaded / FRAME_COUNT) * 100);
    if (loaderBar) loaderBar.style.width = pct + "%";
    if (loaderPercent) loaderPercent.textContent = pct + "%";
    // El primer frame ya está listo: pintamos el póster cuanto antes.
    if (loaded === 1) revealFirstFrame();
  };

  async function worker() {
    while (next < FRAME_COUNT) {
      const i = next++;
      await loadFrame(i);
      loaded++;
      updateProgress();
    }
  }

  const workers = [];
  for (let w = 0; w < Math.min(PRELOAD_CONCURRENCY, FRAME_COUNT); w++) {
    workers.push(worker());
  }
  await Promise.all(workers);
  revealSite();
  // Los frames ya están en RAM: ahora la red queda libre para calentar
  // en caché las botellas premium y las decoraciones estructurales.
  safe("precarga botellas y decoración", preloadCriticalImages);
}

/* BALANCEO DE RED: los frames del taco tienen la prioridad inicial,
   pero apenas terminan forzamos la descarga (prioridad alta) de las
   botellas de licores y las imágenes estructurales. Así, en datos móviles
   lentos, cuando el usuario llega a La Barra las botellas ya están en
   caché en vez de quedar relegadas por el navegador. */
function preloadCriticalImages() {
  const urls = [];
  MENU_BARRA.forEach((cat) => {
    if (cat.premium) cat.items.forEach((it) => { if (it.img) urls.push(it.img); });
  });
  urls.push(
    "assets/img/meme-amor.jpg",
    "assets/img/logo-banner.png",
    "assets/img/nosotros-patio.webp",
    "assets/img/ubicacion-patio.jpg"
  );
  let next = 0;
  function worker() {
    if (next >= urls.length) return;
    const img = new Image();
    if ("fetchPriority" in img) img.fetchPriority = "high";
    img.onload = worker;
    img.onerror = worker;
    img.src = urls[next++];
  }
  // 4 descargas en paralelo: suficiente para avanzar rápido sin ahogar
  // la red del celular mientras el usuario ya navega la página.
  for (let i = 0; i < 4; i++) worker();
}

function revealFirstFrame() {
  resizeCanvas();
  drawFrame(0);
}

function revealSite() {
  if (siteRevealed) return;
  siteRevealed = true;
  resizeCanvas();
  drawFrame(0);
  // Recalculamos posiciones ahora que el layout ya es estable y limpiamos
  // cualquier memoria de scroll para arrancar siempre en el hero.
  if (HAS_ST) {
    ScrollTrigger.clearScrollMemory("manual");
    ScrollTrigger.refresh();
  }
  // Aseguramos que al mostrar el sitio quede exactamente en el inicio.
  // Repetimos en varios ticks porque Lenis/ScrollTrigger pueden reintentar
  // restaurar su posición previa justo después del reveal.
  forceScrollTop();
  requestAnimationFrame(() => {
    forceScrollTop();
    requestAnimationFrame(forceScrollTop);
  });
  if (loader) {
    loader.classList.add("done");
    setTimeout(() => {
      if (loader.parentNode) loader.parentNode.removeChild(loader);
      forceScrollTop();
    }, 900);
  }
  document.body.classList.add("loaded");
}

/* ── SCRUB DE FRAMES EN LA ZONA DEL HERO ────── */
const heroScroll = document.getElementById("hero-scroll");
const heroOverlay = document.getElementById("hero-overlay");
const heroScrim = document.getElementById("hero-scrim");
const heroSlogan = document.getElementById("hero-slogan");

function onHeroProgress(p) {
  // Productor ligero: solo guarda estado y marca "dirty". El trabajo de
  // dibujo se hace en el rAF loop (throttle natural a 60fps).
  heroProgress = p;
  const accelerated = Math.min(p * FRAME_SPEED, 1);
  const playable = FRAME_COUNT - START_FRAME;
  scrollTarget = Math.min(START_FRAME + accelerated * playable, FRAME_COUNT - 1);
  heroVisualsDirty = true;
  scheduleFrameDraw();
}

function initHeroScrub() {
  if (HAS_ST) {
    ScrollTrigger.create({
      trigger: heroScroll,
      start: "top top",
      end: "bottom top",
      scrub: true,
      onUpdate: (self) => onHeroProgress(self.progress)
    });
  } else {
    // Fallback sin ScrollTrigger: el scroll nativo calcula el progreso.
    const update = () => {
      const total = heroScroll.offsetHeight || 1;
      const p = Math.max(0, Math.min(1, (window.pageYOffset || 0) / total));
      onHeroProgress(p);
    };
    window.addEventListener("scroll", update, { passive: true });
    update();
  }
}

/* ── HEADER SÓLIDO AL HACER SCROLL ──────────── */
/* Lenis desplaza la ventana nativa, así que un solo listener nativo
   cubre ambos mundos (con y sin Lenis). */
function initHeader() {
  const header = document.getElementById("site-header");
  const update = () => header.classList.toggle("solid", (window.pageYOffset || 0) > 40);
  window.addEventListener("scroll", update, { passive: true });
  update();
}

/* ── NAV MÓVIL + SCROLL SUAVE A ANCLAS ──────── */
function initNav() {
  const navToggle = document.getElementById("nav-toggle");
  const headerNav = document.getElementById("header-nav");

  navToggle.addEventListener("click", () => {
    const open = headerNav.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", open);
  });

  document.querySelectorAll("[data-scroll]").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      headerNav.classList.remove("open");
      navToggle.setAttribute("aria-expanded", "false");
      lenis.scrollTo(link.dataset.scroll, { offset: -20, duration: 1.6 });
    });
  });

  document.getElementById("back-to-top").addEventListener("click", () => {
    lenis.scrollTo(0, { duration: 1.8 });
  });
}

/* ── ANIMACIONES DE ENTRADA POR SECCIÓN ─────── */
/* Sin GSAP no se registran: el contenido queda visible de una (gsap.from
   es quien lo oculta, así que su ausencia = todo pintado normal). */
const ENTRANCES = {
  "fade-up":    { from: { y: 50, opacity: 0 }, dur: 0.9, ease: "power3.out" },
  "scale-up":   { from: { y: 40, scale: 0.85, opacity: 0 }, dur: 1.0, ease: "power2.out" },
  "rotate-in":  { from: { y: 40, rotation: -10, opacity: 0 }, dur: 0.9, ease: "power3.out" },
  "stagger-up": { from: { y: 60, opacity: 0 }, dur: 0.8, ease: "power3.out" },
  "clip-reveal": { from: { clipPath: "inset(100% 0 0 0)", y: 30, opacity: 0 }, dur: 1.1, ease: "power4.inOut" },
  "blur-up":    { from: { y: 50, opacity: 0, filter: "blur(8px)" }, dur: 1.0, ease: "power3.out" },
  /* fade-soft: solo opacidad, lento y sin desplazamiento — para detalles
     susurrados como la firma "the world is yours". */
  "fade-soft":  { from: { opacity: 0 }, dur: 1.6, ease: "power1.out" }
};

function setupEntrances() {
  // Sin GSAP/ScrollTrigger no ocultamos nada: el contenido queda visible nativo.
  if (!HAS_ST) return;
  // Marca que las animaciones SÍ se van a manejar por JS. Mientras esta clase
  // no exista, el CSS fuerza todo visible (fallback si el script no corre).
  document.documentElement.classList.add("js-anim");

  const tweens = [];
  document.querySelectorAll("[data-animation]").forEach((el) => {
    const cfg = ENTRANCES[el.dataset.animation];
    if (!cfg) return;
    const children = el.querySelectorAll(
      ":scope > .section-label, :scope > .section-heading, :scope > .section-script, :scope > .section-body, " +
      ":scope > .menu-groups, :scope > .menu-tabs, :scope > .menu-swipe-hint, :scope > .menu-carousel, " +
      ".nosotros-card, .ig-header, .ig-highlights, .ig-grid, .ig-open, .salsa-card, " +
      ":scope > .ubicacion-ctas, :scope > .ubicacion-horario, :scope > .pedido-panel, .meme-frame img"
    );
    const targets = children.length ? children : [el];
    // Tween desacoplado del trigger: ScrollTrigger.refresh() (p. ej. al cambiar
    // de tab del menú) no puede revertirlo a mitad de la animación.
    // immediateRender:false es CLAVE para la compatibilidad: sin esto GSAP
    // aplica opacity:0 al instante y, si el ScrollTrigger no dispara en el
    // navegador, el contenido queda oculto para siempre. Con immediateRender
    // en false el estado "from" solo se aplica cuando el tween realmente se
    // reproduce; si nunca se dispara, el contenido permanece visible.
    const tween = gsap.from(targets, {
      ...cfg.from,
      duration: cfg.dur,
      ease: cfg.ease,
      stagger: 0.12,
      paused: true,
      immediateRender: false,
      clearProps: el.dataset.animation === "rotate-in" ? "" : "filter,clipPath"
    });
    ScrollTrigger.create({
      trigger: el,
      start: "top 78%",
      once: true,
      onEnter: () => tween.play()
    });
    tweens.push(tween);
  });

  // RED DE SEGURIDAD: en algunos navegadores el ScrollTrigger puede no
  // dispararse (cálculo de posiciones, proxy de scroll, etc.). Para que el
  // contenido —sobre todo la carta— NUNCA quede en opacity:0, forzamos el
  // estado final de cualquier tween que no se haya revelado.
  const revealPending = () => {
    tweens.forEach((tween) => {
      if (tween.paused() && tween.progress() === 0) tween.progress(1);
    });
  };
  window.addEventListener("load", () => setTimeout(revealPending, 1000));
  setTimeout(revealPending, 2800);
}

/* ── MENÚ INTERACTIVO (Cocina + Barra) ──────── */
function itemId(catId, name) {
  return catId + "::" + name;
}

/* MENÚ EN DOS NIVELES + CARRUSEL SWIPEABLE
   - Nivel 1: Comida | Bebidas (dentro de Bebidas, Licores va de segunda
     opción, justo después de las bebidas sin alcohol).
   - Nivel 2: filtros de categoría.
   - El swipe es el método principal: cada categoría es un panel de un
     carrusel con scroll-snap x mandatory; deslizar el dedo en cualquier
     parte del menú pasa de categoría. Los filtros siguen funcionando al
     tocarlos y se resaltan solos cuando el usuario desliza. */
const MENU_GRUPOS = [
  { id: "comida", label: "Comida", cats: MENU_COCINA },
  {
    id: "bebidas", label: "Bebidas",
    cats: ["bebidas", "licores", "cervezas", "cocteles"]
      .map((id) => MENU_BARRA.find((c) => c.id === id))
      .filter(Boolean)
  }
];

function initMenu() {
  const groupsEl = document.getElementById("menu-groups");
  const tabsEl = document.getElementById("tabs-menu");
  const carousel = document.getElementById("menu-carousel");
  if (!groupsEl || !tabsEl || !carousel) return;

  let grupo = MENU_GRUPOS[0];
  let activeIdx = 0;
  let panels = [];
  let syncing = false;     // true mientras un click de filtro anima el scroll
  let heightRO = null;

  function foodCard(cat, item) {
    const card = document.createElement("article");
    card.className = "menu-card" + (item.featured ? " featured" : "");
    card.innerHTML = `
      <img class="menu-card-thumb" src="${item.img}" alt="${item.n}" loading="lazy">
      <div class="menu-card-body">
        <div class="menu-card-top">
          <h4 class="menu-card-name">${item.n}</h4>
          <span class="menu-card-price">${fmt(item.p)}</span>
        </div>
        ${item.d ? `<p class="menu-card-desc">${item.d}</p>` : ""}
        <button class="menu-card-add" type="button" aria-label="Agregar ${item.n} al pedido">+</button>
      </div>`;
    wireAdd(card, cat, item);
    return card;
  }

  function licorCard(cat, item) {
    const card = document.createElement("article");
    card.className = "licor-card" + (item.featured ? " featured" : "");
    card.innerHTML = `
      <div class="licor-media">
        ${item.img
          ? `<img src="${item.img}" alt="${item.n}" loading="eager" fetchpriority="high" decoding="async">`
          : `<span class="licor-monogram">✿</span>`}
      </div>
      <div class="licor-info">
        <span class="licor-tag">${item.type} · ${item.tag}</span>
        <h4 class="licor-name">${item.n}</h4>
        <div class="licor-bottom">
          <span class="licor-price">${fmt(item.p)}</span>
          <button class="menu-card-add" type="button" aria-label="Agregar ${item.n} al pedido">+</button>
        </div>
      </div>`;
    wireAdd(card, cat, item);
    return card;
  }

  function wireAdd(card, cat, item) {
    card.querySelector(".menu-card-add").addEventListener("click", (e) => {
      addToCart(cat.id, item);
      e.currentTarget.classList.remove("added");
      void e.currentTarget.offsetWidth;
      e.currentTarget.classList.add("added");
    });
  }

  function buildPanel(cat) {
    const panel = document.createElement("div");
    panel.className = "menu-panel";
    panel.dataset.cat = cat.id;
    const tagline = document.createElement("p");
    tagline.className = "menu-tagline";
    tagline.textContent = cat.tagline;
    panel.appendChild(tagline);
    const grid = document.createElement("div");
    grid.className = "menu-grid" + (cat.premium ? " licores-grid" : "");
    cat.items.forEach((item) => grid.appendChild(cat.premium ? licorCard(cat, item) : foodCard(cat, item)));
    panel.appendChild(grid);
    if (cat.note) {
      const note = document.createElement("p");
      note.className = "menu-note";
      note.textContent = cat.note;
      panel.appendChild(note);
    }
    return panel;
  }

  /* La altura del carrusel sigue a la del panel activo: así Postres (4
     platos) no hereda el alto de Tacos (14) y no quedan huecos muertos. */
  function setCarouselHeight() {
    const p = panels[activeIdx];
    if (p) carousel.style.height = p.offsetHeight + "px";
  }

  function refreshLayoutSoon() {
    clearTimeout(refreshLayoutSoon.t);
    refreshLayoutSoon.t = setTimeout(() => { if (HAS_ST) ScrollTrigger.refresh(); }, 420);
  }

  function updateTabs(centerActive) {
    Array.prototype.forEach.call(tabsEl.children, (btn, i) => {
      btn.classList.toggle("active", i === activeIdx);
      btn.setAttribute("aria-selected", i === activeIdx);
    });
    const act = tabsEl.children[activeIdx];
    if (centerActive && act && act.scrollIntoView) {
      act.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    }
  }

  function setActive(idx, opts) {
    opts = opts || {};
    if (idx < 0 || idx >= panels.length) return;
    activeIdx = idx;
    updateTabs(true);
    if (opts.scrollCarousel) {
      syncing = true;
      const target = idx * carousel.clientWidth;
      carousel.scrollTo({ left: target, behavior: "smooth" });
      clearTimeout(setActive.t);
      setActive.t = setTimeout(() => {
        syncing = false;
        // Garantía de llegada: si el smooth scroll se suspendió (pestaña en
        // segundo plano, navegador viejo), anclamos directo al panel.
        if (Math.abs(carousel.scrollLeft - target) > 4) carousel.scrollLeft = target;
      }, 550);
    }
    setCarouselHeight();
    refreshLayoutSoon();
  }

  // Sincronía swipe → filtro: al deslizar, el botón correspondiente se
  // resalta solo (rAF-throttled, sin trabajo pesado en el scroll).
  function syncFromScroll() {
    if (syncing) return;
    const idx = Math.round(carousel.scrollLeft / Math.max(1, carousel.clientWidth));
    if (idx !== activeIdx) setActive(idx, { scrollCarousel: false });
  }
  let scrollRaf = 0;
  carousel.addEventListener("scroll", () => {
    if (scrollRaf) return;
    scrollRaf = requestAnimationFrame(() => {
      scrollRaf = 0;
      syncFromScroll();
    });
  }, { passive: true });
  // Respaldo: scrollend garantiza la sincronía final aunque se pierda un
  // tick de rAF (pestaña en segundo plano, gama muy baja). También suelta
  // el lock del click sin esperar el timeout.
  carousel.addEventListener("scrollend", () => {
    syncing = false;
    syncFromScroll();
  });

  function renderTabs() {
    tabsEl.innerHTML = "";
    grupo.cats.forEach((cat, i) => {
      const btn = document.createElement("button");
      btn.className = "menu-tab"
        + (i === activeIdx ? " active" : "")
        + (cat.premium ? " premium-tab" : "");
      btn.type = "button";
      btn.setAttribute("role", "tab");
      btn.setAttribute("aria-selected", i === activeIdx);
      btn.textContent = cat.tab;
      btn.addEventListener("click", () => {
        if (i !== activeIdx) setActive(i, { scrollCarousel: true });
      });
      tabsEl.appendChild(btn);
    });
  }

  function buildCarousel() {
    if (heightRO) heightRO.disconnect();
    carousel.innerHTML = "";
    activeIdx = 0;
    panels = grupo.cats.map(buildPanel);
    panels.forEach((p) => carousel.appendChild(p));
    carousel.scrollLeft = 0;
    // Las imágenes lazy cambian la altura del panel al llegar: la
    // observamos para que el carrusel siga siempre al panel activo.
    if (typeof ResizeObserver !== "undefined") {
      heightRO = new ResizeObserver(() => setCarouselHeight());
      panels.forEach((p) => heightRO.observe(p));
    }
    // Altura inicial SÍNCRONA (offsetHeight ya está disponible tras insertar
    // al DOM): no dependemos de un tick de rAF que puede llegar tarde si la
    // pestaña carga en segundo plano. El rAF posterior solo corrige.
    setCarouselHeight();
    requestAnimationFrame(setCarouselHeight);
    refreshLayoutSoon();
  }

  function renderGroups() {
    groupsEl.innerHTML = "";
    MENU_GRUPOS.forEach((g) => {
      const btn = document.createElement("button");
      btn.className = "menu-group-btn" + (g === grupo ? " active" : "");
      btn.type = "button";
      btn.setAttribute("role", "tab");
      btn.setAttribute("aria-selected", g === grupo);
      btn.textContent = g.label;
      btn.addEventListener("click", () => {
        if (g === grupo) return;
        grupo = g;
        renderGroups();
        buildCarousel();
        renderTabs();
        updateTabs(true);
      });
      groupsEl.appendChild(btn);
    });
  }

  renderGroups();
  buildCarousel();
  renderTabs();

  // Al girar el teléfono, el ancho de panel cambia: re-anclamos el panel
  // activo y recalculamos la altura.
  window.addEventListener("resize", () => {
    carousel.scrollLeft = activeIdx * carousel.clientWidth;
    setCarouselHeight();
  });

  // INICIALIZACIÓN DIRECTA: apenas la carta queda pintada, quitamos cualquier
  // clase de "oculto/loading" y forzamos visibilidad nativa en los contenedores.
  [groupsEl, tabsEl, carousel, carousel.closest(".menu-block")].forEach((node) => {
    if (!node) return;
    node.classList.remove("hidden", "is-hidden", "loading", "is-loading");
    node.style.visibility = "visible";
    node.style.opacity = "1";
  });
}

/* ── CARRITO → WHATSAPP ─────────────────────── */
const cart = new Map(); // id → { name, price, qty, img } (solo memoria de sesión)
const cartPill = document.getElementById("cart-pill");
const cartPillCount = document.getElementById("cart-pill-count");
const cartPillTotal = document.getElementById("cart-pill-total");
const cartEmpty = document.getElementById("cart-empty");
const cartFull = document.getElementById("cart-full");
const cartList = document.getElementById("cart-list");
const cartTotalEl = document.getElementById("cart-total");
const cartCountBadge = document.getElementById("cart-count-badge");

function cssEscape(value) {
  return (window.CSS && CSS.escape) ? CSS.escape(value) : value.replace(/[^a-zA-Z0-9_-]/g, "\\$&");
}

function addToCart(catId, item) {
  const id = itemId(catId, item.n);
  const entry = cart.get(id) || { name: item.n, price: item.p, qty: 0, img: item.img };
  entry.qty++;
  cart.set(id, entry);
  updateCartUI(id);
  // Rebote sin tocar el transform de layout (translateX(-50%) en desktop).
  // Una clase CSS anima scale; GSAP overwrite:true destruía el centrado.
  if (cartPill) {
    cartPill.classList.remove("is-bounce");
    void cartPill.offsetWidth;
    cartPill.classList.add("is-bounce");
    const clearBounce = () => cartPill.classList.remove("is-bounce");
    cartPill.addEventListener("animationend", clearBounce, { once: true });
  }
}

function changeQty(id, delta) {
  const entry = cart.get(id);
  if (!entry) return;
  entry.qty += delta;
  if (entry.qty <= 0) cart.delete(id);
  updateCartUI(id);
}

function cartTotals() {
  let count = 0, total = 0;
  cart.forEach((e) => { count += e.qty; total += e.qty * e.price; });
  return { count, total };
}

function updateCartUI(changedId) {
  const { count, total } = cartTotals();
  // El pill NUNCA se oculta: siempre visible, incluso con carrito vacío.
  cartPillCount.textContent = count;
  cartPillTotal.textContent = fmt(total);
  if (cartCountBadge) cartCountBadge.textContent = count === 1 ? "1 ítem" : `${count} ítems`;
  cartEmpty.hidden = count > 0;
  cartFull.hidden = count === 0;
  cartList.innerHTML = "";
  cart.forEach((entry, id) => {
    const li = document.createElement("li");
    li.className = "cart-item";
    li.dataset.id = id;
    li.innerHTML = `
      ${entry.img ? `<img class="cart-item-img" src="${entry.img}" alt="" loading="lazy">` : `<span class="cart-item-img cart-item-img-empty">✿</span>`}
      <span class="cart-item-name">${entry.name}<small>${fmt(entry.price)} c/u</small></span>
      <span class="cart-qty">
        <button type="button" aria-label="Quitar uno">−</button>
        <b>${entry.qty}</b>
        <button type="button" aria-label="Agregar uno">+</button>
      </span>
      <span class="cart-item-sub">${fmt(entry.qty * entry.price)}</span>`;
    const btns = li.querySelectorAll("button");
    btns[0].addEventListener("click", () => changeQty(id, -1));
    btns[1].addEventListener("click", () => changeQty(id, 1));
    cartList.appendChild(li);
  });
  cartTotalEl.textContent = fmt(total);
  // Resalta la fila tocada y pulsa el total
  if (changedId && HAS_GSAP) {
    const row = cartList.querySelector(`[data-id="${cssEscape(changedId)}"]`);
    if (row) {
      gsap.fromTo(row, { backgroundColor: "rgba(201,162,39,0.16)", x: -6 }, { backgroundColor: "rgba(201,162,39,0)", x: 0, duration: 0.8, ease: "power2.out" });
    }
    gsap.fromTo(cartTotalEl, { scale: 1.15 }, { scale: 1, duration: 0.4, ease: "back.out(2)", transformOrigin: "right center" });
  }
}

function initCart() {
  updateCartUI();
  cartPill.addEventListener("click", () => {
    lenis.scrollTo("#pedido", { offset: -20, duration: 1.6 });
  });

  document.getElementById("cart-send").addEventListener("click", () => {
    const { total } = cartTotals();
    if (total === 0) return;
    const itemsFormateados = [];
    cart.forEach((e) => itemsFormateados.push(`• ${e.qty}x ${e.name} — ${fmt(e.qty * e.price)}`));
    const mensaje = `¡Hola Gran Patrón! 🌮 Quiero pedir a domicilio:\n${itemsFormateados.join("\n")}\n\nTotal: $${total.toLocaleString("es-CO")}\n\n📍 Mi dirección: `;
    const url = `https://wa.me/${WA_NUMERO}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, "_blank");
  });
}

/* ── SALSAS ─────────────────────────────────── */
/* Salsas: recuadros separados — nombre, nivel, flavor y chiles por picor. */
function renderSalsas() {
  const grid = document.getElementById("salsas-grid");
  if (!grid) return;
  SALSAS.forEach((s) => {
    const card = document.createElement("div");
    card.className = `salsa-card h${s.h}`;
    const heat = Array.from({ length: 4 }, (_, i) =>
      `<span class="${i < s.h ? "chile-on" : "chile-off"}">${CHILE_SVG}</span>`).join("");
    card.innerHTML = `
      <div class="salsa-card-deco" aria-hidden="true"></div>
      <div class="salsa-card-top">
        <h4 class="salsa-name">${s.n}</h4>
        <span class="salsa-level h${s.h}">${s.label}</span>
      </div>
      <p class="salsa-flavor">${s.f}</p>
      <div class="salsa-heat" role="img" aria-label="Picor ${s.h} de 4 (${s.label})">${heat}</div>`;
    grid.appendChild(card);
  });
}

/* ── REEL DE INSTAGRAM (play solo en viewport) ─ */
function setupReel() {
  const video = document.getElementById("ig-reel-video");
  if (!video || typeof IntersectionObserver === "undefined") return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) video.play().catch(() => {});
      else video.pause();
    });
  }, { threshold: 0.25 });
  io.observe(video);
}

/* ── INIT ───────────────────────────────────── */
/* ORDEN CRÍTICO: el menú, las salsas y el carrito van PRIMERO y aislados.
   Aunque el canvas, GSAP o Lenis fallen, la carta se pinta siempre. */
/* Menú en dos niveles (Comida/Bebidas) con carrusel swipeable por categoría. */
safe("menú por grupos", initMenu);
safe("salsas", renderSalsas);
safe("carrito", initCart);
safe("navegación", initNav);
safe("header", initHeader);
safe("reel instagram", setupReel);
safe("animaciones de entrada", setupEntrances);
safe("hero scrub", initHeroScrub);
safe("canvas resize", () => window.addEventListener("resize", resizeCanvas));
safe("precarga de frames", preloadFrames);
if (HAS_ST) safe("scrolltrigger refresh", () => ScrollTrigger.refresh());

/* Red de seguridad: si algo impidió llegar a revealSite() (frames rotos,
   canvas sin contexto, etc.), el loader se quita solo a los 6 segundos
   para que la página NUNCA quede en negro. */
setTimeout(() => {
  if (!siteRevealed) {
    if (window.console && console.warn) console.warn("[GranPatrón] reveal forzado por watchdog");
    revealSite();
    // Si llegamos aquí algo grave falló en el arranque: mostramos todo estático.
    safe("fallback watchdog", () => document.body.classList.add("animations-disabled"));
  }
}, 6000);
