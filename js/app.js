/* ═══════════════════════════════════════════════
   GRAN PATRÓN TAQUERÍA — app.js
   Lenis + GSAP ScrollTrigger + canvas scrubbing + carrito WhatsApp
   ═══════════════════════════════════════════════ */

"use strict";

gsap.registerPlugin(ScrollTrigger);

/* ── CONFIG ─────────────────────────────────── */
const FRAME_COUNT = 113;
const FRAME_PATH = (i) => `assets/frames/frame_${String(i + 1).padStart(4, "0")}.webp`;
const PRELOAD_FIRST = 10;   // frames antes de ocultar el loader
const IMAGE_SCALE = 0.92;   // padded cover (taco protagonista)
const FRAME_SPEED = 1.8;    // el taco termina de abrirse antes en el scroll del hero
const START_FRAME = 18;     // salta frames iniciales para acelerar el arranque
const WA_NUMERO = "573143564723";
const IMG = (slug) => `assets/img/menu/${slug}.webp`;

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
    id: "bebidas", tab: "Bebidas", tagline: "Aguas frescas y limonadas de la casa",
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
    id: "licores", tab: "Licores", tagline: "La reserva del patrón", premium: true,
    items: [
      { n: "½ Aguardiente Amarillo", p: 75000, img: IMG("aguardiente-amarillo-media"), tag: "Media botella", type: "Aguardiente" },
      { n: "½ Aguardiente Ant. Azul", p: 75000, img: IMG("aguardiente-antioqueno-media"), tag: "Media botella", type: "Aguardiente" },
      { n: "Aguardiente Néctar Verde", p: 110000, img: IMG("nectar-verde"), tag: "Botella", type: "Aguardiente" },
      { n: "Aguardiente Ant. Azul", p: 130000, img: IMG("aguardiente-antioqueno"), tag: "Botella", type: "Aguardiente" },
      { n: "Aguardiente Amarillo", p: 130000, img: IMG("aguardiente-amarillo"), tag: "Botella", type: "Aguardiente" },
      { n: "Tequila Jimador Blanco", p: 180000, img: IMG("jimador-blanco"), tag: "Botella", type: "Tequila" },
      { n: "Tequila Jimador Reposado", p: 190000, img: IMG("jimador-reposado"), tag: "Botella", type: "Tequila" },
      { n: "Tequila Patrón Reposado", p: 450000, img: IMG("patron-reposado"), tag: "Botella", type: "Tequila" },
      { n: "Don Julio 70 Cristalino", p: 600000, img: IMG("don-julio-70"), tag: "Botella", type: "Tequila" },
      { n: "Whiskey Buchanans 12 Años", p: 250000, img: IMG("buchanans-12"), tag: "Botella", type: "Whisky" },
      { n: "Whiskey Buchanans Two S", p: 360000, img: IMG("buchanans-two-souls"), tag: "Botella", type: "Whisky" }
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

/* ── LENIS + SCROLLTRIGGER ──────────────────── */
const lenis = new Lenis({
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smoothWheel: true
});
lenis.on("scroll", ScrollTrigger.update);
gsap.ticker.add((time) => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);
window.lenis = lenis;

/* ── CANVAS DEL HERO ────────────────────────── */
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const frames = new Array(FRAME_COUNT).fill(null);
let currentFrame = 0;
let bgColor = "#e9e7e4";
let lastSampledFrame = -99;

function resizeCanvas() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(canvas.clientWidth * dpr);
  canvas.height = Math.round(canvas.clientHeight * dpr);
  drawFrame(currentFrame);
}

function nearestLoaded(index) {
  for (let i = index; i >= 0; i--) if (frames[i] && frames[i].complete) return frames[i];
  return null;
}

function sampleBgColor(img) {
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
  bgColor = `rgb(${Math.round(r / 4)},${Math.round(g / 4)},${Math.round(b / 4)})`;
}

function drawFrame(index) {
  const img = nearestLoaded(index);
  if (!img) return;
  if (Math.abs(index - lastSampledFrame) >= 20) {
    sampleBgColor(img);
    lastSampledFrame = index;
  }
  const cw = canvas.width, ch = canvas.height;
  const iw = img.naturalWidth, ih = img.naturalHeight;
  const scale = Math.max(cw / iw, ch / ih) * IMAGE_SCALE;
  const dw = iw * scale, dh = ih * scale;
  const dx = (cw - dw) / 2, dy = (ch - dh) / 2;
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, cw, ch);
  ctx.drawImage(img, dx, dy, dw, dh);
}

/* ── LOADER (10 primeros frames, resto en bg) ── */
const loader = document.getElementById("loader");
const loaderBar = document.getElementById("loader-bar");
const loaderPercent = document.getElementById("loader-percent");

function loadFrame(i) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => { frames[i] = img; resolve(img); };
    img.onerror = () => resolve(null);
    img.src = FRAME_PATH(i);
  });
}

async function preloadFrames() {
  let loaded = 0;
  const firstBatch = [];
  for (let i = 0; i < PRELOAD_FIRST; i++) {
    firstBatch.push(loadFrame(i).then(() => {
      loaded++;
      const pct = Math.round((loaded / PRELOAD_FIRST) * 100);
      loaderBar.style.width = pct + "%";
      loaderPercent.textContent = pct + "%";
    }));
  }
  await Promise.all(firstBatch);
  revealSite();
  (async () => {
    for (let i = PRELOAD_FIRST; i < FRAME_COUNT; i += 12) {
      const batch = [];
      for (let j = i; j < Math.min(i + 12, FRAME_COUNT); j++) batch.push(loadFrame(j));
      await Promise.all(batch);
      if (currentFrame >= i && currentFrame < i + 12) drawFrame(currentFrame);
    }
  })();
}

function revealSite() {
  resizeCanvas();
  drawFrame(0);
  loader.classList.add("done");
  document.body.classList.add("loaded");
  setTimeout(() => loader.remove(), 900);
}

/* ── SCRUB DE FRAMES EN LA ZONA DEL HERO ────── */
const heroScroll = document.getElementById("hero-scroll");
const heroOverlay = document.getElementById("hero-overlay");
const heroScrim = document.getElementById("hero-scrim");
const heroSlogan = document.getElementById("hero-slogan");

ScrollTrigger.create({
  trigger: heroScroll,
  start: "top top",
  end: "bottom top",
  scrub: true,
  onUpdate: (self) => {
    const p = self.progress;
    const accelerated = Math.min(p * FRAME_SPEED, 1);
    const playable = FRAME_COUNT - START_FRAME;
    const index = Math.min(START_FRAME + Math.floor(accelerated * playable), FRAME_COUNT - 1);
    if (index !== currentFrame) {
      currentFrame = index;
      requestAnimationFrame(() => drawFrame(currentFrame));
    }
    const overlayOpacity = Math.max(0, 1 - p / 0.45);
    heroOverlay.style.opacity = overlayOpacity;
    heroOverlay.style.visibility = overlayOpacity <= 0.01 ? "hidden" : "visible";
    heroScrim.style.opacity = p < 0.5 ? 1 : Math.max(0, 1 - (p - 0.5) / 0.35);
    if (heroSlogan) {
      const sloganOpacity = p > 0.6 ? Math.min(1, (p - 0.6) / 0.25) : 0;
      heroSlogan.style.opacity = sloganOpacity;
      heroSlogan.style.visibility = sloganOpacity <= 0.01 ? "hidden" : "visible";
    }
  }
});

/* ── HEADER SÓLIDO AL HACER SCROLL ──────────── */
const header = document.getElementById("site-header");
lenis.on("scroll", ({ scroll }) => {
  header.classList.toggle("solid", scroll > 40);
});

/* ── NAV MÓVIL + SCROLL SUAVE A ANCLAS ──────── */
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

/* ── ANIMACIONES DE ENTRADA POR SECCIÓN ─────── */
const ENTRANCES = {
  "fade-up":    { from: { y: 50, opacity: 0 }, dur: 0.9, ease: "power3.out" },
  "scale-up":   { from: { y: 40, scale: 0.85, opacity: 0 }, dur: 1.0, ease: "power2.out" },
  "rotate-in":  { from: { y: 40, rotation: -10, opacity: 0 }, dur: 0.9, ease: "power3.out" },
  "stagger-up": { from: { y: 60, opacity: 0 }, dur: 0.8, ease: "power3.out" },
  "clip-reveal": { from: { clipPath: "inset(100% 0 0 0)", y: 30, opacity: 0 }, dur: 1.1, ease: "power4.inOut" },
  "blur-up":    { from: { y: 50, opacity: 0, filter: "blur(8px)" }, dur: 1.0, ease: "power3.out" }
};

function setupEntrances() {
  document.querySelectorAll("[data-animation]").forEach((el) => {
    const cfg = ENTRANCES[el.dataset.animation];
    if (!cfg) return;
    const children = el.querySelectorAll(
      ":scope > .section-label, :scope > .section-heading, :scope > .section-script, :scope > .section-body, " +
      ".menu-block-head, :scope > .menu-tabs, :scope > .menu-tagline, :scope > .menu-grid, :scope > .menu-note, " +
      ".nosotros-card, .ig-header, .ig-highlights, .ig-grid, .ig-open, .salsa-card, " +
      ":scope > .ubicacion-ctas, :scope > .ubicacion-horario, :scope > .pedido-panel, .meme-frame img"
    );
    const targets = children.length ? children : [el];
    // Tween desacoplado del trigger: ScrollTrigger.refresh() (p. ej. al cambiar
    // de tab del menú) no puede revertirlo a mitad de la animación.
    const tween = gsap.from(targets, {
      ...cfg.from,
      duration: cfg.dur,
      ease: cfg.ease,
      stagger: 0.12,
      paused: true,
      clearProps: el.dataset.animation === "rotate-in" ? "" : "filter,clipPath"
    });
    ScrollTrigger.create({
      trigger: el,
      start: "top 78%",
      once: true,
      onEnter: () => tween.play()
    });
  });
}

/* ── MENÚ INTERACTIVO (Cocina + Barra) ──────── */
function itemId(catId, name) {
  return catId + "::" + name;
}

function initMenuBlock(cats, tabsId, taglineId, gridId, noteId) {
  const tabsEl = document.getElementById(tabsId);
  const taglineEl = document.getElementById(taglineId);
  const gridEl = document.getElementById(gridId);
  const noteEl = document.getElementById(noteId);
  let active = cats[0].id;

  function renderTabs() {
    tabsEl.innerHTML = "";
    cats.forEach((cat) => {
      const btn = document.createElement("button");
      btn.className = "menu-tab" + (cat.id === active ? " active" : "");
      btn.type = "button";
      btn.setAttribute("role", "tab");
      btn.setAttribute("aria-selected", cat.id === active);
      btn.textContent = cat.tab;
      btn.addEventListener("click", () => {
        if (cat.id === active) return;
        active = cat.id;
        renderTabs();
        renderGrid(true);
      });
      tabsEl.appendChild(btn);
    });
  }

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
          ? `<img src="${item.img}" alt="${item.n}" loading="lazy">`
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

  function renderGrid(animate) {
    const cat = cats.find((c) => c.id === active);
    taglineEl.textContent = cat.tagline;
    if (noteEl) noteEl.textContent = cat.note || "";
    gridEl.innerHTML = "";
    gridEl.classList.toggle("licores-grid", !!cat.premium);
    cat.items.forEach((item) => {
      gridEl.appendChild(cat.premium ? licorCard(cat, item) : foodCard(cat, item));
    });
    if (animate) {
      gsap.fromTo([taglineEl, ...gridEl.children],
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.05, duration: 0.6, ease: "power3.out", overwrite: true }
      );
      ScrollTrigger.refresh();
    }
  }

  renderTabs();
  renderGrid(false);
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

function addToCart(catId, item) {
  const id = itemId(catId, item.n);
  const entry = cart.get(id) || { name: item.n, price: item.p, qty: 0, img: item.img };
  entry.qty++;
  cart.set(id, entry);
  updateCartUI(id);
  // El botón flotante rebota al agregar
  gsap.fromTo(cartPill, { scale: 1 }, { scale: 1.12, duration: 0.14, yoyo: true, repeat: 1, ease: "power2.out", overwrite: true, transformOrigin: "50% 50%" });
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
  cartPill.hidden = count === 0;
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
    const [minus, plus] = li.querySelectorAll("button");
    minus.addEventListener("click", () => changeQty(id, -1));
    plus.addEventListener("click", () => changeQty(id, 1));
    cartList.appendChild(li);
  });
  cartTotalEl.textContent = fmt(total);
  // Resalta la fila tocada y pulsa el total
  if (changedId) {
    const row = cartList.querySelector(`[data-id="${CSS.escape(changedId)}"]`);
    if (row) {
      gsap.fromTo(row, { backgroundColor: "rgba(201,162,39,0.16)", x: -6 }, { backgroundColor: "rgba(201,162,39,0)", x: 0, duration: 0.8, ease: "power2.out" });
    }
    gsap.fromTo(cartTotalEl, { scale: 1.15 }, { scale: 1, duration: 0.4, ease: "back.out(2)", transformOrigin: "right center" });
  }
}

cartPill.addEventListener("click", () => {
  lenis.scrollTo("#pedido", { offset: -20, duration: 1.6 });
});

document.getElementById("cart-send").addEventListener("click", () => {
  const { total } = cartTotals();
  if (total === 0) return;
  const itemsFormateados = [...cart.values()]
    .map((e) => `• ${e.qty}x ${e.name} — ${fmt(e.qty * e.price)}`)
    .join("\n");
  const mensaje = `¡Hola Gran Patrón! 🌮 Quiero pedir a domicilio:\n${itemsFormateados}\n\nTotal: $${total.toLocaleString("es-CO")}\n\n📍 Mi dirección: `;
  const url = `https://wa.me/${WA_NUMERO}?text=${encodeURIComponent(mensaje)}`;
  window.open(url, "_blank");
});

/* ── SALSAS ─────────────────────────────────── */
function renderSalsas() {
  const grid = document.getElementById("salsas-grid");
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
      <div class="salsa-heat">${heat}</div>`;
    grid.appendChild(card);
  });
}

/* ── REEL DE INSTAGRAM (play solo en viewport) ─ */
function setupReel() {
  const video = document.getElementById("ig-reel-video");
  if (!video) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) video.play().catch(() => {});
      else video.pause();
    });
  }, { threshold: 0.25 });
  io.observe(video);
}

/* ── INIT ───────────────────────────────────── */
window.addEventListener("resize", resizeCanvas);

initMenuBlock(MENU_COCINA, "tabs-cocina", "tagline-cocina", "grid-cocina", "note-cocina");
initMenuBlock(MENU_BARRA, "tabs-barra", "tagline-barra", "grid-barra", "note-barra");
renderSalsas();
setupEntrances();
setupReel();
preloadFrames();
ScrollTrigger.refresh();
