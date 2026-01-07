// ================================================
// MOBILE NAVIGATION
// ================================================
const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');

navToggle?.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    navToggle.classList.toggle('active');
});

// Close mobile menu when clicking a link
navLinks?.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('active');
        navToggle.classList.remove('active');
    });
});

// ================================================
// SCROLL REVEAL ANIMATION
// ================================================
const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
};

const revealOnScroll = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            revealOnScroll.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observe all cards and links
document.querySelectorAll('.project-card, .post-card, .contact-link').forEach(el => {
    revealOnScroll.observe(el);
});

// ================================================
// SMOOTH SCROLL FOR ANCHOR LINKS
// ================================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const headerOffset = 80;
            const elementPosition = target.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// ================================================
// NAVBAR BACKGROUND ON SCROLL
// ================================================
const nav = document.querySelector('.nav');
let lastScroll = 0;

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;

    if (currentScroll > 100) {
        nav.style.boxShadow = '0 1px 10px rgba(0, 0, 0, 0.05)';
    } else {
        nav.style.boxShadow = 'none';
    }

    lastScroll = currentScroll;
});

// ================================================
// ACTIVE NAV LINK HIGHLIGHT
// ================================================
const sections = document.querySelectorAll('section[id]');

const highlightNavLink = () => {
    const scrollY = window.pageYOffset;

    sections.forEach(section => {
        const sectionHeight = section.offsetHeight;
        const sectionTop = section.offsetTop - 100;
        const sectionId = section.getAttribute('id');
        const navLink = document.querySelector(`.nav-links a[href="#${sectionId}"]`);

        if (navLink) {
            if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                navLink.classList.add('active');
            } else {
                navLink.classList.remove('active');
            }
        }
    });
};

window.addEventListener('scroll', highlightNavLink);

// ================================================
// ANIMATE HERO SHAPE ON MOUSE MOVE
// ================================================
const heroShape = document.querySelector('.hero-shape');

if (heroShape) {
    document.addEventListener('mousemove', (e) => {
        const { clientX, clientY } = e;
        const { innerWidth, innerHeight } = window;

        const xPercent = (clientX / innerWidth - 0.5) * 20;
        const yPercent = (clientY / innerHeight - 0.5) * 20;

        heroShape.style.transform = `translate(calc(-50% + ${xPercent}px), calc(-50% + ${yPercent}px))`;
    });
}

// ================================================
// CONSOLE EASTER EGG
// ================================================
console.log('%c👋 Cześć!', 'font-size: 24px; font-weight: bold;');
console.log('%cSzukasz czegoś w kodzie? Napisz do mnie!', 'font-size: 14px; color: #10b981;');
