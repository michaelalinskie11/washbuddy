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

const PRICING = {
  'Wash Regular': 8000,
  'Wash Kilat': 15000,
  'Dry Cleaning': 25000,
  'Premium Spa': 50000,
  'Cuci Karpet': 30000,
  'Cuci Sofa': 100000,
};

let orders = [
  { id: 'WB-001', customer: 'Budi Hartono', service: 'Wash Regular', items: 5, total: 40000, status: 'Selesai', createdAt: new Date(Date.now() - 86400000).toISOString() },
  { id: 'WB-002', customer: 'Siti Rahayu', service: 'Dry Cleaning', items: 3, total: 75000, status: 'Sedang Diantar', createdAt: new Date(Date.now() - 3600000).toISOString() },
  { id: 'WB-003', customer: 'Ahmad Fauzi', service: 'Wash Kilat', items: 4, total: 60000, status: 'Proses Cuci', createdAt: new Date(Date.now() - 1800000).toISOString() },
  { id: 'WB-004', customer: 'Dewi Lestari', service: 'Premium Spa', items: 2, total: 100000, status: 'Menunggu Penjemputan', createdAt: new Date().toISOString() },
];

let orderCounter = 5;

// ===== HEALTH CHECK =====
app.get('/api/health', (req, res) => res.json({ status: 'ok', uptime: process.uptime(), orders: orders.length }));

// ===== ORDERS =====
app.get('/api/orders', (req, res) => res.json({ status: 'success', data: orders, count: orders.length }));

app.post('/api/orders', (req, res) => {
  const { customer, service, items, total } = req.body;
  const qty = Math.max(1, parseInt(items) || 1);
  const price = PRICING[service] || 8000;
  const newOrder = {
    id: `WB-${String(orderCounter++).padStart(3, '0')}`,
    customer: (customer || 'Pelanggan').trim(),
    service: service || 'Wash Regular',
    items: qty,
    total: total || qty * price,
    status: 'Menunggu Penjemputan',
    createdAt: new Date().toISOString(),
  };
  orders.push(newOrder);
  res.status(201).json({ status: 'success', data: newOrder });
});

app.patch('/api/orders/:id/status', (req, res) => {
  const idx = orders.findIndex(o => o.id === req.params.id);
  if (idx === -1) return res.status(404).json({ status: 'error', message: 'Order tidak ditemukan' });
  orders[idx].status = req.body.status;
  res.json({ status: 'success', data: orders[idx] });
});

app.delete('/api/orders/:id', (req, res) => {
  const before = orders.length;
  orders = orders.filter(o => o.id !== req.params.id);
  orders.length < before
    ? res.json({ status: 'success' })
    : res.status(404).json({ status: 'error', message: 'Order tidak ditemukan' });
});

// ===== AI CHATBOT =====
app.post('/api/chat', (req, res) => {
  const msg = (req.body.message || '').toLowerCase();
  let reply = '';

  if (msg.match(/halo|hai|hello|hi|selamat|hei/)) {
    reply = '🤖 Halo! Saya WashBot, asisten pintar WashBuddy. Saya siap bantu soal pesanan, harga, promo, jadwal jemput, dan lainnya!\n\nSilakan ketik pertanyaan atau pilih topik di bawah.';
  } else if (msg.match(/harga|biaya|berapa|tarif|pricelist|daftar harga/)) {
    reply = '💰 **Daftar Harga WashBuddy:**\n• Wash Regular — Rp 8.000/kg\n• Wash Kilat (6 jam) — Rp 15.000/kg\n• Dry Cleaning — Rp 25.000/pcs\n• Shoe & Bag Spa — Rp 50.000/item\n• Cuci Karpet — Rp 30.000/m²\n• Cuci Sofa — Rp 100.000/seat\n\nSemua layanan termasuk antar-jemput gratis!';
  } else if (msg.match(/promo|diskon|voucher|kode/)) {
    reply = '🎉 **Promo Aktif Hari Ini:**\n• **NEWUSER50** — Diskon 50% pesanan pertama\n• **WEEKEND20** — Diskon 20% Sabtu & Minggu\n\nGunakan kode ini di halaman "Promo & Harga" saat checkout. Jangan sampai ketinggalan!';
  } else if (msg.match(/lacak|status|pesanan|tracking|mana|sampai/)) {
    const last = orders[orders.length - 1];
    reply = last
      ? `📦 Pesanan terakhir: **${last.id}** (${last.customer})\nStatus: **${last.status}**\n\nBuka menu **Live Tracker** untuk melihat posisi kurir secara real-time!`
      : '📦 Belum ada pesanan aktif. Yuk, buat pesanan pertama dari menu **Pesan Laundry**!';
  } else if (msg.match(/lama|waktu|berapa hari|kapan|durasi|estimasi/)) {
    reply = '⏱️ **Estimasi Waktu:**\n• Wash Regular — 12-24 jam\n• Wash Kilat — hanya 6 jam!\n• Dry Cleaning — 1-2 hari\n• Karpet/Sofa — 2-3 hari\n\nWash Kilat adalah pilihan terbaik jika Anda butuh cepat!';
  } else if (msg.match(/bayar|pembayaran|qris|transfer|cod|tunai|ewallet|gopay|ovo|dana/)) {
    reply = '💳 **Metode Pembayaran:**\n• QRIS (GoPay, OVO, Dana, ShopeePay)\n• Transfer Bank (BCA, Mandiri, BRI, BNI)\n• COD / Bayar Tunai di Tempat\n\nSemua metode tersedia dan aman!';
  } else if (msg.match(/jam|buka|tutup|operasional|24 jam/)) {
    reply = '🕐 WashBuddy buka **24 jam / 7 hari** termasuk hari libur nasional!\n\nKurir siap jemput kapan saja Anda butuhkan.';
  } else if (msg.match(/noda|kopi|darah|luntur|oli|kotor|bekas|flek/)) {
    reply = '🧪 **Rekomendasi untuk Noda Membandel:**\n• Kopi/teh → Dry Cleaning + Oxi Boost\n• Oli mesin → Wash Regular + Heavy Duty\n• Luntur/bleed → Premium Spa Treatment\n• Darah → Dry Cleaning segera\n\nKirim sekarang, semakin cepat semakin mudah dihilangkan!';
  } else if (msg.match(/karpet|sofa|kasur|bantal|sprei|bedcover|gorden/)) {
    reply = '🛋️ **Layanan Cuci Besar:**\n• Karpet — Rp 30.000/m²\n• Sofa — Rp 100.000/seat\n• Sprei & Bedcover — Rp 25.000/set\n• Kasur & Bantal — Hubungi admin\n• Gorden — Rp 15.000/m²\n\nAntar jemput ke rumah Anda!';
  } else if (msg.match(/sepatu|tas|shoes|bag|sneaker|sendal/)) {
    reply = '👟 **Shoe & Bag Spa** mulai Rp 50.000:\n• Deep Cleaning anti-noda\n• Anti-Jamur Treatment\n• Pengkondisi Kulit Premium\n• Waterproof Coating\n• Stretching & Reshaping\n\nKembalikan kejayaan koleksi Anda!';
  } else if (msg.match(/dry clean|jas|blazer|gaun|kebaya|sutra|wool/)) {
    reply = '🧥 **Dry Cleaning** adalah layanan terbaik untuk:\n• Jas & Blazer formal\n• Gaun & Kebaya\n• Bahan Sutra & Wool\n• Pakaian Branded\n\nHarga mulai Rp 25.000/pcs dengan teknologi pelarut bebas air!';
  } else if (msg.match(/alamat|lokasi|cabang|kantor|dimana/)) {
    reply = '📍 **Lokasi WashBuddy:**\nJl. Laundry Bersih No. 1, Jakarta Selatan\n\nTapi jangan khawatir, Anda tidak perlu datang! Kurir kami yang akan **jemput & antar** ke lokasi Anda. 🛵';
  } else if (msg.match(/daftar|register|akun|login/)) {
    reply = '👤 Untuk membuat akun WashBuddy, cukup gunakan portal pelanggan ini! Semua data pesanan Anda tersimpan otomatis. Tidak perlu registrasi yang ribet!';
  } else if (msg.match(/hubungkan|admin|agen|cs|customer service|operator/)) {
    reply = '🎧 Menghubungkan Anda ke **Agen Admin WashBuddy**...\n\nMohon tunggu sebentar. Agen kami akan merespons dalam **5-10 menit**. Anda juga bisa menghubungi kami via WhatsApp di **0812-WASH-BUDDY**.';
  } else if (msg.match(/terima kasih|makasih|thanks|thank you/)) {
    reply = 'Sama-sama! 😊 Senang bisa membantu. Jangan ragu untuk bertanya lagi kapan saja. Selamat menggunakan WashBuddy! ✨';
  } else if (msg.match(/komplain|masalah|rusak|hilang|kecewa|tidak puas|kualitas/)) {
    reply = '😔 Mohon maaf atas ketidaknyamanannya.\n\nLaporan Anda **sudah diteruskan ke Tim Admin**. Agen kami akan merespons dalam 5-10 menit untuk menyelesaikan masalah ini.\n\nWashBuddy menjamin **100% kepuasan pelanggan**!';
  } else {
    reply = '🤔 Pertanyaan bagus! Saya tidak menemukan jawaban spesifik, tapi Anda bisa:\n\n1. Pilih topik dari menu di bawah\n2. Tekan **"Tanya Admin Langsung"** untuk bicara dengan agen\n3. Hubungi WhatsApp: **0812-WASH-BUDDY**\n\nKami selalu siap membantu! 💙';
  }

  res.json({ reply });
});

// ===== SPA FALLBACK (Express 5 compatible) =====
const sendApp = (req, res) => {
  const file = path.join(__dirname, '../dist/app/index.html');
  res.sendFile(file, err => {
    if (err) res.sendFile(path.join(__dirname, '../app/index.html'));
  });
};
const sendAdmin = (req, res) => {
  const file = path.join(__dirname, '../dist/admin/index.html');
  res.sendFile(file, err => {
    if (err) res.sendFile(path.join(__dirname, '../admin/index.html'));
  });
};
const sendRoot = (req, res) => {
  const file = path.join(__dirname, '../dist/index.html');
  res.sendFile(file, err => {
    if (err) res.sendFile(path.join(__dirname, '../index.html'));
  });
};

app.get('/app', sendApp);
app.use('/app/', sendApp);
app.get('/admin', sendAdmin);
app.use('/admin/', sendAdmin);
app.use('/', sendRoot);

// ===== START SERVER =====
app.listen(PORT, () => {
  console.log(`\n🚀 WashBuddy Server running on http://localhost:${PORT}`);
  console.log(`   API: http://localhost:${PORT}/api/health\n`);
});

export default app;
