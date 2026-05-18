import './style.css'

console.log("WashBuddy Elite App Initialized!");

// Navbar scroll effect
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if(target) {
            target.scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});

// GSAP ScrollTrigger Animations
if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);

    // Advanced Text Splitting Animation for Hero Title
    const title = document.querySelector('.hero-title');
    if(title) {
        // Save the gradient span if any, but since it's hard to split HTML, let's do a simple word/char wrap for text nodes only.
        // Actually, the easiest modern reveal is a line mask reveal:
        gsap.fromTo('.hero-title', 
            { y: 100, opacity: 0, clipPath: 'polygon(0 0, 100% 0, 100% 0, 0 0)' }, 
            { y: 0, opacity: 1, clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)', duration: 1.5, ease: 'power4.out', delay: 0.2 }
        );
        
        // Let's add a glowing pulse effect to the gradient text specifically
        gsap.to('.hero-title .text-gradient', {
            textShadow: "0 0 20px rgba(0,229,255,0.8)",
            duration: 1.5,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut"
        });
    }
    gsap.fromTo('.hero-subtitle', 
        { y: 50, opacity: 0 }, 
        { y: 0, opacity: 1, duration: 1, ease: 'power3.out', delay: 0.5 }
    );
    gsap.fromTo('.hero-cta button', 
        { y: 30, opacity: 0 }, 
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.2, ease: 'back.out(1.5)', delay: 0.7 }
    );
    
    // Animate stats counter
    const counters = document.querySelectorAll('.counter');
    counters.forEach(counter => {
        const target = +counter.getAttribute('data-target');
        ScrollTrigger.create({
            trigger: counter,
            start: "top 85%",
            once: true,
            onEnter: () => {
                let obj = { val: 0 };
                gsap.to(obj, {
                    val: target,
                    duration: 2,
                    ease: "power2.out",
                    onUpdate: () => {
                        counter.innerText = Math.ceil(obj.val);
                    }
                });
            }
        });
    });

    // Bento Grid Reveal
    gsap.utils.toArray('.bento-item').forEach((item, i) => {
        gsap.fromTo(item, 
            { y: 100, opacity: 0, scale: 0.9 },
            { 
                y: 0, opacity: 1, scale: 1, 
                duration: 0.8, 
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: item,
                    start: 'top 85%',
                    toggleActions: 'play none none reverse'
                }
            }
        );
    });

    // Marquee / Running Text Parallax
    gsap.to('.marquee-content', {
        xPercent: -20,
        ease: 'none',
        scrollTrigger: {
            trigger: '.trusted-by',
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1
        }
    });

    // Glass Panel scale up
    gsap.utils.toArray('.glass-panel').forEach(panel => {
        gsap.fromTo(panel,
            { opacity: 0, y: 50, rotateX: 10 },
            { 
                opacity: 1, y: 0, rotateX: 0, 
                duration: 1, 
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: panel,
                    start: 'top 80%'
                }
            }
        );
    });
}

// Mouse tracking for Bento Grid glow effect
document.querySelectorAll('.bento-item').forEach(item => {
    item.addEventListener('mousemove', e => {
        const rect = item.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        item.style.setProperty('--mouse-x', `${x}px`);
        item.style.setProperty('--mouse-y', `${y}px`);
    });
});

// Auth Modal Logic
const authTriggers = document.querySelectorAll('.auth-trigger');
const authModal = document.getElementById('auth-modal');
const closeAuth = document.getElementById('close-auth');
authTriggers.forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        authModal.classList.remove('hidden');
    });
});
closeAuth.addEventListener('click', () => {
    authModal.classList.add('hidden');
});
authModal.addEventListener('click', (e) => {
    if(e.target === authModal) authModal.classList.add('hidden');
});

// 3D Tilt Effect for Glass Cards
document.querySelectorAll('.glass-panel, .bento-item').forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = ((y - centerY) / centerY) * -10;
        const rotateY = ((x - centerX) / centerX) * 10;
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
    });
    card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
    });
});
