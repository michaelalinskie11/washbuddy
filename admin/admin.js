const API_BASE = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ? 'http://localhost:3000/api'
  : '/api';

const PRICING = { 'Wash Regular':8000,'Wash Kilat':15000,'Dry Cleaning':25000,'Premium Spa':50000,'Cuci Karpet':30000,'Cuci Sofa':100000 };

// ===== AUTH =====
let adminToken = localStorage.getItem('wb_admin_token') || null;

async function doLogin() {
  const password = document.getElementById('admin-password').value;
  const btn = document.getElementById('login-btn');
  const err = document.getElementById('login-error');
  if (!password) { showLoginError('Masukkan password terlebih dahulu'); return; }

  btn.disabled = true;
  btn.innerHTML = '<i class="ph-bold ph-spinner-gap spin"></i> Memverifikasi...';

  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    });
    const data = await res.json();
    if (data.status === 'success') {
      adminToken = data.token;
      localStorage.setItem('wb_admin_token', adminToken);
      document.getElementById('login-overlay').classList.add('hidden');
      document.getElementById('admin-app').classList.remove('hidden');
      document.getElementById('support-fab').style.display = 'flex';
      initDashboard();
    } else {
      showLoginError(data.message || 'Password salah. Coba lagi.');
      btn.disabled = false;
      btn.innerHTML = '<i class="ph-bold ph-sign-in"></i> <span>Masuk ke Dashboard</span>';
    }
  } catch {
    showLoginError('Tidak dapat terhubung ke server. Pastikan backend berjalan.');
    btn.disabled = false;
    btn.innerHTML = '<i class="ph-bold ph-sign-in"></i> <span>Masuk ke Dashboard</span>';
  }
}

function showLoginError(msg) {
  const el = document.getElementById('login-error');
  el.textContent = '⚠️ ' + msg;
  el.classList.remove('hidden');
  document.getElementById('pass-group').style.borderColor = '#FF4D4D';
  setTimeout(() => { el.classList.add('hidden'); document.getElementById('pass-group').style.borderColor = ''; }, 4000);
}

function togglePassVis() {
  const inp = document.getElementById('admin-password');
  const icon = document.getElementById('eye-icon');
  if (inp.type === 'password') { inp.type = 'text'; icon.className = 'ph-bold ph-eye-slash'; }
  else { inp.type = 'password'; icon.className = 'ph-bold ph-eye'; }
}

async function doLogout() {
  try {
    await fetch(`${API_BASE}/auth/logout`, {
      method: 'POST',
      headers: { 'x-admin-token': adminToken }
    });
  } catch {}
  adminToken = null;
  localStorage.removeItem('wb_admin_token');
  location.reload();
}

// Enter key login
document.getElementById('admin-password')?.addEventListener('keydown', e => {
  if (e.key === 'Enter') doLogin();
});

// ===== VERIFY EXISTING SESSION =====
async function verifySession() {
  if (!adminToken) return false;
  try {
    const res = await fetch(`${API_BASE}/auth/verify`, { headers: { 'x-admin-token': adminToken } });
    const data = await res.json();
    return data.status === 'success';
  } catch { return false; }
}

// ===== DASHBOARD INIT =====
async function initDashboard() {
  updateClock();
  setInterval(updateClock, 1000);
  await loadOrders();
  setInterval(loadOrders, 20000);

  document.getElementById('m-qty')?.addEventListener('input', updateManualTotal);
  document.getElementById('m-service')?.addEventListener('change', updateManualTotal);

  const searchInput = document.querySelector('.search-bar input');
  if (searchInput) {
    searchInput.addEventListener('input', e => {
      const q = e.target.value.toLowerCase();
      document.querySelectorAll('#orders-tbody tr').forEach(row => {
        row.style.display = row.innerText.toLowerCase().includes(q) ? '' : 'none';
      });
    });
  }
}

function updateClock() {
  const el = document.getElementById('header-time');
  if (el) el.textContent = new Date().toLocaleString('id-ID', { weekday:'long', year:'numeric', month:'long', day:'numeric', hour:'2-digit', minute:'2-digit', second:'2-digit' });
}

// ===== LOAD ORDERS =====
async function loadOrders() {
  const tbody = document.getElementById('orders-tbody');
  if (!tbody) return;

  try {
    const res = await fetch(`${API_BASE}/admin/orders`, { headers: { 'x-admin-token': adminToken } });
    if (res.status === 401) { doLogout(); return; }
    const json = await res.json();
    const orders = json.data || [];
    const stats = json.stats || {};

    // Update stats
    const fmt = n => 'Rp ' + (n||0).toLocaleString('id-ID');
    document.getElementById('stat-total-revenue').textContent = fmt(stats.totalRevenue);
    document.getElementById('stat-total-orders').textContent = orders.length;
    document.getElementById('stat-active').textContent = stats.activeCount || 0;
    const done = orders.filter(o => o.status === 'Selesai');
    document.getElementById('stat-done').textContent = done.length;
    const rated = done.filter(o => o.rating);
    const avgRating = rated.length ? (rated.reduce((s,o) => s + o.rating, 0) / rated.length).toFixed(1) : '-';
    document.getElementById('stat-rating').textContent = avgRating !== '-' ? '⭐ ' + avgRating : '-';

    // Update last refreshed
    const lu = document.getElementById('last-updated');
    if (lu) lu.textContent = 'Update: ' + new Date().toLocaleTimeString('id-ID');

    // Build table
    if (!orders.length) {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:3rem; color:var(--text-muted);">Belum ada pesanan masuk</td></tr>';
      return;
    }

    tbody.innerHTML = orders.slice().reverse().map(o => {
      const statusClass = { 'Selesai':'success', 'Dibatalkan':'danger', 'Sedang Diantar':'warning', 'Proses Cuci':'info' }[o.status] || 'default';
      const date = new Date(o.createdAt).toLocaleDateString('id-ID', { day:'2-digit', month:'short', year:'2-digit', hour:'2-digit', minute:'2-digit' });
      return `<tr>
        <td><strong>${o.id}</strong><br><small style="color:var(--text-muted)">${date}</small></td>
        <td><strong>${o.customer}</strong>${o.phone ? `<br><small style="color:var(--text-muted)">${o.phone}</small>` : ''}</td>
        <td>${o.service}<br><small style="color:var(--text-muted)">${o.items} item</small></td>
        <td><strong>Rp ${o.total.toLocaleString('id-ID')}</strong><br><small style="color:var(--text-muted)">${o.payment||'QRIS'}</small></td>
        <td>
          <select id="select-${o.id}" class="status-select status-${statusClass}" onchange="updateStatus('${o.id}')">
            ${['Menunggu Penjemputan','Dijemput Kurir','Proses Cuci','Proses Setrika','Sedang Diantar','Selesai','Dibatalkan'].map(s =>
              `<option value="${s}" ${s === o.status ? 'selected' : ''}>${s}</option>`
            ).join('')}
          </select>
          ${o.rating ? `<br><small style="color:#FFD700">⭐ ${o.rating}/5</small>` : ''}
        </td>
        <td>
          <button class="action-btn delete-btn" onclick="deleteOrder('${o.id}')" title="Hapus"><i class="ph-bold ph-trash"></i></button>
          ${o.phone ? `<a href="https://wa.me/62${o.phone.replace(/^0/,'').replace(/\D/,'')}" target="_blank" class="action-btn wa-btn" title="WhatsApp"><i class="ph-fill ph-whatsapp-logo"></i></a>` : ''}
        </td>
      </tr>`;
    }).join('');

  } catch (err) {
    console.error(err);
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; color:#FF4D4D; padding:2rem;">Koneksi ke server gagal. Pastikan backend berjalan.</td></tr>';
  }
}

// ===== UPDATE STATUS =====
async function updateStatus(id) {
  const sel = document.getElementById(`select-${id}`);
  if (!sel) return;
  sel.disabled = true;
  try {
    await fetch(`${API_BASE}/orders/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type':'application/json', 'x-admin-token': adminToken },
      body: JSON.stringify({ status: sel.value })
    });
    await loadOrders();
  } catch {
    alert('Gagal update status!');
    sel.disabled = false;
  }
}

// ===== DELETE ORDER =====
async function deleteOrder(id) {
  if (!confirm(`Hapus pesanan ${id}? Tindakan ini tidak bisa dibatalkan.`)) return;
  try {
    const res = await fetch(`${API_BASE}/orders/${id}`, {
      method: 'DELETE',
      headers: { 'x-admin-token': adminToken }
    });
    const data = await res.json();
    if (data.status === 'success') loadOrders();
    else alert('Gagal menghapus: ' + data.message);
  } catch { alert('Gagal menghapus pesanan!'); }
}

// ===== MANUAL ORDER =====
function openManualOrder() {
  document.getElementById('manual-order-modal').classList.remove('hidden');
  updateManualTotal();
}

function updateManualTotal() {
  const service = document.getElementById('m-service')?.value;
  const qty = parseInt(document.getElementById('m-qty')?.value) || 1;
  const price = PRICING[service] || 8000;
  const total = qty * price;
  const el = document.getElementById('m-total-display');
  if (el) el.textContent = 'Rp ' + total.toLocaleString('id-ID');
}

async function submitManualOrder() {
  const customer = document.getElementById('m-customer')?.value?.trim();
  const phone = document.getElementById('m-phone')?.value?.trim();
  const address = document.getElementById('m-address')?.value?.trim();
  const service = document.getElementById('m-service')?.value;
  const qty = parseInt(document.getElementById('m-qty')?.value) || 1;
  const payment = document.getElementById('m-payment')?.value;

  if (!customer || customer.length < 2) { alert('Nama pelanggan minimal 2 karakter'); return; }

  const price = PRICING[service] || 8000;
  try {
    const res = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: { 'Content-Type':'application/json' },
      body: JSON.stringify({ customer, phone, address, service, items: qty, total: qty*price, payment })
    });
    const data = await res.json();
    if (data.status === 'success') {
      alert(`✅ Pesanan ${data.data.id} berhasil dibuat!`);
      document.getElementById('manual-order-modal').classList.add('hidden');
      document.getElementById('m-customer').value = '';
      document.getElementById('m-phone').value = '';
      document.getElementById('m-address').value = '';
      document.getElementById('m-qty').value = 1;
      loadOrders();
    } else alert('❌ ' + data.message);
  } catch { alert('❌ Gagal koneksi ke server!'); }
}

// ===== SUPPORT CHAT =====
function sendAdminReply() {
  const input = document.getElementById('admin-chat-input');
  const box = document.getElementById('admin-chat-box');
  if (!input.value.trim()) return;
  box.innerHTML += `<div style="background:rgba(0,229,255,0.1); padding:0.8rem; border-radius:8px; font-size:0.9rem; text-align:right; border:1px solid rgba(0,229,255,0.2);"><span style="color:var(--primary); font-weight:bold;">Admin:</span><br>${input.value}</div>`;
  input.value = '';
  box.scrollTop = box.scrollHeight;
}

document.getElementById('admin-chat-input')?.addEventListener('keydown', e => {
  if (e.key === 'Enter') sendAdminReply();
});

// ===== AUTO-INIT =====
(async () => {
  const valid = await verifySession();
  if (valid) {
    document.getElementById('login-overlay').classList.add('hidden');
    document.getElementById('admin-app').classList.remove('hidden');
    document.getElementById('support-fab').style.display = 'flex';
    initDashboard();
  }
})();
