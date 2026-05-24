// =====================================================
// WASHBUDDY PORTAL v9 — PROFESSIONAL CLEAN + INTERACTIVE
// =====================================================

const PRICING = {
  'Wash Regular': 8000, 
  'Dry Cleaning': 25000, 
  'Cuci Sepatu':  50000,
};

// --- State ---
let currentService     = 'Wash Regular';
let currentPayment     = 'QRIS';
let discountMultiplier = 0;
let userPoints         = 1250;

// =====================================================
// INIT & UTILS
// =====================================================
document.addEventListener('DOMContentLoaded', () => {
  setGreetingAndDate();
  recalc();
  initMascot();
  
  // Show Daily Pop after 2 seconds
  setTimeout(() => {
    document.getElementById('daily-pop-modal')?.classList.add('active');
  }, 2000);
});

function setGreetingAndDate() {
  const dateEl = document.getElementById('current-date');
  const greetEl = document.getElementById('greeting-text');
  
  if (dateEl) {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    dateEl.textContent = new Date().toLocaleDateString('id-ID', options);
  }
  if (greetEl) {
    const hour = new Date().getHours();
    let time = 'Pagi';
    if (hour >= 12 && hour < 15) time = 'Siang';
    else if (hour >= 15 && hour < 18) time = 'Sore';
    else if (hour >= 18) time = 'Malam';
    greetEl.textContent = `Selamat ${time}, Sultan!`;
  }
}

function showToast(msg, type = 'success') {
  document.querySelector('.toast')?.remove();
  const el = document.createElement('div');
  el.className = 'toast';
  el.style.cssText = `position:fixed; bottom:20px; left:50%; transform:translateX(-50%); 
                      background:#fff; border:1px solid ${type==='error'?'#EF4444':'#10B981'}; 
                      color:#1E293B; padding:12px 24px; border-radius:8px; z-index:9999;
                      box-shadow:0 10px 15px -3px rgba(0,0,0,0.1); font-weight:600;`;
  el.innerHTML = msg;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 3500);
}

// =====================================================
// GAMIFICATION: DAILY BUBBLE POP
// =====================================================
function popDailyBubble() {
  const bubble = document.getElementById('giant-bubble-element');
  const rewardBox = document.getElementById('dp-reward-content');
  const pointsEl = document.getElementById('dp-points-won');
  
  if (!bubble || !rewardBox) return;

  // Animate pop
  bubble.style.transform = 'scale(1.5)';
  bubble.style.opacity = '0';
  
  setTimeout(() => {
    bubble.style.display = 'none';
    const wonPoints = Math.floor(Math.random() * 50) + 10; // Random 10 - 60
    pointsEl.textContent = wonPoints;
    rewardBox.style.display = 'block';
    
    // Update global points
    userPoints += wonPoints;
    const dashPointEl = document.getElementById('dash-points');
    if (dashPointEl) dashPointEl.textContent = userPoints.toLocaleString('id-ID');
    
    // Auto close
    setTimeout(closeDailyPop, 3000);
  }, 300);
}

function closeDailyPop() {
  document.getElementById('daily-pop-modal')?.classList.remove('active');
  showMascotMessage("Hebat! Jangan lupa pakai promo hari ini ya.");
}


// =====================================================
// MASCOT EYE TRACKING
// =====================================================
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
}

function showMascotMessage(msgOverride) {
  const msgBox = document.getElementById('mascot-msg');
  if (!msgBox) return;
  const msgs = [
    "Cucian numpuk? Pesan sekarang!",
    "Ada promo MERDEKA20 lho hari ini!",
    "Poinmu sudah " + userPoints + " nih, yuk tukarkan!"
  ];
  msgBox.textContent = msgOverride || msgs[Math.floor(Math.random() * msgs.length)];
  msgBox.classList.add('show');
  setTimeout(() => msgBox.classList.remove('show'), 4000);
}

window.triggerMascot = function() {
  showMascotMessage();
};

// =====================================================
// NAVIGATION & SIDEBAR
// =====================================================
const PAGE_TITLES = {
  'view-dashboard': 'Dashboard',
  'view-order':     'Buat Pesanan Baru',
  'view-tracking':  'Lacak Pesanan',
  'view-schedule':  'Jadwal Jemput',
  'view-history':   'Riwayat Transaksi',
  'view-profile':   'Profil & Pengaturan',
};

function navigate(targetId) {
  document.querySelectorAll('.sb-nav a').forEach(link => {
    link.classList.toggle('active', link.getAttribute('data-target') === targetId);
  });
  
  document.querySelectorAll('.page-view').forEach(view => {
    view.classList.toggle('active', view.id === targetId);
  });

  const crumb = document.getElementById('tb-breadcrumb');
  if (crumb) crumb.textContent = PAGE_TITLES[targetId] || 'Dashboard';

  if (window.innerWidth < 900) {
    document.getElementById('sidebar')?.classList.remove('open');
  }
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

document.querySelectorAll('.sb-nav a[data-target]').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    navigate(link.getAttribute('data-target'));
  });
});

window.toggleSidebar = function() {
  document.getElementById('sidebar')?.classList.toggle('open');
};

window.showNotif = function() {
  showToast('Tidak ada notifikasi baru hari ini.', 'success');
};

// =====================================================
// WIZARD ORDER (Service & Checkout)
// =====================================================
window.selectService = function(el, name) {
  document.querySelectorAll('.srv-item').forEach(c => c.classList.remove('selected'));
  el.classList.add('selected');
  currentService = name;
  recalc();
};

window.selectPayment = function(el, method) {
  document.querySelectorAll('.pay-item').forEach(c => c.classList.remove('selected'));
  el.classList.add('selected');
  currentPayment = method;
};

window.goStep = function(step) {
  document.querySelectorAll('.wizard-step').forEach(s => s.classList.add('hidden'));
  const target = document.getElementById('w-step-' + step);
  if (!target) return;
  target.classList.remove('hidden');
  
  [1,2,3].forEach(n => {
    const el = document.getElementById('si-' + n);
    if (!el) return;
    if (n <= step) el.classList.add('active');
    else el.classList.remove('active');
  });
  
  if (step >= 2) recalc();
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

window.updateQty = function(delta) {
  const input = document.getElementById('order-qty');
  if (!input) return;
  let val = Math.min(50, Math.max(1, (parseInt(input.value)||1) + delta));
  input.value = val;
  recalc();
};

window.applyPromo = function() {
  const input = document.getElementById('promo-input');
  const msg   = document.getElementById('promo-message');
  if (!input || !msg) return;
  const code = input.value.trim().toUpperCase();
  msg.classList.remove('hidden');
  if (code === 'MERDEKA20') { 
    discountMultiplier = 0.2; 
    msg.textContent = '✓ Diskon 20% diterapkan.'; 
    msg.style.color = 'var(--success)'; 
  } else { 
    discountMultiplier = 0; 
    msg.textContent = '✗ Kode promo tidak valid.'; 
    msg.style.color = 'var(--danger)'; 
  }
  recalc();
};

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
  set('qris-amount',      fmt(total));
}

// Payment Modal
window.showPaymentModal = function() { document.getElementById('payment-modal-backdrop')?.classList.add('active'); };
window.closePayment = function() { document.getElementById('payment-modal-backdrop')?.classList.remove('active'); };
window.confirmPayment = function() {
  closePayment();
  const orderId = 'WB-' + Math.floor(1000 + Math.random()*9000);
  showToast('✓ Pesanan ' + orderId + ' berhasil dikonfirmasi!', 'success');
  
  const idEl = document.getElementById('active-order-id');
  if (idEl) idEl.textContent = orderId;
  const detailEl = document.getElementById('active-order-detail');
  if (detailEl) detailEl.textContent = 'Kurir segera menjemput pesanan Anda.';
  
  setTimeout(() => { goStep(1); navigate('view-dashboard'); }, 1000);
};
