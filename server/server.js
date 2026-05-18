import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../dist')));

const PRICING = { 'Wash Regular':8000,'Wash Kilat':15000,'Dry Cleaning':25000,'Premium Spa':50000,'Cuci Karpet':30000,'Cuci Sofa':100000 };

let orders = [
  { id:'WB-001', customer:'Budi Hartono', service:'Wash Regular', items:5, total:40000, status:'Selesai', createdAt: new Date(Date.now()-86400000).toISOString() },
  { id:'WB-002', customer:'Siti Rahayu', service:'Dry Cleaning', items:3, total:75000, status:'Sedang Diantar', createdAt: new Date(Date.now()-3600000).toISOString() },
  { id:'WB-003', customer:'Ahmad Fauzi', service:'Wash Kilat', items:4, total:60000, status:'Proses Cuci', createdAt: new Date(Date.now()-1800000).toISOString() },
  { id:'WB-004', customer:'Dewi Lestari', service:'Premium Spa', items:2, total:100000, status:'Menunggu Penjemputan', createdAt: new Date().toISOString() },
];

let orderCounter = 5;

app.get('/api/health', (req, res) => res.json({ status:'ok', uptime: process.uptime() }));

app.get('/api/orders', (req, res) => res.json({ status:'success', data: orders, count: orders.length }));

app.post('/api/orders', (req, res) => {
  const { customer, service, items } = req.body;
  const qty = Math.max(1, parseInt(items) || 1);
  const price = PRICING[service] || 8000;
  const newOrder = {
    id: `WB-${String(orderCounter++).padStart(3,'0')}`,
    customer: (customer || 'Pelanggan').trim(),
    service: service || 'Wash Regular',
    items: qty,
    total: qty * price,
    status: 'Menunggu Penjemputan',
    createdAt: new Date().toISOString()
  };
  orders.push(newOrder);
  res.status(201).json({ status:'success', data: newOrder });
});

app.patch('/api/orders/:id/status', (req, res) => {
  const idx = orders.findIndex(o => o.id === req.params.id);
  if (idx === -1) return res.status(404).json({ status:'error', message:'Order tidak ditemukan' });
  orders[idx].status = req.body.status;
  res.json({ status:'success', data: orders[idx] });
});

app.delete('/api/orders/:id', (req, res) => {
  const before = orders.length;
  orders = orders.filter(o => o.id !== req.params.id);
  orders.length < before
    ? res.json({ status:'success' })
    : res.status(404).json({ status:'error', message:'Order tidak ditemukan' });
});

app.post('/api/chat', (req, res) => {
  const msg = (req.body.message || '').toLowerCase();
  let reply = '';

  if (msg.match(/halo|hai|hello|hi|selamat/)) {
    reply = '🤖 Halo! Saya WashBot. Saya bisa bantu soal pesanan, harga, promo, jadwal jemput, dan lainnya. Silakan pilih opsi di bawah!';
  } else if (msg.match(/harga|biaya|berapa|tarif|pricelist/)) {
    reply = '💰 **Daftar Harga WashBuddy:**\n• Wash Regular — Rp 8.000/kg\n• Wash Kilat (6 jam) — Rp 15.000/kg\n• Dry Cleaning — Rp 25.000/pcs\n• Shoe & Bag Spa — Rp 50.000/item\n• Cuci Karpet — Rp 30.000/m²\n• Cuci Sofa — Rp 100.000/seat';
  } else if (msg.match(/promo|diskon|voucher|kode/)) {
    reply = '🎉 **Promo Aktif:**\n• **NEWUSER50** — Diskon 50% pesanan pertama\n• **WEEKEND20** — Diskon 20% Sabtu & Minggu\n\nGunakan kode ini saat checkout!';
  } else if (msg.match(/lacak|status|pesanan|tracking|sampai/)) {
    const last = orders[orders.length - 1];
    reply = last
      ? `📦 Pesanan **${last.id}** (${last.customer}) status: **${last.status}**. Buka menu Live Tracker untuk posisi kurir!`
      : '📦 Belum ada pesanan aktif. Pesan dari menu "Pesan Laundry" sekarang!';
  } else if (msg.match(/lama|waktu|berapa hari|kapan|durasi/)) {
    reply = '⏱️ Estimasi:\n• Wash Regular — 12-24 jam\n• Wash Kilat — hanya 6 jam!\n• Dry Cleaning — 1-2 hari\n• Karpet/Sofa — 2-3 hari';
  } else if (msg.match(/bayar|pembayaran|qris|transfer|cod|tunai|ewallet/)) {
    reply = '💳 Kami terima:\n• QRIS (GoPay, OVO, Dana, ShopeePay)\n• Transfer Bank (BCA, Mandiri, BRI, BNI)\n• COD / Bayar Tunai di Tempat';
  } else if (msg.match(/jam|buka|tutup|operasional/)) {
    reply = '🕐 WashBuddy buka **24 jam / 7 hari** termasuk hari libur nasional!';
  } else if (msg.match(/noda|kopi|darah|luntur|oli|kotor/)) {
    reply = '🧪 Rekomendasi untuk noda membandel:\n• Kopi/teh → Dry Cleaning + Oxi Boost\n• Oli/mesin → Wash Regular + Heavy Duty\n• Luntur → Premium Spa warna\n\nKirim sekarang, kami yang urus!';
  } else if (msg.match(/karpet|sofa|kasur|bantal|sprei|bedcover/)) {
    reply = '🛋️ Layanan Cuci Besar:\n• Karpet — Rp 30.000/m²\n• Sofa — Rp 100.000/seat\n• Sprei/Bedcover — Rp 25.000/set\n• Kasur — Hubungi admin';
  } else if (msg.match(/sepatu|tas|shoes|bag/)) {
    reply = '👟 **Shoe & Bag Spa** mulai Rp 50.000:\n• Deep Cleaning\n• Anti-Jamur Treatment\n• Pengkondisi Kulit\n• Waterproof Coating';
  } else if (msg.match(/terima kasih|makasih|thanks|oke|ok/)) {
    reply = 'Sama-sama! 😊 Senang bisa membantu. Hubungi kami kapan saja ya!';
  } else if (msg.match(/komplain|masalah|rusak|hilang|kecewa/)) {
    reply = '😔 Mohon maaf atas ketidaknyamanannya. Pesan Anda langsung diteruskan ke **Tim Admin**. Agen kami akan merespons dalam 5-10 menit.';
  } else {
    reply = '🤔 Pertanyaan Anda telah diteruskan ke **Agen Admin** kami. Mohon tunggu, staf kami akan segera membalas. Atau pilih opsi di bawah untuk jawaban cepat!';
  }

  res.json({ reply });
});

// SPA fallback routes (Express 5 / path-to-regexp v8 compatible)
const sendApp = (req, res) => res.sendFile(path.join(__dirname, '../dist/app/index.html'));
const sendAdmin = (req, res) => res.sendFile(path.join(__dirname, '../dist/admin/index.html'));
const sendRoot = (req, res) => res.sendFile(path.join(__dirname, '../dist/index.html'));

app.get('/app', sendApp);
app.use('/app/', sendApp);
app.get('/admin', sendAdmin);
app.use('/admin/', sendAdmin);
app.use('/', sendRoot);

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
  console.log(`\n🚀 WashBuddy running on http://localhost:${PORT}`);
});
