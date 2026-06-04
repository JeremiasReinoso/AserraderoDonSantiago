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

                // Agregar pequeño delay basado en dataset si existe
                const delay = entry.target.dataset.revealDelay || "0";
                setTimeout(() => {
                    entry.target.classList.add("is-visible");
                }, parseInt(delay) * 50);
                
                currentObserver.unobserve(entry.target);
            });
        },
        {
            threshold: 0.15,
            rootMargin: "0px 0px -10% 0px"
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
        let isAnimating = false;

        if (activeIndex === -1) {
            activeIndex = 0;
            slides[0].classList.add("active");
        }

        const showSlide = (nextIndex) => {
            if (isAnimating) return;
            isAnimating = true;
            
            slides[activeIndex].classList.remove("active");
            slides[nextIndex].classList.add("active");
            activeIndex = nextIndex;
            
            setTimeout(() => {
                isAnimating = false;
            }, 900);
        };

        const advanceSlide = () => {
            const nextIndex = (activeIndex + 1) % slides.length;
            showSlide(nextIndex);
        };

        const startSlider = () => {
            if (reduceMotion.matches || intervalId !== null) {
                return;
            }

            intervalId = window.setInterval(advanceSlide, 4000);
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

function setupTimelineAnimation() {
    const timelineItems = document.querySelectorAll(".timeline-item");
    if (!timelineItems.length) return;

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        entry.target.classList.add("is-visible");
                    }, index * 150);
                    observer.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.2, rootMargin: "0px 0px -10% 0px" }
    );

    timelineItems.forEach(item => observer.observe(item));
}

// Slider de fondo del HERO (imagenes estables)
function setupHeroSlider() {
    const hero = document.querySelector(".hero");

    if (!hero) {
        return;
    }

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const images = [
        "https://images.unsplash.com/photo-1597007030739-6d2e1b0f1c4a",
        "img/Viviendas Modulares/Obra Modular 3.jpeg",
        "img/Viviendas Modulares/Obra Modular 4.jpeg",
        "https://images.unsplash.com/photo-1568605114967-8130f3a36994",
        "https://images.unsplash.com/photo-1503387762-592deb58ef4e",
        "https://images.unsplash.com/photo-1449844908441-8829872d2607",
        "https://images.unsplash.com/photo-1502005097973-6a7082348e28"
    ];

    const layers = Array.from(hero.querySelectorAll(".hero-bg"));

    if (layers.length < 2) {
        return;
    }

    let activeLayer = 0;
    let activeIndex = -1;
    const failedImages = new Set();
    const preloadTimeoutMs = 9000;

    const preloadImage = (src) =>
        new Promise((resolve, reject) => {
            const img = new Image();
            let settled = false;
            const timer = window.setTimeout(() => {
                if (settled) {
                    return;
                }
                settled = true;
                reject(new Error("timeout"));
            }, preloadTimeoutMs);

            img.onload = () => {
                if (settled) {
                    return;
                }
                settled = true;
                window.clearTimeout(timer);
                resolve(src);
            };

            img.onerror = () => {
                if (settled) {
                    return;
                }
                settled = true;
                window.clearTimeout(timer);
                reject(new Error("error"));
            };

            img.decoding = "async";
            img.src = src;
        });

    const findNextIndex = (fromIndex) => {
        for (let step = 1; step <= images.length; step += 1) {
            const candidateIndex = (fromIndex + step) % images.length;
            const candidate = images[candidateIndex];
            if (!failedImages.has(candidate)) {
                return candidateIndex;
            }
        }

        return -1;
    };

    const swapToIndex = (nextIndex) => {
        if (nextIndex === -1 || nextIndex === activeIndex) {
            return;
        }

        const nextSrc = images[nextIndex];
        const nextLayer = layers[1 - activeLayer];

        preloadImage(nextSrc)
            .then(() => {
                nextLayer.style.backgroundImage = `url('${nextSrc}')`;
                nextLayer.classList.add("is-active");

                window.requestAnimationFrame(() => {
                    layers[activeLayer].classList.remove("is-active");
                    activeLayer = 1 - activeLayer;
                    activeIndex = nextIndex;
                });
            })
            .catch(() => {
                failedImages.add(nextSrc);
                const fallbackIndex = findNextIndex(nextIndex);
                if (fallbackIndex !== -1 && fallbackIndex !== nextIndex) {
                    swapToIndex(fallbackIndex);
                }
            });
    };

    const loadInitial = () => {
        const startIndex = findNextIndex(-1);
        if (startIndex === -1) {
            return;
        }

        const startSrc = images[startIndex];

        preloadImage(startSrc)
            .then(() => {
                layers[activeLayer].style.backgroundImage = `url('${startSrc}')`;
                layers[activeLayer].classList.add("is-active");
                activeIndex = startIndex;

                if (reduceMotion.matches || images.length <= 1) {
                    return;
                }

                window.setInterval(() => {
                    const nextIndex = findNextIndex(activeIndex);
                    swapToIndex(nextIndex);
                }, 4000);
            })
            .catch(() => {
                failedImages.add(startSrc);
                loadInitial();
            });
    };

    loadInitial();
}

document.addEventListener("DOMContentLoaded", () => {
    setupDynamicFurnitureGallery();
    updateHeaderState();
    setupRevealAnimations();
    setupMobileNav();
    setupAnchorOffset();
    setupGallerySliders();
    setupHeroSlider();
    setupTimelineAnimation();
    setupParallaxEffects();
    setupSmoothScroll();
    setupButtonEffects();
    setupHeroBackgroundSlider();
    setupGalleryHoverEffects();
    setupModelCardEffects();
    setupParallaxBackground();
    setupScrollAnimations();

    window.addEventListener("scroll", updateHeaderState, { passive: true });
});

// Nueva función para efectos parallax suave en scroll
function setupParallaxEffects() {
    const parallaxElements = document.querySelectorAll("[data-parallax]");
    
    if (parallaxElements.length === 0) return;
    
    window.addEventListener("scroll", () => {
        parallaxElements.forEach((element) => {
            const rect = element.getBoundingClientRect();
            const speed = element.dataset.parallax || "0.5";
            const yPos = -(rect.top * speed);
            element.style.transform = `translateY(${yPos}px)`;
        });
    }, { passive: true });
}

// Nueva función para scroll suave mejorado
function setupSmoothScroll() {
    const links = document.querySelectorAll('a[href*="#"]');
    
    links.forEach(link => {
        link.addEventListener("click", function(e) {
            const href = this.getAttribute("href");
            if (href === "#" || href.startsWith("http")) return;
            
            const target = document.querySelector(href);
            if (!target) return;
            
            e.preventDefault();
            
            target.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        });
    });
}

// Nueva función para efectos en botones
function setupButtonEffects() {
    const buttons = document.querySelectorAll(".button");
    
    buttons.forEach(button => {
        button.addEventListener("mouseenter", function() {
            this.style.setProperty("--pulse-scale", "1.08");
        });
        
        button.addEventListener("mouseleave", function() {
            this.style.setProperty("--pulse-scale", "1");
        });
    });
}

function setupHeroBackgroundSlider() {
    const heroSection = document.querySelector(".hero-section");
    if (!heroSection) return;

    const slides = heroSection.querySelectorAll(".hero-slide");
    if (slides.length <= 1) return;

    let activeIndex = 0;
    let intervalId = null;

    function showSlide(index) {
        slides[activeIndex].classList.remove("active");
        slides[index].classList.add("active");
        activeIndex = index;
    }

    function nextSlide() {
        const nextIndex = (activeIndex + 1) % slides.length;
        showSlide(nextIndex);
    }

    intervalId = setInterval(nextSlide, 5000);

    slides.forEach(slide => {
        slide.addEventListener("mouseenter", () => {
            if (intervalId) {
                clearInterval(intervalId);
                intervalId = null;
            }
        });
        
        slide.addEventListener("mouseleave", () => {
            intervalId = setInterval(nextSlide, 5000);
        });
    });
}

function setupGalleryHoverEffects() {
    const galleryCards = document.querySelectorAll(".gallery-card");
    
    galleryCards.forEach(card => {
        card.addEventListener("mouseenter", function() {
            this.style.setProperty("--gallery-scale", "1.02");
        });
        
        card.addEventListener("mouseleave", function() {
            this.style.setProperty("--gallery-scale", "1");
        });
    });
}

function setupModelCardEffects() {
    const modelCards = document.querySelectorAll(".model-card");
    
    modelCards.forEach(card => {
        card.addEventListener("mouseenter", function() {
            const img = this.querySelector("img");
            if (img) img.style.transform = "scale(1.1) rotate(1deg)";
        });
        
        card.addEventListener("mouseleave", function() {
            const img = this.querySelector("img");
            if (img) img.style.transform = "scale(1.08)";
        });
    });
}

function setupParallaxBackground() {
    const hero = document.querySelector(".hero-section");
    if (!hero) return;

    window.addEventListener("scroll", () => {
        const scrolled = window.scrollY;
        const parallax = hero.querySelector(".hero-bg");
        if (parallax) {
            parallax.style.transform = `translateY(${scrolled * 0.3}px)`;
        }
    }, { passive: true });
}

function setupScrollAnimations() {
    const animatedElements = document.querySelectorAll(".fade-in, .scale-in");
    if (!animatedElements.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("is-visible");
            }
        });
    }, { threshold: 0.15, rootMargin: "0px 0px -10% 0px" });

    animatedElements.forEach(el => observer.observe(el));
}
