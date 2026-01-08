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
// SCROLL REVEAL ANIMATIONS
// ================================================
const revealElements = document.querySelectorAll(
    '.skill-card, .project-card, .contact-link, .education-list li, .stack-category'
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
    }
};

// Initialize console
LegalConsole.init();
