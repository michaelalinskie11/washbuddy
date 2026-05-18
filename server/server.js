import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = process.env.PORT || 3000;
const DB_PATH = path.join(__dirname, 'db.json');
const ADMIN_PASS = process.env.ADMIN_PASSWORD || 'washbuddy2026';
const JWT_SECRET = process.env.JWT_SECRET || 'washbuddy-secret-key-2026';

// ===== DATABASE HELPERS =====
function readDB() {
  try { return JSON.parse(fs.readFileSync(DB_PATH, 'utf8')); }
  catch { return { orders: [], orderCounter: 5 }; }
}
function writeDB(data) {
  try { fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2)); }
  catch (e) { console.error('DB write error:', e.message); }
}

// ===== SIMPLE TOKEN AUTH =====
function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}
const activeSessions = new Set();

function requireAuth(req, res, next) {
  const token = req.headers['x-admin-token'];
  if (!token || !activeSessions.has(token)) {
    return res.status(401).json({ status: 'error', message: 'Tidak terotorisasi. Silakan login.' });
  }
  next();
}

function validateOrder(body) {
  const errors = [];
  if (!body.customer || body.customer.trim().length < 2) errors.push('Nama pelanggan minimal 2 karakter');
  if (!body.service) errors.push('Layanan harus dipilih');
  const qty = parseInt(body.items);
  if (isNaN(qty) || qty < 1 || qty > 100) errors.push('Jumlah item harus antara 1-100');
  return errors;
}

// ===== MIDDLEWARE =====
const ALLOWED_ORIGINS = ['http://localhost:5173', 'http://localhost:3000', 'https://washbuddy.vercel.app'];
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || ALLOWED_ORIGINS.some(o => origin.startsWith(o.split('//')[1] || o)) || process.env.NODE_ENV !== 'production') cb(null, true);
    else cb(null, true); // allow all for now, tighten in prod
  },
  credentials: true
}));
app.use(express.json({ limit: '1mb' }));
app.use(express.static(path.join(__dirname, '../dist')));
app.use(express.static(path.join(__dirname, '..')));

const PRICING = {
  'Wash Regular': 8000, 'Wash Kilat': 15000, 'Dry Cleaning': 25000,
  'Premium Spa': 50000, 'Cuci Karpet': 30000, 'Cuci Sofa': 100000,
};
const VALID_STATUSES = ['Menunggu Penjemputan', 'Dijemput Kurir', 'Proses Cuci', 'Proses Setrika', 'Sedang Diantar', 'Selesai', 'Dibatalkan'];

// ===== HEALTH =====
app.get('/api/health', (req, res) => {
  const db = readDB();
  res.json({ status: 'ok', uptime: process.uptime(), orders: db.orders.length, timestamp: new Date().toISOString() });
});

// ===== AUTH =====
app.post('/api/auth/login', (req, res) => {
  const { password } = req.body;
  if (!password) return res.status(400).json({ status: 'error', message: 'Password diperlukan' });
  if (password !== ADMIN_PASS) {
    return res.status(401).json({ status: 'error', message: 'Password salah. Coba lagi.' });
  }
  const token = generateToken();
  activeSessions.add(token);
  setTimeout(() => activeSessions.delete(token), 24 * 60 * 60 * 1000); // 24 jam
  res.json({ status: 'success', token, message: 'Login berhasil!' });
});

app.post('/api/auth/logout', (req, res) => {
  const token = req.headers['x-admin-token'];
  if (token) activeSessions.delete(token);
  res.json({ status: 'success', message: 'Logout berhasil' });
});

app.get('/api/auth/verify', requireAuth, (req, res) => {
  res.json({ status: 'success', authenticated: true });
});

// ===== PUBLIC ORDERS (for customer) =====
app.get('/api/orders', (req, res) => {
  const db = readDB();
  const { id } = req.query;
  if (id) {
    const order = db.orders.find(o => o.id === id);
    return order
      ? res.json({ status: 'success', data: order })
      : res.status(404).json({ status: 'error', message: 'Pesanan tidak ditemukan' });
  }
  res.json({ status: 'success', data: db.orders, count: db.orders.length });
});

app.post('/api/orders', (req, res) => {
  const errors = validateOrder(req.body);
  if (errors.length) return res.status(400).json({ status: 'error', message: errors.join(', ') });

  const db = readDB();
  const { customer, service, items, total, payment, address, phone } = req.body;
  const qty = parseInt(items);
  const price = PRICING[service] || 8000;
  const newOrder = {
    id: `WB-${String(db.orderCounter++).padStart(3, '0')}`,
    customer: customer.trim(),
    phone: phone || '',
    address: address || '',
    service: service,
    items: qty,
    total: total || qty * price,
    payment: payment || 'QRIS',
    status: 'Menunggu Penjemputan',
    rating: null,
    review: null,
    createdAt: new Date().toISOString(),
  };
  db.orders.push(newOrder);
  writeDB(db);
  res.status(201).json({ status: 'success', data: newOrder });
});

app.patch('/api/orders/:id/status', (req, res) => {
  const { status } = req.body;
  if (!VALID_STATUSES.includes(status)) {
    return res.status(400).json({ status: 'error', message: 'Status tidak valid' });
  }
  const db = readDB();
  const idx = db.orders.findIndex(o => o.id === req.params.id);
  if (idx === -1) return res.status(404).json({ status: 'error', message: 'Pesanan tidak ditemukan' });
  db.orders[idx].status = status;
  writeDB(db);
  res.json({ status: 'success', data: db.orders[idx] });
});

app.post('/api/orders/:id/rating', (req, res) => {
  const { rating, review } = req.body;
  if (!rating || rating < 1 || rating > 5) return res.status(400).json({ status: 'error', message: 'Rating harus 1-5' });
  const db = readDB();
  const idx = db.orders.findIndex(o => o.id === req.params.id);
  if (idx === -1) return res.status(404).json({ status: 'error', message: 'Pesanan tidak ditemukan' });
  db.orders[idx].rating = parseInt(rating);
  db.orders[idx].review = review || '';
  writeDB(db);
  res.json({ status: 'success', data: db.orders[idx] });
});

// Admin-protected delete
app.delete('/api/orders/:id', requireAuth, (req, res) => {
  const db = readDB();
  const before = db.orders.length;
  db.orders = db.orders.filter(o => o.id !== req.params.id);
  if (db.orders.length === before) return res.status(404).json({ status: 'error', message: 'Pesanan tidak ditemukan' });
  writeDB(db);
  res.json({ status: 'success' });
});

// Admin-only: all orders with stats
app.get('/api/admin/orders', requireAuth, (req, res) => {
  const db = readDB();
  const totalRevenue = db.orders.filter(o => o.status === 'Selesai').reduce((s, o) => s + o.total, 0);
  const activeCount = db.orders.filter(o => !['Selesai', 'Dibatalkan'].includes(o.status)).length;
  res.json({ status: 'success', data: db.orders, count: db.orders.length, stats: { totalRevenue, activeCount } });
});

// ===== CHAT =====
app.post('/api/chat', (req, res) => {
  if (!req.body.message) return res.status(400).json({ status: 'error', message: 'Pesan tidak boleh kosong' });
  const msg = req.body.message.toLowerCase().slice(0, 500);
  let reply = '';

  if (msg.match(/halo|hai|hello|hi|selamat|hei/)) {
    reply = '🤖 Halo! Saya WashBot, asisten pintar WashBuddy. Ada yang bisa saya bantu?';
  } else if (msg.match(/harga|biaya|berapa|tarif/)) {
    reply = '💰 **Daftar Harga:**\n• Wash Regular — Rp 8.000/kg\n• Wash Kilat — Rp 15.000/kg\n• Dry Cleaning — Rp 25.000/pcs\n• Shoe & Bag Spa — Rp 50.000/item\n• Cuci Karpet — Rp 30.000/m²\n• Cuci Sofa — Rp 100.000/seat';
  } else if (msg.match(/promo|diskon|voucher/)) {
    reply = '🎉 **Promo Aktif:**\n• **NEWUSER50** — Diskon 50% pesanan pertama\n• **WEEKEND20** — Diskon 20% Sabtu & Minggu';
  } else if (msg.match(/lacak|status|pesanan|tracking/)) {
    const db = readDB();
    const last = db.orders[db.orders.length - 1];
    reply = last ? `📦 Pesanan terakhir: **${last.id}** — Status: **${last.status}**` : '📦 Belum ada pesanan aktif.';
  } else if (msg.match(/lama|waktu|kapan|durasi/)) {
    reply = '⏱️ **Estimasi:** Wash Regular 12-24 jam, Kilat 6 jam, Dry Clean 1-2 hari, Karpet/Sofa 2-3 hari';
  } else if (msg.match(/bayar|qris|transfer|cod/)) {
    reply = '💳 Kami terima: QRIS, Transfer Bank (BCA/Mandiri/BRI/BNI), & COD';
  } else if (msg.match(/jam|buka|tutup|operasional/)) {
    reply = '🕐 WashBuddy buka **24 jam / 7 hari** termasuk hari libur!';
  } else if (msg.match(/karpet|sofa|kasur|sprei|bedcover/)) {
    reply = '🛋️ **Cuci Besar:** Karpet Rp 30.000/m², Sofa Rp 100.000/seat, Sprei Rp 25.000/set';
  } else if (msg.match(/sepatu|tas|shoes|bag/)) {
    reply = '👟 **Shoe & Bag Spa** Rp 50.000: Deep Clean, Anti-Jamur, Waterproof Coating';
  } else if (msg.match(/komplain|masalah|rusak|hilang|kecewa/)) {
    reply = '😔 Mohon maaf! Laporan Anda diteruskan ke Tim Admin. Respons dalam 5-10 menit.';
  } else if (msg.match(/admin|agen|cs|operator/)) {
    reply = '🎧 Menghubungkan ke **Agen Admin**... Mohon tunggu 5-10 menit atau hubungi WA: **0812-WASH-BUDDY**';
  } else if (msg.match(/terima kasih|makasih|thanks/)) {
    reply = 'Sama-sama! 😊 Selamat menggunakan WashBuddy! ✨';
  } else {
    reply = '🤔 Saya belum memahami pertanyaan itu. Pilih topik di bawah atau hubungi Admin langsung!';
  }
  res.json({ reply });
});

// ===== PAYMENT MOCK =====
app.post('/api/payment/create', (req, res) => {
  const { orderId, amount, method } = req.body;
  if (!orderId || !amount) return res.status(400).json({ status: 'error', message: 'Data pembayaran tidak lengkap' });
  const paymentId = 'PAY-' + crypto.randomBytes(6).toString('hex').toUpperCase();
  res.json({
    status: 'success',
    paymentId,
    orderId,
    amount,
    method: method || 'QRIS',
    qrisUrl: `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=WASHBUDDY-${paymentId}`,
    expiredAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
    message: 'Pembayaran berhasil dibuat. Selesaikan dalam 15 menit.',
  });
});

// ===== SPA FALLBACK =====
const tryFile = (main, fallback) => (req, res) => {
  res.sendFile(main, err => { if (err) res.sendFile(fallback, e => { if (e) res.status(404).send('Not found'); }); });
};
app.get('/app', tryFile(path.join(__dirname, '../dist/app/index.html'), path.join(__dirname, '../app/index.html')));
app.use('/app/', tryFile(path.join(__dirname, '../dist/app/index.html'), path.join(__dirname, '../app/index.html')));
app.get('/admin', tryFile(path.join(__dirname, '../dist/admin/index.html'), path.join(__dirname, '../admin/index.html')));
app.use('/admin/', tryFile(path.join(__dirname, '../dist/admin/index.html'), path.join(__dirname, '../admin/index.html')));
app.use('/', tryFile(path.join(__dirname, '../dist/index.html'), path.join(__dirname, '../index.html')));

app.listen(PORT, () => {
  console.log(`\n🚀 WashBuddy Server → http://localhost:${PORT}`);
  console.log(`   API Health: http://localhost:${PORT}/api/health`);
  console.log(`   Admin Password: ${ADMIN_PASS}\n`);
});

export default app;
