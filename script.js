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

updateHeaderState();
setupRevealAnimations();
setupAnchorOffset();

window.addEventListener("scroll", updateHeaderState, { passive: true });
