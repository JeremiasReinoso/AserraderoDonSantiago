const headerShell = document.querySelector("[data-header-shell]");
const revealElements = document.querySelectorAll(".reveal");

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

updateHeaderState();
setupRevealAnimations();
setupAnchorOffset();
setupGallerySliders();

window.addEventListener("scroll", updateHeaderState, { passive: true });
