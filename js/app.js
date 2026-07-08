/* ═══════════════════════════════════════════════
   GRAN PATRÓN TAQUERÍA — app.js
   Lenis + GSAP ScrollTrigger + canvas scrubbing + carrito WhatsApp
   ═══════════════════════════════════════════════ */

"use strict";

gsap.registerPlugin(ScrollTrigger);

/* ── CONFIG ─────────────────────────────────── */
const FRAME_COUNT = 140;
const FRAME_PATH = (i) => `assets/frames/frame_${String(i + 1).padStart(4, "0")}.webp`;
const PRELOAD_FIRST = 10;   // frames antes de ocultar el loader
const IMAGE_SCALE = 0.86;   // padded cover
const FRAME_SPEED = 1.4;    // el taco termina de abrirse ~72% del scroll del hero
const WA_NUMERO = "573143564723";

const fmt = (n) => "$" + n.toLocaleString("es-CO");

/* ── MENÚ (transcrito exacto de la carta 2026) ─ */
const MENU = [
  {
    id: "entradas", tab: "Entradas", tagline: "“Para ir calentando motores”",
    tile: { img: "assets/img/plato-taquitos.jpg", alt: "Taquitos dorados con guacamole y limón", caption: "Directo del comal" },
    groups: [{ items: [
      { n: "Volcanes", d: "Base de tortilla crujiente, queso gratinado, proteína a elegir.", p: 10000 },
      { n: "Esquites", d: "Maíz desgranado, crema, queso, chicharrón, limón.", p: 25000 },
      { n: "Nachos Sencillos", d: "Totopos, frijoles refritos, guacamole.", p: 16000 },
      { n: "Dorilocos", d: "Doritos, birria, lechuga, pico de gallo, guacamole, limón.", p: 21000 },
      { n: "Flautas x3", d: "Tinga de pollo, salsas y crema.", p: 20000 },
      { n: "Chicharrón con Guacamole", d: "Crujiente por fuera, jugoso por dentro, con guacamole de la casa.", p: 28000, img: "assets/img/plato-chicharron.jpg" }
    ]}]
  },
  {
    id: "especiales", tab: "Especiales", tagline: "“Las joyas de la casa”",
    tile: { img: "assets/img/plato-tostada.jpg", alt: "Tostada con carne, crema y cebolla morada", caption: "Las joyas de la casa" },
    groups: [{ items: [
      { n: "Torta Mexicana", d: "Pan bolillo, carne, guacamole, queso, lechuga, cebolla encurtida.", p: 24000 },
      { n: "Chilaquiles rojos o verdes", d: "Totopos, huevo, queso, crema.", p: 25000 },
      { n: "Sopa Tarasca", d: "Pollo desmenuzado, mazorca, aguacate, tortilla frita, crema, queso costeño.", p: 25000, img: "assets/img/plato-sopa.jpg" },
      { n: "Birriamen", d: "Fideos japoneses en consomé de birria, carne desmechada, picadillo.", p: 25000 },
      { n: "Nachos Gran Patrón", d: "Carne, queso, guacamole, pico de gallo, sour cream.", p: 30000, img: "assets/img/plato-nachos.jpg" },
      { n: "Bandeja Gran Patrón", d: "2 tacos + 1 quesadilla + 2 flautas de pollo.", p: 48000, featured: true }
    ]}]
  },
  {
    id: "tacos", tab: "Tacos x3", tagline: "De a tres, como manda la tradición",
    tile: { img: "assets/img/plato-tacos-1.jpg", alt: "Tacos surtidos en plato verde", caption: "Los patrones del taco" },
    groups: [{ items: [
      { n: "Taco individual", d: "Para los indecisos: uno solo, del sabor que quieras.", p: 10000 },
      { n: "Birria", d: "El clásico jugoso de la casa, con su consomé.", p: 27000 },
      { n: "Pastor", d: "Marinado al estilo CDMX, con piña.", p: 25000 },
      { n: "Carnitas", d: "Cerdo confitado, dorado y tierno.", p: 27000 },
      { n: "Tinga de pollo", d: "Pollo deshebrado en salsa de chipotle.", p: 25000 },
      { n: "Gobernador", d: "Camarón, queso fundido y tortilla dorada.", p: 30000 },
      { n: "Suadero", d: "Res suave, sellada en el comal.", p: 25000 },
      { n: "Asada", d: "Res a la parrilla, sencillo y perfecto.", p: 25000 },
      { n: "Choriqueso", d: "Chorizo con queso fundido.", p: 25000 },
      { n: "Vegetariano", d: "De la huerta al comal.", p: 17000 },
      { n: "Chinchulines", d: "Para los valientes de verdad.", p: 25000 },
      { n: "Chicharrón", d: "Crocante, con su guacamole.", p: 25000 },
      { n: "Temporada", d: "Pregunta por el taco del momento.", p: 25000 },
      { n: "Taquiza x12", d: "12 tacos surtidos para compartir en manada.", p: 110000, featured: true }
    ]}]
  },
  {
    id: "burritos", tab: "Burritos & Quesadillas", tagline: "Abrazos envueltos en tortilla",
    note: "Proteínas disponibles para burrito/quesadilla: Birria, Pastor, Carnitas, Tinga, Suadero, Asada, Chorizo, Chinchulines, Hígado, Chicharrón.",
    groups: [{ items: [
      { n: "Burrito Gran Patrón", d: "Proteína a elegir, tortilla de harina, queso, arroz, frijol, guacamole, sour cream, pico de gallo, salsas.", p: 39000, featured: true },
      { n: "Burrito", d: "220g proteína, guacamole, picadillo.", p: 30000 },
      { n: "Quesadilla", d: "Proteína a elegir, tortilla de maíz, queso, picadillo, salsas.", p: 18000 },
      { n: "Solo Queso", d: "Quesadilla clásica, pura felicidad fundida.", p: 12000 },
      { n: "Menú Infantil", d: "Miniquesadilla asada o pollo, sin picante, jugo de caja + huevo sorpresa.", p: 25000 }
    ]}]
  },
  {
    id: "postres", tab: "Postres", tagline: "El final feliz",
    groups: [{ items: [
      { n: "Cajeta Tradicional", d: "Dulce de leche de cabra, como en México.", p: 12000 },
      { n: "Churros", d: "Recién hechos, con azúcar y canela.", p: 16000 },
      { n: "Bola de Fuego", d: "El postre con espectáculo incluido.", p: 17000 },
      { n: "Nieves (helado)", d: "Para apagar la Salsa Fantasma.", p: 7000 }
    ]}]
  },
  {
    id: "bebidas", tab: "Bebidas & Licores", tagline: "Para brindar como patrón",
    tile: { img: "assets/img/plato-hero-1.jpg", alt: "Cerveza Modelo con tacos en el ambiente del local", caption: "El brindis de la casa" },
    groups: [
      { title: "Bebidas", items: [
        { n: "Horchata", p: 9000 }, { n: "Agua de Jamaica", p: 8000 },
        { n: "Agua de Pepino", p: 8000 }, { n: "Agua Tamarindo", p: 8000 },
        { n: "Gaseosa", p: 7000 }, { n: "Agua Natural", p: 6000 },
        { n: "Limonada", p: 10000 }, { n: "Limonada Cerezada", p: 14000 },
        { n: "Limonada de Coco", p: 16000 }, { n: "Cerveza Nacional", p: 12000 },
        { n: "Gatorade", p: 8000 }, { n: "Soda Saborizada", d: "Frutos rojos o amarillos.", p: 15000 }
      ]},
      { title: "Cerveza Importada", items: [
        { n: "Coronita", p: 11000 }, { n: "Cerveza Sol", p: 11000 },
        { n: "Stella Artois", p: 15000 }, { n: "Corona", p: 18000 },
        { n: "Cerveza Modelo", p: 20000 }
      ]},
      { title: "Cócteles", items: [
        { n: "Paloma", p: 20000 }, { n: "El Azulito", p: 20000 },
        { n: "Paloma Sinaloense", p: 24000 }, { n: "Cantarito Personal", p: 25000 },
        { n: "Perla Negra", p: 30000 }, { n: "Cantarito x10 personas", p: 200000, featured: true }
      ]},
      { title: "Licores", items: [
        { n: "½ Aguardiente Amarillo", p: 75000 }, { n: "½ Aguardiente Ant. Azul", p: 75000 },
        { n: "Aguardiente Néctar Verde", p: 110000 }, { n: "Aguardiente Ant. Azul", p: 130000 },
        { n: "Aguardiente Amarillo", p: 130000 }, { n: "Tequila Jimador Blanco", p: 180000 },
        { n: "Tequila Jimador Reposado", p: 190000 }, { n: "Tequila Patrón Reposado", p: 450000 },
        { n: "Don Julio 70 Cristalino", p: 600000 }, { n: "Whiskey Buchanans 12 Años", p: 250000 },
        { n: "Whiskey Buchanans Two S", p: 360000 }
      ]}
    ]
  }
];

const SALSAS = [
  { n: "Taquera verde", h: 1 }, { n: "Guayaba", h: 2 }, { n: "Maracuyá", h: 2 },
  { n: "Lulo", h: 3 }, { n: "Salsa Gran Patrón", h: 3 },
  { n: "Molcajeteada", h: 4 }, { n: "Salsa Fantasma", h: 4 }
];

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
  // Resto en segundo plano, en tandas para no saturar
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

ScrollTrigger.create({
  trigger: heroScroll,
  start: "top top",
  end: "bottom top",
  scrub: true,
  onUpdate: (self) => {
    const p = self.progress;
    // Frames acelerados: el taco termina de abrirse ~72% del hero
    const accelerated = Math.min(p * FRAME_SPEED, 1);
    const index = Math.min(Math.floor(accelerated * FRAME_COUNT), FRAME_COUNT - 1);
    if (index !== currentFrame) {
      currentFrame = index;
      requestAnimationFrame(() => drawFrame(currentFrame));
    }
    // Fade del overlay de texto (0 → 45% del hero)
    const overlayOpacity = Math.max(0, 1 - p / 0.45);
    heroOverlay.style.opacity = overlayOpacity;
    heroOverlay.style.visibility = overlayOpacity <= 0.01 ? "hidden" : "visible";
    // El scrim se disuelve cuando el taco ya es protagonista
    heroScrim.style.opacity = p < 0.5 ? 1 : Math.max(0, 1 - (p - 0.5) / 0.35);
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
      ".section-label, .section-heading, .section-script, .section-body, .menu-tabs, .menu-tagline, .menu-grid, .menu-note, .nosotros-card, .stat, .momentos-grid > *, .momentos-cta, .salsa-chip, .salsas-note, .ubicacion-ctas, .ubicacion-horario, .pedido-panel, .meme-frame img"
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

/* ── CONTADORES ─────────────────────────────── */
function setupCounters() {
  document.querySelectorAll(".stat-number").forEach((el) => {
    const target = parseFloat(el.dataset.value);
    const decimals = parseInt(el.dataset.decimals || "0", 10);
    const proxy = { val: 0 };
    gsap.fromTo(proxy, { val: 0 }, {
      val: target,
      duration: 2,
      ease: "power2.out",
      onUpdate() {
        el.textContent = decimals > 0 ? proxy.val.toFixed(decimals) : Math.round(proxy.val);
      },
      onComplete() {
        el.textContent = decimals > 0 ? target.toFixed(decimals) : target;
      },
      scrollTrigger: {
        trigger: el.closest(".stats-grid"),
        start: "top 80%",
        toggleActions: "play none none reset"
      }
    });
  });
}

/* ── MENÚ INTERACTIVO ───────────────────────── */
const tabsEl = document.getElementById("menu-tabs");
const gridEl = document.getElementById("menu-grid");
const taglineEl = document.getElementById("menu-tagline");
const noteEl = document.getElementById("menu-note");
let activeCat = MENU[0].id;

function itemId(catId, name) {
  return catId + "::" + name;
}

function renderTabs() {
  tabsEl.innerHTML = "";
  MENU.forEach((cat) => {
    const btn = document.createElement("button");
    btn.className = "menu-tab" + (cat.id === activeCat ? " active" : "");
    btn.type = "button";
    btn.role = "tab";
    btn.textContent = cat.tab;
    btn.addEventListener("click", () => {
      if (cat.id === activeCat) return;
      activeCat = cat.id;
      renderTabs();
      renderGrid(true);
    });
    tabsEl.appendChild(btn);
  });
}

function renderGrid(animate) {
  const cat = MENU.find((c) => c.id === activeCat);
  taglineEl.textContent = cat.tagline;
  noteEl.textContent = cat.note || "";
  gridEl.innerHTML = "";

  if (cat.tile) {
    const tile = document.createElement("figure");
    tile.className = "menu-tile";
    tile.innerHTML = `<img src="${cat.tile.img}" alt="${cat.tile.alt}" loading="lazy"><figcaption>${cat.tile.caption}</figcaption>`;
    gridEl.appendChild(tile);
  }

  cat.groups.forEach((group) => {
    if (group.title) {
      const h = document.createElement("h3");
      h.className = "menu-group-title";
      h.textContent = group.title;
      gridEl.appendChild(h);
    }
    group.items.forEach((item) => {
      const card = document.createElement("article");
      card.className = "menu-card" + (item.featured ? " featured" : "");
      card.innerHTML = `
        ${item.img ? `<img class="menu-card-img" src="${item.img}" alt="${item.n}" loading="lazy">` : ""}
        <div class="menu-card-top">
          <h4 class="menu-card-name">${item.n}</h4>
          <span class="menu-card-dots"></span>
          <span class="menu-card-price">${fmt(item.p)}</span>
        </div>
        ${item.d ? `<p class="menu-card-desc">${item.d}</p>` : ""}
        <button class="menu-card-add" type="button" aria-label="Agregar ${item.n} al pedido">+</button>`;
      card.querySelector(".menu-card-add").addEventListener("click", (e) => {
        addToCart(cat.id, item);
        e.currentTarget.classList.remove("added");
        void e.currentTarget.offsetWidth; // reinicia la animación
        e.currentTarget.classList.add("added");
      });
      gridEl.appendChild(card);
    });
  });

  if (animate) {
    gsap.fromTo([taglineEl, ...gridEl.children],
      { y: 40, opacity: 0 },
      { y: 0, opacity: 1, stagger: 0.05, duration: 0.6, ease: "power3.out", overwrite: true }
    );
    ScrollTrigger.refresh();
  }
}

/* ── CARRITO → WHATSAPP ─────────────────────── */
const cart = new Map(); // id → { name, price, qty }  (solo memoria de sesión, sin localStorage)
const cartPill = document.getElementById("cart-pill");
const cartPillCount = document.getElementById("cart-pill-count");
const cartPillTotal = document.getElementById("cart-pill-total");
const cartEmpty = document.getElementById("cart-empty");
const cartFull = document.getElementById("cart-full");
const cartList = document.getElementById("cart-list");
const cartTotalEl = document.getElementById("cart-total");

function addToCart(catId, item) {
  const id = itemId(catId, item.n);
  const entry = cart.get(id) || { name: item.n, price: item.p, qty: 0 };
  entry.qty++;
  cart.set(id, entry);
  updateCartUI();
}

function changeQty(id, delta) {
  const entry = cart.get(id);
  if (!entry) return;
  entry.qty += delta;
  if (entry.qty <= 0) cart.delete(id);
  updateCartUI();
}

function cartTotals() {
  let count = 0, total = 0;
  cart.forEach((e) => { count += e.qty; total += e.qty * e.price; });
  return { count, total };
}

function updateCartUI() {
  const { count, total } = cartTotals();
  cartPill.hidden = count === 0;
  cartPillCount.textContent = count;
  cartPillTotal.textContent = fmt(total);
  cartEmpty.hidden = count > 0;
  cartFull.hidden = count === 0;
  cartList.innerHTML = "";
  cart.forEach((entry, id) => {
    const li = document.createElement("li");
    li.className = "cart-item";
    li.innerHTML = `
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
  const mensaje = `¡Hola Gran Patrón! 🌮 Quiero pedir:\n${itemsFormateados}\n\nTotal: $${total.toLocaleString("es-CO")}\n\n¿Para recoger o domicilio?`;
  const url = `https://wa.me/${WA_NUMERO}?text=${encodeURIComponent(mensaje)}`;
  window.open(url, "_blank");
});

/* ── SALSAS ─────────────────────────────────── */
function renderSalsas() {
  const row = document.getElementById("salsas-row");
  SALSAS.forEach((s) => {
    const chip = document.createElement("div");
    chip.className = "salsa-chip";
    const heat = Array.from({ length: 4 }, (_, i) =>
      `<span class="${i < s.h ? "on" : "off"}">🌶</span>`).join("");
    chip.innerHTML = `<span class="salsa-name">${s.n}</span><span class="salsa-heat">${heat}</span>`;
    row.appendChild(chip);
  });
}

/* ── VIDEO AMBIENTE (play solo en viewport) ──── */
function setupAmbienteVideo() {
  const video = document.getElementById("ambiente-video");
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

renderTabs();
renderGrid(false);
renderSalsas();
setupEntrances();
setupCounters();
setupAmbienteVideo();
preloadFrames();
ScrollTrigger.refresh();
