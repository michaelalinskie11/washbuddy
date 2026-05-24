// =====================================================
// WASHBUDDY LANDING PAGE JS v8
// =====================================================

// Navbar Scroll Effect
window.addEventListener('scroll', () => {
  const nav = document.getElementById('navbar');
  if (window.scrollY > 50) nav.classList.add('scrolled');
  else nav.classList.remove('scrolled');
});

// Smooth Scroll for Navigation Links
document.querySelectorAll('.nav-links a, .btn-text').forEach(link => {
  link.addEventListener('click', e => {
    const targetId = link.getAttribute('href');
    if (targetId && targetId.startsWith('#')) {
      e.preventDefault();
      const target = document.querySelector(targetId);
      if (target) {
        window.scrollTo({ top: target.offsetTop - 85, behavior: 'smooth' });
        document.querySelectorAll('.nav-links a').forEach(l => l.classList.remove('active'));
        if(link.classList.contains('nav-links a')) {
          link.classList.add('active');
        }
      }
    }
  });
});
