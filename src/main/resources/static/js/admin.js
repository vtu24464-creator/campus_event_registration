// ── admin.js — CampusX Admin Dashboard ───────────────────────
'use strict';

// ── Auth guard ────────────────────────────────────────────────
function checkAdminAuth() {
    if (localStorage.getItem('adminAuth') !== 'true') {
        window.location.href = 'admin-login.html';
        return false;
    }
    const uEl = document.getElementById('adminUsername');
    if (uEl) uEl.textContent = localStorage.getItem('adminUser') || 'admin';
    return true;
}

function adminLogout() {
    localStorage.removeItem('adminAuth');
    localStorage.removeItem('adminUser');
    window.location.href = 'admin-login.html';
}

// ── API helpers ───────────────────────────────────────────────
function adminToken() {
    return localStorage.getItem('campusx_token') || sessionStorage.getItem('campusx_token') || '';
}

async function adminGet(path) {
    const res = await fetch(path, {
        headers: { 'Authorization': 'Bearer ' + adminToken() }
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
}

async function adminPost(path, body) {
    const res = await fetch(path, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + adminToken()
        },
        body: JSON.stringify(body)
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
}

// ── Section switcher ─────────────────────────────────────────
function showSection(name) {
    document.querySelectorAll('.admin-section').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.sidebar-link').forEach(el => el.classList.remove('active'));

    const sectionMap = {
        overview: { section: 'sectionOverview', nav: 'navOverview', title: 'Overview' },
        addEvent: { section: 'sectionAddEvent', nav: 'navAddEvent', title: 'Add New Event' },
        registrations: { section: 'sectionRegistrations', nav: 'navRegs', title: 'View Registrations' },
        certs: { section: 'sectionCerts', nav: 'navCerts', title: 'Manage Certificates' },
        payments: { section: 'sectionPayments', nav: 'navPayments', title: 'Payment Verification' },
        settings: { section: 'sectionSettings', nav: 'navSettings', title: 'Payment Settings' }
    };

    const s = sectionMap[name];
    if (!s) return;

    document.getElementById(s.section)?.classList.add('active');
    document.getElementById(s.nav)?.classList.add('active');
    const titleEl = document.getElementById('sectionTitle');
    if (titleEl) titleEl.textContent = s.title;

    // Lazy-load section data
    if (name === 'registrations') loadEventList();
    if (name === 'certs') loadAllCerts();
    if (name === 'payments') loadPendingPayments();
    if (name === 'settings') loadPaymentSettings();
}

// ── Toast ─────────────────────────────────────────────────────
function adminToast(msg, type = 'success') {
    const t = document.getElementById('adminToast');
    if (!t) return;
    t.textContent = (type === 'success' ? '✅ ' : '❌ ') + msg;
    t.className = type;
    t.style.display = 'block';
    setTimeout(() => t.style.display = 'none', 3500);
}

// ── Overview Stats ───────────────────────────────────────────
async function loadStats() {
    try {
        const stats = await adminGet('/api/admin/stats');
        document.getElementById('statEvents').textContent = stats.totalEvents ?? '—';
        document.getElementById('statUsers').textContent = stats.totalUsers ?? '—';
        document.getElementById('statRegs').textContent = stats.totalRegistrations ?? '—';
        document.getElementById('statCerts').textContent = stats.totalCertificates ?? '—';
        if (document.getElementById('statRevenue')) {
            const rev = stats.totalRevenue || 0;
            document.getElementById('statRevenue').textContent = '₹' + rev.toLocaleString('en-IN');
        }
    } catch (e) {
        console.warn('Stats load failed:', e);
    }
}

async function loadRecentCerts() {
    const box = document.getElementById('recentCerts');
    if (!box) return;
    try {
        const certs = await adminGet('/api/admin/certificates');
        const recent = certs.slice(0, 5);
        if (!recent.length) { box.textContent = 'No certificates issued yet.'; return; }
        box.innerHTML = recent.map(c => {
            const certId = 'CERT-2026-' + String(c.id).padStart(4, '0');
            const date = c.issuedAt ? new Date(c.issuedAt).toLocaleDateString('en-IN') : '—';
            return `<div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid var(--border);">
        <div>
          <div style="font-size:0.88rem;font-weight:600;">${c.firstName} ${c.lastName} <span style="color:var(--text-muted);font-weight:400;">· ${c.rollNumber}</span></div>
          <div style="font-size:0.78rem;color:var(--text-muted);">${c.eventTitle}</div>
        </div>
        <div style="text-align:right;flex-shrink:0;margin-left:16px;">
          <div style="font-size:0.78rem;color:var(--primary-light);">${certId}</div>
          <div style="font-size:0.72rem;color:var(--text-dim);">${date}</div>
        </div>
      </div>`;
        }).join('');
    } catch (e) {
        box.textContent = 'Could not load certificates. (Requires login JWT)';
    }
}

// ── Add Event ─────────────────────────────────────────────────
async function submitNewEvent(e) {
    e.preventDefault();
    const btn = document.getElementById('submitEventBtn');
    const msg = document.getElementById('eventFormMsg');
    btn.textContent = '⏳ Creating…';
    btn.disabled = true;
    msg.style.display = 'none';

    const body = {
        title: document.getElementById('evTitle').value.trim(),
        description: document.getElementById('evDesc').value.trim(),
        category: document.getElementById('evCategory').value,
        eventDate: document.getElementById('evDate').value,
        venue: document.getElementById('evVenue').value.trim(),
        capacity: parseInt(document.getElementById('evCapacity').value) || 100,
        prizePool: document.getElementById('evPrize').value.trim(),
        organizer: document.getElementById('evOrganizer').value.trim(),
        contactEmail: document.getElementById('evEmail').value.trim(),
        bannerUrl: document.getElementById('evBanner').value,
        registrationFee: parseFloat(document.getElementById('evFee').value) || 0,
        paymentRequired: document.getElementById('evPayRequired').checked
    };

    try {
        const res = await adminPost('/api/admin/events', body);
        msg.style.display = 'block';
        msg.style.color = '#3FB950';
        msg.textContent = '✅ Event "' + body.title + '" created! (ID: ' + res.id + ')';
        document.getElementById('addEventForm').reset();
        adminToast('Event created successfully!', 'success');
    } catch (err) {
        msg.style.display = 'block';
        msg.style.color = '#F85149';
        msg.textContent = '❌ Failed: ' + err.message;
        adminToast('Event creation failed.', 'error');
    } finally {
        btn.textContent = '📌 Create Event';
        btn.disabled = false;
    }
}

// ── Registrations ─────────────────────────────────────────────
let _currentRegs = [];

async function loadEventList() {
    const picker = document.getElementById('eventPicker');
    if (!picker || picker.options.length > 1) return; // already loaded
    try {
        const events = await adminGet('/api/admin/events');
        events.forEach(ev => {
            const opt = document.createElement('option');
            opt.value = ev.id;
            opt.textContent = ev.title;
            picker.appendChild(opt);
        });
    } catch (e) {
        console.warn('Event list fetch failed:', e);
    }
}

async function loadRegistrations(eventId) {
    const tbody = document.getElementById('regTableBody');
    const csvBtn = document.getElementById('csvBtn');
    if (!eventId) {
        tbody.innerHTML = '<tr class="loading-row"><td colspan="7">Select an event to view registrations</td></tr>';
        csvBtn.style.display = 'none';
        return;
    }

    tbody.innerHTML = '<tr class="loading-row"><td colspan="7">Loading…</td></tr>';
    const countEl = document.getElementById('regCount');

    try {
        const regs = await adminGet('/api/admin/events/' + eventId + '/registrations');
        _currentRegs = regs;

        if (!regs.length) {
            tbody.innerHTML = '<tr class="loading-row"><td colspan="7">No registrations yet for this event.</td></tr>';
            csvBtn.style.display = 'none';
            if (countEl) countEl.textContent = '';
            return;
        }

        tbody.innerHTML = regs.map((r, i) => {
            const statusClass = 'status-' + (r.status || 'pending');
            const date = r.registeredAt ? new Date(r.registeredAt).toLocaleDateString('en-IN') : '—';
            return `<tr>
        <td style="color:var(--text-muted);">${i + 1}</td>
        <td><div style="font-weight:600;">${r.firstName} ${r.lastName}</div><div style="font-size:0.75rem;color:var(--text-muted);">${r.email || ''}</div></td>
        <td>${r.rollNumber || '—'}</td>
        <td>${r.department || '—'}</td>
        <td>${r.phone || '—'}</td>
        <td><span class="status-pill ${statusClass}">${r.status || 'pending'}</span></td>
        <td style="font-size:0.8rem;color:var(--text-muted);">${date}</td>
      </tr>`;
        }).join('');

        csvBtn.style.display = 'flex';
        if (countEl) countEl.textContent = regs.length + ' participant' + (regs.length !== 1 ? 's' : '');
    } catch (e) {
        tbody.innerHTML = '<tr class="loading-row"><td colspan="7" style="color:var(--danger);">Failed to load: ' + e.message + '</td></tr>';
    }
}

function exportCSV() {
    if (!_currentRegs.length) return;
    const headers = ['#', 'First Name', 'Last Name', 'Email', 'Roll No', 'Department', 'Phone', 'Status', 'Registered At'];
    const rows = _currentRegs.map((r, i) => [
        i + 1, r.firstName, r.lastName, r.email, r.rollNumber, r.department,
        r.phone || '', r.status, r.registeredAt
    ]);

    const csv = [headers, ...rows].map(row =>
        row.map(v => '"' + String(v ?? '').replace(/"/g, '""') + '"').join(',')
    ).join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'registrations_' + new Date().toISOString().slice(0, 10) + '.csv';
    a.click();
}

// ── Manage Certificates ───────────────────────────────────────
async function loadAllCerts() {
    const tbody = document.getElementById('certsTableBody');
    if (!tbody) return;
    tbody.innerHTML = '<tr class="loading-row"><td colspan="7">Loading…</td></tr>';

    try {
        const certs = await adminGet('/api/admin/certificates');
        if (!certs.length) {
            tbody.innerHTML = '<tr class="loading-row"><td colspan="7">No certificates issued yet.</td></tr>';
            return;
        }

        tbody.innerHTML = certs.map(c => {
            const certId = 'CERT-2026-' + String(c.id).padStart(4, '0');
            const typeMap = { winner: '🥇 Winner', runner_up: '🥈 Runner-Up', '2nd_runner_up': '🥉 2nd Runner-Up', participation: '🎓 Participation', merit: '⭐ Merit' };
            const typeLabel = typeMap[(c.participationType || '').toLowerCase().replace(/\s+/g, '_')] || '🎓 Participation';
            const date = c.issuedAt ? new Date(c.issuedAt).toLocaleDateString('en-IN') : '—';
            return `<tr>
        <td style="font-size:0.8rem;color:var(--primary-light);font-weight:600;">${certId}</td>
        <td><div style="font-weight:600;">${c.firstName} ${c.lastName}</div><div style="font-size:0.75rem;color:var(--text-muted);">${c.rollNumber}</div></td>
        <td style="font-size:0.8rem;">${c.rollNumber}</td>
        <td style="font-size:0.84rem;max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${c.eventTitle}</td>
        <td>${typeLabel}</td>
        <td style="font-size:0.8rem;color:var(--text-muted);">${date}</td>
        <td>
          <a href="certificate-preview.html?certId=${c.id}" target="_blank" class="btn-ghost-sm" style="font-size:0.76rem;padding:5px 12px;">👁 View</a>
        </td>
      </tr>`;
        }).join('');
    } catch (e) {
        tbody.innerHTML = '<tr class="loading-row"><td colspan="7" style="color:var(--danger);">Failed: ' + e.message + '</td></tr>';
    }
}

// ── Payment Verification ─────────────────────────────────────
async function loadPendingPayments() {
    const tbody = document.getElementById('paymentsTableBody');
    if (!tbody) return;
    tbody.innerHTML = '<tr class="loading-row"><td colspan="7">Loading pending payments…</td></tr>';

    try {
        const payments = await adminGet('/api/admin/payments');
        if (!payments.length) {
            tbody.innerHTML = '<tr class="loading-row"><td colspan="7">No pending payments found.</td></tr>';
            return;
        }

        tbody.innerHTML = payments.map((p, i) => {
            const date = p.registeredAt ? new Date(p.registeredAt).toLocaleDateString('en-IN') : '—';
            const screenshotHtml = p.paymentScreenshot ? `<a href="${p.paymentScreenshot}" target="_blank" style="color:var(--primary-light);font-size:0.7rem;">🖼 View Screenshot</a>` : '';
            return `<tr>
        <td style="color:var(--text-muted);">${i + 1}</td>
        <td>
            <div style="font-weight:600;">${p.firstName} ${p.lastName}</div>
            <div style="font-size:0.72rem;color:var(--text-muted);">${p.rollNumber}</div>
        </td>
        <td style="font-size:0.84rem;">${p.eventTitle}</td>
        <td style="font-weight:700;color:#FDCB6E;">₹${p.amountPaid || '—'}</td>
        <td>
            <div style="font-family:monospace;font-size:0.8rem;">${p.transactionId || '—'}</div>
            ${screenshotHtml}
        </td>
        <td style="font-size:0.8rem;color:var(--text-muted);">${date}</td>
        <td>
            <div style="display:flex;gap:6px;">
                <button class="btn-primary-sm" style="padding:4px 10px;font-size:0.75rem;background:#3FB950;" onclick="handlePaymentAction(${p.regId}, 'approve')">Approve</button>
                <button class="btn-danger-sm" style="padding:4px 10px;font-size:0.75rem;" onclick="handlePaymentAction(${p.regId}, 'reject')">Reject</button>
            </div>
        </td>
      </tr>`;
        }).join('');
    } catch (e) {
        tbody.innerHTML = '<tr class="loading-row"><td colspan="7" style="color:var(--danger);">Failed to load payments.</td></tr>';
    }
}

async function handlePaymentAction(regId, action) {
    if (!confirm(`Are you sure you want to ${action} this payment?`)) return;
    try {
        await adminPost(`/api/admin/payments/${regId}/${action}`, {});
        adminToast(`Payment ${action}d successfully.`);
        loadPendingPayments();
        loadStats();
    } catch (e) {
        adminToast(`Failed to ${action} payment: ` + e.message, 'error');
    }
}

// ── Payment Settings ─────────────────────────────────────────
async function loadPaymentSettings() {
    try {
        const settings = await adminGet('/api/admin/payment-settings');
        if (settings) {
            const set = (id, val) => { const el = document.getElementById(id); if (el) el.value = val || ''; };
            set('setAccountName', settings.accountName);
            set('setUpiId', settings.upiId);
            set('setUpiPhone', settings.upiPhone);
            set('setBankName', settings.bankName);
            set('setBankAccount', settings.bankAccount);
            set('setIfsc', settings.ifscCode);
            set('setPayNote', settings.payNote);

            const qrUrl = settings.qrCodePath || '';
            const qrHidden = document.getElementById('setQrUrl');
            const previewImg = document.getElementById('qrPreviewImg');
            const prompt = document.getElementById('qrPrompt');
            const nameEl = document.getElementById('qrFileName');

            if (qrHidden) qrHidden.value = qrUrl;
            if (qrUrl && previewImg) {
                previewImg.src = qrUrl;
                previewImg.classList.add('visible');
                if (prompt) prompt.style.display = 'none';
                if (nameEl) nameEl.textContent = '✅ QR code loaded';
            }

            // Mirror to localStorage so payment.html can read it without an API call
            const ls = {
                accountName: settings.accountName,
                upiId: settings.upiId,
                upiPhone: settings.upiPhone,
                bankName: settings.bankName,
                bankAccount: settings.bankAccount,
                ifsc: settings.ifscCode,
                qrUrl: qrUrl,
                payNote: settings.payNote || '',
                savedAt: new Date().toISOString()
            };
            localStorage.setItem('campusxPaymentSettings', JSON.stringify(ls));
            updatePreview();
        }
    } catch (e) {
        console.warn('Could not load payment settings:', e);
    }
}

async function savePaymentSettings(e) {
    e.preventDefault();
    const btn = document.getElementById('savePayBtn');
    const msg = document.getElementById('settingsSaveMsg');
    btn.textContent = '⏳ Saving…';
    btn.disabled = true;

    const accountName = document.getElementById('setAccountName')?.value.trim();
    const upiId = document.getElementById('setUpiId')?.value.trim();
    if (!accountName || !upiId) {
        if (msg) { msg.style.cssText = 'display:block;color:#F85149;'; msg.textContent = '⚠️ UPI ID and Account Holder Name are required.'; }
        btn.textContent = '💾 Save Payment Settings'; btn.disabled = false;
        return;
    }

    const qrHiddenVal = document.getElementById('setQrUrl')?.value.trim() || '';
    // If QR value is a data URL from local selection, upload it first; else use the path as-is
    let qrCodePath = qrHiddenVal;
    if (qrHiddenVal.startsWith('data:image')) {
        try {
            const blob = await (await fetch(qrHiddenVal)).blob();
            const form = new FormData();
            form.append('file', blob, 'qr.png');
            const up = await fetch('/api/admin/upload-qr', {
                method: 'POST',
                headers: { 'Authorization': 'Bearer ' + getAdminToken() },
                body: form
            });
            const upData = await up.json();
            if (up.ok) { qrCodePath = upData.url; document.getElementById('setQrUrl').value = qrCodePath; }
        } catch (err) { console.warn('QR upload failed, using data-URL fallback'); }
    }

    const body = {
        accountName,
        upiId,
        upiPhone: document.getElementById('setUpiPhone')?.value.trim() || '',
        bankName: document.getElementById('setBankName')?.value.trim() || '',
        bankAccount: document.getElementById('setBankAccount')?.value.trim() || '',
        ifscCode: document.getElementById('setIfsc')?.value.trim() || '',
        qrCodePath,
        payNote: document.getElementById('setPayNote')?.value.trim() || ''
    };

    try {
        await adminPost('/api/admin/payment-settings', body);

        // Mirror to localStorage immediately for payment.html
        const ls = {
            accountName, upiId, upiPhone: body.upiPhone, bankName: body.bankName,
            bankAccount: body.bankAccount, ifsc: body.ifscCode, qrUrl: qrCodePath,
            payNote: body.payNote, savedAt: new Date().toISOString()
        };
        localStorage.setItem('campusxPaymentSettings', JSON.stringify(ls));

        adminToast('✅ Payment settings saved! Students will see these on the payment page.');
        if (msg) { msg.style.cssText = 'display:block;color:#3FB950;'; msg.textContent = '✅ Saved! Payment page will show these details immediately.'; setTimeout(() => msg.style.display = 'none', 4000); }
    } catch (err) {
        adminToast('Failed to save settings: ' + err.message, 'error');
        if (msg) { msg.style.cssText = 'display:block;color:#F85149;'; msg.textContent = '❌ Save failed: ' + err.message; }
    } finally {
        btn.textContent = '💾 Save Payment Settings';
        btn.disabled = false;
    }
}

function updatePreview() {
    const v = id => document.getElementById(id)?.value?.trim() || '—';
    if (document.getElementById('prevName')) document.getElementById('prevName').textContent = v('setAccountName');
    if (document.getElementById('prevUpi')) document.getElementById('prevUpi').textContent = v('setUpiId');
    if (document.getElementById('prevPhone')) document.getElementById('prevPhone').textContent = v('setUpiPhone');
    if (document.getElementById('prevBank')) document.getElementById('prevBank').textContent = v('setBankName');
    if (document.getElementById('prevAcc')) document.getElementById('prevAcc').textContent = v('setBankAccount');
    if (document.getElementById('prevIfsc')) document.getElementById('prevIfsc').textContent = v('setIfsc');

    const note = document.getElementById('setPayNote')?.value?.trim();
    const noteRow = document.getElementById('prevNoteRow');
    if (noteRow) noteRow.style.display = note ? 'flex' : 'none';
    if (document.getElementById('prevNote')) document.getElementById('prevNote').textContent = note || '';

    const qr = document.getElementById('setQrUrl')?.value;
    const qrBox = document.getElementById('prevQrBox');
    if (qrBox) qrBox.innerHTML = qr ? `<img src="${qr}" alt="QR">` : '🧾';
}

function resetPaymentSettings() {
    if (!confirm('Reset all payment settings?')) return;
    localStorage.removeItem('campusxPaymentSettings');
    document.getElementById('paymentSettingsForm')?.reset();
    const qrHidden = document.getElementById('setQrUrl');
    if (qrHidden) qrHidden.value = '';
    const img = document.getElementById('qrPreviewImg');
    if (img) { img.src = ''; img.classList.remove('visible'); }
    const prompt = document.getElementById('qrPrompt');
    if (prompt) prompt.style.display = 'flex';
    const fname = document.getElementById('qrFileName');
    if (fname) fname.textContent = '';
    updatePreview();
}

// ── QR Upload Helpers ────────────────────────────────────────
function handleQrSelect(e) {
    const file = e.target.files[0];
    if (file) processQrFile(file);
}

function handleQrDragOver(e) {
    e.preventDefault();
    document.getElementById('qrDropZone')?.classList.add('dragover');
}

function handleQrDragLeave() {
    document.getElementById('qrDropZone')?.classList.remove('dragover');
}

function handleQrDrop(e) {
    e.preventDefault();
    document.getElementById('qrDropZone')?.classList.remove('dragover');
    const file = e.dataTransfer?.files[0];
    if (file && file.type.startsWith('image/')) processQrFile(file);
}

function processQrFile(file) {
    if (!file.type.startsWith('image/')) {
        adminToast('Please select an image file.', 'error');
        return;
    }
    const reader = new FileReader();
    reader.onload = ev => {
        const dataUrl = ev.target.result;
        const hidden = document.getElementById('setQrUrl');
        const img = document.getElementById('qrPreviewImg');
        const prompt = document.getElementById('qrPrompt');
        const fname = document.getElementById('qrFileName');
        if (hidden) hidden.value = dataUrl;
        if (img) { img.src = dataUrl; img.classList.add('visible'); }
        if (prompt) prompt.style.display = 'none';
        if (fname) fname.textContent = '✅ ' + file.name;
        updatePreview();
        adminToast('QR image loaded — click Save to apply.');
    };
    reader.readAsDataURL(file);
}

function initQrDnd() {
    // No-op: event handlers are inline in HTML via ondragover/ondrop attributes
}

function getAdminToken() {
    return localStorage.getItem('campusx_admin_token') || '';
}

// ── Init ─────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    if (!checkAdminAuth()) return;
    loadStats();
    loadRecentCerts();
    initQrDnd();
});


