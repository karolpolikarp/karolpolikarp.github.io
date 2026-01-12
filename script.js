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
// PARALLAX EFFECT
// ================================================
const ParallaxEffect = {
    shapes: document.querySelectorAll('.floating-shape.parallax'),

    init() {
        if (window.innerWidth <= 768) return;

        document.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        window.addEventListener('scroll', () => this.handleScroll());
    },

    handleMouseMove(e) {
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        const mouseX = e.clientX - centerX;
        const mouseY = e.clientY - centerY;

        this.shapes.forEach(shape => {
            const speed = parseFloat(shape.dataset.speed) || 0.05;
            const x = mouseX * speed;
            const y = mouseY * speed;
            shape.style.transform = `translate(${x}px, ${y}px)`;
        });
    },

    handleScroll() {
        const scrollY = window.pageYOffset;
        this.shapes.forEach(shape => {
            const speed = parseFloat(shape.dataset.speed) || 0.05;
            const y = scrollY * speed * 0.5;
            const currentTransform = shape.style.transform || '';
            const baseTransform = currentTransform.replace(/translateY\([^)]*\)/, '');
            shape.style.transform = `${baseTransform} translateY(${y}px)`;
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
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// ================================================
// COUNTER ANIMATION
// ================================================
const animateCounters = () => {
    const counters = document.querySelectorAll('.stat-number');

    counters.forEach(counter => {
        const target = parseInt(counter.getAttribute('data-target'));
        const duration = 2000;
        const increment = target / (duration / 16);
        let current = 0;

        const updateCounter = () => {
            current += increment;
            if (current < target) {
                counter.textContent = Math.ceil(current);
                requestAnimationFrame(updateCounter);
            } else {
                counter.textContent = target;
            }
        };

        updateCounter();
    });
};

// Trigger counters when stats section is visible
const statsSection = document.querySelector('.stats');
let countersAnimated = false;

if (statsSection) {
    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !countersAnimated) {
                countersAnimated = true;
                animateCounters();
            }
        });
    }, { threshold: 0.5 });

    statsObserver.observe(statsSection);
}

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
    init() {
        if (window.innerWidth <= 768) return;

        const buttons = document.querySelectorAll('.btn-primary, .btn-secondary');

        buttons.forEach(btn => {
            btn.addEventListener('mousemove', (e) => {
                const rect = btn.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;

                btn.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
            });

            btn.addEventListener('mouseleave', () => {
                btn.style.transform = '';
            });
        });
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
// LEGAL CONSOLE - Interactive Terminal
// ================================================
const LegalConsole = {
    output: document.getElementById('consoleOutput'),
    input: document.getElementById('consoleInput'),
    runBtn: document.getElementById('consoleRun'),
    cmdButtons: document.querySelectorAll('.cmd-btn'),
    history: [],
    historyIndex: -1,

    // Simulated command responses
    commands: {
        'help': {
            type: 'system',
            response: [
                'Dostępne komendy:',
                '  ISAP.find(query)     - Szukaj w bazie aktów prawnych',
                '  Claude.ask(question) - Zapytaj AI o prawo',
                '  prawo.art(nr, akt)   - Pobierz konkretny artykuł',
                '  clear                - Wyczyść konsolę',
                '  about                - O konsoli prawnej'
            ]
        },
        'clear': {
            type: 'action',
            action: 'clear'
        },
        'about': {
            type: 'system',
            response: [
                'Konsola Prawna v2.0',
                'Autor: Karol Polikarp Wilczyński',
                'Stack: Python + Claude API + ISAP + Supabase',
                'Projekt: jakieprawo.pl'
            ]
        }
    },

    // Patterns for dynamic commands
    patterns: [
        {
            regex: /ISAP\.find\(['"](.+)['"]\)/i,
            handler: (match) => ({
                type: 'result',
                loading: 'Przeszukuję bazę ISAP',
                response: [
                    `Znaleziono akty prawne dla: "${match[1]}"`,
                    '',
                    `  [1] Ustawa o ochronie danych osobowych`,
                    `      Dz.U. 2019 poz. 1781`,
                    `  [2] Rozporządzenie RODO (2016/679)`,
                    `      Dz.Urz. UE L 119`,
                    `  [3] Ustawa o krajowym systemie cyberbezpieczeństwa`,
                    `      Dz.U. 2018 poz. 1560`,
                    '',
                    `Użyj prawo.art(nr, 'nazwa') aby pobrać artykuł`
                ]
            })
        },
        {
            regex: /Claude\.ask\(['"](.+)['"]\)/i,
            handler: (match) => ({
                type: 'ai',
                loading: 'Claude analizuje pytanie',
                response: [
                    `Claude AI odpowiada:`,
                    '',
                    match[1].toLowerCase().includes('rodo')
                        ? `RODO (Rozporządzenie 2016/679) to unijne prawo ochrony danych osobowych. Kluczowe zasady: minimalizacja danych, zgoda, prawo do bycia zapomnianym, prawo dostępu. Administratorzy muszą zgłaszać naruszenia w 72h.`
                        : match[1].toLowerCase().includes('ai act')
                        ? `AI Act to rozporządzenie UE regulujące systemy AI. Wprowadza 4 poziomy ryzyka: niedopuszczalne (zakaz), wysokie (wymogi zgodności), ograniczone (transparentność), minimalne (bez ograniczeń).`
                        : `Analizuję pytanie: "${match[1]}". W polskim systemie prawnym kluczowe są: Konstytucja RP, ustawy, rozporządzenia i akty prawa UE. Sprawdź ISAP.find() dla szczegółów.`
                ]
            })
        },
        {
            regex: /prawo\.art\((\d+),\s*['"](.+)['"]\)/i,
            handler: (match) => ({
                type: 'result',
                loading: 'Pobieram treść artykułu',
                response: [
                    `Art. ${match[1]} - ${match[2]}`,
                    '',
                    match[2].toLowerCase().includes('rodo')
                        ? `"Przetwarzanie jest zgodne z prawem wyłącznie w przypadkach, gdy – i w takim zakresie, w jakim – spełniony jest co najmniej jeden z warunków..."`
                        : `"Każdy ma prawo do ochrony dotyczących go danych osobowych. Przetwarzanie danych wymaga podstawy prawnej określonej w ustawie."`,
                    '',
                    `Źródło: isap.sejm.gov.pl`
                ]
            })
        },
        {
            regex: /cats\.show\(['"]?(Pimpek|Fryderyk|Both)['"]?\)/i,
            handler: (match) => {
                const cat = match[1].toLowerCase();
                return {
                    type: 'easter-egg',
                    loading: 'Ładuję koty...',
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
        this.addLine('command', `prawo@isap:~$ ${command}`);

        // Check for clear command
        if (command.toLowerCase() === 'clear') {
            this.output.innerHTML = '';
            return;
        }

        // Check static commands
        const staticCmd = this.commands[command.toLowerCase()];
        if (staticCmd) {
            await this.delay(300);
            staticCmd.response.forEach(line => {
                this.addLine('system', line || ' ');
            });
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

                // Show result
                const lineType = result.type === 'ai' ? 'ai-response' : 'result';
                result.response.forEach(line => {
                    this.addLine(lineType, line || ' ');
                });
                this.addLine('blank');
                return;
            }
        }

        // Unknown command
        await this.delay(200);
        this.addLine('error', `Nieznana komenda: ${command}`);
        this.addLine('system', 'Wpisz "help" aby zobaczyć dostępne komendy');
        this.addLine('blank');
    },

    addLine(type, content = '') {
        const line = document.createElement('div');
        line.className = `console-line ${type}`;

        if (type === 'command') {
            line.innerHTML = `<span class="line-prefix">></span><span>${this.escapeHtml(content.replace('prawo@isap:~$ ', ''))}</span>`;
        } else if (type === 'loading') {
            line.innerHTML = `<span>${content}</span>`;
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

        const demoCommand = "ISAP.find('ochrona danych')";

        // Type command character by character
        for (let i = 0; i <= demoCommand.length; i++) {
            this.input.value = demoCommand.substring(0, i);
            await this.delay(50 + Math.random() * 30);
        }

        await this.delay(500);
        this.execute(demoCommand);
    },

    showCatEasterEgg(cat) {
        // Create overlay
        const overlay = document.createElement('div');
        overlay.className = 'cat-easter-egg-overlay';

        const container = document.createElement('div');
        container.className = 'cat-easter-egg-container';

        const closeBtn = document.createElement('button');
        closeBtn.className = 'cat-easter-egg-close';
        closeBtn.innerHTML = '×';
        closeBtn.onclick = () => overlay.remove();

        const content = document.createElement('div');
        content.className = 'cat-easter-egg-content';

        const catNames = {
            'pimpek': 'Pimpek',
            'fryderyk': 'Fryderyk',
            'both': 'Pimpek & Fryderyk'
        };

        const title = document.createElement('h3');
        title.className = 'cat-easter-egg-title';
        title.textContent = `🐱 ${catNames[cat]} 🐱`;

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
        subtitle.textContent = 'Sekretni asystenci prawni 🐾';

        content.appendChild(title);
        content.appendChild(imageContainer);
        content.appendChild(subtitle);
        container.appendChild(closeBtn);
        container.appendChild(content);
        overlay.appendChild(container);
        document.body.appendChild(overlay);

        // Add line to console
        this.addLine('system', `🐱 Easter egg unlocked: ${catNames[cat]}!`);
        this.addLine('blank');

        // Close on overlay click
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) overlay.remove();
        });

        // Close on Escape
        const escHandler = (e) => {
            if (e.key === 'Escape') {
                overlay.remove();
                document.removeEventListener('keydown', escHandler);
            }
        };
        document.addEventListener('keydown', escHandler);
    }
};

// Initialize console
LegalConsole.init();

// ================================================
// EMAIL PROTECTION - Anti-Scraper Obfuscation
// ================================================
const EmailProtection = {
    // Email parts (obfuscated to avoid scraping)
    parts: ['karolp', 'wilczynski', '@', 'gmail', '.', 'com'],

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
        // Reconstruct email from parts
        return this.parts[0] + this.parts[1] + this.parts[2] + this.parts[3] + this.parts[4] + this.parts[5];
    }
};

EmailProtection.init();

// ================================================
// SCROLL PROGRESS INDICATOR
// ================================================
const ScrollProgress = {
    indicator: document.getElementById('scrollProgress'),

    init() {
        if (!this.indicator) return;

        window.addEventListener('scroll', () => this.updateProgress(), { passive: true });
        window.addEventListener('resize', () => this.updateProgress(), { passive: true });
        this.updateProgress();
    },

    updateProgress() {
        const windowHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrolled = (window.scrollY / windowHeight) * 100;
        this.indicator.style.width = `${Math.min(scrolled, 100)}%`;
    }
};

ScrollProgress.init();

// ================================================
// ENHANCED SECTION REVEAL
// ================================================
const SectionReveal = {
    init() {
        const sections = document.querySelectorAll('section');

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('section-visible');

                    // Animate children with stagger
                    const staggerElements = entry.target.querySelectorAll('.stagger-children');
                    staggerElements.forEach(el => {
                        el.classList.add('animated');
                    });
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -100px 0px'
        });

        sections.forEach(section => {
            observer.observe(section);
        });
    }
};

SectionReveal.init();

// ================================================
// PROJECT IMAGE PARALLAX ON MOUSE MOVE
// ================================================
const ProjectParallax = {
    init() {
        if (window.innerWidth <= 768) return;

        const projectCards = document.querySelectorAll('.project-card');

        projectCards.forEach(card => {
            const image = card.querySelector('.project-img');
            if (!image) return;

            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = (e.clientX - rect.left) / rect.width;
                const y = (e.clientY - rect.top) / rect.height;

                // Subtle parallax movement
                const moveX = (x - 0.5) * 10;
                const moveY = (y - 0.5) * 10;

                image.style.transform = `scale(1.08) translate(${moveX}px, ${moveY}px)`;
            });

            card.addEventListener('mouseleave', () => {
                image.style.transform = 'scale(1) translate(0, 0)';
            });
        });

        // Same for blog cards
        const blogCards = document.querySelectorAll('.blog-card');

        blogCards.forEach(card => {
            const image = card.querySelector('.blog-card-img');
            if (!image) return;

            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = (e.clientX - rect.left) / rect.width;
                const y = (e.clientY - rect.top) / rect.height;

                const moveX = (x - 0.5) * 8;
                const moveY = (y - 0.5) * 8;

                image.style.transform = `scale(1.1) translate(${moveX}px, ${moveY}px)`;
            });

            card.addEventListener('mouseleave', () => {
                image.style.transform = 'scale(1) translate(0, 0)';
            });
        });
    }
};

ProjectParallax.init();

// ================================================
// 3D TILT EFFECT ON CARDS
// ================================================
const TiltEffect = {
    init() {
        if (window.innerWidth <= 768) return;

        const tiltElements = document.querySelectorAll('.skill-card, .stack-tech-item');

        tiltElements.forEach(el => {
            el.addEventListener('mousemove', (e) => {
                const rect = el.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                const centerX = rect.width / 2;
                const centerY = rect.height / 2;

                const rotateX = (y - centerY) / 15;
                const rotateY = (centerX - x) / 15;

                el.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px)`;
            });

            el.addEventListener('mouseleave', () => {
                el.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
            });
        });
    }
};

TiltEffect.init();

// ================================================
// SMOOTH SCROLL WITH EASING
// ================================================
const SmoothScroll = {
    init() {
        // Enhanced smooth scroll for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const targetId = this.getAttribute('href');
                const target = document.querySelector(targetId);

                if (target) {
                    const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - 80;

                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }
};

// Initialize after DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    SmoothScroll.init();
});
