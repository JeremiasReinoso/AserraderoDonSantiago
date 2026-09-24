(() => {
    "use strict";
    const config = window.ASERRADERO_CONFIG || { whatsapp: "", products: [] };
    const products = config.products;
    const quote = [];
    const $ = (selector, scope = document) => scope.querySelector(selector);
    const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
    const waUrl = (message) => "https://wa.me/" + config.whatsapp + "?text=" + encodeURIComponent(message);
    const getProduct = (id) => products.find((product) => product.id === id);

    function setWhatsAppLinks() {
        $$("[data-whatsapp='general']").forEach((link) => { link.href = waUrl("Hola, quisiera consultar por los productos del aserradero."); });
    }

    function setupLoading() {
        const loading = $("#loading-screen");
        if (!loading) return;
        window.addEventListener("load", () => window.setTimeout(() => {
            loading.classList.add("hidden");
            window.setTimeout(() => loading.remove(), 450);
        }, 450), { once: true });
    }

    function setupNavigation() {
        const shell = $("[data-header-shell]");
        const toggle = $("[data-nav-toggle]");
        const menu = $("[data-mobile-nav]");
        const setOpen = (open) => {
            if (!shell || !toggle) return;
            shell.classList.toggle("is-open", open);
            toggle.setAttribute("aria-expanded", String(open));
            toggle.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
        };
        toggle?.addEventListener("click", () => setOpen(!shell.classList.contains("is-open")));
        $$("a", menu).forEach((link) => link.addEventListener("click", () => setOpen(false)));
        document.addEventListener("keydown", (event) => { if (event.key === "Escape") setOpen(false); });
        window.addEventListener("resize", () => { if (window.innerWidth >= 768) setOpen(false); });
        const update = () => shell?.classList.toggle("is-scrolled", window.scrollY > 18);
        update();
        window.addEventListener("scroll", update, { passive: true });
        $$('a[href^="#"]').forEach((link) => link.addEventListener("click", (event) => {
            const target = $(link.getAttribute("href"));
            if (!target) return;
            event.preventDefault();
            window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - 98, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
        }));
    }

    function setupReveal() {
        const elements = $$(".reveal");
        if (!("IntersectionObserver" in window) || matchMedia("(prefers-reduced-motion: reduce)").matches) {
            elements.forEach((element) => element.classList.add("is-visible"));
            return;
        }
        const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            const delay = Number.parseFloat(entry.target.style.getPropertyValue("--reveal-delay")) || 0;
            window.setTimeout(() => entry.target.classList.add("is-visible"), delay * 1000);
            observer.unobserve(entry.target);
        }), { threshold: .12, rootMargin: "0px 0px -5% 0px" });
        elements.forEach((element) => observer.observe(element));
    }

    function setupHero() {
        const layers = $$(".hero-bg");
        const images = ["img/Viviendas Modulares/Obra Modular 3.jpeg", "img/Paneles/Imagen Panel 1.jpeg", "img/Estructura de madera/Estructura de madera 1.jpg"];
        if (layers.length < 2) return;
        let imageIndex = 0;
        let active = 0;
        layers[0].style.backgroundImage = 'url("' + images[0] + '")';
        if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        window.setInterval(() => {
            imageIndex = (imageIndex + 1) % images.length;
            const next = layers[1 - active];
            next.style.backgroundImage = 'url("' + images[imageIndex] + '")';
            next.classList.add("is-active");
            layers[active].classList.remove("is-active");
            active = 1 - active;
        }, 6000);
    }

    function fillSelect(select, values) {
        if (!select) return;
        [...new Set(values)].sort((a, b) => a.localeCompare(b, "es")).forEach((value) => {
            const option = document.createElement("option");
            option.value = value;
            option.textContent = value;
            select.append(option);
        });
    }

    function button(label, className, key, id) {
        const element = document.createElement("button");
        element.type = "button";
        element.className = className;
        element.dataset[key] = id;
        element.textContent = label;
        return element;
    }

    function renderCatalog() {
        const catalog = $("[data-catalog]");
        if (!catalog) return;
        const filters = Object.fromEntries($$("[data-catalog-filter]").map((input) => [input.dataset.catalogFilter, input.value]));
        const visible = products.filter((product) => Object.entries(filters).every(([key, value]) => !value || product[key] === value));
        catalog.replaceChildren();
        visible.forEach((product) => {
            const card = document.createElement("article");
            card.className = "catalog-card";
            const image = document.createElement("img");
            image.src = product.image; image.alt = product.name; image.loading = "lazy";
            const body = document.createElement("div");
            body.className = "catalog-card__body";
            const title = document.createElement("h3"); title.textContent = product.name;
            const description = document.createElement("p"); description.textContent = product.description;
            const meta = document.createElement("p"); meta.className = "catalog-meta"; meta.textContent = product.category + " · " + product.use;
            const availability = document.createElement("p"); availability.className = "catalog-availability"; availability.textContent = "Disponibilidad: " + product.availability;
            const actions = document.createElement("div"); actions.className = "catalog-card__actions";
            actions.append(button("Ver detalle", "button button-secondary button--small", "openProduct", product.id), button("Agregar", "button button-primary button--small", "addProduct", product.id));
            body.append(title, description, meta, availability, actions); card.append(image, body); catalog.append(card);
        });
        $("[data-catalog-count]").textContent = visible.length === 1 ? "1 producto encontrado" : visible.length + " productos encontrados";
        $("[data-catalog-empty]").hidden = visible.length > 0;
    }

    function setupCatalog() {
        fillSelect($("#filter-category"), products.map((product) => product.category));
        fillSelect($("#filter-type"), products.map((product) => product.type));
        fillSelect($("#filter-use"), products.map((product) => product.use));
        $$("[data-catalog-filter]").forEach((input) => input.addEventListener("change", renderCatalog));
        $("[data-catalog-reset]")?.addEventListener("click", () => { $$("[data-catalog-filter]").forEach((input) => { input.value = ""; }); renderCatalog(); });
        document.addEventListener("click", (event) => {
            const detail = event.target.closest("[data-open-product]");
            const add = event.target.closest("[data-add-product]");
            if (detail) openProduct(detail.dataset.openProduct);
            if (add) addProduct(add.dataset.addProduct);
        });
        renderCatalog();
    }

    function renderQuote() {
        const container = $("[data-quote-items]");
        if (!container) return;
        container.replaceChildren();
        if (!quote.length) {
            const empty = document.createElement("p");
            empty.className = "quote-empty"; empty.textContent = "Todavía no agregaste productos. Podés hacerlo desde el catálogo.";
            container.append(empty); return;
        }
        quote.forEach((item) => {
            const row = document.createElement("div"); row.className = "quote-item";
            const name = document.createElement("strong"); name.textContent = item.name;
            const controls = document.createElement("div"); controls.className = "quote-item__controls";
            const label = document.createElement("label"); label.className = "sr-only"; label.htmlFor = "quantity-" + item.id; label.textContent = "Cantidad de " + item.name;
            const input = document.createElement("input"); input.id = "quantity-" + item.id; input.type = "number"; input.min = "1"; input.step = "1"; input.value = item.quantity; input.dataset.quoteQuantity = item.id;
            controls.append(label, input, button("Quitar", "quote-remove", "removeQuote", item.id)); row.append(name, controls); container.append(row);
        });
    }

    function addProduct(id) {
        const product = getProduct(id);
        if (!product) return;
        const existing = quote.find((item) => item.id === id);
        if (existing) existing.quantity += 1;
        else quote.push({ id: product.id, name: product.name, quantity: 1 });
        renderQuote();
        $("#presupuesto")?.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
    }

    function setupQuote() {
        document.addEventListener("input", (event) => {
            const input = event.target.closest("[data-quote-quantity]");
            if (!input) return;
            const item = quote.find((entry) => entry.id === input.dataset.quoteQuantity);
            if (item) item.quantity = Math.max(1, Number.parseInt(input.value, 10) || 1);
        });
        document.addEventListener("click", (event) => {
            const remove = event.target.closest("[data-remove-quote]");
            if (!remove) return;
            const index = quote.findIndex((item) => item.id === remove.dataset.removeQuote);
            if (index >= 0) quote.splice(index, 1);
            renderQuote();
        });
        $("[data-quote-form]")?.addEventListener("submit", (event) => {
            event.preventDefault();
            const form = event.currentTarget;
            const status = $("[data-quote-status]");
            if (!quote.length) { status.textContent = "Agregá al menos un producto antes de enviar la solicitud."; return; }
            if (!form.checkValidity()) { status.textContent = "Completá los campos requeridos para continuar."; form.reportValidity(); return; }
            const data = new FormData(form);
            const items = quote.map((item) => "• " + item.name + " x " + item.quantity).join("\n");
            const optional = [data.get("email") ? "Email: " + data.get("email") : "", data.get("comments") ? "Comentarios: " + data.get("comments") : ""].filter(Boolean).join("\n");
            const message = "Hola, quisiera solicitar un presupuesto por:\n\n" + items + "\n\nNombre: " + data.get("name") + "\nTeléfono: " + data.get("phone") + "\nLocalidad: " + data.get("locality") + (optional ? "\n" + optional : "");
            window.open(waUrl(message), "_blank", "noopener");
            status.textContent = "Abrimos WhatsApp con el resumen de tu solicitud.";
        });
    }

    function openProduct(id) {
        const product = getProduct(id);
        const dialog = $("[data-product-dialog]");
        const detail = $("[data-product-detail]");
        if (!product || !dialog || !detail) return;
        detail.replaceChildren();
        const image = document.createElement("img"); image.className = "product-dialog__image"; image.src = product.image; image.alt = product.name;
        const content = document.createElement("div"); content.className = "product-dialog__content";
        const eyebrow = document.createElement("p"); eyebrow.className = "section-eyebrow"; eyebrow.textContent = product.category;
        const title = document.createElement("h2"); title.id = "dialog-title"; title.textContent = product.name;
        const description = document.createElement("p"); description.textContent = product.description;
        const featureTitle = document.createElement("h3"); featureTitle.textContent = "Características";
        const list = document.createElement("ul"); product.features.forEach((feature) => { const item = document.createElement("li"); item.textContent = feature; list.append(item); });
        const availability = document.createElement("p"); availability.className = "detail-availability"; availability.textContent = "Disponibilidad: " + product.availability;
        const note = document.createElement("p"); note.className = "detail-note"; note.textContent = "Consultá las medidas disponibles y la información específica del producto.";
        const actions = document.createElement("div"); actions.className = "dialog-actions";
        const add = button("Agregar al presupuesto", "button button-secondary", "addProduct", product.id);
        add.addEventListener("click", () => dialog.close());
        const whatsapp = document.createElement("a"); whatsapp.className = "button button-primary"; whatsapp.href = waUrl("Hola, quisiera consultar por " + product.name + "."); whatsapp.target = "_blank"; whatsapp.rel = "noopener noreferrer"; whatsapp.textContent = "Consultar por WhatsApp";
        const page = document.createElement("a"); page.className = "text-action"; page.href = product.detailUrl; page.textContent = "Ver página del producto";
        actions.append(add, whatsapp, page); content.append(eyebrow, title, description, featureTitle, list, availability, note, actions); detail.append(image, content);
        if (typeof dialog.showModal === "function") dialog.showModal(); else dialog.setAttribute("open", "");
    }

    function setupDialog() {
        const dialog = $("[data-product-dialog]");
        $("[data-dialog-close]")?.addEventListener("click", () => dialog?.close());
        dialog?.addEventListener("click", (event) => { if (event.target === dialog) dialog.close(); });
    }

    function setupTools() {
        const select = $("[data-cut-products]");
        if (select) {
            const placeholder = document.createElement("option"); placeholder.value = ""; placeholder.textContent = "Seleccioná un producto"; placeholder.disabled = true; placeholder.selected = true; select.append(placeholder);
            products.forEach((product) => { const option = document.createElement("option"); option.value = product.name; option.textContent = product.name; select.append(option); });
        }
        let calculation;
        $("[data-calculator-form]")?.addEventListener("submit", (event) => {
            event.preventDefault(); const form = event.currentTarget; if (!form.checkValidity()) return form.reportValidity();
            const values = Object.fromEntries(new FormData(form));
            const perPiece = (Number(values.length) * Number(values.width) * Number(values.thickness)) / 1000000000;
            calculation = { length: values.length, width: values.width, thickness: values.thickness, quantity: Number(values.quantity) };
            const result = $("[data-calculator-result]"); result.hidden = false;
            result.replaceChildren();
            const title = document.createElement("strong"); title.textContent = "Resultado aproximado";
            const piece = document.createElement("span"); piece.textContent = "Por pieza: " + perPiece.toFixed(4) + " m³";
            const total = document.createElement("span"); total.textContent = "Total: " + (perPiece * calculation.quantity).toFixed(4) + " m³";
            result.append(title, piece, total); $("[data-add-calculation]").hidden = false;
        });
        $("[data-add-calculation]")?.addEventListener("click", () => {
            if (!calculation) return;
            quote.push({ id: "corte-" + Date.now(), name: "Madera a medida (" + calculation.length + " × " + calculation.width + " × " + calculation.thickness + " mm)", quantity: calculation.quantity });
            renderQuote(); $("#presupuesto")?.scrollIntoView({ behavior: "smooth", block: "start" });
        });
        $("[data-cut-form]")?.addEventListener("submit", (event) => {
            event.preventDefault(); const form = event.currentTarget; if (!form.checkValidity()) return form.reportValidity();
            const data = Object.fromEntries(new FormData(form));
            const message = "Hola, quisiera solicitar un presupuesto por corte a medida:\n\nProducto: " + data.product + "\nLargo: " + data.length + " mm\nAncho: " + data.width + " mm\nEspesor: " + data.thickness + " mm\nCantidad: " + data.quantity + (data.notes ? "\nObservaciones: " + data.notes : "");
            window.open(waUrl(message), "_blank", "noopener");
        });
    }

    function setupPwa() {
        if ("serviceWorker" in navigator && location.protocol.startsWith("http")) window.addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(() => {}), { once: true });
    }

    document.addEventListener("DOMContentLoaded", () => {
        setupLoading(); setWhatsAppLinks(); setupNavigation(); setupReveal(); setupHero(); setupCatalog(); setupQuote(); setupDialog(); setupTools(); setupPwa();
    });
})();
