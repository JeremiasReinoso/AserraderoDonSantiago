(() => {
  "use strict";
  const config = window.ASERRADERO_CONFIG || { whatsapp: "", products: [] };
  const products = Array.isArray(config.products) ? config.products : [];
  const quote = [];
  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
  const reduceMotion = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
  const getProduct = (id) => products.find((product) => product.id === id);
  const waUrl = (message) => "https://wa.me/" + config.whatsapp + "?text=" + encodeURIComponent(message);
  const number = (value) => Number.parseFloat(value);
  const validPositive = (value, max) => Number.isFinite(value) && value > 0 && value <= max;
  const cleanNumber = (value, digits = 2) => new Intl.NumberFormat("es-AR", { maximumFractionDigits: digits }).format(value);

  function setupLoading() {
    const screen = $("#loading-screen");
    if (!screen) return;
    const hide = () => window.setTimeout(() => { screen.classList.add("hidden"); window.setTimeout(() => screen.remove(), 400); }, 250);
    if (document.readyState === "complete") hide(); else window.addEventListener("load", hide, { once: true });
  }

  function setupNavigation() {
    const shell = $("[data-header-shell]"); const toggle = $("[data-nav-toggle]"); const mobile = $("[data-mobile-nav]");
    const setOpen = (open) => { if (!shell || !toggle) return; shell.classList.toggle("is-open", open); toggle.setAttribute("aria-expanded", String(open)); toggle.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú"); };
    toggle?.addEventListener("click", () => setOpen(!shell.classList.contains("is-open")));
    $$("a", mobile).forEach((link) => link.addEventListener("click", () => setOpen(false)));
    document.addEventListener("keydown", (event) => { if (event.key === "Escape") setOpen(false); });
    window.addEventListener("resize", () => { if (window.innerWidth > 767) setOpen(false); });
    const updateHeader = () => shell?.classList.toggle("is-scrolled", window.scrollY > 16);
    updateHeader(); window.addEventListener("scroll", updateHeader, { passive: true });
    $$('a[href^="#"]').forEach((link) => link.addEventListener("click", (event) => { const target = $(link.getAttribute("href")); if (!target) return; event.preventDefault(); window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - 82, behavior: reduceMotion() ? "auto" : "smooth" }); }));
  }

  function setupReveal() {
    const elements = $$(".reveal");
    if (!("IntersectionObserver" in window) || reduceMotion()) { elements.forEach((item) => item.classList.add("is-visible")); return; }
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => { if (!entry.isIntersecting) return; entry.target.classList.add("is-visible"); observer.unobserve(entry.target); }), { threshold: .1 });
    elements.forEach((item) => observer.observe(item));
  }

  function setupHero() {
    const layers = $$(".hero-bg");
    const images = ["img/Viviendas Modulares/Obra Modular 3.jpeg", "img/Paneles/Imagen Panel 1.jpeg", "img/Estructura de madera/Estructura de madera 1.jpg"];
    if (layers.length < 2) return;
    let currentLayer = 0; let currentImage = 0;
    layers[0].style.backgroundImage = `url("${images[0]}")`;
    if (reduceMotion()) return;
    window.setInterval(() => { currentImage = (currentImage + 1) % images.length; const next = layers[1 - currentLayer]; next.style.backgroundImage = `url("${images[currentImage]}")`; next.classList.add("is-active"); layers[currentLayer].classList.remove("is-active"); currentLayer = 1 - currentLayer; }, 6000);
  }

  function button(label, className, dataName, value) { const element = document.createElement("button"); element.type = "button"; element.className = className; element.textContent = label; element.dataset[dataName] = value; return element; }

  function renderCatalog() {
    const catalog = $("[data-catalog]"); if (!catalog) return;
    catalog.replaceChildren();
    products.forEach((product) => {
      const card = document.createElement("article"); card.className = "product-card";
      const image = document.createElement("img"); image.src = product.image; image.alt = product.name; image.loading = "lazy";
      const body = document.createElement("div"); body.className = "product-card__body";
      const title = document.createElement("h3"); title.textContent = product.name;
      const description = document.createElement("p"); description.textContent = product.description;
      const use = document.createElement("p"); use.className = "product-use"; use.textContent = product.use;
      const actions = document.createElement("div"); actions.className = "product-card__actions";
      actions.append(button("Ver detalle", "text-button", "openProduct", product.id));
      actions.append(button(product.calculator ? "Calcular" : "Consultar", "button button-primary", product.calculator ? "openCalculator" : "consultProduct", product.id));
      body.append(title, description, use, actions); card.append(image, body); catalog.append(card);
    });
  }

  function openProduct(id) {
    const product = getProduct(id); const dialog = $("[data-product-dialog]"); const detail = $("[data-product-detail]");
    if (!product || !dialog || !detail) return;
    detail.replaceChildren();
    const image = document.createElement("img"); image.className = "product-dialog__image"; image.src = product.image; image.alt = product.name;
    const content = document.createElement("div"); content.className = "product-dialog__content";
    const eyebrow = document.createElement("p"); eyebrow.className = "eyebrow"; eyebrow.textContent = product.category;
    const title = document.createElement("h2"); title.id = "dialog-title"; title.textContent = product.name;
    const description = document.createElement("p"); description.textContent = product.description;
    const featureTitle = document.createElement("h3"); featureTitle.textContent = "Características";
    const list = document.createElement("ul"); product.features.forEach((feature) => { const item = document.createElement("li"); item.textContent = feature; list.append(item); });
    const actions = document.createElement("div"); actions.className = "dialog-actions";
    actions.append(button(product.calculator ? "Ir a la calculadora" : "Agregar a la solicitud", "button button-primary", product.calculator ? "openCalculator" : "addProduct", product.id));
    const link = document.createElement("a"); link.href = product.detailUrl; link.className = "text-button"; link.textContent = "Ver página del producto"; actions.append(link);
    content.append(eyebrow, title, description, featureTitle, list, actions); detail.append(image, content);
    if (typeof dialog.showModal === "function") dialog.showModal(); else dialog.setAttribute("open", "");
  }

  function setupDialog() { const dialog = $("[data-product-dialog]"); $("[data-dialog-close]")?.addEventListener("click", () => dialog?.close()); dialog?.addEventListener("click", (event) => { if (event.target === dialog) dialog.close(); }); }

  function calculatorCard(product, index) {
    const article = document.createElement("article"); article.className = "calculator-card"; article.dataset.calculator = product.id;
    const heading = `<header class="calculator-card__header"><div><p class="eyebrow">${product.name}</p><h3>Calculá ${product.calculator === "wood" ? "tu madera" : "tus placas"}</h3><p>${product.calculator === "wood" ? "Ingresá las medidas y obtené el volumen aproximado." : "Ingresá la superficie y la medida de la placa para estimar la cantidad."}</p></div><span class="calculator-number">0${index + 1}</span></header>`;
    if (product.calculator === "wood") article.innerHTML = heading + `<form data-calc-form data-calc-type="wood" novalidate><div class="calc-fields calc-fields--four"><div class="form-field"><label for="${product.id}-length">Largo</label><input id="${product.id}-length" name="length" inputmode="decimal" type="number" min="0.001" step="any" required></div><div class="form-field"><label for="${product.id}-width">Ancho</label><input id="${product.id}-width" name="width" inputmode="decimal" type="number" min="0.001" step="any" required></div><div class="form-field"><label for="${product.id}-thickness">Espesor</label><input id="${product.id}-thickness" name="thickness" inputmode="decimal" type="number" min="0.001" step="any" required></div><div class="form-field"><label for="${product.id}-quantity">Cantidad</label><input id="${product.id}-quantity" name="quantity" inputmode="numeric" type="number" min="1" step="1" value="1" required></div><div class="form-field"><label for="${product.id}-unit">Unidad de medida</label><select id="${product.id}-unit" name="unit"><option value="mm">Milímetros</option><option value="cm">Centímetros</option><option value="m">Metros</option></select></div></div><div class="calc-actions"><button class="button button-secondary" type="submit">Calcular volumen</button><button class="button button-primary" type="button" data-add-calculation disabled>Agregar al presupuesto</button></div><p class="calc-message" aria-live="polite"></p><div class="result-grid" hidden><div class="result"><span>Volumen por pieza</span><strong data-result="piece"></strong></div><div class="result result--primary"><span>Volumen total</span><strong data-result="total"></strong></div><div class="result"><span>Cantidad</span><strong data-result="quantity"></strong></div></div></form>`;
    else {
      const sizes = product.boardSizes || [];
      const options = sizes.map((size, i) => `<option value="${i}">${size.label}</option>`).join("") + `<option value="custom">Medida personalizada</option>`;
      article.innerHTML = heading + `<form data-calc-form data-calc-type="board" novalidate><div class="calc-fields"><div class="form-field"><label for="${product.id}-surface-length">Largo de la superficie (m)</label><input id="${product.id}-surface-length" name="surfaceLength" inputmode="decimal" type="number" min="0.001" step="any" required></div><div class="form-field"><label for="${product.id}-surface-width">Ancho de la superficie (m)</label><input id="${product.id}-surface-width" name="surfaceWidth" inputmode="decimal" type="number" min="0.001" step="any" required></div><div class="form-field"><label for="${product.id}-board-size">Medida de la placa</label><select id="${product.id}-board-size" name="boardSize">${options}</select></div><div class="form-field"><label for="${product.id}-waste">Desperdicio <span>(opcional)</span></label><input id="${product.id}-waste" name="waste" inputmode="decimal" type="number" min="0" max="100" step="any" value="10"></div></div><div class="calc-fields board-custom" data-board-custom ${sizes.length ? "hidden" : ""}><div class="form-field"><label for="${product.id}-board-width">Ancho de la placa (m)</label><input id="${product.id}-board-width" name="boardWidth" inputmode="decimal" type="number" min="0.001" step="any"></div><div class="form-field"><label for="${product.id}-board-length">Largo de la placa (m)</label><input id="${product.id}-board-length" name="boardLength" inputmode="decimal" type="number" min="0.001" step="any"></div></div><div class="calc-actions"><button class="button button-secondary" type="submit">Calcular placas</button><button class="button button-primary" type="button" data-add-calculation disabled>Agregar al presupuesto</button></div><p class="calc-message" aria-live="polite"></p><div class="result-grid" hidden><div class="result"><span>Superficie</span><strong data-result="surface"></strong></div><div class="result"><span>Placas mínimas</span><strong data-result="minimum"></strong></div><div class="result result--primary"><span>Placas recomendadas</span><strong data-result="recommended"></strong></div><div class="result"><span>Superficie cubierta</span><strong data-result="covered"></strong></div></div></form>`;
    }
    return article;
  }

  function readWood(form) {
    const data = Object.fromEntries(new FormData(form)); const factor = { mm: .001, cm: .01, m: 1 }[data.unit];
    const length = number(data.length), width = number(data.width), thickness = number(data.thickness), quantity = number(data.quantity);
    if (![length, width, thickness].every((value) => validPositive(value, 100000)) || !Number.isInteger(quantity) || !validPositive(quantity, 100000)) return null;
    const perPiece = length * factor * width * factor * thickness * factor; const total = perPiece * quantity;
    if (!Number.isFinite(total) || total > 1000000) return null;
    return { perPiece, total, quantity, unit: data.unit, dimensions: `${data.length} × ${data.width} × ${data.thickness} ${data.unit}` };
  }

  function readBoard(form, product) {
    const data = Object.fromEntries(new FormData(form)); const surfaceLength = number(data.surfaceLength), surfaceWidth = number(data.surfaceWidth), waste = data.waste === "" ? 0 : number(data.waste);
    if (![surfaceLength, surfaceWidth].every((value) => validPositive(value, 10000)) || !Number.isFinite(waste) || waste < 0 || waste > 100) return null;
    let board;
    if (data.boardSize === "custom") { const width = number(data.boardWidth), length = number(data.boardLength); if (![width, length].every((value) => validPositive(value, 100))) return null; board = { width, length, label: `${cleanNumber(width)} × ${cleanNumber(length)} m` }; }
    else board = (product.boardSizes || [])[Number(data.boardSize)];
    if (!board) return null;
    const surface = surfaceLength * surfaceWidth, boardSurface = board.width * board.length, minimum = Math.ceil(surface / boardSurface), recommended = Math.ceil(minimum * (1 + waste / 100));
    if (![surface, boardSurface, minimum, recommended].every(Number.isFinite) || recommended > 1000000) return null;
    return { surface, boardSurface, minimum, recommended, covered: recommended * boardSurface, waste, board };
  }

  function calculate(form, showMessage = false) {
    const card = form.closest("[data-calculator]"); const product = getProduct(card?.dataset.calculator); const result = $(".result-grid", form); const message = $(".calc-message", form); const add = $("[data-add-calculation]", form);
    if (!product) return;
    const calculation = product.calculator === "wood" ? readWood(form) : readBoard(form, product);
    form._calculation = calculation;
    if (!calculation) { result.hidden = true; add.disabled = true; if (showMessage) message.textContent = "Completá valores válidos y revisá que las medidas no sean excesivas."; else message.textContent = ""; return; }
    message.textContent = ""; result.hidden = false; add.disabled = false;
    if (product.calculator === "wood") { $("[data-result='piece']", form).textContent = `${cleanNumber(calculation.perPiece, 4)} m³`; $("[data-result='total']", form).textContent = `${cleanNumber(calculation.total, 4)} m³`; $("[data-result='quantity']", form).textContent = cleanNumber(calculation.quantity, 0); }
    else { $("[data-result='surface']", form).textContent = `${cleanNumber(calculation.surface)} m²`; $("[data-result='minimum']", form).textContent = cleanNumber(calculation.minimum, 0); $("[data-result='recommended']", form).textContent = cleanNumber(calculation.recommended, 0); $("[data-result='covered']", form).textContent = `${cleanNumber(calculation.covered)} m²`; }
  }

  function renderCalculators() {
    const container = $("[data-calculators]"); if (!container) return;
    container.replaceChildren(); products.filter((product) => product.calculator).forEach((product, index) => container.append(calculatorCard(product, index)));
  }

  function addQuote(item) {
    const existing = quote.find((entry) => entry.id === item.id);
    if (existing) existing.quantity += item.quantity; else quote.push(item);
    renderQuote();
  }

  function renderQuote() {
    const container = $("[data-quote-items]"); const count = $("[data-quote-count]"); if (!container) return;
    container.replaceChildren(); if (count) count.textContent = quote.length;
    if (!quote.length) { const empty = document.createElement("p"); empty.className = "quote-empty"; empty.textContent = "Todavía no agregaste materiales."; container.append(empty); return; }
    quote.forEach((item) => { const row = document.createElement("div"); row.className = "quote-item"; const text = document.createElement("div"); const name = document.createElement("strong"); name.textContent = item.name; const detail = document.createElement("small"); detail.textContent = item.detail; text.append(name, detail); const controls = document.createElement("div"); controls.className = "quote-item__controls"; const input = document.createElement("input"); input.type = "number"; input.min = item.unit === "m³" ? ".001" : "1"; input.step = item.unit === "m³" ? ".001" : "1"; input.value = item.quantity; input.setAttribute("aria-label", `Cantidad de ${item.name}`); input.dataset.quoteQuantity = item.id; controls.append(input, button("Quitar", "quote-remove", "removeQuote", item.id)); row.append(text, controls); container.append(row); });
  }

  function addCalculation(form) {
    const card = form.closest("[data-calculator]"); const product = getProduct(card?.dataset.calculator); const calculation = form._calculation; if (!product || !calculation) return;
    if (product.calculator === "wood") addQuote({ id: `wood-${calculation.dimensions}`, name: "Maderas", detail: `${calculation.dimensions} · ${calculation.quantity} pieza${calculation.quantity === 1 ? "" : "s"}`, quantity: calculation.total, unit: "m³" });
    else addQuote({ id: `${product.id}-${calculation.board.label}`, name: product.name, detail: `${calculation.board.label} · ${cleanNumber(calculation.surface)} m²`, quantity: calculation.recommended, unit: "placas" });
    const panel = $("#presupuesto"); panel?.scrollIntoView({ behavior: reduceMotion() ? "auto" : "smooth", block: "center" });
  }

  function setupInteractions() {
    document.addEventListener("click", (event) => {
      const target = event.target.closest("button"); if (!target) return;
      if (target.dataset.openProduct) openProduct(target.dataset.openProduct);
      if (target.dataset.consultProduct) { const product = getProduct(target.dataset.consultProduct); if (product && config.whatsapp) window.open(waUrl(`Hola, quisiera consultar por ${product.name}.`), "_blank", "noopener"); }
      if (target.dataset.addProduct) { const product = getProduct(target.dataset.addProduct); if (product) addQuote({ id: product.id, name: product.name, detail: "Consulta de producto", quantity: 1, unit: "unidad" }); $("[data-product-dialog]")?.close(); }
      if (target.dataset.openCalculator) { const dialog = $("[data-product-dialog]"); dialog?.close(); const calculator = $(`[data-calculator="${target.dataset.openCalculator}"]`); calculator?.scrollIntoView({ behavior: reduceMotion() ? "auto" : "smooth", block: "center" }); window.setTimeout(() => $("input, select", calculator)?.focus({ preventScroll: true }), 350); }
      if (target.dataset.addCalculation) addCalculation(target.closest("form"));
      if (target.dataset.removeQuote) { const index = quote.findIndex((item) => item.id === target.dataset.removeQuote); if (index >= 0) quote.splice(index, 1); renderQuote(); }
    });
    document.addEventListener("input", (event) => { const form = event.target.closest("[data-calc-form]"); if (form) calculate(form); const quantity = event.target.closest("[data-quote-quantity]"); if (quantity) { const item = quote.find((entry) => entry.id === quantity.dataset.quoteQuantity); const value = number(quantity.value); if (item && validPositive(value, item.unit === "m³" ? 1000000 : 1000000)) item.quantity = item.unit === "m³" ? value : Math.max(1, Math.round(value)); } });
    document.addEventListener("change", (event) => { const form = event.target.closest("[data-calc-form]"); if (!form) return; if (event.target.name === "boardSize") { const custom = $("[data-board-custom]", form); if (custom) custom.hidden = event.target.value !== "custom"; } calculate(form); });
    document.addEventListener("submit", (event) => { const form = event.target.closest("[data-calc-form]"); if (!form) return; event.preventDefault(); calculate(form, true); });
    $("[data-quote-form]")?.addEventListener("submit", (event) => { event.preventDefault(); const form = event.currentTarget; const status = $("[data-quote-status]"); if (!quote.length) { status.textContent = "Agregá al menos un material antes de enviar la solicitud."; return; } if (!form.checkValidity()) { status.textContent = "Completá nombre, teléfono y localidad para continuar."; form.reportValidity(); return; } const data = new FormData(form); const items = quote.map((item) => `• ${item.name}: ${cleanNumber(item.quantity, item.unit === "m³" ? 3 : 0)} ${item.unit}${item.detail ? ` (${item.detail})` : ""}`).join("\n"); const comments = data.get("comments") ? `\n\nObservaciones:\n${data.get("comments")}` : ""; const message = `Hola, quisiera solicitar un presupuesto:\n\n${items}\n\nNombre: ${data.get("name")}\nTeléfono: ${data.get("phone")}\nLocalidad: ${data.get("locality")}${comments}`; window.open(waUrl(message), "_blank", "noopener"); status.textContent = "Abrimos WhatsApp con el resumen de tu solicitud."; });
  }

  function setWhatsAppLinks() { $$('[data-whatsapp="general"]').forEach((link) => { link.href = waUrl("Hola, quisiera consultar por los productos del aserradero."); }); }
  function setupPwa() { if ("serviceWorker" in navigator && location.protocol.startsWith("http")) window.addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(() => {}), { once: true }); }
  document.addEventListener("DOMContentLoaded", () => { setupLoading(); setWhatsAppLinks(); setupNavigation(); setupReveal(); setupHero(); renderCatalog(); renderCalculators(); renderQuote(); setupDialog(); setupInteractions(); setupPwa(); });
})();
