// ================================================
// THEME TOGGLE (DARK/LIGHT MODE)
// ================================================
const ThemeManager = {
    toggle: document.getElementById('themeToggle'),

    init() {
        // Check for saved preference or system preference
        const savedTheme = localStorage.getItem('theme');
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

        if (savedTheme) {
            document.documentElement.setAttribute('data-theme', savedTheme);
        } else if (systemPrefersDark) {
            document.documentElement.setAttribute('data-theme', 'dark');
        }

        this.toggle?.addEventListener('click', () => this.toggleTheme());

        // Listen for system theme changes
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (!localStorage.getItem('theme')) {
                document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
            }
        });
    },

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);

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
        ['.hero-subtitle', 'I work at the intersection of <span class="accent">artificial intelligence</span>, <span class="accent">technology</span>, <span class="accent">public policy</span>, <span class="accent">law</span> and <span class="accent">public administration</span>.', true],
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
        ['#panel-education li:nth-child(1) .edu-title', 'Big Data \u2014 Large-Scale Data Engineering'],
        ['#panel-education li:nth-child(1) .edu-school', 'Polish-Japanese Academy of Information Technology'],
        ['#panel-education li:nth-child(2) .edu-title', 'Artificial Intelligence in Business and Public Sector'],
        ['#panel-education li:nth-child(2) .edu-school', 'SGH Warsaw School of Economics'],
        ['#panel-education li:nth-child(3) .edu-title', 'Python AI Developer'],
        ['#panel-education li:nth-child(3) .edu-school', 'Polish-Japanese Academy of Information Technology'],
        ['#panel-education li:nth-child(4) .edu-title', 'IT Systems, Applications and Databases'],
        ['#panel-education li:nth-child(4) .edu-school', 'Polish-Japanese Academy of Information Technology'],
        ['#panel-education li:nth-child(5) .edu-title', 'Law'],
        ['#panel-education li:nth-child(5) .edu-school', 'University of Warsaw'],

        // Skills bento
        ['.skills-bento-card[data-accent="burgundy"] .skills-bento-label', 'Law'],
        ['.skills-bento-card:nth-child(4) .skills-bento-label', 'Certificates'],
        ['.skills-bento-card[data-accent="burgundy"] .skills-bento-chips span:nth-child(2)', 'Public Proc.'],
        ['.skills-bento-card[data-accent="burgundy"] .skills-bento-chips span:nth-child(4)', 'Civil Law'],

        // Projects section
        ['#projekty .section-title', 'Projects'],
        ['.project-video-hint span', 'Hover to see demo'],

        // Project 1 - upfor
        ['.projects-featured-stack .project-featured:nth-child(1) .project-subtitle', 'Gaming Availability Calendar with AI'],
        ['.projects-featured-stack .project-featured:nth-child(1) .project-desc', 'Paint weekly gaming availability slots, share with friends, and let Claude propose a session that fits the shared window. Discord-native, multi-timezone, privacy-first.'],
        ['.projects-featured-stack .project-featured:nth-child(1) .project-features li:nth-child(1)', '7\u00d748 grid \u2014 paint when you play, heatmap shows overlap with your group'],
        ['.projects-featured-stack .project-featured:nth-child(1) .project-features li:nth-child(2)', 'Discord bot (13 Polish slash commands) with real-time two-way sync'],
        ['.projects-featured-stack .project-featured:nth-child(1) .project-features li:nth-child(3)', 'Claude Haiku 4.5 with tool-use proposes the session matching the shared window'],

        // Project 2 - JakiePrawo
        ['.projects-featured-stack .project-featured:nth-child(2) .project-subtitle', 'AI-Powered Polish Law Search Engine'],
        ['.projects-featured-stack .project-featured:nth-child(2) .project-desc', 'A search engine that takes a natural language question and returns the specific legal article, statute name, and a direct link to the full text in ISAP.'],
        ['.projects-featured-stack .project-featured:nth-child(2) .project-features li:nth-child(1)', 'Statute database built from the Polish Parliament API (PDF parsing)'],
        ['.projects-featured-stack .project-featured:nth-child(2) .project-features li:nth-child(2)', 'MCP server on Raspberry Pi \u2014 content extraction and indexing'],
        ['.projects-featured-stack .project-featured:nth-child(2) .project-features li:nth-child(3)', 'Source citation with direct link to ISAP'],

        // Project 3 - AutoMargiela
        ['.projects-featured-stack .project-featured:nth-child(3) .project-subtitle', 'Product Price Monitoring System'],
        ['.projects-featured-stack .project-featured:nth-child(3) .project-desc', 'Tool for tracking Maison Margiela product prices across multiple online stores. Automatic notifications when prices drop below a set threshold.'],
        ['.projects-featured-stack .project-featured:nth-child(3) .project-features li:nth-child(1)', 'Price scraping from multiple sources simultaneously'],
        ['.projects-featured-stack .project-featured:nth-child(3) .project-features li:nth-child(2)', 'Email notifications with price change history'],
        ['.projects-featured-stack .project-featured:nth-child(3) .project-features li:nth-child(3)', 'Dashboard for managing watched products'],

        // Project 4 - Majeranek
        ['.projects-featured-stack .project-featured:nth-child(4) .project-badge-wip', 'WIP'],
        ['.projects-featured-stack .project-featured:nth-child(4) .project-subtitle', 'Smart Recommendations Based on Tier Lists'],
        ['.projects-featured-stack .project-featured:nth-child(4) .project-desc', 'App for creating tier lists from movies, games, books, and music. A language model analyzes patterns in user ratings and suggests new titles to discover.'],
        ['.projects-featured-stack .project-featured:nth-child(4) .project-features li:nth-child(1)', 'Cross-media recommendations (e.g., movie based on music taste)'],
        ['.projects-featured-stack .project-featured:nth-child(4) .project-features li:nth-child(2)', 'Intuitive drag & drop interface'],
        ['.projects-featured-stack .project-featured:nth-child(4) .project-features li:nth-child(3)', 'User preference analysis via LLM'],

        // Project 5 - AIgets.me
        ['.projects-featured-stack .project-featured:nth-child(5) .project-badge-wip', 'WIP'],
        ['.projects-featured-stack .project-featured:nth-child(5) .project-subtitle', 'One Personality Profile for Multiple AI Models'],
        ['.projects-featured-stack .project-featured:nth-child(5) .project-desc', 'A tool for building a communication profile with AI assistants \u2014 tone, context, work style. Profile exported as a system prompt, compatible with any model.'],
        ['.projects-featured-stack .project-featured:nth-child(5) .project-features li:nth-child(1)', 'Tone, context, and communication style configuration'],
        ['.projects-featured-stack .project-featured:nth-child(5) .project-features li:nth-child(2)', 'Compatible with Claude, GPT, and other LLM models'],
        ['.projects-featured-stack .project-featured:nth-child(5) .project-features li:nth-child(3)', 'Export as a ready-made system prompt for any tool'],

        // Project links
        ['.project-link-primary span', 'See live'],
        ['.project-link-coming span', 'Coming soon'],

        // Duo projects
        ['.projects-duo .project-duo-card:nth-child(1) h3', 'Stock Market Predictions from ESPI'],
        ['.projects-duo .project-duo-card:nth-child(1) p', 'Can an LLM predict market reactions to stock reports? Analysis of ~1,500 ESPI reports from Polish companies with predictions across 5 time horizons.'],
        ['.projects-duo .project-duo-card:nth-child(2) h3', 'Data Science Notebooks'],
        ['.projects-duo .project-duo-card:nth-child(2) p', 'Analytical projects: gaming market segmentation (K-means), Airbnb price modeling (feature engineering).'],

        // All repositories
        ['.projects-footer .btn-secondary span', 'All repositories'],

        // Contact section
        ['#kontakt .section-title', 'Contact'],
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
// PORTFOLIO CONSOLE - Interactive Terminal
// ================================================
const LegalConsole = {
    output: document.getElementById('consoleOutput'),
    input: document.getElementById('consoleInput'),
    runBtn: document.getElementById('consoleRun'),
    cmdButtons: document.querySelectorAll('.cmd-btn'),
    history: [],
    historyIndex: -1,
    prompt: 'karol@dev:~$',

    // Project data for projekty.get()
    projectData: {
        'jakieprawo': {
            name: 'JakiePrawo.pl',
            badge: 'Prawo + AI',
            desc: [
                'Wpisujesz pytanie, dostajesz artyku\u0142,',
                'nazw\u0119 ustawy i link do pe\u0142nego',
                'tekstu w ISAP.'
            ],
            stack: 'React + TypeScript + Supabase Edge Functions',
            ai: 'Claude API + MCP server',
            infra: 'Raspberry Pi + Tailscale',
            features: [
                'Parsowanie PDF z api.sejm.gov.pl',
                'Serwer MCP na Raspberry Pi',
                'RAG do analizy prawnej'
            ],
            link: 'jakieprawo.pl'
        },
        'automargiela': {
            name: 'AutoMargiela',
            badge: 'Automation',
            desc: [
                '\u015aledzi ceny produkt\u00f3w Maison Margiela.',
                'Jak cena spadnie, dostajesz',
                'powiadomienie na maila.'
            ],
            stack: 'Python + Selenium',
            infra: 'Raspberry Pi hosting',
            features: [
                'Scraping z obej\u015bciem captcha',
                'Alerty cenowe na maila',
                '\u015aledzenie wielu produkt\u00f3w naraz'
            ],
            link: 'replica.karolwilczynski.com'
        },
        'majeranek': {
            name: 'Majeranek',
            badge: 'Tier Lists + AI',
            desc: [
                'Robisz tier listy z film\u00f3w, ksi\u0105\u017cek,',
                'gier. AI patrzy na Twoje rankingi',
                'i podpowiada co mo\u017ce Ci si\u0119 spodoba\u0107.'
            ],
            stack: 'TypeScript + React + Supabase',
            ai: 'Rekomendacje z ranking\u00f3w',
            features: [
                'Cross-list: film wg gustu muzycznego',
                'Rekomendacje z Twoich ranking\u00f3w',
                'Drag & drop do uk\u0142adania tier list'
            ],
            link: 'wkr\u00f3tce'
        },
        'aigets': {
            name: 'AIgets.me',
            badge: 'AI + Personalizacja',
            desc: [
                'Konfigurujesz jak AI ma si\u0119 odzywac,',
                'co wie o Tobie i jak pracuje.',
                'Zapisujesz profil i u\u017cywasz z r\u00f3\u017cnymi modelami.'
            ],
            stack: 'AI + Personalization + LLM + UX',
            features: [
                'Profile z tonem i preferencjami',
                'Dzia\u0142a z Claude, GPT i innymi',
                'Eksport jako system prompt'
            ],
            link: 'wkr\u00f3tce'
        },
        'espi': {
            name: 'Prognozy gie\u0142dowe z ESPI',
            badge: 'Data Science',
            desc: [
                'Prognozowanie kurs\u00f3w akcji na podstawie',
                'komunikat\u00f3w gie\u0142dowych. Ponad 1200',
                'raport\u00f3w ESPI z trzech sp\u00f3\u0142ek.'
            ],
            stack: 'Python + GPT-4o + Pandas',
            features: [
                'Analiza sentymentu raport\u00f3w ESPI',
                'Modele predykcyjne cen akcji',
                'Wizualizacja trend\u00f3w'
            ],
            link: 'github.com/karolpolikarp'
        },
        'notebooks': {
            name: 'Notebooki Data Science',
            badge: 'Projekty ze studi\u00f3w',
            desc: [
                'Analiza rynku gier wideo (K-means),',
                'analiza Airbnb (feature engineering).'
            ],
            stack: 'Jupyter + Pandas + R',
            features: [
                'Klasteryzacja K-means',
                'Feature engineering',
                'Wizualizacja danych'
            ],
            link: 'github.com/karolpolikarp'
        }
    },

    // Static command responses
    commands: {
        'help': {
            type: 'system',
            response: [
                { text: '  Prawo:', type: 'dim' },
                '    ISAP.find(query)     Szukaj w bazie ISAP',
                '    Claude.ask(query)    Zapytaj AI o prawo',
                '    prawo.art(nr, akt)   Pobierz artyku\u0142',
                '',
                { text: '  Projekty:', type: 'dim' },
                '    karol.projects()     Lista projekt\u00f3w',
                '    projekty.get(name)   Szczeg\u00f3\u0142y projektu',
                '    karol.stack()        Tech stack',
                '',
                { text: '  System:', type: 'dim' },
                '    clear                Wyczy\u015b\u0107 konsol\u0119',
                '',
                { text: '  Nie wszystkie komendy s\u0105 tu wymienione.', type: 'dim' }
            ]
        },
        'clear': {
            type: 'action',
            action: 'clear'
        }
    },

    // Patterns for dynamic commands
    patterns: [
        // ═══ PROJECT COMMANDS ═══
        {
            regex: /^karol\.projects\(\)\s*$/i,
            handler: () => ({
                type: 'result',
                loading: '\u0141aduj\u0119 projekty',
                response: [
                    { text: '  [1] JakiePrawo.pl', type: 'accent' },
                    '      React + Claude API + MCP',
                    '      Wyszukiwarka podstaw prawnych',
                    '',
                    { text: '  [2] AutoMargiela', type: 'accent' },
                    '      Python + Selenium',
                    '      Monitor cen Maison Margiela',
                    '',
                    { text: '  [3] Majeranek', type: 'accent' },
                    '      TypeScript + React + AI',
                    '      Tier listy z rekomendacjami AI',
                    '',
                    { text: '  [4] AIgets.me', type: 'accent' },
                    '      AI + Personalization + LLM',
                    '      Personalizacja asystent\u00f3w AI [soon]',
                    '',
                    { text: '  [5] Prognozy ESPI', type: 'accent' },
                    '      Python + GPT-4o + Pandas',
                    '      Prognozy z raport\u00f3w gie\u0142dowych',
                    '',
                    { text: '  [6] Notebooki DS', type: 'accent' },
                    '      Jupyter + Pandas + R',
                    '      Analiza rynku gier i Airbnb',
                    '',
                    { text: '  \u2192 projekty.get(\'jakieprawo\') po szczeg\u00f3\u0142y', type: 'dim' }
                ]
            })
        },
        {
            regex: /^karol\.stack\(\)\s*$/i,
            handler: () => ({
                type: 'result',
                loading: '\u0141aduj\u0119 stack',
                response: [
                    { text: '  Python', type: 'accent' },
                    '    AutoMargiela, ESPI, Data Science',
                    { text: '  React + TypeScript', type: 'accent' },
                    '    JakiePrawo.pl, Majeranek',
                    { text: '  Claude API + MCP', type: 'accent' },
                    '    JakiePrawo.pl, RAG prawniczy',
                    { text: '  Supabase', type: 'accent' },
                    '    Backend, Edge Functions',
                    { text: '  Raspberry Pi + Tailscale', type: 'accent' },
                    '    W\u0142asny serwer MCP',
                    { text: '  Pandas + Scikit-learn', type: 'accent' },
                    '    Analiza danych, NLP',
                    { text: '  Selenium', type: 'accent' },
                    '    Web scraping, automatyzacja'
                ]
            })
        },
        // ═══ PROJECT DETAILS ═══
        {
            regex: /projekty\.get\(['"](.+)['"]\)/i,
            handler: function(match) {
                const key = match[1].toLowerCase().replace(/\s+/g, '');
                // Aliases
                const aliases = {
                    'jakieprawo': 'jakieprawo', 'jakieprawo.pl': 'jakieprawo',
                    'automargiela': 'automargiela', 'margiela': 'automargiela',
                    'majeranek': 'majeranek',
                    'aigets': 'aigets', 'aigets.me': 'aigets', 'whoisi': 'aigets',
                    'espi': 'espi', 'prognozy': 'espi',
                    'notebooks': 'notebooks', 'ds': 'notebooks', 'datascience': 'notebooks'
                };
                const projectKey = aliases[key];
                if (!projectKey || !LegalConsole.projectData[projectKey]) {
                    return {
                        type: 'error-response',
                        loading: 'Szukam projektu',
                        response: [
                            { text: `Nie znaleziono projektu: "${match[1]}"`, type: 'error' },
                            '',
                            '  Dost\u0119pne projekty:',
                            { text: '    jakieprawo, automargiela, majeranek,', type: 'dim' },
                            { text: '    aigets, espi, notebooks', type: 'dim' }
                        ]
                    };
                }

                const p = LegalConsole.projectData[projectKey];
                const lines = [
                    { text: `  ${p.name}`, type: 'accent' },
                    { text: `  ${p.badge}`, type: 'dim' },
                    ''
                ];
                p.desc.forEach(d => lines.push(d));
                lines.push('');
                lines.push({ text: '  Stack:', type: 'accent' });
                lines.push(`    ${p.stack}`);
                if (p.ai) {
                    lines.push({ text: '  AI:', type: 'accent' });
                    lines.push(`    ${p.ai}`);
                }
                if (p.infra) {
                    lines.push({ text: '  Infra:', type: 'accent' });
                    lines.push(`    ${p.infra}`);
                }
                if (p.features) {
                    lines.push({ text: '  Funkcje:', type: 'accent' });
                    p.features.forEach(f => lines.push(`    \u2022 ${f}`));
                }
                lines.push('');
                lines.push({ text: `  \u2192 ${p.link}`, type: 'accent' });

                return {
                    type: 'result',
                    loading: `\u0141aduj\u0119 ${p.name}`,
                    response: lines
                };
            }
        },

        // ═══ LEGAL COMMANDS ═══
        {
            regex: /ISAP\.find\(['"](.+)['"]\)/i,
            handler: (match) => {
                const query = match[1].toLowerCase();
                let results;
                if (query.includes('ai') || query.includes('sztuczn')) {
                    results = [
                        '  [1] Rozporz\u0105dzenie AI Act (2024/1689)',
                        '      Dz.Urz. UE L 2024/1689',
                        '  [2] Ustawa o systemach AI (projekt)',
                        '      Sejm RP, druk nr ...',
                        '  [3] Krajowy Plan Dzia\u0142a\u0144 ws. AI',
                        '      RM, 2021'
                    ];
                } else if (query.includes('dane') || query.includes('rodo') || query.includes('ochrona')) {
                    results = [
                        '  [1] Ustawa o ochronie danych osobowych',
                        '      Dz.U. 2019 poz. 1781',
                        '  [2] Rozporz\u0105dzenie RODO (2016/679)',
                        '      Dz.Urz. UE L 119',
                        '  [3] Ustawa o krajowym systemie cyberbezp.',
                        '      Dz.U. 2018 poz. 1560'
                    ];
                } else if (query.includes('zam\u00f3w') || query.includes('przetarg')) {
                    results = [
                        '  [1] Prawo zam\u00f3wie\u0144 publicznych',
                        '      Dz.U. 2022 poz. 1710',
                        '  [2] Ustawa o umowie koncesji',
                        '      Dz.U. 2023 poz. 1890',
                        '  [3] Rozp. ws. warunk\u00f3w technicznych',
                        '      Dz.U. 2021 poz. 2049'
                    ];
                } else {
                    results = [
                        '  [1] Ustawa o ochronie danych osobowych',
                        '      Dz.U. 2019 poz. 1781',
                        '  [2] Rozporz\u0105dzenie RODO (2016/679)',
                        '      Dz.Urz. UE L 119',
                        '  [3] Ustawa o krajowym systemie cyberbezp.',
                        '      Dz.U. 2018 poz. 1560'
                    ];
                }

                return {
                    type: 'result',
                    loading: 'Przeszukuj\u0119 baz\u0119 ISAP',
                    response: [
                        `Znaleziono akty prawne dla: "${match[1]}"`,
                        '',
                        ...results,
                        '',
                        { text: '  U\u017cyj prawo.art(nr, \'nazwa\') po artyku\u0142', type: 'dim' }
                    ]
                };
            }
        },
        {
            regex: /Claude\.ask\(['"](.+)['"]\)/i,
            handler: (match) => {
                const q = match[1].toLowerCase();
                let answer;
                if (q.includes('rodo') || q.includes('gdpr') || q.includes('dane osobowe')) {
                    answer = 'RODO (2016/679) \u2014 unijne prawo ochrony danych osobowych. Zasady: minimalizacja danych, zgoda, prawo do bycia zapomnianym, prawo dost\u0119pu. Zg\u0142aszanie narusze\u0144 w 72h.';
                } else if (q.includes('ai act') || q.includes('akt o ai')) {
                    answer = 'AI Act (2024/1689) reguluje systemy AI w UE. 4 poziomy ryzyka: niedopuszczalne, wysokie, ograniczone, minimalne. Art. 57 wymaga piaskownic regulacyjnych w ka\u017cdym pa\u0144stwie.';
                } else if (q.includes('piaskown') || q.includes('sandbox')) {
                    answer = 'Piaskownice regulacyjne AI (Art. 57 AI Act) \u2014 kontrolowane \u015brodowiska do testowania system\u00f3w AI pod nadzorem regulatora, przed wej\u015bciem na rynek.';
                } else if (q.includes('zam\u00f3w') || q.includes('przetarg')) {
                    answer = 'Prawo zam\u00f3wie\u0144 publicznych (Dz.U. 2022 poz. 1710) \u2014 reguluje udzielanie zam\u00f3wie\u0144 przez podmioty publiczne. Tryby: przetarg nieograniczony, ograniczony, negocjacje, dialog konkurencyjny.';
                } else {
                    answer = `W polskim systemie prawnym kluczowe \u017ar\u00f3d\u0142a to: Konstytucja RP, ustawy, rozporz\u0105dzenia i akty prawa UE. Spr\u00f3buj ISAP.find() dla konkretnych akt\u00f3w.`;
                }
                return {
                    type: 'ai',
                    loading: 'Claude analizuje pytanie',
                    response: [
                        { text: 'Claude AI:', type: 'accent' },
                        answer
                    ]
                };
            }
        },
        {
            regex: /prawo\.art\((\d+),\s*['"](.+)['"]\)/i,
            handler: (match) => ({
                type: 'result',
                loading: 'Pobieram tre\u015b\u0107 artyku\u0142u',
                response: [
                    { text: `Art. ${match[1]} - ${match[2]}`, type: 'accent' },
                    '',
                    match[2].toLowerCase().includes('rodo')
                        ? '"Przetwarzanie jest zgodne z prawem wy\u0142\u0105cznie w przypadkach, gdy \u2013 i w takim zakresie, w jakim \u2013 spe\u0142niony jest co najmniej jeden z warunk\u00f3w..."'
                        : match[2].toLowerCase().includes('ai act')
                        ? '"Pa\u0144stwa cz\u0142onkowskie zapewniaj\u0105 utworzenie co najmniej jednej piaskownicy regulacyjnej na szczeblu krajowym, kt\u00f3ra jest operacyjna..."'
                        : '"Ka\u017cdy ma prawo do ochrony dotycz\u0105cych go danych osobowych. Przetwarzanie danych wymaga podstawy prawnej okre\u015blonej w ustawie."',
                    '',
                    { text: '  \u0179r\u00f3d\u0142o: isap.sejm.gov.pl', type: 'dim' }
                ]
            })
        },
        {
            regex: /cats\.show\(['"]?(Pimpek|Fryderyk|Both)['"]?\)/i,
            handler: (match) => {
                const cat = match[1].toLowerCase();
                return {
                    type: 'easter-egg',
                    loading: '\u0141aduj\u0119 koty...',
                    cat: cat
                };
            }
        }
    ],

    init() {
        if (!this.output || !this.input) return;

        // Input handlers
        this.input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                this.execute(this.input.value);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                this.navigateHistory(-1);
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                this.navigateHistory(1);
            }
        });

        this.runBtn?.addEventListener('click', () => {
            this.execute(this.input.value);
        });

        // Command button handlers
        this.cmdButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const cmd = btn.getAttribute('data-cmd');
                this.input.value = cmd;
                this.input.focus();
                this.execute(cmd);
            });
        });

        // Auto-demo after 3 seconds
        setTimeout(() => this.runDemo(), 3000);
    },

    async execute(command) {
        command = command.trim();
        if (!command) return;

        // Add to history
        this.history.push(command);
        this.historyIndex = this.history.length;

        // Clear input
        this.input.value = '';

        // Show command
        this.addLine('command', `${this.prompt} ${command}`);

        // Check for clear command
        if (command.toLowerCase() === 'clear') {
            this.output.innerHTML = '';
            return;
        }

        // Check static commands
        const staticCmd = this.commands[command.toLowerCase()];
        if (staticCmd) {
            await this.delay(300);
            this.renderResponse(staticCmd.response, 'system');
            this.addLine('blank');
            return;
        }

        // Check pattern commands
        for (const pattern of this.patterns) {
            const match = command.match(pattern.regex);
            if (match) {
                const result = pattern.handler(match);

                // Show loading
                const loadingLine = this.addLine('loading', result.loading);
                await this.delay(800 + Math.random() * 700);
                loadingLine.remove();

                // Handle easter egg (cats)
                if (result.type === 'easter-egg' && result.cat) {
                    this.showCatEasterEgg(result.cat);
                    return;
                }

                // Determine default line type
                const lineType = result.type === 'ai' ? 'ai-response'
                    : result.type === 'error-response' ? 'system'
                    : 'result';

                this.renderResponse(result.response, lineType);
                this.addLine('blank');
                return;
            }
        }

        // Unknown command
        await this.delay(200);
        this.addLine('error', `Nieznana komenda: ${command}`);
        this.addLine('system', 'Wpisz "help" aby zobaczy\u0107 dost\u0119pne komendy');
        this.addLine('blank');
    },

    // Render mixed-type response arrays (batched DOM update)
    renderResponse(response, defaultType) {
        const fragment = document.createDocumentFragment();
        response.forEach(item => {
            if (typeof item === 'object' && item !== null) {
                fragment.appendChild(this.createLine(item.type || defaultType, item.text || ' '));
            } else {
                fragment.appendChild(this.createLine(defaultType, item || ' '));
            }
        });
        this.output.appendChild(fragment);
        this.output.scrollTop = this.output.scrollHeight;
    },

    createLine(type, content = '') {
        const line = document.createElement('div');
        line.className = `console-line ${type}`;

        if (type === 'command') {
            line.innerHTML = `<span class="line-prefix">\u276f</span><span>${this.escapeHtml(content.replace(this.prompt + ' ', ''))}</span>`;
        } else if (content) {
            line.innerHTML = `<span>${this.escapeHtml(content)}</span>`;
        }

        return line;
    },

    addLine(type, content = '') {
        const line = this.createLine(type, content);
        this.output.appendChild(line);
        this.output.scrollTop = this.output.scrollHeight;
        return line;
    },

    navigateHistory(direction) {
        const newIndex = this.historyIndex + direction;
        if (newIndex >= 0 && newIndex < this.history.length) {
            this.historyIndex = newIndex;
            this.input.value = this.history[newIndex];
        } else if (newIndex >= this.history.length) {
            this.historyIndex = this.history.length;
            this.input.value = '';
        }
    },

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },

    async runDemo() {
        // Only run demo if no user interaction yet and motion is allowed
        if (this.history.length > 0 || prefersReducedMotion) return;

        const demoCommand = "ISAP.find('AI Act')";

        // Type command character by character
        for (let i = 0; i <= demoCommand.length; i++) {
            this.input.value = demoCommand.substring(0, i);
            await this.delay(50 + Math.random() * 30);
        }

        await this.delay(500);
        this.execute(demoCommand);
    },

    showCatEasterEgg(cat) {
        // Store previously focused element to restore focus on close
        const previouslyFocused = document.activeElement;

        // Create overlay
        const overlay = document.createElement('div');
        overlay.className = 'cat-easter-egg-overlay';
        overlay.setAttribute('role', 'dialog');
        overlay.setAttribute('aria-modal', 'true');
        overlay.setAttribute('aria-label', 'Zdj\u0119cia kot\u00f3w');

        const container = document.createElement('div');
        container.className = 'cat-easter-egg-container';

        const closeBtn = document.createElement('button');
        closeBtn.className = 'cat-easter-egg-close';
        closeBtn.innerHTML = '\u00d7';
        closeBtn.setAttribute('aria-label', 'Zamknij');

        const closeModal = () => {
            overlay.remove();
            document.removeEventListener('keydown', keyHandler);
            // Restore focus to previously focused element
            if (previouslyFocused && previouslyFocused.focus) {
                previouslyFocused.focus();
            }
        };

        closeBtn.onclick = closeModal;

        const content = document.createElement('div');
        content.className = 'cat-easter-egg-content';

        const catNames = {
            'pimpek': 'Pimpek',
            'fryderyk': 'Fryderyk',
            'both': 'Pimpek & Fryderyk'
        };

        const title = document.createElement('h3');
        title.className = 'cat-easter-egg-title';
        title.textContent = `\ud83d\udc31 ${catNames[cat]} \ud83d\udc31`;

        const imageContainer = document.createElement('div');
        imageContainer.className = 'cat-easter-egg-images';

        if (cat === 'both') {
            ['pimpek', 'fryderyk'].forEach(name => {
                const img = document.createElement('img');
                img.src = `assets/images/cats/${name}.jpg`;
                img.alt = name.charAt(0).toUpperCase() + name.slice(1);
                img.className = 'cat-easter-egg-img';
                imageContainer.appendChild(img);
            });
        } else {
            const img = document.createElement('img');
            img.src = `assets/images/cats/${cat}.jpg`;
            img.alt = catNames[cat];
            img.className = 'cat-easter-egg-img cat-easter-egg-img-single';
            imageContainer.appendChild(img);
        }

        const subtitle = document.createElement('p');
        subtitle.className = 'cat-easter-egg-subtitle';
        subtitle.textContent = 'Sekretni asystenci prawni \ud83d\udc3e';

        content.appendChild(title);
        content.appendChild(imageContainer);
        content.appendChild(subtitle);
        container.appendChild(closeBtn);
        container.appendChild(content);
        overlay.appendChild(container);
        document.body.appendChild(overlay);

        // Focus the close button for keyboard accessibility
        closeBtn.focus();

        // Add line to console
        this.addLine('system', `\ud83d\udc31 Easter egg unlocked: ${catNames[cat]}!`);
        this.addLine('blank');

        // Close on overlay click
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) closeModal();
        });

        // Keyboard handler for Escape and focus trap
        const keyHandler = (e) => {
            if (e.key === 'Escape') {
                closeModal();
            }
            // Focus trap - keep focus within modal
            if (e.key === 'Tab') {
                // Only one focusable element (close button), so trap focus there
                e.preventDefault();
                closeBtn.focus();
            }
        };
        document.addEventListener('keydown', keyHandler);
    }
};

// Initialize console
LegalConsole.init();

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
        const tabs = document.querySelectorAll('.hero-tab');
        const panels = document.querySelectorAll('.hero-tab-panel');
        if (!tabs.length) return;

        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const target = document.getElementById('panel-' + tab.dataset.tab);
                if (target.classList.contains('active')) return;

                tabs.forEach(t => {
                    t.classList.remove('active');
                    t.setAttribute('aria-selected', 'false');
                });
                panels.forEach(p => p.classList.remove('active'));

                tab.classList.add('active');
                tab.setAttribute('aria-selected', 'true');

                // Force animation restart
                target.style.animation = 'none';
                target.offsetHeight; // trigger reflow
                target.style.animation = '';
                target.classList.add('active');
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

        // Re-align the overlaid mobile controls when the layout changes size.
        window.addEventListener('resize', () => {
            if (this._rAF) cancelAnimationFrame(this._rAF);
            this._rAF = requestAnimationFrame(() => this.positionMobileControls());
        }, { passive: true });

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
        // Strzałki: środek całego boxa slajdu (nie samego zdjęcia).
        const slideRect = slide.getBoundingClientRect();
        this.carousel.style.setProperty('--sc-arrow-top', (slideRect.top - carTop + slideRect.height / 2) + 'px');
        // Licznik 01/05: nadal w rogu zdjęcia.
        const stage = slide.querySelector('.showcase-stage');
        if (stage) {
            const sr = stage.getBoundingClientRect();
            this.carousel.style.setProperty('--sc-badge-top', (sr.top - carTop + 12) + 'px');
        }
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
        this._startAutoplay = () => {
            this.stopAutoplay();
            this.timer = setInterval(() => { if (!this.paused) this.next(); }, this.delay);
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
