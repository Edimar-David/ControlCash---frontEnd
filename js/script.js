const navbar = document.getElementById("navbar");
const mobileToggle = document.getElementById("mobileToggle");
const mobileMenu = document.getElementById("mobileMenu");

window.addEventListener("scroll", () => {
    if (window.scrollY > 20) {
        navbar.classList.add("scrolled");
    } else {
        navbar.classList.remove("scrolled");
    }
});

mobileToggle.addEventListener("click", () => {
    mobileMenu.classList.toggle("active");
});

const revealElements = document.querySelectorAll(".reveal");

const revealOnScroll = () => {
    revealElements.forEach((element) => {
        const elementTop = element.getBoundingClientRect().top;

        if (elementTop < window.innerHeight - 80) {
            element.classList.add("visible");
        }
    });
};

window.addEventListener("scroll", revealOnScroll);

revealOnScroll();