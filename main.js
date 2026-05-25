// =====================================================
// WASHBUDDY LANDING PAGE JS v11 — CINEMATIC PARALLAX
// =====================================================

// --- 1. Navbar & Smooth Scroll ---
window.addEventListener('scroll', () => {
  const nav = document.getElementById('navbar');
  if (window.scrollY > 50) nav.classList.add('scrolled');
  else nav.classList.remove('scrolled');
});

document.querySelectorAll('.nav-links a').forEach(link => {
  link.addEventListener('click', e => {
    const targetId = link.getAttribute('href');
    if (targetId && targetId.startsWith('#')) {
      e.preventDefault();
      const target = document.querySelector(targetId);
      if (target) {
        window.scrollTo({ top: target.offsetTop - 85, behavior: 'smooth' });
        document.querySelectorAll('.nav-links a').forEach(l => l.classList.remove('active'));
        link.classList.add('active');
      }
    }
  });
});

// --- 2. Parallax Scroll Engine ---
const parallaxLayers = document.querySelectorAll('.p-layer');
const parallaxDrum = document.getElementById('parallax-drum');

window.addEventListener('scroll', () => {
  const scrollY = window.scrollY;

  // Move layers (clothes and bubbles)
  parallaxLayers.forEach(layer => {
    const speed = layer.getAttribute('data-speed') || 0.5;
    const yPos = -(scrollY * speed);
    layer.style.transform = `translateY(${yPos}px)`;
  });

  // Spin the washing machine drum
  if (parallaxDrum) {
    const rotation = scrollY * 0.1; // Rotate based on scroll
    parallaxDrum.style.transform = `rotate(${rotation}deg)`;
  }
});

// --- 3. Scroll Animations (Fade In Up) ---
const observerOptions = { threshold: 0.1, rootMargin: "0px 0px -50px 0px" };
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  });
}, observerOptions);

document.querySelectorAll('.animate-fade-in-up').forEach(el => {
  observer.observe(el);
});

// --- 4. Number Counter Animation ---
const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el = entry.target;
      const target = parseInt(el.getAttribute('data-target'));
      let count = 0;
      const speed = target / 50; // Total 50 frames
      
      const updateCount = () => {
        count += speed;
        if (count < target) {
          el.innerText = Math.ceil(count);
          requestAnimationFrame(updateCount);
        } else {
          el.innerText = target;
        }
      };
      updateCount();
      counterObserver.unobserve(el);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('.counter').forEach(el => {
  counterObserver.observe(el);
});

// --- 5. Mascot Eye Tracking & Messages ---
function initMascot() {
  const pupils = document.querySelectorAll('.pupil');
  if (pupils.length === 0) return;

  document.addEventListener('mousemove', (e) => {
    pupils.forEach(pupil => {
      const rect = pupil.getBoundingClientRect();
      const eyeX = rect.left + rect.width / 2;
      const eyeY = rect.top + rect.height / 2;
      
      const angle = Math.atan2(e.clientY - eyeY, e.clientX - eyeX);
      const dist  = Math.min(4, Math.hypot(e.clientX - eyeX, e.clientY - eyeY) / 50);
      
      const px = Math.cos(angle) * dist;
      const py = Math.sin(angle) * dist;
      
      pupil.style.transform = `translate(${px}px, ${py}px)`;
    });
  });

  // Random greetings
  setTimeout(showMascotMessage, 3000);
}

function showMascotMessage() {
  const msgBox = document.getElementById('mascot-msg');
  if (!msgBox) return;
  const msgs = [
    "Cucian numpuk? Biar aku yang urus! 🫧",
    "Udah cek layanan Dry Clean kita? ✨",
    "Aku bisa deteksi noda lho! Cek AI Scanner 🤖"
  ];
  msgBox.textContent = msgs[Math.floor(Math.random() * msgs.length)];
  msgBox.classList.add('show');
  setTimeout(() => msgBox.classList.remove('show'), 4000);
}

window.triggerMascot = function() {
  showMascotMessage();
};

// --- 6. AI Scanner Demo ---
window.runAIScanner = function() {
  const laser = document.getElementById('scanner-laser');
  const result = document.getElementById('scanner-result');
  if (!laser || !result) return;

  laser.style.display = 'block';
  laser.style.animation = 'scanMove 2s ease-in-out infinite';
  result.style.display = 'none';

  setTimeout(() => {
    laser.style.animation = 'none';
    laser.style.display = 'none';
    result.style.display = 'block';
    result.classList.add('animate-fade-in-up', 'is-visible');
  }, 4000);
};

// --- Init ---
document.addEventListener('DOMContentLoaded', () => {
  initMascot();
});

// --- GSAP ScrollTrigger Horai Animation ---
document.addEventListener('DOMContentLoaded', () => {
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);

    // 1. Hero to Stats (Dim and scale down)
    gsap.to("#horai-bg .hero-video", {
      scrollTrigger: { trigger: ".stats-section", start: "top bottom", end: "bottom top", scrub: true },
      scale: 1,
      filter: "brightness(0.7) blur(0px)"
    });

    // 2. Stats to Layanan (Blur heavily)
    gsap.to("#horai-bg .hero-video", {
      scrollTrigger: { trigger: "#layanan", start: "top center", end: "bottom center", scrub: true },
      filter: "brightness(0.4) blur(10px)"
    });

    // 3. Layanan to Cara Kerja (Darken overlay)
    gsap.to("#horai-overlay", {
      scrollTrigger: { trigger: "#cara-kerja", start: "top center", end: "bottom center", scrub: true },
      backgroundColor: "rgba(15, 23, 42, 0.85)"
    });

    // 4. Cara Kerja to AI Scanner (Pulse/Scale up slightly)
    gsap.to("#horai-bg .hero-video", {
      scrollTrigger: { trigger: "#ai-scanner", start: "top center", end: "bottom center", scrub: true },
      scale: 1.1,
      filter: "brightness(0.5) blur(4px) contrast(1.2)"
    });
  }
});
