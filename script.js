(() => {
  "use strict";

  const config = window.ASERRADERO_CONFIG || { whatsapp: "5492944928970", products: [] };
  const products = Array.isArray(config.products) ? config.products : [];
  const quote = [];
  let activeCatalogFilter = "all";
  let activeCalcTab = "all";

  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
  const reduceMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const getProduct = (id) => products.find((product) => product.id === id);
  const waUrl = (message) =>
    "https://wa.me/" + (config.whatsapp || "5492944928970") + "?text=" + encodeURIComponent(message);
  const number = (value) => Number.parseFloat(value);
  const validPositive = (value, max) => Number.isFinite(value) && value > 0 && value <= max;
  const cleanNumber = (value, digits = 2) =>
    new Intl.NumberFormat("es-AR", { maximumFractionDigits: digits }).format(value);

  /* 1. Pantalla de carga rápida y fluida */
  function setupLoading() {
    const screen = $("#loading-screen");
    if (!screen) return;
    const hide = () => {
      window.setTimeout(() => {
        screen.classList.add("hidden");
        window.setTimeout(() => screen.remove(), 400);
      }, 220);
    };
    if (document.readyState === "complete") hide();
    else window.addEventListener("load", hide, { once: true });
  }

  /* 2. Navegación principal y móvil */
  function setupNavigation() {
    const shell = $("[data-header-shell]");
    const toggle = $("[data-nav-toggle]");
    const mobile = $("[data-mobile-nav]");

    const setOpen = (open) => {
      if (!shell || !toggle) return;
      shell.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
    };

    toggle?.addEventListener("click", () => setOpen(!shell.classList.contains("is-open")));
    if (mobile) {
      $$("a", mobile).forEach((link) => link.addEventListener("click", () => setOpen(false)));
    }
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") setOpen(false);
    });
    window.addEventListener("resize", () => {
      if (window.innerWidth > 767) setOpen(false);
    });

    const updateHeader = () => shell?.classList.toggle("is-scrolled", window.scrollY > 16);
    updateHeader();
    window.addEventListener("scroll", updateHeader, { passive: true });

    $$('a[href^="#"]').forEach((link) =>
      link.addEventListener("click", (event) => {
        const href = link.getAttribute("href");
        if (!href || href === "#") return;
        const target = $(href);
        if (!target) return;
        event.preventDefault();
        window.scrollTo({
          top: target.getBoundingClientRect().top + window.scrollY - 84,
          behavior: reduceMotion() ? "auto" : "smooth"
        });
      })
    );
  }

  /* 3. Animaciones de entrada suaves al hacer scroll */
  function setupReveal() {
    const elements = $$(".reveal, .timeline-item");
    if (!("IntersectionObserver" in window) || reduceMotion()) {
      elements.forEach((item) => item.classList.add("is-visible"));
      return;
    }
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }),
      { threshold: 0.1 }
    );
    elements.forEach((item) => observer.observe(item));
  }

  /* 4. Fondo dinámico del Hero con fotografías reales */
  function setupHero() {
    const layers = $$(".hero-bg");
    const images = [
      "img/Obra/Imagen Obra 10.jpeg",
      "img/Viviendas Modulares/Obra Modular 3.jpeg",
      "img/Paneles/Imagen Panel 1.jpeg",
      "img/Estructura de madera/Estructura de madera 1.jpg"
    ];
    if (layers.length < 2) return;
    let currentLayer = 0;
    let currentImage = 0;
    layers[0].style.backgroundImage = `url("${images[0]}")`;
    if (reduceMotion()) return;
    window.setInterval(() => {
      currentImage = (currentImage + 1) % images.length;
      const next = layers[1 - currentLayer];
      next.style.backgroundImage = `url("${images[currentImage]}")`;
      next.classList.add("is-active");
      layers[currentLayer].classList.remove("is-active");
      currentLayer = 1 - currentLayer;
    }, 6000);
  }

  function button(label, className, dataName, value) {
    const element = document.createElement("button");
    element.type = "button";
    element.className = className;
    element.textContent = label;
    if (dataName) element.dataset[dataName] = value;
    return element;
  }

  /* 5. Filtros y Catálogo de las 6 Categorías */
  function renderCatalogFilters() {
    const bar = $("[data-catalog-filters]");
    if (!bar || !products.length) return;
    bar.replaceChildren();

    const allBtn = button(
      `Todas (${products.length})`,
      `filter-chip ${activeCatalogFilter === "all" ? "is-active" : ""}`,
      "filterCatalog",
      "all"
    );
    allBtn.setAttribute("aria-pressed", String(activeCatalogFilter === "all"));
    bar.append(allBtn);

    products.forEach((product) => {
      const chip = button(
        product.name,
        `filter-chip ${activeCatalogFilter === product.id ? "is-active" : ""}`,
        "filterCatalog",
        product.id
      );
      chip.setAttribute("aria-pressed", String(activeCatalogFilter === product.id));
      bar.append(chip);
    });
  }

  function renderCatalog() {
    const catalog = $("[data-catalog]");
    if (!catalog) return;
    catalog.replaceChildren();

    const visibleProducts =
      activeCatalogFilter === "all"
        ? products
        : products.filter((product) => product.id === activeCatalogFilter);

    visibleProducts.forEach((product) => {
      const card = document.createElement("article");
      card.className = "product-card";

      const media = document.createElement("div");
      media.className = "product-card__media";

      const image = document.createElement("img");
      image.src = product.image;
      image.alt = `${product.name} - ${product.category}`;
      image.loading = "lazy";
      image.decoding = "async";

      const badges = document.createElement("div");
      badges.className = "product-card__badges";

      const categoryBadge = document.createElement("span");
      categoryBadge.className = "product-category-tag";
      categoryBadge.textContent = product.category;

      const availabilityBadge = document.createElement("span");
      availabilityBadge.className = "availability-badge";
      availabilityBadge.textContent = product.availability || "Disponible";

      badges.append(categoryBadge, availabilityBadge);
      media.append(image, badges);

      const body = document.createElement("div");
      body.className = "product-card__body";

      const titleRow = document.createElement("div");
      titleRow.className = "product-card__title-row";
      const title = document.createElement("h3");
      title.textContent = product.name;
      titleRow.append(title);

      const description = document.createElement("p");
      description.className = "product-card__desc";
      description.textContent = product.description;

      const use = document.createElement("p");
      use.className = "product-use";
      use.textContent = `Aplicación: ${product.use}`;

      const featuresList = document.createElement("ul");
      featuresList.className = "product-card__features";
      (product.features || []).slice(0, 3).forEach((feat) => {
        const li = document.createElement("li");
        li.textContent = feat;
        featuresList.append(li);
      });

      const actions = document.createElement("div");
      actions.className = "product-card__actions";
      actions.append(button("Ver características", "text-button", "openProduct", product.id));

      const primaryBtnGroup = document.createElement("div");
      primaryBtnGroup.className = "product-card__btn-group";

      if (product.calculator) {
        primaryBtnGroup.append(
          button("Calcular", "button button-secondary button-sm", "openCalculator", product.id)
        );
      } else {
        primaryBtnGroup.append(
          button("+ Presupuesto", "button button-secondary button-sm", "addProduct", product.id)
        );
      }
      primaryBtnGroup.append(
        button("WhatsApp", "button button-primary button-sm", "consultProduct", product.id)
      );

      actions.append(primaryBtnGroup);
      body.append(titleRow, description, use, featuresList, actions);
      card.append(media, body);
      catalog.append(card);
    });
  }

  /* 6. Modal de Detalle de Producto */
  function openProduct(id) {
    const product = getProduct(id);
    const dialog = $("[data-product-dialog]");
    const detail = $("[data-product-detail]");
    if (!product || !dialog || !detail) return;
    detail.replaceChildren();

    const image = document.createElement("img");
    image.className = "product-dialog__image";
    image.src = product.image;
    image.alt = product.name;

    const content = document.createElement("div");
    content.className = "product-dialog__content";

    const topMeta = document.createElement("div");
    topMeta.className = "product-dialog__meta";

    const eyebrow = document.createElement("p");
    eyebrow.className = "eyebrow";
    eyebrow.textContent = product.category;

    const availability = document.createElement("span");
    availability.className = "availability-badge";
    availability.textContent = product.availability || "Disponible";

    topMeta.append(eyebrow, availability);

    const title = document.createElement("h2");
    title.id = "dialog-title";
    title.textContent = product.name;

    const description = document.createElement("p");
    description.textContent = product.description;

    const useTag = document.createElement("p");
    useTag.className = "product-use";
    useTag.textContent = `Uso principal: ${product.use}`;

    const featureTitle = document.createElement("h3");
    featureTitle.textContent = "Características de la categoría";

    const list = document.createElement("ul");
    (product.features || []).forEach((feature) => {
      const item = document.createElement("li");
      item.textContent = feature;
      list.append(item);
    });

    content.append(topMeta, title, description, useTag, featureTitle, list);

    /* Variantes de Clavos si existen */
    if (Array.isArray(product.variants) && product.variants.length) {
      const varTitle = document.createElement("h3");
      varTitle.textContent = "Variedades disponibles";
      const varGrid = document.createElement("div");
      varGrid.className = "dialog-variants-grid";
      product.variants.forEach((v) => {
        const vCard = document.createElement("div");
        vCard.className = "dialog-variant-card";
        const vName = document.createElement("strong");
        vName.textContent = v.name;
        const vPres = document.createElement("span");
        vPres.className = "dialog-variant-pres";
        vPres.textContent = v.presentation;
        const vDet = document.createElement("p");
        vDet.textContent = v.detail;
        const vActions = document.createElement("div");
        vActions.className = "dialog-variant-actions";
        const addVarBtn = button("+ Presupuesto", "text-button", "addVariant", `${product.id}|${v.name}|${v.presentation}`);
        const waVarBtn = button("Cotizar WhatsApp", "text-button text-button--green", "consultVariant", `Clavo ${v.name} (${v.presentation})`);
        vActions.append(addVarBtn, waVarBtn);
        vCard.append(vName, vPres, vDet, vActions);
        varGrid.append(vCard);
      });
      content.append(varTitle, varGrid);
    }

    /* Opciones de baterías si es Paneles solares */
    if (Array.isArray(product.batteryOptions) && product.batteryOptions.length) {
      const batTitle = document.createElement("h3");
      batTitle.textContent = "Referencias de baterías disponibles";
      const batList = document.createElement("ul");
      product.batteryOptions.forEach((b) => {
        const li = document.createElement("li");
        li.textContent = b.label;
        batList.append(li);
      });
      content.append(batTitle, batList);
    }

    const actions = document.createElement("div");
    actions.className = "dialog-actions";
    if (product.calculator) {
      actions.append(button("Ir a la calculadora", "button button-primary", "openCalculator", product.id));
    }
    actions.append(button("Agregar al presupuesto", "button button-secondary", "addProduct", product.id));
    actions.append(button("Consultar por WhatsApp", "button button-outline", "consultProduct", product.id));

    const link = document.createElement("a");
    link.href = product.detailUrl;
    link.className = "text-button";
    link.textContent = "Ver ficha completa →";
    actions.append(link);

    content.append(actions);
    detail.append(image, content);
    if (typeof dialog.showModal === "function") dialog.showModal();
    else dialog.setAttribute("open", "");
  }

  function setupDialog() {
    const dialog = $("[data-product-dialog]");
    $("[data-dialog-close]")?.addEventListener("click", () => dialog?.close());
    dialog?.addEventListener("click", (event) => {
      if (event.target === dialog) dialog.close();
    });
  }

  /* 7. Calculadoras de Materiales y Calculadora de Paneles Solares */
  function renderCalcTabs() {
    const container = $("[data-calc-tabs]");
    if (!container) return;
    container.replaceChildren();
    const calcProducts = products.filter((p) => p.calculator);

    const allTab = button(
      `Todas las calculadoras (${calcProducts.length})`,
      `calc-tab ${activeCalcTab === "all" ? "is-active" : ""}`,
      "selectCalcTab",
      "all"
    );
    container.append(allTab);

    calcProducts.forEach((product, idx) => {
      const tab = button(
        `0${idx + 1} · ${product.name}`,
        `calc-tab ${activeCalcTab === product.id ? "is-active" : ""}`,
        "selectCalcTab",
        product.id
      );
      container.append(tab);
    });
  }

  function calculatorCard(product, index) {
    const article = document.createElement("article");
    article.className = "calculator-card";
    article.dataset.calculator = product.id;
    if (activeCalcTab !== "all" && activeCalcTab !== product.id) {
      article.hidden = true;
    }

    const subtitleText =
      product.calculator === "wood"
        ? "Ingresá las medidas y obtené el volumen aproximado en m³."
        : product.calculator === "solar"
        ? "Ajustá tu consumo mensual y horas de sol para estimar paneles, potencia kWp y superficie."
        : "Ingresá la superficie y la medida de la placa para estimar la cantidad necesaria.";

    const titleText =
      product.calculator === "wood"
        ? "Calculá tu madera"
        : product.calculator === "solar"
        ? "Calculadora de paneles solares"
        : `Calculá tus placas de ${product.name}`;

    const heading = `
      <header class="calculator-card__header">
        <div>
          <div class="calculator-card__eyebrow-row">
            <p class="eyebrow">${product.name}</p>
            <span class="availability-badge">${product.availability || "Disponible"}</span>
          </div>
          <h3>${titleText}</h3>
          <p>${subtitleText}</p>
        </div>
        <span class="calculator-number">0${index + 1}</span>
      </header>`;

    if (product.calculator === "wood") {
      article.innerHTML =
        heading +
        `<form data-calc-form data-calc-type="wood" novalidate>
          <div class="calc-fields calc-fields--four">
            <div class="form-field">
              <label for="${product.id}-length">Largo</label>
              <input id="${product.id}-length" name="length" inputmode="decimal" type="number" min="0.001" step="any" placeholder="Ej: 3.2" required>
            </div>
            <div class="form-field">
              <label for="${product.id}-width">Ancho</label>
              <input id="${product.id}-width" name="width" inputmode="decimal" type="number" min="0.001" step="any" placeholder="Ej: 0.15" required>
            </div>
            <div class="form-field">
              <label for="${product.id}-thickness">Espesor</label>
              <input id="${product.id}-thickness" name="thickness" inputmode="decimal" type="number" min="0.001" step="any" placeholder="Ej: 0.05" required>
            </div>
            <div class="form-field">
              <label for="${product.id}-quantity">Cantidad</label>
              <input id="${product.id}-quantity" name="quantity" inputmode="numeric" type="number" min="1" step="1" value="1" required>
            </div>
            <div class="form-field">
              <label for="${product.id}-unit">Unidad de medida</label>
              <select id="${product.id}-unit" name="unit">
                <option value="m">Metros (m)</option>
                <option value="cm">Centímetros (cm)</option>
                <option value="mm">Milímetros (mm)</option>
              </select>
            </div>
          </div>
          <div class="calc-actions">
            <button class="button button-secondary" type="submit">Calcular volumen</button>
            <button class="button button-primary" type="button" data-add-calculation disabled>Agregar al presupuesto</button>
            <button class="button button-outline" type="button" data-wa-calculation disabled>Consultar por WhatsApp</button>
          </div>
          <p class="calc-message" aria-live="polite"></p>
          <div class="result-grid" hidden>
            <div class="result"><span>Volumen por pieza</span><strong data-result="piece"></strong></div>
            <div class="result result--primary"><span>Volumen total</span><strong data-result="total"></strong></div>
            <div class="result"><span>Cantidad</span><strong data-result="quantity"></strong></div>
          </div>
        </form>`;
    } else if (product.calculator === "solar") {
      article.innerHTML =
        heading +
        `<form data-calc-form data-calc-type="solar" novalidate>
          <div class="calc-fields">
            <div class="form-field">
              <label for="${product.id}-consumption">Consumo mensual (kWh) <span data-solar-val="consumption">300 kWh</span></label>
              <input id="${product.id}-consumption" name="consumption" type="range" min="50" max="1500" step="10" value="300">
            </div>
            <div class="form-field">
              <label for="${product.id}-sunhours">Horas pico solar diarias <span data-solar-val="sunHours">4.8 hs</span></label>
              <input id="${product.id}-sunhours" name="sunHours" type="range" min="2.5" max="7" step="0.1" value="4.8">
            </div>
            <div class="form-field">
              <label for="${product.id}-panelwatts">Potencia por panel (W) <span data-solar-val="panelWatts">400 W</span></label>
              <input id="${product.id}-panelwatts" name="panelWatts" type="range" min="200" max="600" step="10" value="400">
            </div>
            <div class="form-field">
              <label for="${product.id}-efficiency">Eficiencia del sistema (%) <span data-solar-val="efficiency">85%</span></label>
              <input id="${product.id}-efficiency" name="efficiency" type="range" min="70" max="95" step="1" value="85">
            </div>
          </div>
          <div class="result-grid result-grid--four">
            <div class="result result--primary"><span>Paneles necesarios</span><strong data-result="panels">8</strong></div>
            <div class="result"><span>kWp del sistema</span><strong data-result="kwp">3,2 kWp</strong></div>
            <div class="result"><span>m² de techo</span><strong data-result="roof">13 m²</strong></div>
            <div class="result"><span>kWh/mes generados</span><strong data-result="generated">294 kWh</strong></div>
          </div>
          <div class="calc-actions">
            <button class="button button-primary" type="button" data-add-calculation>Agregar al presupuesto</button>
            <button class="button button-secondary" type="button" data-wa-calculation>Consultar cálculo por WhatsApp</button>
            <a class="text-button" href="Sistemas%20constructivos/Panelessolares.html#calculadoras">Ver calculadoras de baterías y electrodomésticos →</a>
          </div>
          <p class="calc-message" aria-live="polite"></p>
        </form>`;
    } else {
      const sizes = product.boardSizes || [];
      const options =
        sizes.map((size, i) => `<option value="${i}">${size.label}</option>`).join("") +
        `<option value="custom">Medida personalizada</option>`;
      article.innerHTML =
        heading +
        `<form data-calc-form data-calc-type="board" novalidate>
          <div class="calc-fields">
            <div class="form-field">
              <label for="${product.id}-surface-length">Largo de la superficie (m)</label>
              <input id="${product.id}-surface-length" name="surfaceLength" inputmode="decimal" type="number" min="0.001" step="any" placeholder="Ej: 5" required>
            </div>
            <div class="form-field">
              <label for="${product.id}-surface-width">Ancho de la superficie (m)</label>
              <input id="${product.id}-surface-width" name="surfaceWidth" inputmode="decimal" type="number" min="0.001" step="any" placeholder="Ej: 4" required>
            </div>
            <div class="form-field">
              <label for="${product.id}-board-size">Medida de la placa</label>
              <select id="${product.id}-board-size" name="boardSize">${options}</select>
            </div>
            <div class="form-field">
              <label for="${product.id}-waste">Desperdicio (%) <span>(opcional)</span></label>
              <input id="${product.id}-waste" name="waste" inputmode="decimal" type="number" min="0" max="100" step="any" value="10">
            </div>
          </div>
          <div class="calc-fields board-custom" data-board-custom ${sizes.length ? "hidden" : ""}>
            <div class="form-field">
              <label for="${product.id}-board-width">Ancho de la placa (m)</label>
              <input id="${product.id}-board-width" name="boardWidth" inputmode="decimal" type="number" min="0.001" step="any" placeholder="Ej: 1.22">
            </div>
            <div class="form-field">
              <label for="${product.id}-board-length">Largo de la placa (m)</label>
              <input id="${product.id}-board-length" name="boardLength" inputmode="decimal" type="number" min="0.001" step="any" placeholder="Ej: 2.44">
            </div>
          </div>
          <div class="calc-actions">
            <button class="button button-secondary" type="submit">Calcular placas</button>
            <button class="button button-primary" type="button" data-add-calculation disabled>Agregar al presupuesto</button>
            <button class="button button-outline" type="button" data-wa-calculation disabled>Consultar por WhatsApp</button>
          </div>
          <p class="calc-message" aria-live="polite"></p>
          <div class="result-grid result-grid--four" hidden>
            <div class="result"><span>Superficie</span><strong data-result="surface"></strong></div>
            <div class="result"><span>Placas mínimas</span><strong data-result="minimum"></strong></div>
            <div class="result result--primary"><span>Placas recomendadas</span><strong data-result="recommended"></strong></div>
            <div class="result"><span>Superficie cubierta</span><strong data-result="covered"></strong></div>
          </div>
        </form>`;
    }
    return article;
  }

  function readWood(form) {
    const data = Object.fromEntries(new FormData(form));
    const factor = { mm: 0.001, cm: 0.01, m: 1 }[data.unit];
    const length = number(data.length);
    const width = number(data.width);
    const thickness = number(data.thickness);
    const quantity = number(data.quantity);
    if (
      ![length, width, thickness].every((value) => validPositive(value, 100000)) ||
      !Number.isInteger(quantity) ||
      !validPositive(quantity, 100000)
    )
      return null;
    const perPiece = length * factor * width * factor * thickness * factor;
    const total = perPiece * quantity;
    if (!Number.isFinite(total) || total > 1000000) return null;
    return {
      perPiece,
      total,
      quantity,
      unit: data.unit,
      dimensions: `${data.length} × ${data.width} × ${data.thickness} ${data.unit}`
    };
  }

  function readBoard(form, product) {
    const data = Object.fromEntries(new FormData(form));
    const surfaceLength = number(data.surfaceLength);
    const surfaceWidth = number(data.surfaceWidth);
    const waste = data.waste === "" ? 0 : number(data.waste);
    if (
      ![surfaceLength, surfaceWidth].every((value) => validPositive(value, 10000)) ||
      !Number.isFinite(waste) ||
      waste < 0 ||
      waste > 100
    )
      return null;
    let board;
    if (data.boardSize === "custom") {
      const width = number(data.boardWidth);
      const length = number(data.boardLength);
      if (![width, length].every((value) => validPositive(value, 100))) return null;
      board = { width, length, label: `${cleanNumber(width)} × ${cleanNumber(length)} m` };
    } else {
      board = (product.boardSizes || [])[Number(data.boardSize)];
    }
    if (!board) return null;
    const surface = surfaceLength * surfaceWidth;
    const boardSurface = board.width * board.length;
    const minimum = Math.ceil(surface / boardSurface);
    const recommended = Math.ceil(minimum * (1 + waste / 100));
    if (![surface, boardSurface, minimum, recommended].every(Number.isFinite) || recommended > 1000000)
      return null;
    return { surface, boardSurface, minimum, recommended, covered: recommended * boardSurface, waste, board };
  }

  /* Misma lógica exacta de calcP() de Panelessolares.html */
  function readSolar(form) {
    const data = Object.fromEntries(new FormData(form));
    const c = number(data.consumption);
    const h = number(data.sunHours);
    const w = number(data.panelWatts);
    const e = number(data.efficiency) / 100;
    if (![c, h, w, e].every((v) => Number.isFinite(v) && v > 0)) return null;
    const d = c / 30;
    const g = (w / 1000) * h * e;
    const p = Math.ceil(d / g);
    const kwp = Number((p * w / 1000).toFixed(1));
    const roof = Math.round(p * 1.65);
    const generated = Math.round(p * g * 30);
    return { c, h, w, eff: Math.round(e * 100), panels: p, kwp, roof, generated };
  }

  function calculate(form, showMessage = false) {
    const card = form.closest("[data-calculator]");
    const product = getProduct(card?.dataset.calculator);
    const result = $(".result-grid", form);
    const message = $(".calc-message", form);
    const add = $("[data-add-calculation]", form);
    const waBtn = $("[data-wa-calculation]", form);
    if (!product) return;

    const calculation =
      product.calculator === "wood"
        ? readWood(form)
        : product.calculator === "solar"
        ? readSolar(form)
        : readBoard(form, product);

    form._calculation = calculation;
    if (!calculation) {
      if (result) result.hidden = true;
      if (add) add.disabled = true;
      if (waBtn) waBtn.disabled = true;
      if (message) {
        message.textContent = showMessage
          ? "Completá valores válidos y revisá que las medidas no sean excesivas."
          : "";
      }
      return;
    }

    if (message) message.textContent = "";
    if (result) result.hidden = false;
    if (add) add.disabled = false;
    if (waBtn) waBtn.disabled = false;

    if (product.calculator === "wood") {
      $("[data-result='piece']", form).textContent = `${cleanNumber(calculation.perPiece, 4)} m³`;
      $("[data-result='total']", form).textContent = `${cleanNumber(calculation.total, 4)} m³`;
      $("[data-result='quantity']", form).textContent = cleanNumber(calculation.quantity, 0);
    } else if (product.calculator === "solar") {
      $("[data-solar-val='consumption']", form).textContent = `${calculation.c} kWh`;
      $("[data-solar-val='sunHours']", form).textContent = `${calculation.h.toFixed(1)} hs`;
      $("[data-solar-val='panelWatts']", form).textContent = `${calculation.w} W`;
      $("[data-solar-val='efficiency']", form).textContent = `${calculation.eff}%`;
      $("[data-result='panels']", form).textContent = String(calculation.panels);
      $("[data-result='kwp']", form).textContent = `${cleanNumber(calculation.kwp, 1)} kWp`;
      $("[data-result='roof']", form).textContent = `${calculation.roof} m²`;
      $("[data-result='generated']", form).textContent = `${calculation.generated} kWh`;
    } else {
      $("[data-result='surface']", form).textContent = `${cleanNumber(calculation.surface)} m²`;
      $("[data-result='minimum']", form).textContent = cleanNumber(calculation.minimum, 0);
      $("[data-result='recommended']", form).textContent = cleanNumber(calculation.recommended, 0);
      $("[data-result='covered']", form).textContent = `${cleanNumber(calculation.covered)} m²`;
    }
  }

  function renderCalculators() {
    const container = $("[data-calculators]");
    if (!container) return;
    container.replaceChildren();
    products
      .filter((product) => product.calculator)
      .forEach((product, index) => {
        const card = calculatorCard(product, index);
        container.append(card);
        if (product.calculator === "solar") {
          const form = $("[data-calc-form]", card);
          if (form) calculate(form, false);
        }
      });
  }

  /* 8. Armador de Presupuesto y Envío por WhatsApp */
  function setupQuickAdd() {
    const select = $("[data-quick-select]");
    if (!select || !products.length) return;
    select.replaceChildren();
    products.forEach((p) => {
      if (Array.isArray(p.variants) && p.variants.length) {
        const group = document.createElement("optgroup");
        group.label = p.name;
        p.variants.forEach((v) => {
          const opt = document.createElement("option");
          opt.value = `${p.id}|${v.name}|${v.presentation}`;
          opt.textContent = `Clavo ${v.name} (${v.presentation})`;
          group.append(opt);
        });
        select.append(group);
      } else {
        const opt = document.createElement("option");
        opt.value = p.id;
        opt.textContent = `${p.name} — ${p.use}`;
        select.append(opt);
      }
    });
  }

  function addQuote(item) {
    const existing = quote.find((entry) => entry.id === item.id);
    if (existing) existing.quantity += item.quantity;
    else quote.push(item);
    renderQuote();
  }

  function renderQuote() {
    const container = $("[data-quote-items]");
    const count = $("[data-quote-count]");
    if (!container) return;
    container.replaceChildren();
    if (count) count.textContent = String(quote.length);

    if (!quote.length) {
      const empty = document.createElement("p");
      empty.className = "quote-empty";
      empty.textContent = "Todavía no agregaste materiales. Usá las calculadoras o sumá una categoría arriba.";
      container.append(empty);
      return;
    }

    quote.forEach((item) => {
      const row = document.createElement("div");
      row.className = "quote-item";
      const text = document.createElement("div");
      const name = document.createElement("strong");
      name.textContent = item.name;
      const detail = document.createElement("small");
      detail.textContent = `${item.detail} (${item.unit})`;
      text.append(name, detail);

      const controls = document.createElement("div");
      controls.className = "quote-item__controls";
      const input = document.createElement("input");
      input.type = "number";
      input.min = item.unit === "m³" ? "0.001" : "1";
      input.step = item.unit === "m³" ? "0.001" : "1";
      input.value = String(item.quantity);
      input.setAttribute("aria-label", `Cantidad de ${item.name}`);
      input.dataset.quoteQuantity = item.id;
      controls.append(input, button("Quitar", "quote-remove", "removeQuote", item.id));
      row.append(text, controls);
      container.append(row);
    });
  }

  function addCalculation(form) {
    const card = form.closest("[data-calculator]");
    const product = getProduct(card?.dataset.calculator);
    const calculation = form._calculation;
    if (!product || !calculation) return;

    if (product.calculator === "wood") {
      addQuote({
        id: `wood-${calculation.dimensions}`,
        name: "Maderas",
        detail: `${calculation.dimensions} · ${calculation.quantity} pieza${calculation.quantity === 1 ? "" : "s"}`,
        quantity: Number(calculation.total.toFixed(4)),
        unit: "m³"
      });
    } else if (product.calculator === "solar") {
      addQuote({
        id: `solar-${calculation.w}W-${calculation.c}kWh`,
        name: "Paneles solares",
        detail: `Paneles de ${calculation.w}W (${cleanNumber(calculation.kwp, 1)} kWp · ~${calculation.roof} m² techo · consumo ${calculation.c} kWh/mes)`,
        quantity: calculation.panels,
        unit: "paneles"
      });
    } else {
      addQuote({
        id: `${product.id}-${calculation.board.label}`,
        name: product.name,
        detail: `${calculation.board.label} · superficie ${cleanNumber(calculation.surface)} m²`,
        quantity: calculation.recommended,
        unit: "placas"
      });
    }

    const panel = $("#presupuesto");
    panel?.scrollIntoView({ behavior: reduceMotion() ? "auto" : "smooth", block: "center" });
  }

  function consultCalculationWhatsApp(form) {
    const card = form.closest("[data-calculator]");
    const product = getProduct(card?.dataset.calculator);
    const calculation = form._calculation;
    if (!product || !calculation) return;

    let msg = "";
    if (product.calculator === "wood") {
      msg = `Hola Aserradero Don Santiago, calculé madera (${calculation.dimensions}, ${calculation.quantity} pieza${calculation.quantity === 1 ? "" : "s"}) por un volumen total de ${cleanNumber(calculation.total, 4)} m³. Quisiera consultar disponibilidad y presupuesto.`;
    } else if (product.calculator === "solar") {
      msg = `Hola Aserradero Don Santiago, calculé mi sistema de Paneles Solares para un consumo de ${calculation.c} kWh/mes (${calculation.h.toFixed(1)} hs pico solar): ${calculation.panels} paneles de ${calculation.w}W (${cleanNumber(calculation.kwp, 1)} kWp, ~${calculation.roof} m² de techo). Quisiera asesoramiento y presupuesto.`;
    } else {
      msg = `Hola Aserradero Don Santiago, calculé ${calculation.recommended} placas de ${product.name} (${calculation.board.label}) para cubrir ${cleanNumber(calculation.surface)} m². Quisiera consultar disponibilidad y presupuesto.`;
    }
    window.open(waUrl(msg), "_blank", "noopener");
  }

  function selectCalculator(id) {
    activeCalcTab = id;
    renderCalcTabs();
    $$("[data-calculator]").forEach((card) => {
      card.hidden = activeCalcTab !== "all" && card.dataset.calculator !== activeCalcTab;
    });
  }

  function setupInteractions() {
    document.addEventListener("click", (event) => {
      const target = event.target.closest("button");
      if (!target) return;

      if (target.dataset.filterCatalog) {
        activeCatalogFilter = target.dataset.filterCatalog;
        renderCatalogFilters();
        renderCatalog();
      }

      if (target.dataset.selectCalcTab) {
        selectCalculator(target.dataset.selectCalcTab);
      }

      if (target.dataset.openProduct) {
        openProduct(target.dataset.openProduct);
      }

      if (target.dataset.consultProduct) {
        const product = getProduct(target.dataset.consultProduct);
        if (product) {
          window.open(
            waUrl(`Hola Aserradero Don Santiago, quisiera consultar disponibilidad y presupuesto de ${product.name}.`),
            "_blank",
            "noopener"
          );
        }
      }

      if (target.dataset.consultVariant) {
        window.open(
          waUrl(`Hola Aserradero Don Santiago, quisiera cotizar ${target.dataset.consultVariant}.`),
          "_blank",
          "noopener"
        );
      }

      if (target.dataset.addVariant) {
        const [prodId, varName, varPres] = target.dataset.addVariant.split("|");
        addQuote({
          id: `${prodId}-${varName}`,
          name: `Clavos — ${varName}`,
          detail: `Presentación: ${varPres}`,
          quantity: 1,
          unit: "unidad/caja"
        });
        $("[data-product-dialog]")?.close();
        $("#presupuesto")?.scrollIntoView({ behavior: reduceMotion() ? "auto" : "smooth", block: "center" });
      }

      if (target.dataset.addProduct) {
        const product = getProduct(target.dataset.addProduct);
        if (product) {
          addQuote({
            id: product.id,
            name: product.name,
            detail: `Categoría: ${product.use}`,
            quantity: 1,
            unit: "consulta"
          });
        }
        $("[data-product-dialog]")?.close();
        $("#presupuesto")?.scrollIntoView({ behavior: reduceMotion() ? "auto" : "smooth", block: "center" });
      }

      if (target.dataset.quickAdd !== undefined) {
        const select = $("[data-quick-select]");
        const val = select?.value;
        if (!val) return;
        if (val.includes("|")) {
          const [prodId, varName, varPres] = val.split("|");
          addQuote({
            id: `${prodId}-${varName}`,
            name: `Clavos — ${varName}`,
            detail: `Presentación: ${varPres}`,
            quantity: 1,
            unit: "unidad/caja"
          });
        } else {
          const product = getProduct(val);
          if (product) {
            addQuote({
              id: product.id,
              name: product.name,
              detail: `Categoría: ${product.use}`,
              quantity: 1,
              unit: "consulta"
            });
          }
        }
      }

      if (target.dataset.openCalculator) {
        const calcId = target.dataset.openCalculator;
        $("[data-product-dialog]")?.close();
        if (activeCalcTab !== "all" && activeCalcTab !== calcId) {
          selectCalculator(calcId);
        }
        const calculator = $(`[data-calculator="${calcId}"]`);
        calculator?.scrollIntoView({ behavior: reduceMotion() ? "auto" : "smooth", block: "center" });
        window.setTimeout(() => $("input, select", calculator)?.focus({ preventScroll: true }), 350);
      }

      if (target.dataset.addCalculation !== undefined) {
        addCalculation(target.closest("form"));
      }

      if (target.dataset.waCalculation !== undefined) {
        consultCalculationWhatsApp(target.closest("form"));
      }

      if (target.dataset.removeQuote) {
        const index = quote.findIndex((item) => item.id === target.dataset.removeQuote);
        if (index >= 0) quote.splice(index, 1);
        renderQuote();
      }
    });

    document.addEventListener("input", (event) => {
      const form = event.target.closest("[data-calc-form]");
      if (form) calculate(form);
      const quantity = event.target.closest("[data-quote-quantity]");
      if (quantity) {
        const item = quote.find((entry) => entry.id === quantity.dataset.quoteQuantity);
        const value = number(quantity.value);
        if (item && validPositive(value, 1000000)) {
          item.quantity = item.unit === "m³" ? value : Math.max(1, Math.round(value));
        }
      }
    });

    document.addEventListener("change", (event) => {
      const form = event.target.closest("[data-calc-form]");
      if (!form) return;
      if (event.target.name === "boardSize") {
        const custom = $("[data-board-custom]", form);
        if (custom) custom.hidden = event.target.value !== "custom";
      }
      calculate(form);
    });

    document.addEventListener("submit", (event) => {
      const form = event.target.closest("[data-calc-form]");
      if (!form) return;
      event.preventDefault();
      calculate(form, true);
    });

    $("[data-quote-form]")?.addEventListener("submit", (event) => {
      event.preventDefault();
      const form = event.currentTarget;
      const status = $("[data-quote-status]");
      if (!quote.length) {
        status.textContent = "Agregá al menos un material antes de enviar la solicitud.";
        return;
      }
      if (!form.checkValidity()) {
        status.textContent = "Completá nombre, teléfono y localidad para continuar.";
        form.reportValidity();
        return;
      }
      const data = new FormData(form);
      const items = quote
        .map(
          (item) =>
            `• ${item.name}: ${cleanNumber(item.quantity, item.unit === "m³" ? 3 : 0)} ${item.unit}${
              item.detail ? ` (${item.detail})` : ""
            }`
        )
        .join("\n");
      const comments = data.get("comments") ? `\n\nObservaciones:\n${data.get("comments")}` : "";
      const message = `Hola Aserradero Don Santiago, quisiera solicitar un presupuesto:\n\n${items}\n\nNombre: ${data.get("name")}\nTeléfono: ${data.get("phone")}\nLocalidad: ${data.get("locality")}${comments}`;
      window.open(waUrl(message), "_blank", "noopener");
      status.textContent = "Abrimos WhatsApp con el resumen de tu solicitud.";
    });
  }

  function setWhatsAppLinks() {
    $$('[data-whatsapp="general"]').forEach((link) => {
      link.href = waUrl("Hola Aserradero Don Santiago, quisiera consultar por los productos y servicios del aserradero.");
    });
  }

  function setupPwa() {
    if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
      window.addEventListener(
        "load",
        () => navigator.serviceWorker.register("sw.js").catch(() => {}),
        { once: true }
      );
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    setupLoading();
    setWhatsAppLinks();
    setupNavigation();
    setupReveal();
    setupHero();
    renderCatalogFilters();
    renderCatalog();
    renderCalcTabs();
    renderCalculators();
    setupQuickAdd();
    renderQuote();
    setupDialog();
    setupInteractions();
    setupPwa();
  });
})();
