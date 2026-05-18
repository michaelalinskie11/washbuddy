const API_BASE = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:3000/api'
    : '/api';

async function loadOrders() {
    const tbody = document.getElementById('orders-tbody');
    if (!tbody) return;
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:2rem;"><i class="ph-bold ph-spinner-gap" style="animation:spin 1s linear infinite"></i> Memuat data...</td></tr>';
    
    try {
        const response = await fetch(`${API_BASE}/orders`);
        const res = await response.json();
        
        tbody.innerHTML = '';
        res.data.forEach(order => {
            // Determine badge class
            let statusClass = 'waiting';
            if(order.status === 'Proses Cuci') statusClass = 'washing';
            if(order.status === 'Sedang Diantar') statusClass = 'delivering';
            if(order.status === 'Selesai') statusClass = 'success';
            
            // Format customer initial for avatar
            const init = order.customer ? order.customer.charAt(0) : 'U';

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="font-mono">${order.id}</td>
                <td>
                   <div class="user-cell">
                      <img src="https://ui-avatars.com/api/?name=${order.customer}&background=random&color=fff&bold=true" alt="${init}">
                      <span>${order.customer}</span>
                   </div>
                </td>
                <td>${order.service || 'Wash & Fold'} (${order.items} unit)</td>
                <td><span class="status-badge ${statusClass}">${order.status}</span></td>
                <td class="font-mono">Rp ${(order.total || 0).toLocaleString('id-ID')}</td>
                <td>
                    <select class="action-select" id="select-${order.id}" style="background:rgba(0,0,0,0.5); color:#fff; padding:5px; border-radius:4px; border:1px solid rgba(255,255,255,0.2); margin-right:5px;">
                        <option value="Menunggu Penjemputan" ${order.status === 'Menunggu Penjemputan' ? 'selected':''}>Menunggu</option>
                        <option value="Proses Cuci" ${order.status === 'Proses Cuci' ? 'selected':''}>Proses Cuci</option>
                        <option value="Sedang Diantar" ${order.status === 'Sedang Diantar' ? 'selected':''}>Sedang Diantar</option>
                        <option value="Selesai" ${order.status === 'Selesai' ? 'selected':''}>Selesai</option>
                    </select>
                    <button class="btn-action" onclick="updateStatus('${order.id}')">Update</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch(err) {
        console.error(err);
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; color:#FF4D4D;">Koneksi ke server gagal. Pastikan backend berjalan.</td></tr>';
    }
}

async function updateStatus(id) {
    const selectEl = document.getElementById(`select-${id}`);
    if (!selectEl) return;
    const newStatus = selectEl.value;
    try {
        await fetch(`${API_BASE}/orders/${id}/status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus })
        });
        loadOrders();
    } catch(err) {
        alert('Gagal update status! Pastikan backend aktif.');
    }
}

// Load orders dynamically on page load
document.addEventListener('DOMContentLoaded', () => {
    loadOrders();
    setInterval(loadOrders, 15000); // auto-refresh every 15s
    
    // Live Search Feature
    const searchInput = document.querySelector('.search-bar input');
    if(searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            const rows = document.querySelectorAll('#orders-tbody tr');
            rows.forEach(row => {
                const text = row.innerText.toLowerCase();
                if(text.includes(query)) {
                    row.style.display = '';
                } else {
                    row.style.display = 'none';
                }
            });
        });
    }
});

// Pesanan Manual Feature
function openManualOrder() {
    const customerName = prompt("Masukkan Nama Pelanggan:");
    if(!customerName) return;
    
    const service = prompt("Jenis Layanan (Wash Regular / Wash Kilat / Dry Cleaning / Premium Spa / Cuci Karpet / Cuci Sofa):", "Wash Regular");
    if(!service) return;
    
    const qty = prompt("Estimasi Berat/Item:", "1");
    if(!qty) return;
    
    let price = 8000;
    const lowerSrv = service.toLowerCase();
    if(lowerSrv.includes('kilat')) price = 15000;
    if(lowerSrv.includes('dry')) price = 25000;
    if(lowerSrv.includes('spa')) price = 50000;
    if(lowerSrv.includes('karpet')) price = 30000;
    if(lowerSrv.includes('sofa')) price = 100000;
    
    const finalQty = parseInt(qty) || 1;
    
    const orderData = {
        customer: customerName,
        service: service,
        items: finalQty,
        total: finalQty * price
    };
    
    fetch(`${API_BASE}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
    }).then(res => res.json()).then(data => {
        alert('✅ Pesanan Manual Berhasil Dibuat: ' + data.data.id);
        loadOrders();
    }).catch(() => alert('❌ Gagal koneksi ke server!'));
}


// Under Construction Alerts for Navigation
document.querySelectorAll('.nav-menu a').forEach(link => {
    link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        if(href === '#fleet' || href === '#customers' || href === '#settings') {
            e.preventDefault();
            alert('Fitur ' + link.innerText + ' akan segera hadir di versi Pro. Fokus manajemen pesanan saat ini aktif.');
        }
    });
});

