// === Navbar: efecto al hacer scroll ===
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
    if (window.scrollY > 60) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
}, { passive: true });

// === Animaciones de entrada con Intersection Observer ===
const elementosAnimar = document.querySelectorAll('.card, .card-precio, .galeria-item, .card-servicio');

const observador = new IntersectionObserver((entradas) => {
    entradas.forEach(entrada => {
        if (entrada.isIntersecting) {
            entrada.target.classList.add('visible');
            observador.unobserve(entrada.target);
        }
    });
}, {
    threshold: 0.1
});

elementosAnimar.forEach(elemento => {
    observador.observe(elemento);
});
