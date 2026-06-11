// ================================================
// THEME TOGGLE (DARK/LIGHT MODE)
// ================================================
const ThemeManager = {
    toggle: document.getElementById('themeToggle'),

    init() {
        // Theme is set pre-paint by an inline <head> script (defaults to dark,
        // honours a saved choice). Here we just sync the toggle.
        this.toggle?.setAttribute('aria-pressed', String(document.documentElement.getAttribute('data-theme') === 'dark'));
        this.toggle?.addEventListener('click', () => this.toggleTheme());
    },

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        this.toggle?.setAttribute('aria-pressed', String(newTheme === 'dark'));

        // Add transition effect
        document.body.style.transition = 'background 0.3s ease, color 0.3s ease';
        setTimeout(() => {
            document.body.style.transition = '';
        }, 300);
    }
};

ThemeManager.init();

// ================================================
// LANGUAGE TOGGLE (PL/EN)
// ================================================
const LanguageManager = {
    toggle: document.getElementById('langToggle'),
    currentLang: 'pl',
    originals: new Map(),

    translations: [
        // [selector, englishText, isHTML]
        // Nav
        ['.skip-link', 'Skip to content'],
        ['.nav-links a[href="#projekty"]', 'Projects'],
        ['.nav-links a[href="#kontakt"]', 'Contact'],

        // Hero
        ['.greeting-text', "Hi, I'm"],
        ['.hero-subtitle', 'I work at the intersection of <span class="accent">artificial intelligence</span>, <span class="accent">data analysis</span>, <span class="accent">ICT</span>, <span class="accent">public policy</span>, <span class="accent">law</span> and <span class="accent">public administration</span>.', true],
        ['.hero-cta .btn-primary span', 'See projects'],
        ['.hero-cta .btn-secondary', 'Contact'],

        // Hero tabs
        ['.hero-tab[data-tab="employment"]', 'Experience'],
        ['.hero-tab[data-tab="education"]', 'Education'],
        ['.hero-tab[data-tab="skills"]', 'Skills'],

        // Employment
        ['#panel-employment li:nth-child(1) .emp-date', '2025\u2013present'],
        ['#panel-employment li:nth-child(1) .emp-title', 'Chief Specialist, Innovative Public Policies Division'],
        ['#panel-employment li:nth-child(1) .emp-company', 'Ministry of Digital Affairs'],
        ['#panel-employment li:nth-child(2) .emp-title', 'Head of CEEB Department'],
        ['#panel-employment li:nth-child(2) .emp-company', 'General Office of Building Supervision'],
        ['#panel-employment li:nth-child(3) .emp-title', 'Deputy Head of Service Development Team'],
        ['#panel-employment li:nth-child(3) .emp-company', 'Educational Research Institute'],
        ['#panel-employment li:nth-child(4) .emp-title', 'Senior Legal Specialist'],
        ['#panel-employment li:nth-child(4) .emp-company', 'Educational Research Institute'],
        ['#panel-employment li:nth-child(5) .emp-title', 'Senior Specialist, Portal RP Project'],
        ['#panel-employment li:nth-child(5) .emp-company', 'Ministry of Digital Affairs'],

        // Education
        ['#panel-education li:nth-child(1) .edu-title', 'Big Data: Large-Scale Data Engineering'],
        ['#panel-education li:nth-child(1) .edu-school', 'Polish-Japanese Academy of Information Technology'],
        ['#panel-education li:nth-child(2) .edu-title', 'Artificial Intelligence in Business and Public Sector'],
        ['#panel-education li:nth-child(2) .edu-school', 'SGH Warsaw School of Economics'],
        ['#panel-education li:nth-child(3) .edu-title', 'Python AI Developer'],
        ['#panel-education li:nth-child(3) .edu-school', 'Polish-Japanese Academy of Information Technology'],
        ['#panel-education li:nth-child(4) .edu-title', 'IT Systems, Applications and Databases'],
        ['#panel-education li:nth-child(4) .edu-school', 'Polish-Japanese Academy of Information Technology'],
        ['#panel-education li:nth-child(5) .edu-title', 'Law'],
        ['#panel-education li:nth-child(5) .edu-school', 'University of Warsaw'],

        // Skills bento Law/Certificates labels + Prawo chips translate via data-en attributes

        // Projects section
        ['#projekty .section-title', 'Projects'],


        // Contact section
        ['#kontakt .section-title', 'Contact'],
    ],

    // Assistive-tech attribute strings (aria-label) the textContent toggle can't reach.
    attrTranslations: [
        ['.showcase-prev', 'aria-label', 'Poprzedni projekt', 'Previous project'],
        ['.showcase-next', 'aria-label', 'Nast\u0119pny projekt', 'Next project'],
        ['.showcase-dots', 'aria-label', 'Wyb\u00f3r projektu', 'Choose project'],
        ['.showcase-carousel', 'aria-label', 'Projekty', 'Projects'],
    ],

    init() {
        this.translations.forEach(([selector, , isHTML]) => {
            document.querySelectorAll(selector).forEach((el, i) => {
                const key = selector + '__' + i;
                this.originals.set(key, isHTML ? el.innerHTML : el.textContent);
            });
        });

        // Attribute-based translations: [data-en] (text) / [data-en-html] (markup).
        // Cleaner than selector lists for large blocks like the project showcase.
        this.dataEls = Array.from(document.querySelectorAll('[data-en], [data-en-html]'));
        this.dataEls.forEach(el => {
            const isHTML = el.hasAttribute('data-en-html');
            this.originals.set(el, isHTML ? el.innerHTML : el.textContent);
        });

        const savedLang = localStorage.getItem('lang');
        if (savedLang === 'en') {
            this.setLanguage('en', false);
        }

        this.toggle?.addEventListener('click', () => this.toggleLanguage());
    },

    toggleLanguage() {
        this.setLanguage(this.currentLang === 'pl' ? 'en' : 'pl', true);
    },

    setLanguage(lang, save) {
        this.currentLang = lang;
        document.documentElement.lang = lang;

        this.attrTranslations.forEach(([sel, attr, pl, en]) => {
            document.querySelectorAll(sel).forEach(el => el.setAttribute(attr, lang === 'en' ? en : pl));
        });

        if (lang === 'en') {
            this.translations.forEach(([selector, enText, isHTML]) => {
                document.querySelectorAll(selector).forEach(el => {
                    if (isHTML) el.innerHTML = enText;
                    else el.textContent = enText;
                });
            });
            this.dataEls?.forEach(el => {
                if (el.hasAttribute('data-en-html')) el.innerHTML = el.getAttribute('data-en-html');
                else el.textContent = el.getAttribute('data-en');
            });
            document.title = 'Karol Polikarp Wilczy\u0144ski | AI, Law, Technology';
            document.querySelector('meta[name="description"]')?.setAttribute('content',
                'I work at the intersection of AI, ICT, law and public administration. Building tools for working with Polish law and automations.');
        } else {
            this.translations.forEach(([selector, , isHTML]) => {
                document.querySelectorAll(selector).forEach((el, i) => {
                    const key = selector + '__' + i;
                    const original = this.originals.get(key);
                    if (original !== undefined) {
                        if (isHTML) el.innerHTML = original;
                        else el.textContent = original;
                    }
                });
            });
            this.dataEls?.forEach(el => {
                const original = this.originals.get(el);
                if (original === undefined) return;
                if (el.hasAttribute('data-en-html')) el.innerHTML = original;
                else el.textContent = original;
            });
            document.title = 'Karol Polikarp Wilczy\u0144ski | AI, Prawo, Technologia';
            document.querySelector('meta[name="description"]')?.setAttribute('content',
                'Pracuj\u0119 na styku AI, ICT, prawa i administracji publicznej. Buduj\u0119 narz\u0119dzia do pracy z polskim prawem i automatyzacje.');
        }

        // Email display
        const emailDisplay = document.getElementById('emailDisplay');
        const emailLink = document.getElementById('emailLink');
        if (emailDisplay && (!emailLink || emailLink.dataset.revealed !== 'true')) {
            emailDisplay.textContent = lang === 'en' ? '[click]' : '[kliknij]';
        }

        this.updateToggle();
        document.dispatchEvent(new CustomEvent('languagechange', { detail: { lang: lang } }));
        if (save) localStorage.setItem('lang', lang);
    },

    updateToggle() {
        if (!this.toggle) return;
        if (this.currentLang === 'en') {
            this.toggle.classList.add('lang-en');
            this.toggle.setAttribute('aria-label', 'Prze\u0142\u0105cz na polski');
        } else {
            this.toggle.classList.remove('lang-en');
            this.toggle.setAttribute('aria-label', 'Switch to English');
        }
    }
};

LanguageManager.init();

// ================================================
// PERFORMANCE: Reduced motion detection
// ================================================
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ================================================
// PARALLAX EFFECT (with requestAnimationFrame throttling)
// ================================================
const ParallaxEffect = {
    shapes: document.querySelectorAll('.floating-shape.parallax'),
    mouseX: 0,
    mouseY: 0,
    scrollY: 0,
    rafId: null,
    needsUpdate: false,

    init() {
        if (window.innerWidth <= 768 || prefersReducedMotion) return;

        document.addEventListener('mousemove', (e) => this.handleMouseMove(e), { passive: true });
        window.addEventListener('scroll', () => this.handleScroll(), { passive: true });
    },

    handleMouseMove(e) {
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        this.mouseX = e.clientX - centerX;
        this.mouseY = e.clientY - centerY;
        this.scheduleUpdate();
    },

    handleScroll() {
        this.scrollY = window.pageYOffset;
        this.scheduleUpdate();
    },

    scheduleUpdate() {
        if (this.needsUpdate) return;
        this.needsUpdate = true;
        this.rafId = requestAnimationFrame(() => {
            this.updateTransforms();
            this.needsUpdate = false;
        });
    },

    updateTransforms() {
        this.shapes.forEach(shape => {
            const speed = parseFloat(shape.dataset.speed) || 0.05;
            const mouseOffsetX = this.mouseX * speed;
            const mouseOffsetY = this.mouseY * speed;
            const scrollOffset = this.scrollY * speed * 0.5;
            shape.style.transform = `translate(${mouseOffsetX}px, ${mouseOffsetY + scrollOffset}px)`;
        });
    }
};

ParallaxEffect.init();

// ================================================
// MOBILE NAVIGATION
// ================================================
const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');

navToggle?.addEventListener('click', () => {
    const open = navLinks.classList.toggle('active');
    navToggle.classList.toggle('active');
    navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
});

// Close mobile menu when clicking a link
navLinks?.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('active');
        navToggle.classList.remove('active');
        navToggle.setAttribute('aria-expanded', 'false');
    });
});

// ================================================
// SMOOTH SCROLL
// ================================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        // Skip if href is just "#" or empty
        if (!href || href === '#') return;

        try {
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        } catch (err) {
            // Invalid selector, let browser handle default behavior
            console.warn('Invalid anchor href:', href);
        }
    });
});


// ================================================
// ENHANCED SCROLL REVEAL ANIMATIONS
// ================================================
const ScrollAnimations = {
    init() {
        // Original reveal elements
        const revealElements = document.querySelectorAll(
            '.skill-card, .project-card, .contact-link, .education-list li'
        );

        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                    revealObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

        revealElements.forEach(el => {
            el.classList.add('reveal');
            revealObserver.observe(el);
        });

        // New fade-in animations
        const fadeElements = document.querySelectorAll(
            '.fade-in-up, .fade-in-left, .fade-in-right, .scale-in'
        );

        const fadeObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animated');
                    fadeObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -100px 0px' });

        fadeElements.forEach(el => {
            fadeObserver.observe(el);
        });

        // Section headers animation
        const sectionHeaders = document.querySelectorAll('.section-header');
        const headerObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                    headerObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.2 });

        sectionHeaders.forEach(header => {
            header.style.opacity = '0';
            header.style.transform = 'translateY(30px)';
            header.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            headerObserver.observe(header);
        });

        // Position items staggered animation
        const positionItems = document.querySelectorAll('.position-item');
        const positionObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                    }, index * 100);
                    positionObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.2 });

        positionItems.forEach(item => {
            item.style.opacity = '0';
            item.style.transform = 'translateY(20px)';
            item.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            positionObserver.observe(item);
        });
    }
};

ScrollAnimations.init();

// ================================================
// MAGNETIC BUTTON EFFECT
// ================================================
const MagneticButtons = {
    buttons: [],
    handlers: new Map(),
    isEnabled: false,

    init() {
        this.buttons = document.querySelectorAll('.btn-primary, .btn-secondary');
        this.handleResize();
        window.addEventListener('resize', () => this.handleResize());
    },

    handleResize() {
        const shouldEnable = window.innerWidth > 768 && !prefersReducedMotion;

        if (shouldEnable && !this.isEnabled) {
            this.enable();
        } else if (!shouldEnable && this.isEnabled) {
            this.disable();
        }
    },

    enable() {
        this.isEnabled = true;
        this.buttons.forEach(btn => {
            let rafPending = false;
            const moveHandler = (e) => {
                if (rafPending) return;
                rafPending = true;
                requestAnimationFrame(() => {
                    const rect = btn.getBoundingClientRect();
                    const x = e.clientX - rect.left - rect.width / 2;
                    const y = e.clientY - rect.top - rect.height / 2;
                    btn.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
                    rafPending = false;
                });
            };
            const leaveHandler = () => {
                btn.style.transform = '';
            };

            btn.addEventListener('mousemove', moveHandler, { passive: true });
            btn.addEventListener('mouseleave', leaveHandler);
            this.handlers.set(btn, { move: moveHandler, leave: leaveHandler });
        });
    },

    disable() {
        this.isEnabled = false;
        this.buttons.forEach(btn => {
            const handlers = this.handlers.get(btn);
            if (handlers) {
                btn.removeEventListener('mousemove', handlers.move);
                btn.removeEventListener('mouseleave', handlers.leave);
                btn.style.transform = '';
            }
        });
        this.handlers.clear();
    }
};

MagneticButtons.init();

// ================================================
// NAVBAR SCROLL EFFECT (throttled with rAF)
// ================================================
const nav = document.querySelector('.nav');
let navScrollRaf = false;

window.addEventListener('scroll', () => {
    if (navScrollRaf) return;
    navScrollRaf = true;
    requestAnimationFrame(() => {
        const currentScroll = window.pageYOffset;
        if (currentScroll > 100) {
            nav.classList.add('nav-scrolled');
        } else {
            nav.classList.remove('nav-scrolled');
        }
        navScrollRaf = false;
    });
}, { passive: true });

// ================================================
// WINDOWS 95 CLOCK
// ================================================
const updateClock = () => {
    const clock = document.getElementById('clock');
    if (clock) {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        clock.textContent = `${hours}:${minutes}`;
    }
};

updateClock();
// Update every 15s instead of every 1s - clock only shows HH:MM
setInterval(updateClock, 15000);

// ================================================
// PROJECT VIDEO ON HOVER
// ================================================
document.querySelectorAll('.project-has-video').forEach(container => {
    const video = container.querySelector('.project-video');
    if (!video) return;

    container.addEventListener('mouseenter', () => {
        video.play().catch(() => {});
    });

    container.addEventListener('mouseleave', () => {
        video.pause();
        video.currentTime = 0;
    });
});

// ================================================
// CATS EASTER EGG  (devtools: cats.show('Pimpek'|'Fryderyk'|'Both'))
// ================================================
const cats = {
    show(which) {
        const cat = String(which || 'both').toLowerCase();
        if (!['pimpek', 'fryderyk', 'both'].includes(cat)) {
            console.log("cats.show('Pimpek' | 'Fryderyk' | 'Both')");
            return;
        }
        const previouslyFocused = document.activeElement;
        const overlay = document.createElement('div');
        overlay.className = 'cat-easter-egg-overlay';
        overlay.setAttribute('role', 'dialog');
        overlay.setAttribute('aria-modal', 'true');
        overlay.setAttribute('aria-label', 'Zdjęcia kotów');
        const container = document.createElement('div');
        container.className = 'cat-easter-egg-container';
        const closeBtn = document.createElement('button');
        closeBtn.className = 'cat-easter-egg-close';
        closeBtn.innerHTML = '×';
        closeBtn.setAttribute('aria-label', 'Zamknij');
        const keyHandler = (e) => {
            if (e.key === 'Escape') closeModal();
            if (e.key === 'Tab') { e.preventDefault(); closeBtn.focus(); }
        };
        const closeModal = () => {
            overlay.remove();
            document.removeEventListener('keydown', keyHandler);
            if (previouslyFocused && previouslyFocused.focus) previouslyFocused.focus();
        };
        closeBtn.onclick = closeModal;
        const content = document.createElement('div');
        content.className = 'cat-easter-egg-content';
        const catNames = { 'pimpek': 'Pimpek', 'fryderyk': 'Fryderyk', 'both': 'Pimpek & Fryderyk' };
        const title = document.createElement('h3');
        title.className = 'cat-easter-egg-title';
        title.textContent = '🐱 ' + catNames[cat] + ' 🐱';
        const imageContainer = document.createElement('div');
        imageContainer.className = 'cat-easter-egg-images';
        if (cat === 'both') {
            ['pimpek', 'fryderyk'].forEach(name => {
                const img = document.createElement('img');
                img.src = 'assets/images/cats/' + name + '.jpg';
                img.alt = name.charAt(0).toUpperCase() + name.slice(1);
                img.className = 'cat-easter-egg-img';
                imageContainer.appendChild(img);
            });
        } else {
            const img = document.createElement('img');
            img.src = 'assets/images/cats/' + cat + '.jpg';
            img.alt = catNames[cat];
            img.className = 'cat-easter-egg-img cat-easter-egg-img-single';
            imageContainer.appendChild(img);
        }
        const subtitle = document.createElement('p');
        subtitle.className = 'cat-easter-egg-subtitle';
        subtitle.textContent = 'Sekretni asystenci prawni 🐾';
        content.appendChild(title);
        content.appendChild(imageContainer);
        content.appendChild(subtitle);
        container.appendChild(closeBtn);
        container.appendChild(content);
        overlay.appendChild(container);
        document.body.appendChild(overlay);
        closeBtn.focus();
        overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); });
        document.addEventListener('keydown', keyHandler);
    }
};
window.cats = cats;

// Konami code (Up Up Down Down Left Right Left Right B A) keeps the cats discoverable.
(function () {
    const seq = ['arrowup', 'arrowup', 'arrowdown', 'arrowdown', 'arrowleft', 'arrowright', 'arrowleft', 'arrowright', 'b', 'a'];
    let pos = 0;
    document.addEventListener('keydown', (e) => {
        const k = e.key.toLowerCase();
        pos = (k === seq[pos]) ? pos + 1 : (k === seq[0] ? 1 : 0);
        if (pos === seq.length) { pos = 0; cats.show('both'); }
    });
})();

// ================================================
// EMAIL PROTECTION - Anti-Scraper Obfuscation
// ================================================
const EmailProtection = {
    // Email encoded as character codes (harder for scrapers to parse)
    // Encoded: karolpwilczynski@gmail.com
    encoded: [107,97,114,111,108,112,119,105,108,99,122,121,110,115,107,105,64,103,109,97,105,108,46,99,111,109],

    init() {
        const emailLink = document.getElementById('emailLink');
        const emailDisplay = document.getElementById('emailDisplay');

        if (emailLink && emailDisplay) {
            emailLink.addEventListener('click', (e) => {
                e.preventDefault();
                const email = this.decode();
                emailDisplay.textContent = email;
                emailLink.href = 'mailto:' + email;
                // Open mail client on subsequent clicks
                if (emailLink.dataset.revealed === 'true') {
                    window.location.href = 'mailto:' + email;
                }
                emailLink.dataset.revealed = 'true';
            });
        }
    },

    decode() {
        // Reconstruct email from character codes
        return String.fromCharCode(...this.encoded);
    }
};

EmailProtection.init();

// ================================================
// PERFORMANCE: Pause off-screen animations
// ================================================
const AnimationPauser = {
    init() {
        if (prefersReducedMotion) return;

        // Pause gradient blob animations when not visible
        const blobs = document.querySelector('.gradient-blobs');
        if (blobs) {
            // Blobs are fixed-position so always "visible" - but we can pause
            // when user is at the very bottom or in certain sections
            // For fixed elements, we use a page visibility approach instead
            document.addEventListener('visibilitychange', () => {
                const blobEls = blobs.querySelectorAll('.gradient-blob');
                blobEls.forEach(blob => {
                    blob.style.animationPlayState = document.hidden ? 'paused' : 'running';
                });
            });
        }

        // Pause neural network animation when tab is hidden
        const neural = document.querySelector('.neural-network');
        if (neural) {
            document.addEventListener('visibilitychange', () => {
                const lines = neural.querySelectorAll('.neural-line, .neural-line-accent, .neural-node, .neural-node-accent');
                lines.forEach(el => {
                    el.style.animationPlayState = document.hidden ? 'paused' : 'running';
                });
            });
        }

        // Pause hero decorations when hero is scrolled past
        const hero = document.querySelector('.hero');
        const heroDecorations = document.querySelectorAll('.floating-shape, .hero::before');
        if (hero) {
            const heroObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    const shapes = hero.querySelectorAll('.floating-shape');
                    shapes.forEach(shape => {
                        shape.style.animationPlayState = entry.isIntersecting ? 'running' : 'paused';
                    });
                });
            }, { threshold: 0 });
            heroObserver.observe(hero);
        }

        // Pause positions glow when not visible
        const positions = document.querySelector('.positions');
        if (positions) {
            const posObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    positions.style.setProperty('--anim-state', entry.isIntersecting ? 'running' : 'paused');
                });
            }, { threshold: 0 });
            posObserver.observe(positions);
        }

        // Pause console status dot when not visible
        const consoleDot = document.querySelector('.status-dot');
        if (consoleDot) {
            const dotObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    consoleDot.style.animationPlayState = entry.isIntersecting ? 'running' : 'paused';
                });
            }, { threshold: 0 });
            dotObserver.observe(consoleDot);
        }
    }
};

AnimationPauser.init();

// Hero Tabs
const HeroTabs = {
    init() {
        const tabs = Array.from(document.querySelectorAll('.hero-tab'));
        const panels = document.querySelectorAll('.hero-tab-panel');
        if (!tabs.length) return;

        const activate = (tab, focus) => {
            const target = document.getElementById('panel-' + tab.dataset.tab);
            if (!target) return;
            tabs.forEach(t => {
                const on = t === tab;
                t.classList.toggle('active', on);
                t.setAttribute('aria-selected', on ? 'true' : 'false');
                t.setAttribute('tabindex', on ? '0' : '-1');
            });
            panels.forEach(p => p.classList.remove('active'));
            // Force animation restart
            target.style.animation = 'none';
            target.offsetHeight; // trigger reflow
            target.style.animation = '';
            target.classList.add('active');
            if (focus) tab.focus();
        };

        tabs.forEach((tab, i) => {
            tab.setAttribute('tabindex', tab.classList.contains('active') ? '0' : '-1');
            tab.addEventListener('click', () => {
                if (!tab.classList.contains('active')) activate(tab, false);
            });
            tab.addEventListener('keydown', (e) => {
                let j = null;
                if (e.key === 'ArrowRight' || e.key === 'ArrowDown') j = (i + 1) % tabs.length;
                else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') j = (i - 1 + tabs.length) % tabs.length;
                else if (e.key === 'Home') j = 0;
                else if (e.key === 'End') j = tabs.length - 1;
                if (j === null) return;
                e.preventDefault();
                activate(tabs[j], true);
            });
        });
    }
};

HeroTabs.init();

// ================================================
// PROJECT SHOWCASE CAROUSEL
// ================================================
const ProjectShowcase = {
    init() {
        const carousel = document.querySelector('.showcase-carousel');
        if (!carousel) return;

        this.carousel = carousel;
        this.track = carousel.querySelector('.showcase-track');
        this.slides = Array.from(carousel.querySelectorAll('.showcase-slide'));
        this.prevBtn = carousel.querySelector('.showcase-prev');
        this.nextBtn = carousel.querySelector('.showcase-next');
        this.dotsWrap = carousel.querySelector('.showcase-dots');
        this.counterCurrent = carousel.querySelector('.showcase-counter-current');
        this.counterTotal = carousel.querySelector('.showcase-counter-total');
        if (!this.track || !this.slides.length) return;

        this.index = 0;
        this.count = this.slides.length;
        this.reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        this.buildDots();
        this.setupTabs();
        this.setupGalleries();
        this.handleMissingImages();
        this.bindControls();
        this.bindKeyboard();
        this.bindSwipe();
        this.bindAutoplay();
        this.liveRegion = document.createElement('span');
        this.liveRegion.className = 'sr-only';
        this.liveRegion.setAttribute('aria-live', 'polite');
        this.liveRegion.setAttribute('aria-atomic', 'true');
        this.carousel.appendChild(this.liveRegion);
        this.relabelControls();
        document.addEventListener('languagechange', () => {
            this.relabelControls();
            this.announce();
            if (this._syncPause) this._syncPause();
        });

        // Re-align the overlaid mobile controls when the layout changes size.
        window.addEventListener('resize', () => {
            if (this._rAF) cancelAnimationFrame(this._rAF);
            this._rAF = requestAnimationFrame(() => this.positionMobileControls());
        }, { passive: true });
        // The slide height (which the arrow offset is derived from) keeps growing
        // as fonts and images load, so recompute once everything has settled.
        window.addEventListener('load', () => this.positionMobileControls());
        if (document.fonts && document.fonts.ready) {
            document.fonts.ready.then(() => this.positionMobileControls());
        }

        if (this.counterTotal) this.counterTotal.textContent = this.pad(this.count);
        this.goTo(0, false);
    },

    pad(n) {
        return String(n).padStart(2, '0');
    },

    buildDots() {
        if (!this.dotsWrap) return;
        this.dots = this.slides.map((slide, i) => {
            const dot = document.createElement('button');
            dot.type = 'button';
            dot.className = 'showcase-dot' + (i === 0 ? ' is-active' : '');
            dot.setAttribute('aria-label', 'Przejdź do projektu ' + (i + 1));
            if (i === 0) dot.setAttribute('aria-current', 'true');
            dot.addEventListener('click', () => { this.goTo(i); this.restartAutoplay(); });
            this.dotsWrap.appendChild(dot);
            return dot;
        });
    },

    goTo(i, animate = true) {
        this.index = (i + this.count) % this.count;
        if (this.track) {
            if (!animate) {
                const prev = this.track.style.transition;
                this.track.style.transition = 'none';
                this.track.style.transform = `translateX(-${this.index * 100}%)`;
                void this.track.offsetHeight; // force reflow so the jump isn't animated
                this.track.style.transition = prev;
            } else {
                this.track.style.transform = `translateX(-${this.index * 100}%)`;
            }
        }
        this.updateUI();
    },

    next() { this.goTo(this.index + 1); },
    prev() { this.goTo(this.index - 1); },

    updateUI() {
        if (this.dots) {
            this.dots.forEach((d, i) => {
                const active = i === this.index;
                d.classList.toggle('is-active', active);
                if (active) d.setAttribute('aria-current', 'true');
                else d.removeAttribute('aria-current');
            });
        }
        if (this.counterCurrent) this.counterCurrent.textContent = this.pad(this.index + 1);

        // Keep off-screen slides out of the tab order and hidden from assistive tech.
        const active = this.slides[this.index];
        // Navigating to a slide always starts on its first tab (Opis).
        if (active && active._resetTab) active._resetTab();
        this.slides.forEach((slide, i) => {
            const offscreen = i !== this.index;
            // Never leave focus inside a slide we're about to aria-hide (covers swipe/dots/autoplay).
            if (offscreen && slide.contains(document.activeElement)) {
                const safe = active.querySelector('.showcase-tab.is-active')
                    || active.querySelector('.showcase-tab, a, button') || active;
                if (safe === active && !active.hasAttribute('tabindex')) active.setAttribute('tabindex', '-1');
                safe.focus({ preventScroll: true });
            }
            slide.setAttribute('aria-hidden', offscreen ? 'true' : 'false');
            slide.querySelectorAll('a, button').forEach(el => {
                if (offscreen) {
                    el.setAttribute('tabindex', '-1');
                } else if (el.classList.contains('showcase-tab')) {
                    // Roving tabindex: only the active tab stays in the tab order.
                    el.setAttribute('tabindex', el.classList.contains('is-active') ? '0' : '-1');
                } else {
                    el.removeAttribute('tabindex');
                }
            });
        });

        this.announce();
        this.positionMobileControls();
    },

    // On mobile the prev/next arrows and the counter are overlaid on the screenshot.
    // Align them to the active slide's image area (same vertical offset for every slide).
    positionMobileControls() {
        if (!this.carousel) return;
        if (!window.matchMedia('(max-width: 768px)').matches) {
            this.carousel.style.removeProperty('--sc-arrow-top');
            this.carousel.style.removeProperty('--sc-badge-top');
            return;
        }
        const slide = this.slides[this.index];
        if (!slide) return;
        const carTop = this.carousel.getBoundingClientRect().top;
        // Strzałki na wysokości wiersza zakładek (Opis/Techniczne/Wyzwania),
        // żeby tworzyły z nimi jedną linię.
        const ref = slide.querySelector('.showcase-tabs') || slide.querySelector('.showcase-stage');
        if (ref) {
            const r = ref.getBoundingClientRect();
            this.carousel.style.setProperty('--sc-arrow-top', (r.top - carTop + r.height / 2) + 'px');
        }
        // Licznik 01/05 zostaje w rogu zrzutu.
        const stage = slide.querySelector('.showcase-stage');
        if (stage) {
            const sr = stage.getBoundingClientRect();
            this.carousel.style.setProperty('--sc-badge-top', (sr.top - carTop + 12) + 'px');
        }
    },

    lang() { return document.documentElement.lang === 'en' ? 'en' : 'pl'; },

    relabelControls() {
        if (!this.dots) return;
        const en = this.lang() === 'en';
        this.dots.forEach((d, i) => d.setAttribute('aria-label', (en ? 'Go to project ' : 'Przejdź do projektu ') + (i + 1)));
    },

    announce() {
        if (!this.liveRegion) return;
        const slide = this.slides[this.index];
        const titleEl = slide && slide.querySelector('.showcase-title');
        const title = titleEl ? titleEl.textContent.trim().replace(/\s+/g, ' ') : '';
        const en = this.lang() === 'en';
        this.liveRegion.textContent = en
            ? 'Project ' + (this.index + 1) + ' of ' + this.count + ': ' + title
            : 'Projekt ' + (this.index + 1) + ' z ' + this.count + ': ' + title;
    },

    addPauseButton() {
        const controls = this.carousel.querySelector('.showcase-controls');
        if (!controls) return;
        const PAUSE = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>';
        const PLAY = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>';
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'showcase-arrow showcase-pause';
        const sync = () => {
            const en = this.lang() === 'en';
            btn.innerHTML = this.userPaused ? PLAY : PAUSE;
            btn.setAttribute('aria-pressed', String(this.userPaused));
            btn.setAttribute('aria-label', this.userPaused
                ? (en ? 'Resume autoplay' : 'Wznów automatyczne przewijanie')
                : (en ? 'Pause autoplay' : 'Wstrzymaj automatyczne przewijanie'));
        };
        btn.addEventListener('click', () => {
            this.userPaused = !this.userPaused;
            sync();
            if (!this.userPaused) this.restartAutoplay();
        });
        sync();
        controls.appendChild(btn);
        this._syncPause = sync;
    },

    bindControls() {
        this.nextBtn?.addEventListener('click', () => { this.next(); this.restartAutoplay(); });
        this.prevBtn?.addEventListener('click', () => { this.prev(); this.restartAutoplay(); });
    },

    bindKeyboard() {
        this.carousel.addEventListener('keydown', (e) => {
            if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
            // Don't hijack arrows aimed at controls inside a slide — the tablist owns them.
            if (e.target.closest && e.target.closest('.showcase-slide')) return;
            e.preventDefault();
            if (e.key === 'ArrowRight') this.next(); else this.prev();
            this.restartAutoplay();
        });
    },

    bindSwipe() {
        const vp = this.carousel.querySelector('.showcase-viewport');
        if (!vp) return;
        let startX = 0, startY = 0, tracking = false;
        vp.addEventListener('pointerdown', (e) => {
            startX = e.clientX; startY = e.clientY; tracking = true;
        }, { passive: true });
        vp.addEventListener('pointerup', (e) => {
            if (!tracking) return;
            tracking = false;
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;
            if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) {
                if (dx < 0) this.next(); else this.prev();
                this.restartAutoplay();
            }
        }, { passive: true });
        vp.addEventListener('pointercancel', () => { tracking = false; });
    },

    setupTabs() {
        this.slides.forEach(slide => {
            const tabs = Array.from(slide.querySelectorAll('.showcase-tab'));
            const panels = Array.from(slide.querySelectorAll('.showcase-panel'));
            if (!tabs.length) return;

            const activate = (tab) => {
                tabs.forEach(t => {
                    const on = t === tab;
                    t.classList.toggle('is-active', on);
                    t.setAttribute('aria-selected', on ? 'true' : 'false');
                    t.setAttribute('tabindex', on ? '0' : '-1');
                });
                panels.forEach(p => { p.classList.remove('is-active'); p.hidden = true; });
                const target = slide.querySelector('#' + tab.getAttribute('aria-controls'));
                if (target) { target.hidden = false; target.classList.add('is-active'); }
            };

            // Let the carousel snap this slide back to its first tab (Opis) on navigation.
            slide._resetTab = () => activate(tabs[0]);

            // Roving tabindex: only the active tab is initially reachable via Tab.
            tabs.forEach(t => t.setAttribute('tabindex', t.classList.contains('is-active') ? '0' : '-1'));

            tabs.forEach((tab, i) => {
                tab.addEventListener('click', () => {
                    if (!tab.classList.contains('is-active')) activate(tab);
                });
                // ARIA tabs keyboard pattern: Left/Right move between tabs, Home/End jump to ends.
                tab.addEventListener('keydown', (e) => {
                    let next = -1;
                    if (e.key === 'ArrowRight') next = (i + 1) % tabs.length;
                    else if (e.key === 'ArrowLeft') next = (i - 1 + tabs.length) % tabs.length;
                    else if (e.key === 'Home') next = 0;
                    else if (e.key === 'End') next = tabs.length - 1;
                    else return;
                    e.preventDefault();
                    e.stopPropagation(); // don't let the carousel-level handler also fire
                    activate(tabs[next]);
                    tabs[next].focus();
                });
            });
        });
    },

    setupGalleries() {
        this.slides.forEach(slide => {
            const gallery = slide.querySelector('.showcase-gallery');
            const mainImg = slide.querySelector('.showcase-img');
            const stage = slide.querySelector('.showcase-stage');
            if (!gallery || !mainImg) return;
            const thumbs = Array.from(gallery.querySelectorAll('.showcase-thumb'));
            // A single-image gallery adds no value — hide it until more screenshots are added.
            if (thumbs.length <= 1) { gallery.hidden = true; return; }
            thumbs.forEach(thumb => {
                thumb.addEventListener('click', () => {
                    const src = thumb.dataset.src;
                    if (src) {
                        mainImg.src = src;
                        stage?.classList.remove('is-missing');
                    }
                    thumbs.forEach(t => t.classList.remove('is-active'));
                    thumb.classList.add('is-active');
                });
            });
        });
    },

    handleMissingImages() {
        this.slides.forEach(slide => {
            const img = slide.querySelector('.showcase-img');
            const stage = slide.querySelector('.showcase-stage');
            if (!img || !stage) return;
            const markMissing = () => stage.classList.add('is-missing');
            if (img.complete && img.naturalWidth === 0) markMissing();
            img.addEventListener('error', markMissing);
            img.addEventListener('load', () => {
                if (img.naturalWidth > 0) stage.classList.remove('is-missing');
            });
        });
    },

    bindAutoplay() {
        if (this.reduceMotion || this.count <= 1) return;
        this.delay = 7000;
        this.paused = false;
        this.userPaused = false;
        this.addPauseButton();
        this._startAutoplay = () => {
            this.stopAutoplay();
            this.timer = setInterval(() => { if (!this.paused && !this.userPaused) this.next(); }, this.delay);
        };

        this.carousel.addEventListener('mouseenter', () => { this.paused = true; });
        this.carousel.addEventListener('mouseleave', () => { this.paused = false; });
        this.carousel.addEventListener('focusin', () => { this.paused = true; });
        this.carousel.addEventListener('focusout', () => {
            if (!this.carousel.contains(document.activeElement)) this.paused = false;
        });
        document.addEventListener('visibilitychange', () => { this.paused = document.hidden; });

        // Only run autoplay while the carousel is on screen.
        if ('IntersectionObserver' in window) {
            const io = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    this.onScreen = entry.isIntersecting;
                    if (entry.isIntersecting) { this.paused = false; this._startAutoplay(); }
                    else { this.stopAutoplay(); }
                });
            }, { threshold: 0.3 });
            io.observe(this.carousel);
        } else {
            this._startAutoplay();
        }
    },

    stopAutoplay() {
        if (this.timer) { clearInterval(this.timer); this.timer = null; }
    },

    restartAutoplay() {
        // Bail if the carousel is known to be off screen, so user interaction with the
        // bottom controls can't re-arm autoplay that the IntersectionObserver had stopped.
        if (this.reduceMotion || !this._startAutoplay || this.onScreen === false) return;
        this._startAutoplay();
    }
};

ProjectShowcase.init();

// ================================================
// TECH KEYWORD HIGHLIGHTER (carousel + tool copy)
// Wraps known stack/brand names in <span class="kw"> so they pop in the prose.
// Re-runs on languagechange because setLanguage rewrites the text nodes.
// ================================================
const TechHighlighter = {
    terms: ['Apple Silicon', 'Raspberry Pi', 'PLLuM-12B', 'Next.js', 'TypeScript', 'Playwright',
        'Selenium', 'Supabase', 'Postgres', 'Cloudflare', 'Discordzie', 'Discord', 'Whisperze',
        'Whisper', 'Béziera', 'Bézier', 'OpenAI', 'Claude', 'macOS', 'PLLuM', 'Python', 'SQLite',
        'Flask', 'React', 'tRPC', 'Swing', 'Java', 'ISAP', 'CLI', 'GPT', 'MCP', 'CSV',
        'JSON', 'RLS'],
    selector: '.showcase-panel p, .tools-card p, .showcase-subtitle',

    init() {
        const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        this.re = new RegExp('\\b(' + this.terms.map(esc).join('|') + ')\\b', 'g');
        this.run();
        document.addEventListener('languagechange', () => this.run());
    },

    run() {
        document.querySelectorAll(this.selector).forEach(el => this.mark(el));
    },

    mark(el) {
        const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null);
        const targets = [];
        let node;
        while (node = walker.nextNode()) {
            if (node.parentElement.classList.contains('kw')) continue;
            this.re.lastIndex = 0;
            if (this.re.test(node.nodeValue)) targets.push(node);
        }
        targets.forEach(textNode => {
            const text = textNode.nodeValue;
            const frag = document.createDocumentFragment();
            let last = 0, m;
            this.re.lastIndex = 0;
            while (m = this.re.exec(text)) {
                if (m.index > last) frag.appendChild(document.createTextNode(text.slice(last, m.index)));
                const span = document.createElement('span');
                span.className = 'kw';
                span.textContent = m[0];
                frag.appendChild(span);
                last = m.index + m[0].length;
            }
            if (last < text.length) frag.appendChild(document.createTextNode(text.slice(last)));
            textNode.parentNode.replaceChild(frag, textNode);
        });
    }
};

TechHighlighter.init();
