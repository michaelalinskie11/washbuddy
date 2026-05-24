// =====================================================
// WASHBUDDY LANDING PAGE JS v7
// =====================================================

// Theme Engine
function initTheme() {
  const saved = localStorage.getItem('wb_theme') || 'dark';
  applyTheme(saved);
}
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('wb_theme', theme);
  const icon = document.getElementById('theme-icon');
  if (icon) {
    icon.className = theme === 'dark' ? 'ph-fill ph-sun-dim' : 'ph-fill ph-moon';
  }
}
function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') || 'dark';
  applyTheme(current === 'dark' ? 'light' : 'dark');
}

// Parallax Bubbles Background
const bubbles = [];
function initParallaxBubbles() {
  const layer = document.getElementById('px-bubbles');
  if (!layer) return;

  for (let i = 0; i < 20; i++) {
    const el = document.createElement('div');
    el.className = 'bbl';
    const size = Math.random() * 40 + 10;
    const x = Math.random() * 100;
    const y = Math.random() * 100;
    const speed = Math.random() * 0.05 + 0.01;
    
    el.style.width = size + 'px';
    el.style.height = size + 'px';
    el.style.left = x + 'vw';
    el.style.top = y + 'vh';
    
    layer.appendChild(el);
    bubbles.push({ el, x, y, speed });
  }

  document.addEventListener('mousemove', (e) => {
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    const mx = (e.clientX - cx) / cx;
    const my = (e.clientY - cy) / cy;

    bubbles.forEach(b => {
      const offsetX = mx * b.speed * 200;
      const offsetY = my * b.speed * 200;
      b.el.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
    });
  });
}

// Mascot Eye Tracking on Landing Page
function initMascot() {
  const pupils = document.querySelectorAll('.pupil');
  if (pupils.length === 0) return;

  document.addEventListener('mousemove', (e) => {
    pupils.forEach(pupil => {
      const rect = pupil.getBoundingClientRect();
      const eyeX = rect.left + rect.width / 2;
      const eyeY = rect.top + rect.height / 2;
      
      const angle = Math.atan2(e.clientY - eyeY, e.clientX - eyeX);
      const dist  = Math.min(3, Math.hypot(e.clientX - eyeX, e.clientY - eyeY) / 100);
      
      const px = Math.cos(angle) * dist;
      const py = Math.sin(angle) * dist;
      
      pupil.style.transform = `translate(${px}px, ${py}px)`;
    });
  });
}

// Navbar Scroll Effect
window.addEventListener('scroll', () => {
  const nav = document.getElementById('navbar');
  if (window.scrollY > 50) nav.classList.add('scrolled');
  else nav.classList.remove('scrolled');
});

// Smooth Scroll
document.querySelectorAll('.nav-links a').forEach(link => {
  link.addEventListener('click', e => {
    const targetId = link.getAttribute('href');
    if (targetId.startsWith('#')) {
      e.preventDefault();
      const target = document.querySelector(targetId);
      if (target) {
        window.scrollTo({ top: target.offsetTop - 80, behavior: 'smooth' });
        document.querySelectorAll('.nav-links a').forEach(l => l.classList.remove('active'));
        link.classList.add('active');
      }
    }
  });
});

// Init
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initParallaxBubbles();
  initMascot();
});
