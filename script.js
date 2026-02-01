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
        if (window.innerWidth <= 768) return;

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
            '.skill-card, .project-card, .contact-link, .education-list li, .stack-category, .stack-tech-item'
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
        const shouldEnable = window.innerWidth > 768;

        if (shouldEnable && !this.isEnabled) {
            this.enable();
        } else if (!shouldEnable && this.isEnabled) {
            this.disable();
        }
    },

    enable() {
        this.isEnabled = true;
        this.buttons.forEach(btn => {
            const moveHandler = (e) => {
                const rect = btn.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                btn.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
            };
            const leaveHandler = () => {
                btn.style.transform = '';
            };

            btn.addEventListener('mousemove', moveHandler);
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
// NAVBAR SCROLL EFFECT
// ================================================
const nav = document.querySelector('.nav');
let lastScroll = 0;

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;

    if (currentScroll > 100) {
        nav.classList.add('nav-scrolled');
    } else {
        nav.classList.remove('nav-scrolled');
    }

    lastScroll = currentScroll;
});

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
setInterval(updateClock, 1000);

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
            badge: 'Flagowy projekt',
            desc: [
                'Wyszukiwarka podstaw prawnych \u2014 zadaj',
                'pytanie, otrzymaj artyku\u0142, nazw\u0119 aktu,',
                'wyja\u015bnienie i link do tekstu w ISAP.'
            ],
            stack: 'React + TypeScript + Supabase Edge Functions',
            ai: 'Claude API + custom MCP server',
            infra: 'Raspberry Pi + Tailscale',
            features: [
                'Parsowanie PDF z api.sejm.gov.pl',
                'W\u0142asny serwer MCP na Raspberry Pi',
                'RAG dla analizy prawnej'
            ],
            link: 'jakieprawo.pl'
        },
        'majeranek': {
            name: 'Majeranek',
            badge: 'Tier Lists + AI',
            desc: [
                'Aplikacja do tworzenia tier list',
                'i ranking\u00f3w z rekomendacjami AI.',
                'Analiza cross-listowa i drag & drop.'
            ],
            stack: 'TypeScript + React + Supabase',
            ai: 'Rekomendacje na bazie ranking\u00f3w',
            features: [
                'Analiza cross-list (film wg gustu muz.)',
                'Personalizowane rekomendacje AI',
                'Intuicyjny drag & drop'
            ],
            link: 'github.com/karolpolikarp'
        },
        'whoisi': {
            name: 'Whoisi',
            badge: 'Personalized Intelligence',
            desc: [
                'Personalny asystent AI dopasowany',
                'do stylu komunikacji, preferencji',
                'i metody pracy u\u017cytkownika.'
            ],
            stack: 'AI + Personalization + LLM + UX',
            features: [
                'AI uczy si\u0119 stylu komunikacji',
                'Personalizacja workflow',
                'Adaptacyjny interfejs'
            ],
            link: 'Coming Soon'
        },
        'espi': {
            name: 'Prognozy gie\u0142dowe z ESPI',
            badge: 'Data Science',
            desc: [
                'Prognozowanie cen akcji na podstawie',
                'komunikat\u00f3w gie\u0142dowych. Analiza 1200+',
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
        'automargiela': {
            name: 'AutoMargiela',
            badge: 'Automation',
            desc: [
                'Bot automatycznie monitoruj\u0105cy ceny',
                'produkt\u00f3w Maison Margiela.',
                'Selenium + CAPTCHA + powiadomienia.'
            ],
            stack: 'Python + Selenium',
            infra: 'Raspberry Pi hosting',
            features: [
                'Obej\u015bcie CAPTCHA',
                'System powiadomie\u0144',
                'Automatyczny monitoring cen'
            ],
            link: 'github.com/karolpolikarp'
        },
        'notebooks': {
            name: 'Notebooki Data Science',
            badge: 'Uczelniane projekty',
            desc: [
                'Analiza rynku gier wideo (K-means),',
                'analiza Airbnb (feature engineering)',
                'i inne projekty uczelniane.'
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
                    { text: '  [2] Majeranek', type: 'accent' },
                    '      TypeScript + React + AI',
                    '      Tier listy z rekomendacjami AI',
                    '',
                    { text: '  [3] Whoisi', type: 'accent' },
                    '      AI + Personalization + LLM',
                    '      Personalny asystent AI [soon]',
                    '',
                    { text: '  [4] Prognozy ESPI', type: 'accent' },
                    '      Python + GPT-4o + Pandas',
                    '      Prognozowanie z raport\u00f3w gie\u0142dowych',
                    '',
                    { text: '  [5] AutoMargiela', type: 'accent' },
                    '      Python + Selenium',
                    '      Bot monitoruj\u0105cy ceny',
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
                    'majeranek': 'majeranek',
                    'whoisi': 'whoisi',
                    'espi': 'espi', 'prognozy': 'espi',
                    'automargiela': 'automargiela', 'margiela': 'automargiela',
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
                            { text: '    jakieprawo, majeranek, whoisi,', type: 'dim' },
                            { text: '    espi, automargiela, notebooks', type: 'dim' }
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

    // Render mixed-type response arrays
    renderResponse(response, defaultType) {
        response.forEach(item => {
            if (typeof item === 'object' && item !== null) {
                this.addLine(item.type || defaultType, item.text || ' ');
            } else {
                this.addLine(defaultType, item || ' ');
            }
        });
    },

    addLine(type, content = '') {
        const line = document.createElement('div');
        line.className = `console-line ${type}`;

        if (type === 'command') {
            line.innerHTML = `<span class="line-prefix">\u276f</span><span>${this.escapeHtml(content.replace(this.prompt + ' ', ''))}</span>`;
        } else if (type === 'loading') {
            line.innerHTML = `<span>${this.escapeHtml(content)}</span>`;
        } else if (content) {
            line.innerHTML = `<span>${this.escapeHtml(content)}</span>`;
        }

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
        // Only run demo if no user interaction yet
        if (this.history.length > 0) return;

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
        const newsletterLink = document.getElementById('newsletterLink');

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

        if (newsletterLink) {
            newsletterLink.addEventListener('click', (e) => {
                e.preventDefault();
                const email = this.decode();
                window.location.href = 'mailto:' + email + '?subject=Newsletter%20-%20Zapisuję%20się';
            });
        }
    },

    decode() {
        // Reconstruct email from character codes
        return String.fromCharCode(...this.encoded);
    }
};

EmailProtection.init();
