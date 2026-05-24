// =====================================================
// WASHBUDDY PORTAL v7 — PREMIUM INTERACTIVE JS
// Features: Mascot Eye Tracking, Parallax Bubbles,
//           Daily Pop Gamification, Glassmorphism Logic
// =====================================================

// --- Config & Constants ---
const API = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ? 'http://localhost:3000/api' : '/api';

const PRICING = {
  'Wash Regular': 8000, 'Wash Kilat': 15000,
  'Dry Cleaning': 25000, 'Premium Spa': 50000,
  'Cuci Karpet':  30000, 'Cuci Sofa':  100000,
};

// --- State ---
let currentService     = 'Wash Regular';
let currentPayment     = 'QRIS';
let discountMultiplier = 0;
let isTracking         = false;
let globalTimeLeft     = 120;
let userPoints         = parseInt(localStorage.getItem('wb_points') || '1250');

const PAGE_TITLES = {
  'view-dashboard': 'Dashboard Utama',
  'view-order':     'Pesan Laundry',
  'view-schedule':  'Jadwal Jemput',
  'view-scanner':   'AI Scanner',
  'view-tracking':  'Lacak Pesanan',
  'view-clothes':   'Lemari Cucian',
  'view-eco':       'Eco Dashboard',
  'view-referral':  'Poin & Reward',
};

// =====================================================
// THEME ENGINE (V7)
// =====================================================
function initTheme() {
  const saved = localStorage.getItem('wb_theme') || 'dark';
  applyTheme(saved);
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('wb_theme', theme);
  const isDark = theme === 'dark';

  const tbIcon = document.getElementById('topbar-theme-icon');
  if (tbIcon) tbIcon.className = isDark ? 'ph-fill ph-sun-dim' : 'ph-fill ph-moon';
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') || 'dark';
  applyTheme(current === 'dark' ? 'light' : 'dark');
}

// =====================================================
// PARALLAX BUBBLES (V7 BACKGROUND)
// =====================================================
const bubbles = [];
function initParallaxBubbles() {
  const layer = document.getElementById('px-bubbles');
  if (!layer) return;

  // Create 20 random bubbles
  for (let i = 0; i < 20; i++) {
    const el = document.createElement('div');
    el.className = 'bbl';
    const size = Math.random() * 40 + 10; // 10px to 50px
    const x = Math.random() * 100;
    const y = Math.random() * 100;
    const speed = Math.random() * 0.05 + 0.01; // Parallax speed factor
    
    el.style.width = size + 'px';
    el.style.height = size + 'px';
    el.style.left = x + 'vw';
    el.style.top = y + 'vh';
    
    layer.appendChild(el);
    bubbles.push({ el, x: x, y: y, speed });
  }

  // Mouse move listener for parallax
  document.addEventListener('mousemove', (e) => {
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    const mx = (e.clientX - cx) / cx; // -1 to 1
    const my = (e.clientY - cy) / cy; // -1 to 1

    bubbles.forEach(b => {
      const offsetX = mx * b.speed * 200; // max 200px movement
      const offsetY = my * b.speed * 200;
      b.el.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
    });
  });
}

// =====================================================
// VIRTUAL MASCOT (WASHBOT BUBBLY) EYE TRACKING
// =====================================================
function initMascot() {
  const mascot = document.getElementById('mascot-obj');
  const pupils = document.querySelectorAll('.pupil');
  if (!mascot || pupils.length === 0) return;

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

  // Mascot random messages
  setTimeout(showMascotMessage, 3000);
}

function showMascotMessage() {
  const msgBox = document.getElementById('mascot-msg');
  if (!msgBox) return;
  const msgs = [
    "Pecahkan gelembung harianmu! 👆",
    "Tahukah kamu? Kami pakai bio-enzim! 🌱",
    "Ada diskon 50% untuk teman barumu! 🎁",
    "Cucian menumpuk? Pesan sekarang! 📦"
  ];
  // Check if daily pop is needed
  const lastPop = localStorage.getItem('wb_last_pop');
  const today   = new Date().toDateString();
  if (lastPop !== today) {
    msgBox.textContent = msgs[0];
  } else {
    msgBox.textContent = msgs[Math.floor(Math.random() * (msgs.length - 1)) + 1];
  }
  
  msgBox.classList.add('show');
  setTimeout(() => msgBox.classList.remove('show'), 5000);
}

function triggerMascot() {
  const lastPop = localStorage.getItem('wb_last_pop');
  const today   = new Date().toDateString();
  if (lastPop !== today) {
    openDailyPop();
  } else {
    showToast('Halo Sultan! Aku WashBot 🫧', 'success');
  }
}

// =====================================================
// DAILY BUBBLE POP GAMIFICATION
// =====================================================
function checkDailyPop() {
  const lastPop = localStorage.getItem('wb_last_pop');
  const today   = new Date().toDateString();
  if (lastPop !== today) {
    setTimeout(openDailyPop, 1500); // Auto open on login
  }
}

function openDailyPop() {
  document.getElementById('daily-pop-modal')?.classList.add('active');
}

function closeDailyPop() {
  document.getElementById('daily-pop-modal')?.classList.remove('active');
}

function popDailyBubble() {
  const bubble = document.getElementById('giant-bubble-element');
  const reward = document.getElementById('dp-reward-content');
  const ptsEl  = document.getElementById('dp-points-won');
  
  if (bubble.classList.contains('popped')) return;
  
  // Popping animation
  bubble.classList.add('popped');
  
  // Reward Logic
  const pointsWon = Math.floor(Math.random() * 50) + 10; // 10 to 60 points
  if (ptsEl) ptsEl.textContent = '+' + pointsWon;
  
  setTimeout(() => {
    if (reward) reward.classList.add('show');
    userPoints += pointsWon;
    localStorage.setItem('wb_points', userPoints);
    localStorage.setItem('wb_last_pop', new Date().toDateString());
    updatePointsDisplay();
  }, 400);

  setTimeout(closeDailyPop, 4000);
}

function updatePointsDisplay() {
  const el = document.getElementById('dash-points');
  if (el) el.textContent = userPoints.toLocaleString('id-ID');
}

// =====================================================
// NAVIGATION & SIDEBAR
// =====================================================
const navLinks  = document.querySelectorAll('.sb-nav a');
const pageViews = document.querySelectorAll('.page-view');

function navigate(targetId) {
  navLinks.forEach(link => {
    link.classList.toggle('active', link.getAttribute('data-target') === targetId);
  });
  pageViews.forEach(view => {
    const isTarget = view.id === targetId;
    view.classList.toggle('hidden',  !isTarget);
    // Slight delay for CSS opacity transition
    if (isTarget) setTimeout(() => view.classList.add('active'), 10);
    else view.classList.remove('active');
  });
  const crumb = document.getElementById('tb-breadcrumb');
  if (crumb) crumb.textContent = PAGE_TITLES[targetId] || 'Dashboard';

  if (window.innerWidth < 900) document.getElementById('sidebar')?.classList.remove('open');
}

navLinks.forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    navigate(link.getAttribute('data-target'));
  });
});

function toggleSidebar() {
  document.getElementById('sidebar')?.classList.toggle('open');
}

// =====================================================
// WIZARD ORDER (Service & Checkout)
// =====================================================
function selectService(el, name) {
  document.querySelectorAll('.srv-item').forEach(c => c.classList.remove('selected'));
  el.classList.add('selected');
  currentService = name;
  recalc();
}
function selectPayment(el, method) {
  document.querySelectorAll('#w-step-3 .srv-item').forEach(c => c.classList.remove('selected'));
  el.classList.add('selected');
  currentPayment = method;
}
function goStep(step) {
  document.querySelectorAll('.wizard-step').forEach(s => s.classList.add('hidden'));
  const target = document.getElementById('w-step-' + step);
  if (!target) return;
  target.classList.remove('hidden');
  
  [1,2,3].forEach(n => {
    const el = document.getElementById('si-' + n);
    const ln = document.getElementById('si-line-' + n);
    if (!el) return;
    el.classList.remove('active','done');
    if (ln) ln.classList.remove('active');
    if (n <= step) el.classList.add('active');
    if (n < step && ln) ln.classList.add('active');
  });
  if (step >= 2) recalc();
  window.scrollTo({ top:0, behavior:'smooth' });
}
function updateQty(delta) {
  const input = document.getElementById('order-qty');
  if (!input) return;
  let val = Math.min(50, Math.max(1, (parseInt(input.value)||1) + delta));
  input.value = val;
  recalc();
}
function applyPromo() {
  const input = document.getElementById('promo-input');
  const msg   = document.getElementById('promo-message');
  if (!input || !msg) return;
  const code = input.value.trim().toUpperCase();
  msg.classList.remove('hidden');
  if (code === 'NEWUSER50') { discountMultiplier = 0.5; msg.textContent = '✓ Diskon 50% diterapkan.'; msg.style.color = 'var(--green-lt)'; }
  else { discountMultiplier = 0; msg.textContent = '✗ Kode tidak valid.'; msg.style.color = 'var(--red)'; }
  recalc();
}
function recalc() {
  const qty      = parseInt(document.getElementById('order-qty')?.value) || 1;
  const unit     = PRICING[currentService] || 8000;
  const subtotal = qty * unit;
  const discount = Math.round(subtotal * discountMultiplier);
  const total    = subtotal - discount;
  const fmt      = n => 'Rp ' + n.toLocaleString('id-ID');
  const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  set('inv-service',      currentService);
  set('summary-subtotal', fmt(subtotal));
  set('summary-discount', '− ' + fmt(discount));
  set('summary-total',    fmt(total));
  set('final-bill',       fmt(total));
}

// Payment Modal
function showPaymentModal() { document.getElementById('payment-modal-backdrop')?.classList.add('active'); }
function closePayment() { document.getElementById('payment-modal-backdrop')?.classList.remove('active'); }
function confirmPayment() {
  closePayment();
  const orderId = 'WB-' + Math.floor(1000 + Math.random()*9000);
  showToast('✓ Pesanan #' + orderId + ' berhasil dibuat!', 'success');
  discountMultiplier = 0;
  
  // Dummy logic for active order update
  const idEl = document.getElementById('active-order-id');
  if (idEl) idEl.textContent = '#' + orderId;
  const detailEl = document.getElementById('active-order-detail');
  if (detailEl) detailEl.textContent = 'Kurir segera menjemput cucian.';
  
  setTimeout(() => { goStep(1); navigate('view-dashboard'); }, 1000);
}

// =====================================================
// AI SCANNER
// =====================================================
function startScan() {
  const idle   = document.getElementById('scan-idle-state');
  const active = document.getElementById('scan-active-state');
  const status = document.getElementById('scan-status-text');
  if (!idle || !active) return;

  idle.style.display = 'none';
  active.classList.remove('hidden');

  const logs = ['Memindai serat kain...', 'Mendeteksi residu noda...', 'Menghitung rasio bio-enzim...', 'Analisis Selesai!'];
  let idx = 0;
  const timer = setInterval(() => {
    idx++;
    if (status && logs[idx]) status.textContent = logs[idx];
    if (idx >= logs.length) {
      clearInterval(timer);
      setTimeout(() => {
        active.classList.add('hidden');
        idle.style.display = '';
        showToast('Analisis: Noda Kopi di Sutra. Direkomendasikan: Dry Cleaning.', 'success');
      }, 1000);
    }
  }, 1000);
}

// =====================================================
// UTILS
// =====================================================
function showToast(msg, type = 'success') {
  document.querySelector('.toast')?.remove();
  const el = document.createElement('div');
  el.className = 'toast';
  el.style.cssText = `position:fixed; bottom:20px; left:50%; transform:translateX(-50%); 
                      background:var(--glass-bg); backdrop-filter:blur(10px); 
                      border:1px solid ${type==='error'?'var(--red)':'var(--glass-border)'}; 
                      padding:12px 24px; border-radius:var(--r-md); z-index:9999;
                      box-shadow:0 10px 30px rgba(0,0,0,0.5); font-weight:700;`;
  el.innerHTML = msg;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 3500);
}

// =====================================================
// INIT
// =====================================================
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initParallaxBubbles();
  initMascot();
  updatePointsDisplay();
  checkDailyPop();
  recalc();
});
