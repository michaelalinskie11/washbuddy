// ===== WASHBUDDY CUSTOMER APP =====
// Global State
const API = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:3000/api'
  : '/api';

const PRICING = {
  'Wash Regular': 8000,
  'Wash Kilat': 15000,
  'Dry Cleaning': 25000,
  'Premium Spa': 50000,
  'Cuci Karpet': 30000,
  'Cuci Sofa': 100000,
};

const COURIERS = [
  { name: 'Ahmad Fauzi', rating: '4.9' },
  { name: 'Budi Santoso', rating: '4.8' },
  { name: 'Chandra Wijaya', rating: '5.0' },
  { name: 'Dimas Pratama', rating: '4.7' },
  { name: 'Eko Prasetyo', rating: '4.9' },
  { name: 'Fajar Rahman', rating: '4.8' },
  { name: 'Gilang Nugraha', rating: '4.6' },
  { name: 'Hendra Setiawan', rating: '4.9' },
];

const SCAN_SCENARIOS = [
  { fabric: 'Katun Premium', stain: 'Tumpahan Kopi', rec: 'Dry Cleaning + Oxi-Boost', img: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&auto=format&fit=crop' },
  { fabric: 'Denim / Jeans', stain: 'Noda Oli Mesin', rec: 'Wash Regular + Heavy Duty', img: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&auto=format&fit=crop' },
  { fabric: 'Wool / Rajut', stain: 'Tumpahan Coklat', rec: 'Premium Spa Anti-Shrink', img: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=600&auto=format&fit=crop' },
  { fabric: 'Linen', stain: 'Noda Saus Tomat', rec: 'Dry Cleaning + Spot Treatment', img: 'https://images.unsplash.com/photo-1596755094514-f87e32f85e2c?w=600&auto=format&fit=crop' },
  { fabric: 'Polyester Sport', stain: 'Keringat & Lumpur', rec: 'Wash Kilat + Anti-Odor', img: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=600&auto=format&fit=crop' },
  { fabric: 'Sutra Murni', stain: 'Noda Anggur (Wine)', rec: 'Premium Spa Delicate Mode', img: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=600&auto=format&fit=crop' },
  { fabric: 'Jaket Kulit', stain: 'Noda Jamur', rec: 'Dry Cleaning + Leather Restore', img: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&auto=format&fit=crop' },
  { fabric: 'Sepatu Kanvas', stain: 'Noda Tanah & Debu', rec: 'Shoe Spa Deep Clean', img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop' },
  { fabric: 'Karpet Berbulu', stain: 'Tumpahan Susu', rec: 'Cuci Karpet + Disinfektan', img: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&auto=format&fit=crop' },
];

let currentService = 'Wash Regular';
let currentPayment = 'QRIS';
let discountMultiplier = 0;
let countdownInterval = null;
let globalTimeLeft = 120;
let isTracking = false;
let activeOrderId = null;

// ===== NAVIGATION =====
const navLinks = document.querySelectorAll('#main-nav a');
const views = document.querySelectorAll('.page-view');

function navigate(targetId) {
  navLinks.forEach(link => {
    link.classList.toggle('active', link.getAttribute('data-target') === targetId);
  });
  views.forEach(view => {
    const isTarget = view.id === targetId;
    view.classList.toggle('hidden', !isTarget);
    view.classList.toggle('active', isTarget);
    if (isTarget && window.gsap) {
      gsap.fromTo(view, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' });
    }
  });
}

navLinks.forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    navigate(link.getAttribute('data-target'));
  });
});

// ===== NOTIFICATIONS =====
function toggleNotifications() {
  document.getElementById('notif-dropdown').classList.toggle('hidden');
  document.getElementById('notif-dot').style.display = 'none';
}

document.addEventListener('click', e => {
  const dropdown = document.getElementById('notif-dropdown');
  if (!dropdown.classList.contains('hidden') && !dropdown.contains(e.target) && !e.target.closest('[onclick="toggleNotifications()"]')) {
    dropdown.classList.add('hidden');
  }
});

// ===== AI SCANNER =====
function startScan() {
  document.getElementById('scan-area').classList.add('hidden');
  document.getElementById('scan-result').classList.add('hidden');
  const anim = document.getElementById('scan-animation');
  anim.classList.remove('hidden');

  const scanImg = document.getElementById('scan-image');
  let idx = 0;
  const scenario = SCAN_SCENARIOS[Math.floor(Math.random() * SCAN_SCENARIOS.length)];
  const imgs = SCAN_SCENARIOS.map(s => s.img);

  const imgInterval = setInterval(() => {
    scanImg.style.opacity = 0;
    setTimeout(() => {
      scanImg.src = imgs[idx % imgs.length];
      scanImg.style.opacity = 1;
      idx++;
    }, 200);
  }, 500);

  setTimeout(() => {
    clearInterval(imgInterval);
    anim.classList.add('hidden');
    scanImg.src = scenario.img;

    document.getElementById('scan-fabric').textContent = scenario.fabric;
    document.getElementById('scan-stain').textContent = scenario.stain;
    document.getElementById('scan-rec').textContent = `Gunakan layanan ${scenario.rec} untuk hasil optimal.`;

    const result = document.getElementById('scan-result');
    result.classList.remove('hidden');
    if (window.gsap) gsap.fromTo(result, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5 });
  }, 4000);
}

// ===== ORDER WIZARD =====
function selectService(element, serviceName) {
  document.querySelectorAll('.srv-card-img').forEach(c => c.classList.remove('selected'));
  element.classList.add('selected');
  currentService = serviceName;
  updateSummary();
}

function selectPayment(element, method) {
  document.querySelectorAll('.pay-card').forEach(c => c.classList.remove('selected'));
  element.classList.add('selected');
  currentPayment = method;
}

function nextWizard(step) {
  document.querySelectorAll('.wizard-step').forEach(s => s.classList.add('hidden'));
  const target = document.getElementById('w-step-' + step);
  if (!target) return;
  target.classList.remove('hidden');
  if (window.gsap) gsap.fromTo(target, { opacity: 0, x: 30 }, { opacity: 1, x: 0, duration: 0.35 });
}

function updateQty(change) {
  const input = document.getElementById('order-qty');
  let val = (parseInt(input.value) || 1) + change;
  if (val < 1) val = 1;
  if (val > 50) val = 50;
  input.value = val;
  updateSummary();
}

function updateSummary() {
  const qty = parseInt(document.getElementById('order-qty')?.value) || 1;
  const unitPrice = PRICING[currentService] || 8000;
  const subtotal = qty * unitPrice;
  const discount = subtotal * discountMultiplier;
  const total = subtotal - discount;

  const fmt = n => 'Rp ' + n.toLocaleString('id-ID');
  if (document.getElementById('summary-subtotal')) document.getElementById('summary-subtotal').textContent = fmt(subtotal);
  if (document.getElementById('summary-discount')) document.getElementById('summary-discount').textContent = '- ' + fmt(discount);
  if (document.getElementById('summary-total')) document.getElementById('summary-total').textContent = fmt(total);
  if (document.getElementById('final-bill')) document.getElementById('final-bill').textContent = fmt(total);
}

function applyPromo() {
  const code = document.getElementById('promo-input').value.trim().toUpperCase();
  const msg = document.getElementById('promo-message');
  if (code === 'NEWUSER50') {
    discountMultiplier = 0.5;
    msg.textContent = '✅ Promo NEWUSER50 berhasil! Diskon 50% diterapkan.';
    msg.style.color = '#00E5A0';
    msg.classList.remove('hidden');
  } else if (code === 'WEEKEND20') {
    discountMultiplier = 0.2;
    msg.textContent = '✅ Promo WEEKEND20 berhasil! Diskon 20% diterapkan.';
    msg.style.color = '#00E5A0';
    msg.classList.remove('hidden');
  } else if (code !== '') {
    discountMultiplier = 0;
    msg.textContent = '❌ Kode promo tidak valid atau sudah kadaluarsa.';
    msg.style.color = '#FF4D4D';
    msg.classList.remove('hidden');
  } else {
    discountMultiplier = 0;
    msg.classList.add('hidden');
  }
  updateSummary();
}

function copyPromo() {
  navigator.clipboard.writeText('NEWUSER50').then(() => {
    const btn = document.querySelector('[onclick="copyPromo()"]');
    if (btn) { btn.textContent = '✅ Disalin!'; setTimeout(() => { btn.innerHTML = '<i class="ph-bold ph-copy"></i> Salin'; }, 2000); }
  });
}

// ===== PAYMENT =====
function showPaymentModal() {
  const qty = parseInt(document.getElementById('order-qty').value) || 1;
  const unitPrice = PRICING[currentService] || 8000;
  const total = qty * unitPrice * (1 - discountMultiplier);
  const fmt = 'Rp ' + total.toLocaleString('id-ID');

  ['qris', 'va', 'cod'].forEach(id => document.getElementById('payment-content-' + id).classList.add('hidden'));

  if (currentPayment === 'QRIS') {
    document.getElementById('payment-content-qris').classList.remove('hidden');
    document.getElementById('qris-amount').textContent = fmt;
  } else if (currentPayment === 'E-Wallet') {
    document.getElementById('payment-content-va').classList.remove('hidden');
    document.getElementById('va-amount').textContent = fmt;
  } else {
    document.getElementById('payment-content-cod').classList.remove('hidden');
    document.getElementById('cod-amount').textContent = fmt;
  }

  document.getElementById('payment-modal').classList.remove('hidden');
  if (window.gsap) gsap.fromTo('.payment-box', { scale: 0.85, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.4, ease: 'back.out(1.5)' });
}

function closePayment() {
  document.getElementById('payment-modal').classList.add('hidden');
}

async function confirmPayment() {
  const qty = parseInt(document.getElementById('order-qty').value) || 1;
  const unitPrice = PRICING[currentService] || 8000;
  const total = qty * unitPrice * (1 - discountMultiplier);

  const btn = document.querySelector('#payment-modal .btn-primary:not(.hidden)');
  if (btn) { btn.textContent = 'Memproses...'; btn.disabled = true; }

  try {
    const res = await fetch(`${API}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customer: 'Sultan', service: currentService, items: qty, total }),
    });
    const data = await res.json();
    activeOrderId = data.data.id;

    closePayment();
    document.getElementById('order-qty').value = 1;
    discountMultiplier = 0;
    document.getElementById('promo-input').value = '';
    document.getElementById('promo-message').classList.add('hidden');
    document.getElementById('user-points').textContent = '1,350 Pts';
    updateSummary();
    nextWizard(1);
    document.getElementById('active-order-id').textContent = '#' + activeOrderId;

    if (isTracking) {
      clearInterval(countdownInterval);
      isTracking = false;
    }
    navigate('view-tracking');
    startLiveTracking();
  } catch (err) {
    alert('Gagal terhubung ke server. Pastikan backend berjalan.');
    if (btn) { btn.textContent = 'Coba Lagi'; btn.disabled = false; }
  }
}

// ===== LIVE TRACKER =====
function startLiveTracking() {
  if (isTracking) {
    clearInterval(countdownInterval);
    isTracking = false;
  }
  isTracking = true;
  globalTimeLeft = 120;

  const courier = COURIERS[Math.floor(Math.random() * COURIERS.length)];
  const courierNameEl = document.getElementById('courier-name');
  const courierImgEl = document.getElementById('courier-img');
  const courierRatingEl = document.getElementById('courier-rating');
  if (courierNameEl) courierNameEl.textContent = courier.name;
  if (courierRatingEl) courierRatingEl.textContent = '⭐ ' + courier.rating + ' (Mitra Elite)';
  if (courierImgEl) courierImgEl.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(courier.name)}&background=00E5FF&color=0a0f1e&bold=true&size=100`;

  const liveTimeEl = document.getElementById('live-time');
  const liveDistEl = document.getElementById('live-distance');
  const progressEl = document.getElementById('courier-progress');
  const detailEl = document.getElementById('active-order-detail');
  const statusSteps = document.querySelectorAll('.status-tracker .step');
  const statusLines = document.querySelectorAll('.status-tracker .line');

  countdownInterval = setInterval(() => {
    globalTimeLeft--;
    const progress = Math.min(1, 1 - globalTimeLeft / 120);

    // Timer display
    const m = Math.floor(globalTimeLeft / 60);
    const s = globalTimeLeft % 60;
    if (liveTimeEl) liveTimeEl.textContent = globalTimeLeft <= 0 ? 'Tiba!' : `0${m}:${s < 10 ? '0' + s : s}`;
    if (liveDistEl) liveDistEl.textContent = globalTimeLeft <= 0 ? '0 km' : `${(5 * (1 - progress)).toFixed(1)} km`;
    if (progressEl) progressEl.style.width = (progress * 100) + '%';

    // Status & tracker visual
    let status, detail, step;
    if (globalTimeLeft <= 0) {
      status = 'Selesai'; detail = '✅ Pakaian telah diterima. Terima kasih telah menggunakan WashBuddy!'; step = 3;
    } else if (progress > 0.6) {
      status = 'Sedang Diantar'; detail = '🏍️ Kurir sedang dalam perjalanan menuju lokasi Anda!'; step = 2;
    } else if (progress > 0.25) {
      status = 'Proses Cuci'; detail = '🫧 Pakaian Anda sedang dibersihkan dengan teknologi canggih kami.'; step = 1;
    } else {
      status = 'Menunggu Penjemputan'; detail = '📦 Kurir akan segera tiba untuk menjemput pakaian Anda.'; step = 0;
    }

    if (detailEl) detailEl.textContent = detail;

    // Update step visuals
    statusSteps.forEach((el, i) => {
      el.classList.remove('active', 'completed');
      if (i < step) el.classList.add('completed');
      else if (i === step) el.classList.add('active');
    });
    statusLines.forEach((el, i) => {
      el.classList.toggle('active', i < step);
    });

    // Update badge in dashboard
    const orderIdEl = document.getElementById('active-order-id');
    if (orderIdEl && activeOrderId) orderIdEl.textContent = '#' + activeOrderId;

    // Courier dot animation on map
    const dot = document.getElementById('moving-courier');
    if (dot) {
      const x = 10 + progress * 78;
      const y = 80 - progress * 58;
      dot.style.left = x + '%';
      dot.style.top = y + '%';
    }

    // Patch status to server
    if (activeOrderId) {
      fetch(`${API}/orders/${activeOrderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      }).catch(() => {});
    }

    if (globalTimeLeft <= 0) {
      clearInterval(countdownInterval);
      isTracking = false;
    }
  }, 1000);
}

async function loadActiveOrder() {
  try {
    const res = await fetch(`${API}/orders`);
    const data = await res.json();
    if (data.data && data.data.length > 0) {
      const order = data.data[data.data.length - 1];
      if (!activeOrderId) activeOrderId = order.id;
      const el = document.getElementById('active-order-id');
      if (el) el.textContent = '#' + order.id;
    }
  } catch (e) {}
}

// ===== AI CHATBOT =====
function toggleChat() {
  const chatbox = document.getElementById('ai-chatbox');
  chatbox.classList.toggle('active');
  const badge = document.querySelector('.chat-badge');
  if (badge) badge.style.display = 'none';
}

async function sendChatMessage() {
  const input = document.getElementById('chat-input-field');
  const text = (input.value || '').trim();
  if (!text) return;

  const messages = document.getElementById('chat-messages');
  messages.innerHTML += `<div class="message user">${text}</div>`;
  input.value = '';
  messages.scrollTop = messages.scrollHeight;

  const loadingId = 'load-' + Date.now();
  messages.innerHTML += `<div class="message bot loading" id="${loadingId}"><span></span><span></span><span></span></div>`;
  messages.scrollTop = messages.scrollHeight;

  try {
    const res = await fetch(`${API}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text })
    });
    const data = await res.json();
    document.getElementById(loadingId)?.remove();
    messages.innerHTML += `<div class="message bot">${data.reply.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</div>`;
  } catch (e) {
    document.getElementById(loadingId)?.remove();
    messages.innerHTML += `<div class="message bot">Maaf, server sedang sibuk. Coba lagi sebentar.</div>`;
  }
  messages.scrollTop = messages.scrollHeight;
}

function sendOption(text) {
  document.getElementById('chat-input-field').value = text;
  sendChatMessage();
}

// Enter key support for chat
document.getElementById('chat-input-field')?.addEventListener('keydown', e => {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendChatMessage(); }
});

// ===== NOTIFICATIONS =====
function clearNotifs() {
  const list = document.getElementById('notif-list');
  const dot = document.getElementById('notif-dot');
  if (list) {
    list.querySelectorAll('.notif-item.unread').forEach(el => el.classList.remove('unread'));
  }
  if (dot) dot.style.display = 'none';
  document.getElementById('notif-dropdown')?.classList.add('hidden');
}

// ===== HOVER FLOAT EFFECT =====
document.querySelectorAll('.hover-float').forEach(el => {
  el.addEventListener('mouseenter', () => el.style.transform = 'translateY(-8px)');
  el.addEventListener('mouseleave', () => el.style.transform = '');
});

// ===== INIT =====
console.log('%c🚀 WashBuddy Elite App Initialized!', 'color:#00E5FF; font-size:18px; font-weight:bold;');
updateSummary();
loadActiveOrder();
setInterval(loadActiveOrder, 8000);

// 3D Tilt cards
document.querySelectorAll('.srv-card-img').forEach(card => {
  card.addEventListener('mousemove', e => {
    const r = card.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    card.style.transform = `perspective(600px) rotateY(${x * 12}deg) rotateX(${-y * 12}deg) scale(1.03)`;
  });
  card.addEventListener('mouseleave', () => { card.style.transform = ''; });
});
