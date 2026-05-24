// =====================================================
// WASHBUDDY PORTAL — Refactored JS Engine v5.0
// All bugs fixed, clean structure
// =====================================================

// --- Config & State ---
const API = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ? 'http://localhost:3000/api'
  : '/api';

const PRICING = {
  'Wash Regular': 8000,
  'Wash Kilat':   15000,
  'Dry Cleaning': 25000,
  'Premium Spa':  50000,
  'Cuci Karpet':  30000,
  'Cuci Sofa':    100000,
};

const COURIERS = [
  { name: 'Ahmad Fauzi',    rating: '4.9', avatar: 'https://ui-avatars.com/api/?name=Ahmad+Fauzi&background=4F7EFF&color=fff&bold=true' },
  { name: 'Budi Santoso',   rating: '4.8', avatar: 'https://ui-avatars.com/api/?name=Budi+Santoso&background=22c55e&color=fff&bold=true' },
  { name: 'Chandra Wijaya', rating: '5.0', avatar: 'https://ui-avatars.com/api/?name=Chandra&background=a855f7&color=fff&bold=true' },
  { name: 'Dimas Pratama',  rating: '4.7', avatar: 'https://ui-avatars.com/api/?name=Dimas&background=f59e0b&color=fff&bold=true' },
  { name: 'Eko Prasetyo',   rating: '4.9', avatar: 'https://ui-avatars.com/api/?name=Eko&background=14b8a6&color=fff&bold=true' },
];

const SCAN_SCENARIOS = [
  { fabric: 'Sutra Murni', stain: 'Kopi & Lipstik', rec: 'Premium Spa — Delicate Mode. Formula enzim khusus sutra.', img: 'https://images.unsplash.com/photo-1520637102912-2df6bb2aec6d?w=600&auto=format&fit=crop' },
  { fabric: 'Katun Oxford', stain: 'Kopi Susu', rec: 'Dry Cleaning + Oxi-Boost Treatment untuk noda organik membandel.', img: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&auto=format&fit=crop' },
  { fabric: 'Denim Premium', stain: 'Noda Oli Mesin', rec: 'Wash Regular + Heavy-Duty Degreaser. Rendam 30 menit sebelum cuci.', img: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&auto=format&fit=crop' },
  { fabric: 'Wol Merino', stain: 'Noda Cokelat', rec: 'Premium Spa Anti-Shrink. Suhu air maksimum 30°C.', img: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=600&auto=format&fit=crop' },
  { fabric: 'Linen Halus', stain: 'Saus Tomat', rec: 'Dry Cleaning + Spot Treatment enzim asam sebelum proses utama.', img: 'https://images.unsplash.com/photo-1596755094514-f87e32f85e2c?w=600&auto=format&fit=crop' },
  { fabric: 'Polyester Active', stain: 'Keringat & Lumpur', rec: 'Wash Kilat + Anti-Odor Sport Treatment. Efektif hilangkan bakteri.', img: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=600&auto=format&fit=crop' },
];

let currentService     = 'Wash Regular';
let currentPayment     = 'QRIS';
let discountMultiplier = 0;
let trackingInterval   = null;
let countdownInterval  = null;
let globalTimeLeft     = 120;
let isTracking         = false;

// =====================================================
// NAVIGATION
// =====================================================
const navLinks = document.querySelectorAll('#main-nav a');
const pageViews = document.querySelectorAll('.page-view');

const PAGE_TITLES = {
  'view-dashboard': 'Dashboard',
  'view-order':     'Pesan Laundry',
  'view-pricing':   'Harga & Promo',
  'view-scanner':   'AI Scanner',
  'view-tracking':  'Lacak Pesanan',
};

function navigate(targetId) {
  navLinks.forEach(link => {
    link.classList.toggle('active', link.getAttribute('data-target') === targetId);
  });
  pageViews.forEach(view => {
    const isTarget = view.id === targetId;
    if (isTarget) {
      view.classList.remove('hidden');
      view.classList.add('active');
    } else {
      view.classList.add('hidden');
      view.classList.remove('active');
    }
  });
  const breadcrumb = document.getElementById('tb-breadcrumb');
  if (breadcrumb) breadcrumb.textContent = PAGE_TITLES[targetId] || '';

  // Close sidebar on mobile after navigation
  if (window.innerWidth < 900) {
    document.getElementById('sidebar')?.classList.remove('open');
  }
}

navLinks.forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    navigate(link.getAttribute('data-target'));
  });
});

// =====================================================
// SIDEBAR MOBILE TOGGLE
// =====================================================
function toggleSidebar() {
  document.getElementById('sidebar')?.classList.toggle('open');
}

// Close sidebar clicking outside on mobile
document.addEventListener('click', e => {
  const sidebar = document.getElementById('sidebar');
  const menuBtn = document.getElementById('menu-toggle');
  if (sidebar && window.innerWidth < 900 &&
      sidebar.classList.contains('open') &&
      !sidebar.contains(e.target) &&
      !menuBtn.contains(e.target)) {
    sidebar.classList.remove('open');
  }
});

// =====================================================
// NOTIFICATIONS
// =====================================================
const notifBtn = document.getElementById('notif-btn');
notifBtn?.addEventListener('click', e => {
  e.stopPropagation();
  const panel = document.getElementById('notif-dropdown');
  panel?.classList.toggle('hidden');
  const dot = document.getElementById('notif-dot');
  if (dot) dot.style.display = 'none';
});

document.addEventListener('click', e => {
  const panel = document.getElementById('notif-dropdown');
  const btn   = document.getElementById('notif-btn');
  if (panel && !panel.classList.contains('hidden') &&
      !panel.contains(e.target) && !btn?.contains(e.target)) {
    panel.classList.add('hidden');
  }
});

function clearNotifs() {
  document.querySelectorAll('.np-item.unread').forEach(el => el.classList.remove('unread'));
  document.getElementById('notif-dot')?.remove();
  document.getElementById('notif-dropdown')?.classList.add('hidden');
}

// =====================================================
// LOYALTY CARD 3D TILT
// =====================================================
const loyaltyCard = document.getElementById('loyalty-card-3d');
if (loyaltyCard) {
  const inner = loyaltyCard.querySelector('.lc-inner');
  const glare = document.getElementById('lc-glare');

  loyaltyCard.addEventListener('mousemove', e => {
    if (!inner) return;
    const r = loyaltyCard.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    const nx = (x / r.width)  - 0.5;
    const ny = (y / r.height) - 0.5;
    inner.style.transform = `perspective(1000px) rotateX(${-ny * 14}deg) rotateY(${nx * 14}deg) scale3d(1.02, 1.02, 1.02)`;
    if (glare) {
      glare.style.opacity = '1';
      glare.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(79,126,255,0.1) 0%, transparent 65%)`;
    }
  });

  loyaltyCard.addEventListener('mouseleave', () => {
    if (inner) inner.style.transform = '';
    if (glare) glare.style.opacity = '0';
  });
}

// =====================================================
// AI STAIN SCANNER
// =====================================================
function startScan() {
  const idleEl   = document.getElementById('scan-idle-state');
  const activeEl = document.getElementById('scan-active-state');
  const resultEl = document.getElementById('scan-result');
  const statusEl = document.getElementById('scan-status-text');
  const scanImg  = document.getElementById('scan-image');

  if (!idleEl || !activeEl) return;

  idleEl.style.display   = 'none';
  activeEl.classList.remove('hidden');
  resultEl?.classList.add('hidden');

  const scenario = SCAN_SCENARIOS[Math.floor(Math.random() * SCAN_SCENARIOS.length)];
  const imgPool  = SCAN_SCENARIOS.map(s => s.img);
  let imgIdx = 0;

  const logs = [
    'Memulai kamera WashBot Vision AI...',
    'Memindai spektrum warna & pola noda...',
    'Menganalisis kerapatan serat kain...',
    'Mencocokkan dengan 10.000+ data WashBot...',
    'Menyusun rekomendasi pencucian...',
  ];
  let logIdx = 0;
  if (statusEl) statusEl.textContent = logs[0];

  const logTimer = setInterval(() => {
    logIdx++;
    if (logIdx < logs.length && statusEl) statusEl.textContent = logs[logIdx];
  }, 750);

  const imgTimer = setInterval(() => {
    if (!scanImg) return;
    scanImg.style.opacity = '0.3';
    setTimeout(() => {
      scanImg.src = imgPool[imgIdx % imgPool.length];
      scanImg.style.transition = 'opacity 0.15s';
      scanImg.style.opacity = '1';
      imgIdx++;
    }, 150);
  }, 550);

  setTimeout(() => {
    clearInterval(logTimer);
    clearInterval(imgTimer);

    activeEl.classList.add('hidden');
    idleEl.style.display = '';

    const fabEl  = document.getElementById('scan-fabric');
    const stnEl  = document.getElementById('scan-stain');
    const recEl  = document.getElementById('scan-rec');

    if (fabEl) fabEl.textContent = scenario.fabric;
    if (stnEl) stnEl.textContent = scenario.stain;
    if (recEl) recEl.textContent = scenario.rec;

    if (resultEl) {
      resultEl.classList.remove('hidden');
      resultEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, 4200);
}

function resetScan() {
  const idleEl   = document.getElementById('scan-idle-state');
  const activeEl = document.getElementById('scan-active-state');
  const resultEl = document.getElementById('scan-result');
  if (idleEl)   idleEl.style.display = '';
  if (activeEl) activeEl.classList.add('hidden');
  if (resultEl) resultEl.classList.add('hidden');
}

// =====================================================
// ORDER WIZARD
// =====================================================
let currentWizardStep = 1;

function selectService(el, name) {
  document.querySelectorAll('.srv-item').forEach(c => c.classList.remove('selected'));
  el.classList.add('selected');
  currentService = name;
  recalc();
}

function selectPayment(el, method) {
  document.querySelectorAll('.pay-opt').forEach(c => c.classList.remove('selected'));
  el.classList.add('selected');
  currentPayment = method;
}

function goStep(step) {
  // Hide all steps
  document.querySelectorAll('.wizard-step').forEach(s => s.classList.add('hidden'));

  // Show target
  const target = document.getElementById('w-step-' + step);
  if (!target) return;
  target.classList.remove('hidden');
  currentWizardStep = step;

  // Update step indicator
  [1, 2, 3].forEach(n => {
    const el  = document.getElementById('si-' + n);
    const ln  = document.getElementById('si-line-' + n);
    if (!el) return;
    el.classList.remove('active', 'done');
    if (ln) ln.classList.remove('active');
    if (n < step) {
      el.classList.add('done');
      if (ln) ln.classList.add('active');
    } else if (n === step) {
      el.classList.add('active');
    }
  });

  // Sync detail view labels
  if (step === 2 || step === 3) recalc();

  target.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function updateQty(delta) {
  const input = document.getElementById('order-qty');
  if (!input) return;
  let val = (parseInt(input.value) || 1) + delta;
  if (val < 1)  val = 1;
  if (val > 50) val = 50;
  input.value = val;
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
  set('inv-qty',          qty + ' item');
  set('summary-subtotal', fmt(subtotal));
  set('summary-discount', '− ' + fmt(discount));
  set('summary-total',    fmt(total));
  set('final-bill',       fmt(total));
}

function applyPromo() {
  const input = document.getElementById('promo-input');
  const msg   = document.getElementById('promo-message');
  if (!input || !msg) return;

  const code = input.value.trim().toUpperCase();
  msg.classList.remove('hidden', 'ok', 'err');

  if (code === 'NEWUSER50') {
    discountMultiplier = 0.5;
    msg.textContent = '✓ Kode NEWUSER50 berhasil! Diskon 50% diterapkan.';
    msg.classList.add('ok');
  } else if (code === 'WEEKEND20') {
    discountMultiplier = 0.2;
    msg.textContent = '✓ Kode WEEKEND20 berhasil! Diskon 20% diterapkan.';
    msg.classList.add('ok');
  } else if (code !== '') {
    discountMultiplier = 0;
    msg.textContent = '✗ Kode promo tidak valid atau sudah kedaluwarsa.';
    msg.classList.add('err');
  } else {
    discountMultiplier = 0;
    msg.classList.add('hidden');
  }
  recalc();
}

function copyPromo(code, btn) {
  navigator.clipboard.writeText(code).then(() => {
    if (btn) {
      const original = btn.innerHTML;
      btn.innerHTML = '<i class="ph-bold ph-check"></i> Disalin!';
      btn.style.color = 'var(--green)';
      setTimeout(() => { btn.innerHTML = original; btn.style.color = ''; }, 2000);
    }
  }).catch(() => {
    showToast('Salin manual: ' + code);
  });
}

// =====================================================
// PAYMENT MODAL
// =====================================================
function showPaymentModal() {
  const qty    = parseInt(document.getElementById('order-qty')?.value) || 1;
  const unit   = PRICING[currentService] || 8000;
  const total  = Math.round(qty * unit * (1 - discountMultiplier));
  const fmt    = 'Rp ' + total.toLocaleString('id-ID');

  // Hide all content panels
  ['qris', 'va', 'cod'].forEach(id => {
    document.getElementById('payment-content-' + id)?.classList.add('hidden');
  });

  // Show relevant panel
  const panelMap = { 'QRIS': 'qris', 'E-Wallet': 'va', 'Tunai': 'cod' };
  const panelId  = panelMap[currentPayment] || 'qris';
  const panel    = document.getElementById('payment-content-' + panelId);
  panel?.classList.remove('hidden');

  // Set amounts
  const setAmt = (id) => { const el = document.getElementById(id); if (el) el.textContent = fmt; };
  setAmt('qris-amount');
  setAmt('va-amount');
  setAmt('cod-amount');

  // Show backdrop
  const backdrop = document.getElementById('payment-modal-backdrop');
  if (backdrop) backdrop.classList.remove('hidden');
}

function closePayment() {
  document.getElementById('payment-modal-backdrop')?.classList.add('hidden');
}

function closePaymentOutside(e) {
  if (e.target === document.getElementById('payment-modal-backdrop')) {
    closePayment();
  }
}

function confirmPayment() {
  closePayment();

  // Save order to localStorage
  const orderId = 'WB-' + Math.floor(1000 + Math.random() * 9000);
  const qty     = parseInt(document.getElementById('order-qty')?.value) || 1;
  const unit    = PRICING[currentService] || 8000;
  const total   = Math.round(qty * unit * (1 - discountMultiplier));

  const order = {
    id:      orderId,
    service: currentService,
    qty,
    total,
    status:  'pickup',
    date:    new Date().toISOString(),
    payment: currentPayment,
  };

  // Store
  const existing = JSON.parse(localStorage.getItem('wb_bookings') || '[]');
  existing.unshift(order);
  localStorage.setItem('wb_bookings', JSON.stringify(existing.slice(0, 20)));
  localStorage.setItem('wb_active_order', JSON.stringify(order));

  showToast('✓ Pesanan #' + orderId + ' berhasil dibuat!');

  // Reset wizard
  discountMultiplier = 0;
  setTimeout(() => {
    goStep(1);
    navigate('view-dashboard');
    loadActiveOrder();
    updateRecentOrders();
  }, 1200);
}

// =====================================================
// LOAD ACTIVE ORDER (localStorage fallback)
// =====================================================
function loadActiveOrder() {
  const raw = localStorage.getItem('wb_active_order');
  const order = raw ? JSON.parse(raw) : null;

  const idEl     = document.getElementById('active-order-id');
  const detailEl = document.querySelectorAll('#active-order-detail');

  if (!order) {
    if (idEl) {
      idEl.textContent = 'Tidak ada pesanan';
      idEl.style.background = '';
    }
    detailEl.forEach(el => {
      el.innerHTML = 'Belum ada pesanan aktif. <a href="#" onclick="navigate(\'view-order\'); return false;">Pesan sekarang →</a>';
    });
    // Reset all tracker steps
    document.querySelectorAll('.step').forEach(s => s.classList.remove('completed', 'active'));
    document.querySelectorAll('.step').forEach((s, i) => { if (i === 0) s.classList.add('active'); });
    document.querySelectorAll('.ts-circle').forEach(c => c.classList.remove('completed', 'active'));
    return;
  }

  if (idEl) idEl.textContent = '#' + order.id;

  const statusMap = {
    pickup:   { step: 0, label: '📦 Kurir dalam perjalanan menjemput cucian kamu.' },
    washing:  { step: 1, label: '🧺 Pakaian sedang dalam proses pencucian.' },
    delivery: { step: 2, label: '🚴 Kurir sedang mengantar pesanan ke lokasimu.' },
    done:     { step: 3, label: '✅ Pesanan telah selesai dan diterima. Terima kasih!' },
  };

  const info = statusMap[order.status] || statusMap['pickup'];

  detailEl.forEach(el => { el.textContent = info.label; });

  // Update tracker circles & lines
  document.querySelectorAll('.step').forEach((stepEl, idx) => {
    stepEl.classList.remove('completed', 'active');
    if (idx < info.step)       stepEl.classList.add('completed');
    else if (idx === info.step) stepEl.classList.add('active');
  });

  document.querySelectorAll('.line').forEach((lineEl, idx) => {
    lineEl.classList.toggle('active', idx < info.step);
  });
}

function updateRecentOrders() {
  const list = document.getElementById('recent-orders-list');
  if (!list) return;
  const orders = JSON.parse(localStorage.getItem('wb_bookings') || '[]');
  if (!orders.length) return;

  const iconMap = {
    'Wash Regular': 'ph-washing-machine',
    'Wash Kilat':   'ph-rocket',
    'Dry Cleaning': 'ph-coat-hanger',
    'Premium Spa':  'ph-sneaker',
    'Cuci Karpet':  'ph-rug',
    'Cuci Sofa':    'ph-armchair',
  };

  list.innerHTML = orders.slice(0, 4).map(o => `
    <div class="ro-item">
      <div class="ro-icon"><i class="ph-fill ${iconMap[o.service] || 'ph-package'}"></i></div>
      <div class="ro-info">
        <span class="ro-name">${o.service} — ${o.qty} item</span>
        <span class="ro-date">${new Date(o.date).toLocaleDateString('id-ID', { day:'numeric', month:'long', year:'numeric' })}</span>
      </div>
      <span class="ro-badge done">Selesai</span>
    </div>
  `).join('');
}

// =====================================================
// LIVE TRACKING
// =====================================================
// Bezier curve parametric: P = (1-t)³P0 + 3(1-t)²tP1 + 3(1-t)t²P2 + t³P3
function bezier(t, p0, p1, p2, p3) {
  const mt = 1 - t;
  return mt*mt*mt*p0 + 3*mt*mt*t*p1 + 3*mt*t*t*p2 + t*t*t*p3;
}

// Bezier control points matching the SVG path: M 10 85 C 40 85, 30 20, 90 20
const PATH = { x: [10, 40, 30, 90], y: [85, 85, 20, 20] };

function startLiveTracking() {
  if (isTracking) {
    clearInterval(trackingInterval);
    clearInterval(countdownInterval);
  }

  const order   = JSON.parse(localStorage.getItem('wb_active_order') || 'null');
  const courier = COURIERS[Math.floor(Math.random() * COURIERS.length)];

  // Update courier profile
  const nameEl   = document.getElementById('courier-name');
  const ratingEl = document.getElementById('courier-rating');
  const imgEl    = document.getElementById('courier-img');
  if (nameEl)   nameEl.textContent  = courier.name;
  if (ratingEl) ratingEl.textContent = '⭐ ' + courier.rating + ' (Mitra Elite)';
  if (imgEl)    imgEl.src            = courier.avatar;

  // Countdown
  globalTimeLeft = order ? 120 : 120;
  isTracking = true;

  let t = 0; // progress 0→1 along bezier

  countdownInterval = setInterval(() => {
    globalTimeLeft = Math.max(0, globalTimeLeft - 1);
    const mm = String(Math.floor(globalTimeLeft / 60)).padStart(2, '0');
    const ss = String(globalTimeLeft % 60).padStart(2, '0');
    const timeEl = document.getElementById('live-time');
    if (timeEl) timeEl.textContent = mm + ':' + ss;

    // Distance
    const distEl = document.getElementById('live-distance');
    if (distEl) {
      const d = Math.max(0, (5 * (1 - t))).toFixed(1);
      distEl.textContent = d + ' km';
    }

    if (globalTimeLeft <= 0) {
      clearInterval(countdownInterval);
      if (timeEl) timeEl.textContent = 'Tiba!';
      isTracking = false;
    }
  }, 1000);

  // Move courier along path
  trackingInterval = setInterval(() => {
    t = Math.min(1, t + 0.005);
    const courier_el = document.getElementById('moving-courier');
    if (courier_el) {
      const px = bezier(t, ...PATH.x);
      const py = bezier(t, ...PATH.y);
      courier_el.style.left = px + '%';
      courier_el.style.top  = py + '%';
    }

    // Progress bar
    const fill = document.getElementById('courier-progress');
    if (fill) fill.style.width = (t * 100) + '%';

    if (t >= 1) {
      clearInterval(trackingInterval);
    }
  }, 500);

  // Inject chat message from courier after 3s
  setTimeout(() => {
    const messages = document.getElementById('chat-messages');
    if (messages) {
      const msgEl = document.createElement('div');
      msgEl.className = 'msg bot';
      msgEl.style.borderLeft = '2px solid var(--teal)';
      msgEl.innerHTML = `<strong style="color:#2dd4bf; font-size:0.75rem">🏍 Kurir (${courier.name})</strong><br>Halo! Saya sudah dalam perjalanan ke lokasi kamu. Estimasi tiba sekitar 2 menit. Ada petunjuk khusus untuk alamat? 🙏`;
      messages.appendChild(msgEl);
      messages.scrollTop = messages.scrollHeight;
    }
  }, 3000);
}

function restartTracking() {
  startLiveTracking();
}

// =====================================================
// CHATBOT
// =====================================================
function toggleChat() {
  const box  = document.getElementById('ai-chatbox');
  const dot  = document.getElementById('chat-dot');
  if (!box) return;
  box.classList.toggle('open');
  if (box.classList.contains('open') && dot) dot.style.display = 'none';
}

function sendOption(text) {
  const input = document.getElementById('chat-input-field');
  if (input) input.value = text;
  sendChatMessage();
}

async function sendChatMessage() {
  const input    = document.getElementById('chat-input-field');
  const messages = document.getElementById('chat-messages');
  if (!input || !messages) return;

  const text = input.value.trim();
  if (!text) return;

  // User bubble
  const userMsg = document.createElement('div');
  userMsg.className = 'msg user';
  userMsg.textContent = text;
  messages.appendChild(userMsg);
  input.value = '';
  messages.scrollTop = messages.scrollHeight;

  // Loading
  const loadId = 'load-' + Date.now();
  const loadEl = document.createElement('div');
  loadEl.className = 'msg bot loading';
  loadEl.id = loadId;
  loadEl.innerHTML = '<span></span><span></span><span></span>';
  messages.appendChild(loadEl);
  messages.scrollTop = messages.scrollHeight;

  // Try API first, fallback to local AI
  try {
    const res = await fetch(API + '/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text }),
    });
    if (!res.ok) throw new Error('offline');
    const data = await res.json();
    document.getElementById(loadId)?.remove();
    appendBotMsg(messages, data.reply);
  } catch {
    document.getElementById(loadId)?.remove();
    appendBotMsg(messages, getLocalReply(text));
  }
}

function appendBotMsg(container, text) {
  const el = document.createElement('div');
  el.className = 'msg bot';
  el.innerHTML = text.replace(/\n/g, '<br>');
  container.appendChild(el);
  container.scrollTop = container.scrollHeight;
}

function getLocalReply(text) {
  const t = text.toLowerCase();
  if (/harga|tarif|biaya/.test(t))       return 'Harga layanan kami mulai dari <strong>Rp 8.000/kg</strong> untuk Wash Regular hingga <strong>Rp 100.000/seat</strong> untuk Cuci Sofa. Lihat tabel lengkap di menu Harga & Promo!';
  if (/promo|diskon|voucher/.test(t))    return 'Ada 2 promo aktif sekarang:\n<strong>NEWUSER50</strong> — diskon 50%\n<strong>WEEKEND20</strong> — diskon 20%\nMasukkan kode saat checkout!';
  if (/dry clean/.test(t))              return 'Dry Cleaning cocok untuk jas, gaun, sutra, dan baju formal. Mulai <strong>Rp 25.000/pcs</strong>, selesai dalam 2–3 hari kerja.';
  if (/karpet/.test(t))                 return 'Cuci karpet menggunakan mesin ekstraktor khusus yang efektif mengangkat debu, tungau, dan noda membandel. Mulai <strong>Rp 40.000</strong>.';
  if (/sofa/.test(t))                   return 'Cuci sofa bisa on-site (kami datang ke rumah) atau antar ke toko. Harga <strong>Rp 100.000/seat</strong>.';
  if (/kilat|express|cepat/.test(t))    return 'Wash Kilat selesai dalam <strong>24 jam</strong>! Termasuk cuci + setrika. Harga <strong>Rp 15.000/kg</strong>.';
  if (/cod|tunai|cash/.test(t))         return 'Ya, kami menerima pembayaran tunai (COD) saat penjemputan atau pengiriman. Siapkan uang pas ya! 😊';
  if (/lacak|track|pesanan/.test(t))    return 'Kamu bisa lacak pesanan aktif di menu <strong>Lacak Pesanan</strong>. Posisi kurir ditampilkan secara real-time!';
  if (/waktu|lama|durasi/.test(t))      return 'Estimasi waktu:\n• Wash Regular: 1–2 hari\n• Wash Kilat: 24 jam\n• Dry Cleaning: 2–3 hari\n• Shoe Spa: 3–5 hari';
  if (/scan|ai|noda/.test(t))           return 'WashBot Vision AI bisa mendeteksi jenis noda dan merekomendasikan layanan terbaik! Coba di menu <strong>AI Scanner</strong>.';
  if (/sepatu|tas|shoe|bag/.test(t))    return 'Shoe & Bag Spa kami menangani sepatu, tas kulit, dan aksesori. Mulai <strong>Rp 50.000/item</strong>, selesai 3–5 hari.';
  return 'Halo! Saya WashBot AI siap membantu. Coba tanya tentang harga, promo, durasi, atau fitur AI Scanner kami! 😊';
}

// =====================================================
// TOAST NOTIFICATION
// =====================================================
function showToast(msg) {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = '<i class="ph-fill ph-check-circle"></i> ' + msg;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3500);
}

// =====================================================
// INIT
// =====================================================
document.addEventListener('DOMContentLoaded', () => {
  loadActiveOrder();
  updateRecentOrders();
  recalc();

  // Auto-start tracking when view-tracking is visited
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (link.getAttribute('data-target') === 'view-tracking') {
        setTimeout(startLiveTracking, 300);
      }
    });
  });

  // Show notif dot if there are unreads
  const unread = document.querySelectorAll('.np-item.unread');
  const dot    = document.getElementById('notif-dot');
  if (unread.length > 0 && dot) dot.style.display = 'block';
  else if (dot) dot.style.display = 'none';
});
