// =====================================================
// WASHBUDDY PORTAL v6 — Full Engine
// Features: dark/light theme, laundry bg, schedule,
//           eco, referral, clothes tracker
// =====================================================

// --- Config & Constants ---
const API = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ? 'http://localhost:3000/api' : '/api';

const PRICING = {
  'Wash Regular': 8000, 'Wash Kilat': 15000,
  'Dry Cleaning': 25000, 'Premium Spa': 50000,
  'Cuci Karpet':  30000, 'Cuci Sofa':  100000,
};
const COURIERS = [
  { name: 'Ahmad Fauzi',    rating: '4.9', avatar: 'https://ui-avatars.com/api/?name=Ahmad+F&background=4F7EFF&color=fff&bold=true' },
  { name: 'Budi Santoso',   rating: '4.8', avatar: 'https://ui-avatars.com/api/?name=Budi+S&background=22c55e&color=fff&bold=true' },
  { name: 'Chandra Wijaya', rating: '5.0', avatar: 'https://ui-avatars.com/api/?name=Chandra&background=a855f7&color=fff&bold=true' },
  { name: 'Dimas Pratama',  rating: '4.7', avatar: 'https://ui-avatars.com/api/?name=Dimas&background=f59e0b&color=fff&bold=true' },
  { name: 'Eko Prasetyo',   rating: '4.9', avatar: 'https://ui-avatars.com/api/?name=Eko&background=14b8a6&color=fff&bold=true' },
];
const SCAN_SCENARIOS = [
  { fabric: 'Sutra Murni',     stain: 'Kopi & Lipstik',    rec: 'Premium Spa — Delicate Mode. Formula enzim khusus sutra.',          img: 'https://images.unsplash.com/photo-1520637102912-2df6bb2aec6d?w=600&auto=format&fit=crop' },
  { fabric: 'Katun Oxford',    stain: 'Kopi Susu',          rec: 'Dry Cleaning + Oxi-Boost untuk noda organik.',                     img: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&auto=format&fit=crop' },
  { fabric: 'Denim Premium',   stain: 'Oli Mesin',          rec: 'Wash Regular + Heavy-Duty Degreaser. Rendam 30 menit.',            img: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&auto=format&fit=crop' },
  { fabric: 'Wol Merino',      stain: 'Cokelat Cair',       rec: 'Premium Spa Anti-Shrink. Suhu max 30°C.',                          img: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=600&auto=format&fit=crop' },
  { fabric: 'Linen Halus',     stain: 'Saus Tomat',         rec: 'Dry Cleaning + Spot Treatment enzim asam.',                        img: 'https://images.unsplash.com/photo-1596755094514-f87e32f85e2c?w=600&auto=format&fit=crop' },
  { fabric: 'Polyester Active',stain: 'Keringat & Lumpur',  rec: 'Wash Kilat + Anti-Odor Sport Treatment.',                          img: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=600&auto=format&fit=crop' },
];
const WEATHER_DATA = [
  { icon: '☀️', temp: '32°C', desc: 'Cerah Terang', cond: 'Sangat Cerah', tip: '☀️ Sempurna untuk jemur' },
  { icon: '⛅', temp: '29°C', desc: 'Berawan, Jakarta', cond: 'Berawan Sebagian', tip: '💡 Cocok untuk jemur' },
  { icon: '🌧️', temp: '24°C', desc: 'Hujan Ringan', cond: 'Hujan Ringan', tip: '🏠 Lebih baik angin-anginkan' },
  { icon: '🌤️', temp: '27°C', desc: 'Cerah Berawan', cond: 'Cerah Berawan', tip: '✅ Baik untuk jemur' },
  { icon: '⛈️', temp: '22°C', desc: 'Hujan Deras', cond: 'Badai Petir', tip: '❌ Hindari jemur di luar' },
];

// --- State ---
let currentService     = 'Wash Regular';
let currentPayment     = 'QRIS';
let discountMultiplier = 0;
let trackingInterval   = null;
let countdownInterval  = null;
let globalTimeLeft     = 120;
let isTracking         = false;
let selectedDate       = null;
let selectedTimeSlot   = null;
let calYear            = new Date().getFullYear();
let calMonth           = new Date().getMonth();

const PAGE_TITLES = {
  'view-dashboard': 'Dashboard',
  'view-order':     'Pesan Laundry',
  'view-schedule':  'Jadwal Penjemputan',
  'view-pricing':   'Harga & Promo',
  'view-scanner':   'AI Scanner',
  'view-tracking':  'Lacak Pesanan',
  'view-clothes':   'Lemari Cucian',
  'view-eco':       'Eco Dashboard',
  'view-referral':  'Referral & Reward',
};

// =====================================================
// THEME ENGINE
// =====================================================
function initTheme() {
  const saved = localStorage.getItem('wb_theme') || 'dark';
  applyTheme(saved);
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('wb_theme', theme);
  const isDark = theme === 'dark';

  const icon   = document.getElementById('theme-icon');
  const tbIcon = document.getElementById('topbar-theme-icon');

  if (icon)   icon.className   = isDark ? 'ph-fill ph-moon'    : 'ph-fill ph-sun';
  if (tbIcon) tbIcon.className = isDark ? 'ph-fill ph-sun-dim' : 'ph-fill ph-moon';
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') || 'dark';
  applyTheme(current === 'dark' ? 'light' : 'dark');
}

// =====================================================
// LAUNDRY BACKGROUND BUBBLES
// =====================================================
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
      left:${b.l}%;
      bottom: -${b.w}px;
      animation-duration:${b.dur}s;
      animation-delay:${b.delay}s;
    `;
    bg.appendChild(el);
  });
}

// =====================================================
// NAVIGATION
// =====================================================
const navLinks  = document.querySelectorAll('#main-nav a');
const pageViews = document.querySelectorAll('.page-view');

function navigate(targetId) {
  navLinks.forEach(link => {
    link.classList.toggle('active', link.getAttribute('data-target') === targetId);
  });
  pageViews.forEach(view => {
    const isTarget = view.id === targetId;
    view.classList.toggle('hidden',  !isTarget);
    view.classList.toggle('active',   isTarget);
  });
  const crumb = document.getElementById('tb-breadcrumb');
  if (crumb) crumb.innerHTML = `<strong>${PAGE_TITLES[targetId] || ''}</strong>`;

  if (targetId === 'view-tracking') setTimeout(startLiveTracking, 300);
  if (window.innerWidth < 900) document.getElementById('sidebar')?.classList.remove('open');
}

navLinks.forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    navigate(link.getAttribute('data-target'));
  });
});

// =====================================================
// SIDEBAR MOBILE
// =====================================================
function toggleSidebar() {
  document.getElementById('sidebar')?.classList.toggle('open');
}
document.addEventListener('click', e => {
  const sidebar = document.getElementById('sidebar');
  const btn     = document.getElementById('menu-toggle');
  if (sidebar && window.innerWidth < 900 &&
      sidebar.classList.contains('open') &&
      !sidebar.contains(e.target) && !btn?.contains(e.target)) {
    sidebar.classList.remove('open');
  }
});

// =====================================================
// WEATHER SIMULATION
// =====================================================
function initWeather() {
  const w = WEATHER_DATA[Math.floor(Math.random() * WEATHER_DATA.length)];
  const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  set('sb-weather-icon',  w.icon);
  set('sb-weather-temp',  w.temp);
  set('sb-weather-desc',  w.desc);
  set('sb-weather-tip',   w.tip);
  set('dash-weather-icon', w.icon);
  set('dash-weather-temp', w.temp);
  set('dash-weather-cond', w.cond);
  set('dash-weather-tip',  w.tip);
}

// =====================================================
// NOTIFICATIONS
// =====================================================
document.getElementById('notif-btn')?.addEventListener('click', e => {
  e.stopPropagation();
  document.getElementById('notif-dropdown')?.classList.toggle('hidden');
  document.getElementById('notif-dot')?.remove();
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
// LOYALTY CARD 3D
// =====================================================
const loyaltyCard = document.getElementById('loyalty-card-3d');
if (loyaltyCard) {
  const inner = loyaltyCard.querySelector('.lc-inner');
  const glare = document.getElementById('lc-glare');
  loyaltyCard.addEventListener('mousemove', e => {
    if (!inner) return;
    const r  = loyaltyCard.getBoundingClientRect();
    const nx = (e.clientX - r.left) / r.width  - 0.5;
    const ny = (e.clientY - r.top)  / r.height - 0.5;
    inner.style.transform = `perspective(900px) rotateX(${-ny*14}deg) rotateY(${nx*14}deg) scale3d(1.02,1.02,1.02)`;
    if (glare) {
      glare.style.opacity = '1';
      glare.style.background = `radial-gradient(circle at ${e.clientX - r.left}px ${e.clientY - r.top}px, rgba(79,126,255,0.1) 0%, transparent 65%)`;
    }
  });
  loyaltyCard.addEventListener('mouseleave', () => {
    if (inner) inner.style.transform = '';
    if (glare) glare.style.opacity = '0';
  });
}

// =====================================================
// AI SCANNER
// =====================================================
function startScan() {
  const idle   = document.getElementById('scan-idle-state');
  const active = document.getElementById('scan-active-state');
  const result = document.getElementById('scan-result');
  const status = document.getElementById('scan-status-text');
  const img    = document.getElementById('scan-image');
  if (!idle || !active) return;

  idle.style.display = 'none';
  active.classList.remove('hidden');
  result?.classList.add('hidden');

  const scenario = SCAN_SCENARIOS[Math.floor(Math.random() * SCAN_SCENARIOS.length)];
  const imgPool  = SCAN_SCENARIOS.map(s => s.img);
  let imgIdx = 0;

  const logs = [
    'Memulai kamera WashBot Vision AI...', 'Memindai spektrum warna & pola noda...',
    'Menganalisis kerapatan serat kain...', 'Mencocokkan dengan 10.000+ data WashBot...',
    'Menyusun rekomendasi pencucian...',
  ];
  let logIdx = 0;
  if (status) status.textContent = logs[0];
  const logTimer = setInterval(() => { if (++logIdx < logs.length && status) status.textContent = logs[logIdx]; }, 750);
  const imgTimer = setInterval(() => {
    if (!img) return;
    img.style.opacity = '0.3';
    setTimeout(() => { img.src = imgPool[imgIdx++ % imgPool.length]; img.style.opacity = '1'; }, 150);
  }, 550);

  setTimeout(() => {
    clearInterval(logTimer); clearInterval(imgTimer);
    active.classList.add('hidden');
    idle.style.display = '';
    const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    set('scan-fabric', scenario.fabric);
    set('scan-stain',  scenario.stain);
    set('scan-rec',    scenario.rec);
    result?.classList.remove('hidden');
    result?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, 4200);
}
function resetScan() {
  document.getElementById('scan-idle-state').style.display  = '';
  document.getElementById('scan-active-state')?.classList.add('hidden');
  document.getElementById('scan-result')?.classList.add('hidden');
}

// =====================================================
// ORDER WIZARD
// =====================================================
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
    if (n < step) { el.classList.add('done'); if (ln) ln.classList.add('active'); }
    else if (n === step) el.classList.add('active');
  });
  if (step >= 2) recalc();
  target.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
function updateQty(delta) {
  const input = document.getElementById('order-qty');
  if (!input) return;
  let val = Math.min(50, Math.max(1, (parseInt(input.value)||1) + delta));
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
  msg.classList.remove('hidden','ok','err');
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
    if (!btn) return;
    const orig = btn.innerHTML;
    btn.innerHTML = '<i class="ph-bold ph-check"></i> Disalin!';
    btn.style.color = 'var(--green)';
    setTimeout(() => { btn.innerHTML = orig; btn.style.color = ''; }, 2000);
  }).catch(() => showToast('Salin manual: ' + code));
}

// =====================================================
// PAYMENT MODAL
// =====================================================
function showPaymentModal() {
  const qty   = parseInt(document.getElementById('order-qty')?.value) || 1;
  const total = Math.round(qty * (PRICING[currentService]||8000) * (1 - discountMultiplier));
  const fmt   = 'Rp ' + total.toLocaleString('id-ID');

  ['qris','va','cod'].forEach(id => document.getElementById('payment-content-'+id)?.classList.add('hidden'));
  const panelMap = { 'QRIS':'qris', 'E-Wallet':'va', 'Tunai':'cod' };
  document.getElementById('payment-content-'+(panelMap[currentPayment]||'qris'))?.classList.remove('hidden');
  ['qris-amount','va-amount','cod-amount'].forEach(id => { const el = document.getElementById(id); if (el) el.textContent = fmt; });
  document.getElementById('payment-modal-backdrop')?.classList.remove('hidden');
}
function closePayment() {
  document.getElementById('payment-modal-backdrop')?.classList.add('hidden');
}
function closePaymentOutside(e) {
  if (e.target === document.getElementById('payment-modal-backdrop')) closePayment();
}
function confirmPayment() {
  closePayment();
  const orderId = 'WB-' + Math.floor(1000 + Math.random()*9000);
  const qty     = parseInt(document.getElementById('order-qty')?.value) || 1;
  const total   = Math.round(qty * (PRICING[currentService]||8000) * (1 - discountMultiplier));
  const order   = { id: orderId, service: currentService, qty, total, status:'pickup', date: new Date().toISOString(), payment: currentPayment };
  const existing = JSON.parse(localStorage.getItem('wb_bookings') || '[]');
  existing.unshift(order);
  localStorage.setItem('wb_bookings',     JSON.stringify(existing.slice(0, 20)));
  localStorage.setItem('wb_active_order', JSON.stringify(order));
  showToast('✓ Pesanan #' + orderId + ' berhasil dibuat!');
  discountMultiplier = 0;
  setTimeout(() => { goStep(1); navigate('view-dashboard'); loadActiveOrder(); updateRecentOrders(); }, 1000);
}

// =====================================================
// ACTIVE ORDER FROM LOCALSTORAGE
// =====================================================
function loadActiveOrder() {
  const raw   = localStorage.getItem('wb_active_order');
  const order = raw ? JSON.parse(raw) : null;
  const idEl  = document.getElementById('active-order-id');
  const detailEls = document.querySelectorAll('#active-order-detail');

  if (!order) {
    if (idEl) idEl.textContent = 'Tidak ada';
    detailEls.forEach(el => { el.innerHTML = 'Belum ada pesanan aktif. <a href="#" onclick="navigate(\'view-order\'); return false;">Pesan sekarang →</a>'; });
    resetTrackerSteps('#st-', '#ln-', 4);
    resetTrackerSteps('#tr-st-', '#tr-ln-', 4);
    return;
  }

  if (idEl) idEl.textContent = '#' + order.id;

  const statusMap = {
    pickup:   { step:0, label:'📦 Kurir sedang dalam perjalanan menjemput cucian kamu.' },
    washing:  { step:1, label:'🧺 Pakaian sedang dalam proses pencucian di outlet kami.' },
    delivery: { step:2, label:'🚴 Kurir sedang mengantar pesanan ke lokasimu.' },
    done:     { step:3, label:'✅ Pesanan selesai dan sudah diterima. Terima kasih!' },
  };
  const info = statusMap[order.status] || statusMap['pickup'];
  detailEls.forEach(el => { el.textContent = info.label; });

  updateTrackerSteps('#st-', '#ln-', info.step, 4);
  updateTrackerSteps('#tr-st-', '#tr-ln-', info.step, 4);
}

function resetTrackerSteps(stepPfx, linePfx, count) {
  for (let i = 0; i < count; i++) {
    document.querySelector(stepPfx + i)?.classList.remove('completed','active');
    if (i < count - 1) document.querySelector(linePfx + i)?.classList.remove('active');
  }
  document.querySelector(stepPfx + '0')?.classList.add('active');
}

function updateTrackerSteps(stepPfx, linePfx, activeIdx, count) {
  for (let i = 0; i < count; i++) {
    const stepEl = document.querySelector(stepPfx + i);
    if (!stepEl) continue;
    stepEl.classList.remove('completed','active');
    if (i < activeIdx)        stepEl.classList.add('completed');
    else if (i === activeIdx) stepEl.classList.add('active');

    if (i < count - 1) {
      const lineEl = document.querySelector(linePfx + i);
      lineEl?.classList.toggle('active', i < activeIdx);
    }
  }
}

function updateRecentOrders() {
  const list   = document.getElementById('recent-orders-list');
  if (!list) return;
  const orders = JSON.parse(localStorage.getItem('wb_bookings') || '[]');
  if (!orders.length) return;
  const iconMap = { 'Wash Regular':'ph-washing-machine','Wash Kilat':'ph-rocket','Dry Cleaning':'ph-coat-hanger','Premium Spa':'ph-sneaker','Cuci Karpet':'ph-rug','Cuci Sofa':'ph-armchair' };
  list.innerHTML = orders.slice(0,5).map(o => `
    <div class="ro-item">
      <div class="ro-icon"><i class="ph-fill ${iconMap[o.service]||'ph-package'}"></i></div>
      <div class="ro-info">
        <span class="ro-name">${o.service} — ${o.qty} item</span>
        <span class="ro-date">${new Date(o.date).toLocaleDateString('id-ID',{day:'numeric',month:'long',year:'numeric'})}</span>
      </div>
      <span class="ro-badge done">Selesai</span>
    </div>`).join('');
}

// =====================================================
// SCHEDULE PICKUP — CALENDAR
// =====================================================
const MONTHS = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
const DAYS   = ['Min','Sen','Sel','Rab','Kam','Jum','Sab'];

function renderCalendar() {
  const grid  = document.getElementById('cal-grid');
  const label = document.getElementById('cal-month-label');
  if (!grid || !label) return;
  label.textContent = MONTHS[calMonth] + ' ' + calYear;

  const today     = new Date();
  const firstDay  = new Date(calYear, calMonth, 1).getDay();
  const daysInMon = new Date(calYear, calMonth+1, 0).getDate();

  let html = DAYS.map(d => `<div class="cal-day-name">${d}</div>`).join('');

  for (let i = 0; i < firstDay; i++) html += '<div class="cal-day empty"></div>';

  for (let d = 1; d <= daysInMon; d++) {
    const isToday    = d === today.getDate() && calMonth === today.getMonth() && calYear === today.getFullYear();
    const isSelected = selectedDate && d === selectedDate.getDate() && calMonth === selectedDate.getMonth() && calYear === selectedDate.getFullYear();
    const isPast     = new Date(calYear, calMonth, d) < new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const cls = [
      'cal-day',
      isToday    ? 'today'    : '',
      isSelected ? 'selected' : '',
      isPast     ? 'empty'    : '',
    ].filter(Boolean).join(' ');

    html += isPast
      ? `<div class="${cls}" style="opacity:0.3">${d}</div>`
      : `<div class="${cls}" onclick="pickDate(${d})">${d}</div>`;
  }
  grid.innerHTML = html;
}

function changeMonth(dir) {
  calMonth += dir;
  if (calMonth < 0) { calMonth = 11; calYear--; }
  if (calMonth > 11){ calMonth = 0;  calYear++; }
  renderCalendar();
}

function pickDate(day) {
  selectedDate = new Date(calYear, calMonth, day);
  renderCalendar();
  updateScheduleSummary();
}

function selectTimeSlot(el, slot) {
  document.querySelectorAll('.time-slot').forEach(s => s.classList.remove('selected'));
  el.classList.add('selected');
  selectedTimeSlot = slot;
  updateScheduleSummary();
}

function updateScheduleSummary() {
  const el = document.getElementById('sch-summary');
  if (!el) return;
  if (selectedDate && selectedTimeSlot) {
    el.textContent = selectedDate.toLocaleDateString('id-ID',{weekday:'long',day:'numeric',month:'long',year:'numeric'}) + ' · ' + selectedTimeSlot;
    el.style.color = 'var(--text)';
  } else if (selectedDate) {
    el.textContent = selectedDate.toLocaleDateString('id-ID',{weekday:'long',day:'numeric',month:'long',year:'numeric'}) + ' · Pilih slot waktu';
    el.style.color = 'var(--text-2)';
  } else {
    el.textContent = 'Pilih tanggal & slot waktu';
    el.style.color = 'var(--text-2)';
  }
}

function confirmSchedule() {
  if (!selectedDate || !selectedTimeSlot) {
    showToast('❗ Pilih tanggal dan slot waktu terlebih dahulu.', 'error');
    return;
  }
  const service = document.getElementById('sch-service')?.value || 'Wash Regular';
  const notes   = document.getElementById('sch-notes')?.value || '';
  const schKey  = selectedDate.toLocaleDateString('id-ID',{weekday:'long',day:'numeric',month:'long'}) + ' · ' + selectedTimeSlot;

  // Save to localStorage
  const schedules = JSON.parse(localStorage.getItem('wb_schedules') || '[]');
  schedules.unshift({ date: selectedDate.toISOString(), slot: selectedTimeSlot, service, notes, id: 'SCH-' + Date.now() });
  localStorage.setItem('wb_schedules', JSON.stringify(schedules.slice(0, 10)));

  // Update sidebar upcoming
  updateSidebarSchedule();

  showToast('✓ Jadwal dikonfirmasi: ' + schKey);
  selectedDate = null; selectedTimeSlot = null;
  renderCalendar();
  updateScheduleSummary();
  document.querySelectorAll('.time-slot').forEach(s => s.classList.remove('selected'));
  if (document.getElementById('sch-notes')) document.getElementById('sch-notes').value = '';
}

function updateSidebarSchedule() {
  const el = document.getElementById('sb-schedule-preview');
  if (!el) return;
  const schedules = JSON.parse(localStorage.getItem('wb_schedules') || '[]');
  if (!schedules.length) {
    el.innerHTML = '<div class="sb-no-schedule">Belum ada jadwal aktif</div>';
    return;
  }
  const s = schedules[0];
  const d = new Date(s.date);
  el.innerHTML = `
    <div class="sb-upcoming-dot"></div>
    <span class="sb-upcoming-text">${d.toLocaleDateString('id-ID',{day:'numeric',month:'short'})}</span>
    <span class="sb-upcoming-time">${s.slot.split('–')[0]}</span>
  `;
}

// =====================================================
// CLOTHES TRACKER — FILTER
// =====================================================
function filterClothes(status, btn) {
  document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
  btn?.classList.add('active');
  document.querySelectorAll('.clothes-item').forEach(item => {
    if (status === 'all' || item.dataset.status === status) {
      item.style.display = '';
    } else {
      item.style.display = 'none';
    }
  });
}
document.getElementById('clothes-search')?.addEventListener('input', e => {
  const q = e.target.value.toLowerCase();
  document.querySelectorAll('.clothes-item').forEach(item => {
    const name = item.querySelector('.ci-name')?.textContent.toLowerCase() || '';
    item.style.display = name.includes(q) ? '' : 'none';
  });
});

// =====================================================
// REFERRAL
// =====================================================
function shareReferral() {
  const code = document.getElementById('referral-code')?.textContent || 'SULTAN-X72';
  const text = `Hei! Coba layanan laundry premium WashBuddy 🧺 Pakai kode referral aku ${code} dan dapet diskon 30% di pesanan pertamamu! 🎉 https://washbuddy-umber.vercel.app`;
  if (navigator.share) {
    navigator.share({ title: 'WashBuddy Referral', text, url: 'https://washbuddy-umber.vercel.app' });
  } else {
    navigator.clipboard.writeText(text).then(() => showToast('✓ Link referral disalin!'));
  }
}

// =====================================================
// LIVE TRACKING
// =====================================================
const BEZIER = { x:[10,40,30,90], y:[85,85,20,20] };
function bezier(t, p0, p1, p2, p3) {
  const m = 1-t;
  return m*m*m*p0 + 3*m*m*t*p1 + 3*m*t*t*p2 + t*t*t*p3;
}

function startLiveTracking() {
  if (isTracking) { clearInterval(trackingInterval); clearInterval(countdownInterval); }

  const courier = COURIERS[Math.floor(Math.random() * COURIERS.length)];
  const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  const setImg = (id, val) => { const el = document.getElementById(id); if (el) el.src = val; };

  set('courier-name',   courier.name);
  set('courier-rating', '⭐ ' + courier.rating + ' (Mitra Elite)');
  setImg('courier-img', courier.avatar);

  globalTimeLeft = 120;
  isTracking = true;
  let t = 0;

  countdownInterval = setInterval(() => {
    globalTimeLeft = Math.max(0, globalTimeLeft - 1);
    const mm = String(Math.floor(globalTimeLeft / 60)).padStart(2,'0');
    const ss = String(globalTimeLeft % 60).padStart(2,'0');
    set('live-time', mm + ':' + ss);
    const km = Math.max(0, (5 * (1-t))).toFixed(1);
    set('live-distance', km + ' km');
    if (globalTimeLeft <= 0) { clearInterval(countdownInterval); isTracking = false; set('live-time','Tiba!'); }
  }, 1000);

  trackingInterval = setInterval(() => {
    t = Math.min(1, t + 0.005);
    const dot = document.getElementById('moving-courier');
    if (dot) { dot.style.left = bezier(t,...BEZIER.x)+'%'; dot.style.top  = bezier(t,...BEZIER.y)+'%'; }
    const fill = document.getElementById('courier-progress');
    if (fill) fill.style.width = (t*100)+'%';
    if (t >= 1) clearInterval(trackingInterval);
  }, 500);

  // Inject courier chat
  setTimeout(() => {
    const msgs = document.getElementById('chat-messages');
    if (msgs) {
      const el = document.createElement('div');
      el.className = 'msg bot';
      el.style.borderLeft = '2px solid var(--teal)';
      el.innerHTML = `<strong style="color:var(--teal);font-size:0.72rem">🏍 Kurir (${courier.name})</strong><br>Halo! Saya sudah otw ke lokasi kamu. Estimasi ~2 menit. Ada petunjuk khusus untuk alamat? 🙏`;
      msgs.appendChild(el);
      msgs.scrollTop = msgs.scrollHeight;
    }
  }, 3000);

  loadActiveOrder();
}

function restartTracking() {
  clearInterval(trackingInterval);
  clearInterval(countdownInterval);
  isTracking = false;
  const dot = document.getElementById('moving-courier');
  if (dot) { dot.style.left = '10%'; dot.style.top = '85%'; }
  const fill = document.getElementById('courier-progress');
  if (fill) fill.style.width = '0%';
  startLiveTracking();
}

// =====================================================
// CHATBOT
// =====================================================
function toggleChat() {
  const box = document.getElementById('ai-chatbox');
  const dot = document.getElementById('chat-dot');
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
  const input = document.getElementById('chat-input-field');
  const msgs  = document.getElementById('chat-messages');
  if (!input || !msgs) return;
  const text = input.value.trim();
  if (!text) return;

  const userEl = document.createElement('div');
  userEl.className = 'msg user';
  userEl.textContent = text;
  msgs.appendChild(userEl);
  input.value = '';
  msgs.scrollTop = msgs.scrollHeight;

  const loadEl = document.createElement('div');
  loadEl.className = 'msg bot loading';
  loadEl.id = 'load-' + Date.now();
  loadEl.innerHTML = '<span></span><span></span><span></span>';
  msgs.appendChild(loadEl);
  msgs.scrollTop = msgs.scrollHeight;

  try {
    const res = await fetch(API + '/chat', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ message: text }) });
    if (!res.ok) throw new Error('offline');
    const data = await res.json();
    loadEl.remove();
    appendBot(msgs, data.reply);
  } catch {
    loadEl.remove();
    appendBot(msgs, getLocalReply(text));
  }
}
function appendBot(container, text) {
  const el = document.createElement('div');
  el.className = 'msg bot';
  el.innerHTML = text.replace(/\n/g,'<br>');
  container.appendChild(el);
  container.scrollTop = container.scrollHeight;
}
function getLocalReply(t) {
  t = t.toLowerCase();
  if (/harga|tarif|biaya/.test(t))      return 'Harga laundry kami mulai dari <strong>Rp 8.000/kg</strong> (Wash Regular) hingga <strong>Rp 100.000/seat</strong> (Cuci Sofa). Lihat selengkapnya di menu Harga & Promo!';
  if (/promo|diskon|voucher|kode/.test(t)) return 'Promo aktif sekarang:\n<strong>NEWUSER50</strong> — diskon 50% (member baru)\n<strong>WEEKEND20</strong> — diskon 20% (akhir pekan)\nMasukkan kode saat checkout!';
  if (/jadwal|jemput|schedule/.test(t)) return 'Kamu bisa jadwalkan penjemputan di menu <strong>Jadwal Penjemputan</strong>! Pilih tanggal dan slot waktu yang nyaman, kurir kami siap datang.';
  if (/dry clean|jas|gaun|formal/.test(t))  return 'Dry Cleaning untuk jas, gaun, sutra, dan formal mulai <strong>Rp 25.000/pcs</strong>, selesai 2–3 hari kerja.';
  if (/karpet/.test(t))                 return 'Cuci karpet menggunakan ekstraktor khusus, efektif angkat debu & tungau. Mulai <strong>Rp 30.000/m²</strong>.';
  if (/sofa/.test(t))                   return 'Cuci sofa on-site atau antar ke outlet. Harga <strong>Rp 100.000/seat</strong>.';
  if (/kilat|express|24 jam/.test(t))   return 'Wash Kilat + Setrika selesai dalam <strong>24 jam</strong>! Harga <strong>Rp 15.000/kg</strong>.';
  if (/lacak|track|pesanan/.test(t))    return 'Lacak pesanan aktif kamu di menu <strong>Lacak Pesanan</strong> — posisi kurir real-time dengan peta!';
  if (/scan|noda|ai/.test(t))           return 'WashBot Vision AI bisa deteksi jenis noda secara otomatis! Coba di menu <strong>AI Scanner</strong> — gratis dan akurasi 96%!';
  if (/referral|ajak|teman/.test(t))    return 'Program referral WashBuddy: bagikan kode unikmu dan kamu dapat <strong>200 poin</strong> tiap teman yang berhasil pesan. Cek menu Referral!';
  if (/eco|hijau|lingkungan/.test(t))   return 'WashBuddy menggunakan detergen bio-enzim, batch washing hemat energi, dan kurir eco-route. Lihat dampakmu di <strong>Eco Dashboard</strong>!';
  if (/poin|point|reward/.test(t))      return 'Kamu punya <strong>1.250 poin</strong> saat ini! Gunakan di checkout untuk diskon tambahan, atau tukar dengan voucher layanan.';
  return 'Halo Sultan! Saya WashBot siap membantu 😊 Tanya soal harga, jadwal, promo, AI Scanner, atau apa saja!';
}

// =====================================================
// TOAST
// =====================================================
function showToast(msg, type = 'success') {
  document.querySelector('.toast')?.remove();
  const el = document.createElement('div');
  el.className = 'toast' + (type === 'error' ? ' error' : '');
  el.innerHTML = `<i class="ph-fill ${type==='error'?'ph-warning-circle':'ph-check-circle'}"></i> ${msg}`;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 3500);
}

// =====================================================
// INIT
// =====================================================
document.addEventListener('DOMContentLoaded', () => {
  // Date display
  const dateEl = document.getElementById('current-date');
  if (dateEl) dateEl.textContent = new Date().toLocaleDateString('id-ID',{weekday:'long',day:'numeric',month:'long',year:'numeric'});

  initTheme();
  initBubbles();
  initWeather();
  loadActiveOrder();
  updateRecentOrders();
  updateSidebarSchedule();
  recalc();
  renderCalendar();

  // Show notif dot if unreads exist
  const unreads = document.querySelectorAll('.np-item.unread');
  const dot     = document.getElementById('notif-dot');
  if (unreads.length > 0 && dot) dot.style.display = 'block';
  else if (dot) dot.style.display = 'none';
});
