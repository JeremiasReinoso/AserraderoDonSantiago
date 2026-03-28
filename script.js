const headerShell = document.querySelector("[data-header-shell]");
const navToggle = document.querySelector("[data-nav-toggle]");
const mobileNav = document.querySelector("[data-mobile-nav]");
const revealElements = document.querySelectorAll(".reveal");

function shuffleArray(items) {
    const clonedItems = [...items];

    for (let index = clonedItems.length - 1; index > 0; index -= 1) {
        const randomIndex = Math.floor(Math.random() * (index + 1));
        [clonedItems[index], clonedItems[randomIndex]] = [clonedItems[randomIndex], clonedItems[index]];
    }

    return clonedItems;
}

function setupDynamicFurnitureGallery() {
    const furnitureSlider = document.querySelector('[data-dynamic-gallery="muebles"]');

    if (!furnitureSlider) {
        return;
    }

    const fallbackImages = [
        {
            src: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
            alt: "Mesa de comedor de madera rustica"
        },
        {
            src: "https://images.unsplash.com/photo-1505409628601-edc9af17fda6?auto=format&fit=crop&w=1200&q=80",
            alt: "Sillas y muebles de madera en interior calido"
        },
        {
            src: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80",
            alt: "Mesa de madera maciza en ambiente moderno"
        },
        {
            src: "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80",
            alt: "Mesada de cocina con muebles de madera"
        },
        {
            src: "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80",
            alt: "Muebles de madera rustica en living"
        }
    ];

    const rawKeywords = furnitureSlider.dataset.keywords || "";
    const searchKeywords = rawKeywords
        .split(",")
        .map((keyword) => keyword.trim())
        .filter(Boolean);

    const selectedFallbacks = shuffleArray(fallbackImages).slice(0, 5);

    const dynamicSources = selectedFallbacks.map((image, index) => {
        const keyword = searchKeywords[index % searchKeywords.length] || "wood furniture";
        return {
            src: `https://source.unsplash.com/featured/1200x900/?${encodeURIComponent(keyword)}&sig=${index + 1}`,
            fallbackSrc: image.src,
            alt: image.alt
        };
    });

    furnitureSlider.innerHTML = "";

    dynamicSources.forEach((image, index) => {
        const img = document.createElement("img");
        img.className = `slide${index === 0 ? " active" : ""}`;
        img.src = image.src;
        img.alt = image.alt;
        img.loading = "lazy";
        img.referrerPolicy = "no-referrer";
        img.dataset.fallbackSrc = image.fallbackSrc;
        img.addEventListener("error", () => {
            if (img.src !== image.fallbackSrc) {
                img.src = image.fallbackSrc;
            }
        });
        furnitureSlider.appendChild(img);
    });
}

function updateHeaderState() {
    if (!headerShell) {
        return;
    }

    headerShell.classList.toggle("is-scrolled", window.scrollY > 24);
}

function setupRevealAnimations() {
    if (!("IntersectionObserver" in window)) {
        revealElements.forEach((element) => element.classList.add("is-visible"));
        return;
    }

    const observer = new IntersectionObserver(
        (entries, currentObserver) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) {
                    return;
                }

                entry.target.classList.add("is-visible");
                currentObserver.unobserve(entry.target);
            });
        },
        {
            threshold: 0.2,
            rootMargin: "0px 0px -5% 0px"
        }
    );

    revealElements.forEach((element) => observer.observe(element));
}

// Menu mobile: abrir/cerrar y accesibilidad
function setupMobileNav() {
    if (!headerShell || !navToggle || !mobileNav) {
        return;
    }

    const setExpanded = (isOpen) => {
        headerShell.classList.toggle("is-open", isOpen);
        navToggle.setAttribute("aria-expanded", String(isOpen));
        navToggle.setAttribute("aria-label", isOpen ? "Cerrar menu" : "Abrir menu");
    };

    const toggleMenu = () => {
        const isOpen = headerShell.classList.contains("is-open");
        setExpanded(!isOpen);
    };

    navToggle.addEventListener("click", toggleMenu);

    mobileNav.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", () => setExpanded(false));
    });

    window.addEventListener("resize", () => {
        if (window.innerWidth >= 768) {
            setExpanded(false);
        }
    });
}

function setupAnchorOffset() {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        anchor.addEventListener("click", (event) => {
            const targetId = anchor.getAttribute("href");
            if (!targetId || targetId === "#") {
                return;
            }

            const target = document.querySelector(targetId);
            if (!target) {
                return;
            }

            event.preventDefault();
            const offset = 110;
            const top = target.getBoundingClientRect().top + window.scrollY - offset;

            window.scrollTo({
                top,
                behavior: reduceMotion.matches ? "auto" : "smooth"
            });
        });
    });
}

function setupGallerySliders() {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sliderElements = document.querySelectorAll("[data-slider]");

    sliderElements.forEach((slider) => {
        const slides = Array.from(slider.querySelectorAll(".slide"));

        if (slides.length <= 1) {
            return;
        }

        let activeIndex = slides.findIndex((slide) => slide.classList.contains("active"));
        let intervalId = null;

        if (activeIndex === -1) {
            activeIndex = 0;
            slides[0].classList.add("active");
        }

        const showSlide = (nextIndex) => {
            slides[activeIndex].classList.remove("active");
            slides[nextIndex].classList.add("active");
            activeIndex = nextIndex;
        };

        const advanceSlide = () => {
            const nextIndex = (activeIndex + 1) % slides.length;
            showSlide(nextIndex);
        };

        const startSlider = () => {
            if (reduceMotion.matches || intervalId !== null) {
                return;
            }

            intervalId = window.setInterval(advanceSlide, 3000);
        };

        const stopSlider = () => {
            if (intervalId === null) {
                return;
            }

            window.clearInterval(intervalId);
            intervalId = null;
        };

        slider.addEventListener("mouseenter", stopSlider);
        slider.addEventListener("mouseleave", startSlider);

        startSlider();
    });
}

// Slider de fondo del HERO
function setupHeroSlider() {
    const heroSlider = document.querySelector("[data-hero-slider]");

    if (!heroSlider) {
        return;
    }

    const slides = Array.from(heroSlider.querySelectorAll(".hero-slide"));
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    if (slides.length <= 1 || reduceMotion.matches) {
        slides.forEach((slide, index) => slide.classList.toggle("is-active", index === 0));
        return;
    }

    let activeIndex = slides.findIndex((slide) => slide.classList.contains("is-active"));
    if (activeIndex === -1) {
        activeIndex = 0;
        slides[0].classList.add("is-active");
    }

    window.setInterval(() => {
        slides[activeIndex].classList.remove("is-active");
        activeIndex = (activeIndex + 1) % slides.length;
        slides[activeIndex].classList.add("is-active");
    }, 4500);
}

setupDynamicFurnitureGallery();
updateHeaderState();
setupRevealAnimations();
setupMobileNav();
setupAnchorOffset();
setupGallerySliders();
setupHeroSlider();

window.addEventListener("scroll", updateHeaderState, { passive: true });
