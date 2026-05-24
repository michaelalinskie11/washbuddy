// =====================================================
// WASHBUDDY PORTAL v8 — PROFESSIONAL CLEAN DASHBOARD JS
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

// =====================================================
// INIT & UTILS
// =====================================================
document.addEventListener('DOMContentLoaded', () => {
  setGreetingAndDate();
  recalc();
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
  // Update Links
  document.querySelectorAll('.sb-nav a').forEach(link => {
    link.classList.toggle('active', link.getAttribute('data-target') === targetId);
  });
  
  // Update Views
  document.querySelectorAll('.page-view').forEach(view => {
    const isTarget = view.id === targetId;
    if (isTarget) {
      view.classList.add('active');
    } else {
      view.classList.remove('active');
    }
  });

  // Update Breadcrumb
  const crumb = document.getElementById('tb-breadcrumb');
  if (crumb) crumb.textContent = PAGE_TITLES[targetId] || 'Dashboard';

  // Close sidebar on mobile
  if (window.innerWidth < 900) {
    document.getElementById('sidebar')?.classList.remove('open');
  }
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Attach event listeners to sidebar
document.querySelectorAll('.sb-nav a[data-target]').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    navigate(link.getAttribute('data-target'));
  });
});

function toggleSidebar() {
  document.getElementById('sidebar')?.classList.toggle('open');
}

function showNotif() {
  showToast('Tidak ada notifikasi baru hari ini.', 'success');
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
  document.querySelectorAll('.pay-item').forEach(c => c.classList.remove('selected'));
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
    if (!el) return;
    if (n <= step) el.classList.add('active');
    else el.classList.remove('active');
  });
  
  if (step >= 2) recalc();
  window.scrollTo({ top: 0, behavior: 'smooth' });
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
  set('qris-amount',      fmt(total));
}

// Payment Modal
function showPaymentModal() { document.getElementById('payment-modal-backdrop')?.classList.add('active'); }
function closePayment() { document.getElementById('payment-modal-backdrop')?.classList.remove('active'); }
function confirmPayment() {
  closePayment();
  const orderId = 'WB-' + Math.floor(1000 + Math.random()*9000);
  showToast('✓ Pesanan ' + orderId + ' berhasil dikonfirmasi!', 'success');
  
  // Dummy logic for active order update
  const idEl = document.getElementById('active-order-id');
  if (idEl) idEl.textContent = orderId;
  const detailEl = document.getElementById('active-order-detail');
  if (detailEl) detailEl.textContent = 'Kurir segera menjemput pesanan Anda.';
  
  setTimeout(() => { goStep(1); navigate('view-dashboard'); }, 1000);
}
