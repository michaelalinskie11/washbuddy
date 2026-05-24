// =====================================================
// WASHBUDDY LANDING PAGE JS v6
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

// Background Bubbles
function initBubbles() {
  const bg = document.getElementById('laundry-bg');
  if (!bg) return;
  const bubbles = [
    { w: 18, l: 8,  delay: 0,   dur: 22 },
    { w: 12, l: 25, delay: 3,   dur: 18 },
    { w: 24, l: 42, delay: 6,   dur: 26 },
    { w: 9,  l: 60, delay: 1,   dur: 20 },
    { w: 16, l: 75, delay: 4,   dur: 24 },
    { w: 10, l: 88, delay: 8,   dur: 16 },
    { w: 20, l: 15, delay: 10,  dur: 28 },
    { w: 14, l: 52, delay: 12,  dur: 19 },
    { w: 8,  l: 95, delay: 5,   dur: 23 },
    { w: 22, l: 35, delay: 14,  dur: 21 },
  ];
  bubbles.forEach(b => {
    const el = document.createElement('div');
    el.className = 'bubble';
    el.style.cssText = `
      width:${b.w}px; height:${b.w}px;
      left:${b.l}%; bottom:-${b.w}px;
      animation-duration:${b.dur}s;
      animation-delay:${b.delay}s;
    `;
    bg.appendChild(el);
  });
}

// Navbar Scroll Effect
window.addEventListener('scroll', () => {
  const nav = document.getElementById('navbar');
  if (window.scrollY > 50) nav.classList.add('scrolled');
  else nav.classList.remove('scrolled');
});

// Smooth Scroll for Nav Links
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
  initBubbles();
});
