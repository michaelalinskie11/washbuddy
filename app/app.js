// ===== WASHBUDDY ELITE CUSTOMER PORTAL ENGINE =====
// Global State & Core Systems
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
  { name: 'Ahmad Fauzi', rating: '4.9', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop' },
  { name: 'Budi Santoso', rating: '4.8', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop' },
  { name: 'Chandra Wijaya', rating: '5.0', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop' },
  { name: 'Dimas Pratama', rating: '4.7', avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&auto=format&fit=crop' },
  { name: 'Eko Prasetyo', rating: '4.9', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop' },
];

const SCAN_SCENARIOS = [
  { fabric: 'Sutra Murni (Silk)', stain: 'Noda Kopi & Lipstik', rec: 'Premium Spa Delicate Mode', img: 'https://images.unsplash.com/photo-1520637102912-2df6bb2aec6d?w=600&auto=format&fit=crop' },
  { fabric: 'Katun Oxford', stain: 'Tumpahan Kopi Susu', rec: 'Dry Cleaning + Oxi-Boost', img: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&auto=format&fit=crop' },
  { fabric: 'Denim Premium', stain: 'Noda Oli Mesin Pekat', rec: 'Wash Regular + Heavy Duty', img: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&auto=format&fit=crop' },
  { fabric: 'Wool Wol Wol', stain: 'Noda Cokelat Cair', rec: 'Premium Spa Anti-Shrink', img: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=600&auto=format&fit=crop' },
  { fabric: 'Linen Halus', stain: 'Noda Saus Tomat / Chili', rec: 'Dry Cleaning + Spot Treatment', img: 'https://images.unsplash.com/photo-1596755094514-f87e32f85e2c?w=600&auto=format&fit=crop' },
  { fabric: 'Polyester Active', stain: 'Keringat & Noda Lumpur', rec: 'Wash Kilat + Anti-Odor Treatment', img: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=600&auto=format&fit=crop' }
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
      gsap.fromTo(view, { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' });
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
  const dot = document.getElementById('notif-dot');
  if (dot) dot.style.display = 'none';
}

document.addEventListener('click', e => {
  const dropdown = document.getElementById('notif-dropdown');
  if (dropdown && !dropdown.classList.contains('hidden') && !dropdown.contains(e.target) && !e.target.closest('[onclick="toggleNotifications()"]')) {
    dropdown.classList.add('hidden');
  }
});

function clearNotifs() {
  const list = document.getElementById('notif-list');
  const dot = document.getElementById('notif-dot');
  if (list) {
    list.querySelectorAll('.notif-item.unread').forEach(el => el.classList.remove('unread'));
  }
  if (dot) dot.style.display = 'none';
  document.getElementById('notif-dropdown')?.classList.add('hidden');
}

// ===== 3D HOVER AND PHYSICAL EFFECTS SYSTEM =====
// 1. Bento Loyalty Card Hologram and 3D Tilting Physics
const loyaltyCard = document.querySelector('.bento-loyalty');
if (loyaltyCard) {
  loyaltyCard.addEventListener('mousemove', e => {
    const r = loyaltyCard.getBoundingClientRect();
    const x = e.clientX - r.left; // x coordinate within card
    const y = e.clientY - r.top;  // y coordinate within card
    
    // Normalize coordinates around card center (-0.5 to 0.5)
    const normalizedX = (x / r.width) - 0.5;
    const normalizedY = (y / r.height) - 0.5;
    
    // Degrees of rotation: max 15 degrees tilt
    const rotX = -normalizedY * 15;
    const rotY = normalizedX * 15;
    
    loyaltyCard.style.transform = `perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale3d(1.02, 1.02, 1.02)`;
    
    // Glow/Glare movement
    const glare = loyaltyCard.querySelector('.card-glare');
    if (glare) {
      glare.style.opacity = '1';
      glare.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(0, 229, 255, 0.15) 0%, rgba(255, 255, 255, 0) 65%)`;
    }
  });

  loyaltyCard.addEventListener('mouseleave', () => {
    loyaltyCard.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    const glare = loyaltyCard.querySelector('.card-glare');
    if (glare) glare.style.opacity = '0';
  });
}

// 2. Premium floating micro-animations
document.querySelectorAll('.hover-float').forEach(el => {
  el.addEventListener('mouseenter', () => el.style.transform = 'translateY(-6px)');
  el.addEventListener('mouseleave', () => el.style.transform = '');
});

// 3. Wizard Service Cards 3D Effect
document.querySelectorAll('.srv-card-img').forEach(card => {
  card.addEventListener('mousemove', e => {
    const r = card.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    card.style.transform = `perspective(600px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg) scale(1.02)`;
  });
  card.addEventListener('mouseleave', () => { card.style.transform = ''; });
});

// ===== AI STAIN SCANNER (WASHBOT VISION AI) =====
function startScan() {
  document.getElementById('scan-area').classList.add('hidden');
  document.getElementById('scan-result').classList.add('hidden');
  const anim = document.getElementById('scan-animation');
  anim.classList.remove('hidden');

  const scanImg = document.getElementById('scan-image');
  const scanStatusText = document.getElementById('scan-status-text');
  
  let idx = 0;
  const scenario = SCAN_SCENARIOS[Math.floor(Math.random() * SCAN_SCENARIOS.length)];
  const imgs = SCAN_SCENARIOS.map(s => s.img);

  // Dynamic neural AI processing log cycle
  const logs = [
    "Memulai lensa WashBot Vision AI...",
    "Memindai koordinat noda & spektrometri warna...",
    "Menganalisis kerapatan kain & material rajut...",
    "Mencocokkan solusi dengan 10.000+ basis data WashBot...",
    "Menyusun rekomendasi penanganan noda khusus..."
  ];

  let logIdx = 0;
  scanStatusText.textContent = logs[0];
  const logInterval = setInterval(() => {
    logIdx++;
    if (logIdx < logs.length) {
      scanStatusText.textContent = logs[logIdx];
    }
  }, 800);

  // Image flash preview effect (simulating scan cycles)
  const imgInterval = setInterval(() => {
    scanImg.style.opacity = 0.3;
    setTimeout(() => {
      scanImg.src = imgs[idx % imgs.length];
      scanImg.style.opacity = 1;
      idx++;
    }, 150);
  }, 600);

  setTimeout(() => {
    clearInterval(imgInterval);
    clearInterval(logInterval);
    anim.classList.add('hidden');
    scanImg.src = scenario.img;

    document.getElementById('scan-fabric').textContent = scenario.fabric;
    document.getElementById('scan-stain').textContent = scenario.stain;
    
    // Rich recommendations
    document.getElementById('scan-rec').innerHTML = `
      <strong>${scenario.rec}</strong><br>
      <span style="font-size:0.85rem; color:var(--text-muted); display:inline-block; margin-top:5px; line-height:1.4;">
        <i class="ph-bold ph-info"></i> Formula noda khusus akan disemprotkan sebelum proses cuci untuk mengangkat noda membandel tanpa merusak serat kain.
      </span>
    `;

    const result = document.getElementById('scan-result');
    result.classList.remove('hidden');
    if (window.gsap) gsap.fromTo(result, { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.4 });
  }, 4000);
}

// ===== ORDER WIZARD SYSTEM =====
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
  if (window.gsap) gsap.fromTo(target, { opacity: 0, x: 25 }, { opacity: 1, x: 0, duration: 0.3, ease: 'power2.out' });
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

// ===== PAYMENT ACTIONS =====
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
  if (window.gsap) gsap.fromTo('.payment-box', { scale: 0.9, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.35, ease: 'back.out(1.4)' });
}

function closePayment() {
  document.getElementById('payment-modal').classList.add('hidden');
}

// ===== LOCALSTORAGE & SYNC CLIENT DATABASE FALLBACK =====
async function confirmPayment() {
  const qty = parseInt(document.getElementById('order-qty').value) || 1;
  const unitPrice = PRICING[currentService] || 8000;
  const total = qty * unitPrice * (1 - discountMultiplier);
  const formattedTotal = 'Rp ' + total.toLocaleString('id-ID');

  const btn = document.querySelector('#payment-modal .btn-primary:not(.hidden)');
  if (btn) { btn.textContent = 'Memproses...'; btn.disabled = true; }

  const randomNum = Math.floor(1000 + Math.random() * 9000);
  const invoiceId = `WB-${randomNum}`;

  // Local storage mapping closure
  const localSave = (statusLabel) => {
    const newBooking = {
      id: invoiceId,
      service: currentService,
      qty: qty,
      schedule: currentService.includes('Kilat') ? 'Express' : 'Regular',
      total: formattedTotal,
      pay: currentPayment,
      date: new Date().toLocaleDateString('id-ID'),
      slot: 'Pagi (08:00 - 12:00)',
      rawService: currentService.toLowerCase().replace(/\s+/g, '_'),
      status: statusLabel || 'Kurir Menjemput',
      timestamp: new Date().getTime()
    };

    const existingBookings = JSON.parse(localStorage.getItem('wb_bookings') || '[]');
    existingBookings.push(newBooking);
    localStorage.setItem('wb_bookings', JSON.stringify(existingBookings));
  };

  try {
    const res = await fetch(`${API}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customer: 'Sultan', service: currentService, items: qty, total }),
    });
    const data = await res.json();
    activeOrderId = data.data.id;

    // Save to local storage for portal-landing sync
    localSave('Kurir Menjemput');
    
    closePayment();
    resetWizardAfterCheckout(activeOrderId);
  } catch (err) {
    console.warn("API Offline - Beralih ke Client-Side LocalStorage Fallback", err);
    activeOrderId = invoiceId;

    // Save to local storage for offline simulation search support
    localSave('Kurir Menjemput');

    closePayment();
    resetWizardAfterCheckout(activeOrderId);

    // Show stylized premium modal confirmation
    alert(`[Offline Mode] Pesanan Sukses Dibuat!\n\nID Pesanan Anda: ${invoiceId}\nLayanan: ${currentService} (${qty} item)\nTotal: ${formattedTotal}\n\nInvoice Anda telah tersimpan di LocalStorage dan siap dilacak di Homepage!`);
  }
}

function resetWizardAfterCheckout(orderId) {
  document.getElementById('order-qty').value = 1;
  discountMultiplier = 0;
  document.getElementById('promo-input').value = '';
  document.getElementById('promo-message').classList.add('hidden');
  document.getElementById('user-points').textContent = '1,350 Pts';
  
  updateSummary();
  nextWizard(1);
  document.getElementById('active-order-id').textContent = '#' + orderId;

  if (isTracking) {
    clearInterval(countdownInterval);
    isTracking = false;
  }
  navigate('view-tracking');
  startLiveTracking();
}

// ===== MATHEMATICAL BEZIER CURVE LIVE TRACKING SYSTEM =====
// SVG path represents a Cubic Bezier Curve: M 10 85 C 40 85, 30 20, 90 20
// Cubic Bezier Formula: B(t) = (1-t)^3 * P0 + 3(1-t)^2 * t * P1 + 3(1-t) * t^2 * P2 + t^3 * P3
function getBezierPoint(t, p0, p1, p2, p3) {
  const mt = 1 - t;
  return (
    Math.pow(mt, 3) * p0 +
    3 * Math.pow(mt, 2) * t * p1 +
    3 * mt * Math.pow(t, 2) * p2 +
    Math.pow(t, 3) * p3
  );
}

function startLiveTracking() {
  if (isTracking) {
    clearInterval(countdownInterval);
    isTracking = false;
  }
  isTracking = true;
  globalTimeLeft = 120; // 2 minutes journey

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

    // Timer UI
    const m = Math.floor(globalTimeLeft / 60);
    const s = globalTimeLeft % 60;
    if (liveTimeEl) liveTimeEl.textContent = globalTimeLeft <= 0 ? 'Tiba!' : `0${m}:${s < 10 ? '0' + s : s}`;
    if (liveDistEl) liveDistEl.textContent = globalTimeLeft <= 0 ? '0 km' : `${(5 * (1 - progress)).toFixed(1)} km`;
    if (progressEl) progressEl.style.width = (progress * 100) + '%';

    // Status Tracking Calculations
    let status, detail, step;
    if (globalTimeLeft <= 0) {
      status = 'Selesai';
      detail = '✅ Pakaian telah selesai diantar & diterima. Terima kasih!';
      step = 3;
    } else if (progress > 0.6) {
      status = 'Sedang Diantar';
      detail = '🏍️ Kurir sedang mengantar pakaian bersih Anda menuju rumah.';
      step = 2;
    } else if (progress > 0.25) {
      status = 'Proses Cuci';
      detail = '🫧 Pakaian Anda sedang dicuci higienis di Toko Pusat.';
      step = 1;
    } else {
      status = 'Menunggu Penjemputan';
      detail = '📦 Kurir WashBuddy sedang menuju lokasi untuk menjemput pakaian kotor.';
      step = 0;
    }

    if (detailEl) detailEl.textContent = detail;

    // Update Steps Progress Class UI
    statusSteps.forEach((el, i) => {
      el.classList.remove('active', 'completed');
      if (i < step) el.classList.add('completed');
      else if (i === step) el.classList.add('active');
    });
    statusLines.forEach((el, i) => {
      el.classList.toggle('active', i < step);
    });

    if (document.getElementById('active-order-id') && activeOrderId) {
      document.getElementById('active-order-id').textContent = '#' + activeOrderId;
    }

    // Precise Bezier Math curve mapping for courier motorcycle pin
    const dot = document.getElementById('moving-courier');
    if (dot) {
      const x = getBezierPoint(progress, 10, 40, 30, 90);
      const y = getBezierPoint(progress, 85, 85, 20, 20);
      dot.style.left = x + '%';
      dot.style.top = y + '%';
    }

    // Attempt to update backend status
    if (activeOrderId) {
      fetch(`${API}/orders/${activeOrderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      }).catch(() => {});

      // Keep LocalStorage state updated as well
      try {
        const bookings = JSON.parse(localStorage.getItem('wb_bookings') || '[]');
        const targetBooking = bookings.find(b => b.id === activeOrderId);
        if (targetBooking) {
          // Map portal states to landing page tracker states
          let landingStatus = 'Kurir Menjemput';
          if (step === 1) landingStatus = 'Proses Cuci';
          if (step === 2) landingStatus = 'Sedang Diantar';
          if (step === 3) landingStatus = 'Selesai';
          
          targetBooking.status = landingStatus;
          localStorage.setItem('wb_bookings', JSON.stringify(bookings));
        }
      } catch (e) {
        console.error(e);
      }
    }

    if (globalTimeLeft <= 0) {
      clearInterval(countdownInterval);
      isTracking = false;
    }
  }, 1000);
}

// ===== COURIER CHAT COMPONENT CONNECTOR =====
const chatCourierBtn = document.getElementById('chat-courier-btn');
if (chatCourierBtn) {
  chatCourierBtn.addEventListener('click', () => {
    const courierName = document.getElementById('courier-name')?.textContent || 'Kurir WashBuddy';
    
    toggleChatbox(true);
    
    // Clear chat badge
    const badge = document.querySelector('.chat-badge');
    if (badge) badge.style.display = 'none';

    // Inject live courier greeting
    const messages = document.getElementById('chat-messages');
    if (messages) {
      messages.innerHTML += `
        <div class="message bot" style="border-left: 3px solid var(--secondary); background: rgba(0, 229, 255, 0.05); padding: 10px; border-radius: 8px; margin-bottom: 10px;">
          <div style="font-size:0.8rem; color:var(--secondary); font-weight:800; margin-bottom:4px;"><i class="ph-fill ph-motorcycle"></i> Kurir (${courierName})</div>
          Halo Sultan! Saya ${courierName}, kurir WashBuddy Anda. Saya saat ini sedang dalam perjalanan menuju lokasi Anda. Mohon siapkan cucian Anda ya! Jika ada titipan pesan khusus atau petunjuk alamat, kabari saya di sini. Terima kasih! 🙏
        </div>
      `;
      messages.scrollTop = messages.scrollHeight;
    }
  });
}

function toggleChatbox(forceOpen = false) {
  const chatbox = document.getElementById('ai-chatbox');
  if (chatbox) {
    if (forceOpen) {
      chatbox.classList.add('active');
    } else {
      chatbox.classList.toggle('active');
    }
    const badge = document.querySelector('.chat-badge');
    if (badge && chatbox.classList.contains('active')) badge.style.display = 'none';
  }
}

// Override original toggleChat
window.toggleChat = () => toggleChatbox();

// ===== AI CHATBOT INTEGRATION =====
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
    // API is offline (e.g. Vercel deployment) - run a high-fidelity local AI rule-engine reply!
    document.getElementById(loadingId)?.remove();
    
    let botReply = "Maaf Sultan, saya sedang offline. Ada yang bisa saya bantu dengan pesanan Anda?";
    const query = text.toLowerCase();
    
    if (query.includes('harga') || query.includes('tarif')) {
      botReply = `Berikut daftar tarif WashBuddy Elite:<br>
      • <strong>Wash Regular:</strong> Rp 8.000 / kg (3 hari)<br>
      • <strong>Wash Kilat:</strong> Rp 15.000 / kg (24 jam)<br>
      • <strong>Dry Cleaning:</strong> Rp 25.000 / pcs<br>
      • <strong>Shoe/Bag Spa:</strong> Rp 50.000 / item<br>
      Pilih menu <strong>Pesan Laundry</strong> untuk melakukan pemesanan instan!`;
    } else if (query.includes('promo') || query.includes('diskon') || query.includes('voucher')) {
      botReply = `Wah, pas sekali! Hari ini Anda punya 2 kode promo aktif:<br>
      1. <strong>NEWUSER50</strong>: Potongan 50% untuk pesanan pertama Anda.<br>
      2. <strong>WEEKEND20</strong>: Diskon 20% khusus akhir pekan.<br>
      Ketik kode ini di kolom promo saat checkout untuk menikmati diskonnya! 🎁`;
    } else if (query.includes('lacak') || query.includes('posisi') || query.includes('kurir') || query.includes('order')) {
      if (isTracking && activeOrderId) {
        botReply = `Pesanan Anda <strong>#${activeOrderId}</strong> sedang aktif dilacak! Silakan buka halaman <strong>Live Tracker</strong> untuk melihat perjalanan motor kurir secara live di peta 3D kami. 🏍️`;
      } else {
        botReply = `Anda belum memiliki pesanan aktif saat ini. Buka halaman <strong>Pesan Laundry</strong> untuk memesan layanan WashBuddy pertama Anda!`;
      }
    } else if (query.includes('dry') || query.includes('lama')) {
      botReply = `Layanan <strong>Dry Cleaning</strong> eksklusif kami membutuhkan waktu sekitar 2-3 hari pengerjaan. Pakaian Anda akan dirawat secara khusus menggunakan cairan ramah lingkungan premium agar serat kain tetap lembut dan wangi elegan. ✨`;
    } else if (query.includes('karpet')) {
      botReply = `Tentu saja bisa! Layanan <strong>Cuci Karpet</strong> kami menggunakan mesin ekstraktor khusus untuk membersihkan debu mikro dan tungau hingga tuntas. Harganya mulai Rp 30.000 / m².`;
    } else if (query.includes('cod') || query.includes('tunai') || query.includes('bayar')) {
      botReply = `WashBuddy mendukung 3 metode pembayaran:<br>
      1. <strong>QRIS Otomatis</strong> (Gopay, OVO, ShopeePay, M-Banking)<br>
      2. <strong>Transfer Virtual Account</strong> Bank BCA<br>
      3. <strong>Cash on Delivery (COD)</strong> / Bayar Tunai ke Kurir.<br>
      Sangat fleksibel dan aman!`;
    } else if (query.includes('admin') || query.includes('halo') || query.includes('hai')) {
      botReply = `Halo Sultan! Selamat datang di WashBuddy Elite Customer Portal. Saya WashBot AI, asisten virtual pribadi Anda. Saya bisa membantu Anda cek tarif, melacak kurir, memberi rekomendasi noda, atau menghubungkan Anda ke Admin Whatsapp. Ada yang bisa dibantu hari ini?`;
    }

    messages.innerHTML += `<div class="message bot">${botReply}</div>`;
  }
  messages.scrollTop = messages.scrollHeight;
}

window.sendOption = (text) => {
  document.getElementById('chat-input-field').value = text;
  sendChatMessage();
};

document.getElementById('chat-input-field')?.addEventListener('keydown', e => {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendChatMessage(); }
});

// ===== DYNAMIC ACTIVE ORDER POLLING =====
async function loadActiveOrder() {
  try {
    const res = await fetch(`${API}/orders`);
    const data = await res.json();
    if (data.data && data.data.length > 0) {
      const order = data.data[data.data.length - 1];
      if (!activeOrderId) {
        activeOrderId = order.id;
        const el = document.getElementById('active-order-id');
        if (el) el.textContent = '#' + order.id;
        startLiveTracking();
      }
    }
  } catch (e) {
    // offline load fallback
    const bookings = JSON.parse(localStorage.getItem('wb_bookings') || '[]');
    if (bookings.length > 0 && !activeOrderId) {
      const latest = bookings[bookings.length - 1];
      activeOrderId = latest.id;
      const el = document.getElementById('active-order-id');
      if (el) el.textContent = '#' + latest.id;
      startLiveTracking();
    }
  }
}

// ===== INITIALIZATION =====
console.log('%c🚀 WashBuddy Premium Customer Portal Script Initialized!', 'color:#00E5FF; font-size:18px; font-weight:bold;');
updateSummary();
loadActiveOrder();
setInterval(loadActiveOrder, 15000);
