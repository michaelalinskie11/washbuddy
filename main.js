import './style.css'

console.log("WashBuddy v2.0 initialized");

// ---- Navbar scroll effect ----
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });

// ---- Active nav link on scroll ----
const sections = document.querySelectorAll('section[id], div[id="home"]');
const navLinks = document.querySelectorAll('.nav-links a');

const observerOptions = { rootMargin: '-40% 0px -55% 0px' };
const sectionObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            navLinks.forEach(link => {
                link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`);
            });
        }
    });
}, observerOptions);

document.querySelectorAll('section[id]').forEach(s => sectionObserver.observe(s));

// ---- Smooth scroll for anchor links ----
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href === '#') return;
        const target = document.querySelector(href);
        if (target) {
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

// ---- GSAP Animations ----
if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);

    // Hero entrance animations
    const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    heroTl
        .from('.pill-badge',     { y: 20, opacity: 0, duration: 0.6 })
        .from('.hero-title',     { y: 40, opacity: 0, duration: 0.8 }, '-=0.3')
        .from('.hero-subtitle',  { y: 30, opacity: 0, duration: 0.7 }, '-=0.4')
        .from('.hero-cta > *',   { y: 20, opacity: 0, duration: 0.5, stagger: 0.15 }, '-=0.4')
        .from('.hero-stats',     { y: 20, opacity: 0, duration: 0.5 }, '-=0.3')
        .from('.app-card-hero',  { x: 40, opacity: 0, duration: 0.9, ease: 'back.out(1.2)' }, '-=0.7')
        .from('.float-card',     { scale: 0.8, opacity: 0, duration: 0.5, stagger: 0.2 }, '-=0.5');

    // Counter animation
    document.querySelectorAll('.counter').forEach(counter => {
        const target = +counter.getAttribute('data-target');
        const suffix = counter.querySelector('span') ? counter.querySelector('span').outerHTML : '';
        ScrollTrigger.create({
            trigger: counter,
            start: 'top 85%',
            once: true,
            onEnter: () => {
                let obj = { val: 0 };
                gsap.to(obj, {
                    val: target,
                    duration: 2,
                    ease: 'power2.out',
                    onUpdate: () => {
                        counter.innerHTML = Math.ceil(obj.val).toLocaleString('id-ID') + suffix;
                    }
                });
            }
        });
    });

    // Generic scroll reveals
    gsap.utils.toArray('.reveal-up').forEach(el => {
        gsap.from(el, {
            y: 40, opacity: 0, duration: 0.75, ease: 'power2.out',
            scrollTrigger: { trigger: el, start: 'top 85%', once: true }
        });
    });
    gsap.utils.toArray('.reveal-left').forEach(el => {
        gsap.from(el, {
            x: -40, opacity: 0, duration: 0.8, ease: 'power2.out',
            scrollTrigger: { trigger: el, start: 'top 85%', once: true }
        });
    });
    gsap.utils.toArray('.reveal-right').forEach(el => {
        gsap.from(el, {
            x: 40, opacity: 0, duration: 0.8, ease: 'power2.out',
            scrollTrigger: { trigger: el, start: 'top 85%', once: true }
        });
    });

    // Step cards stagger
    gsap.from('.step-card', {
        y: 50, opacity: 0, duration: 0.7, stagger: 0.15, ease: 'back.out(1.2)',
        scrollTrigger: { trigger: '.steps-grid', start: 'top 80%', once: true }
    });

    // Service cards stagger
    gsap.from('.service-card', {
        y: 40, opacity: 0, duration: 0.6, stagger: 0.1, ease: 'power2.out',
        scrollTrigger: { trigger: '.services-grid', start: 'top 80%', once: true }
    });
}

// ---- Auth Modal ----
const authModal = document.getElementById('auth-modal');
const closeAuth = document.getElementById('close-auth');

document.querySelectorAll('.auth-trigger').forEach(btn => {
    btn.addEventListener('click', e => {
        e.preventDefault();
        authModal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    });
});

function closeModal() {
    authModal.classList.add('hidden');
    document.body.style.overflow = '';
}

if (closeAuth) closeAuth.addEventListener('click', closeModal);
authModal.addEventListener('click', e => {
    if (e.target === authModal) closeModal();
});
document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !authModal.classList.contains('hidden')) closeModal();
});

// ---- Mobile Menu ----
window.toggleMobileMenu = function() {
    const menu = document.getElementById('mobile-menu');
    const btn = document.getElementById('hamburger');
    if (!menu) return;
    const isOpen = menu.classList.contains('open');
    menu.classList.toggle('open', !isOpen);
    if (btn) {
        btn.innerHTML = isOpen
            ? '<i class="ph-bold ph-list"></i>'
            : '<i class="ph-bold ph-x"></i>';
    }
};

// Close mobile menu on outside click
document.addEventListener('click', e => {
    const menu = document.getElementById('mobile-menu');
    const btn = document.getElementById('hamburger');
    if (menu && menu.classList.contains('open') && !menu.contains(e.target) && !btn?.contains(e.target)) {
        menu.classList.remove('open');
        if (btn) btn.innerHTML = '<i class="ph-bold ph-list"></i>';
    }
});

// ---- Subtle card hover tilt (only on desktop) ----
if (window.matchMedia('(hover: hover)').matches) {
    document.querySelectorAll('.service-card, .step-card, .track-panel').forEach(card => {
        card.addEventListener('mousemove', e => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const cx = rect.width / 2;
            const cy = rect.height / 2;
            const rx = ((y - cy) / cy) * -4;
            const ry = ((x - cx) / cx) * 4;
            card.style.transform = `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-4px)`;
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
        });
    });
}
