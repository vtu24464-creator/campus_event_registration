/* ================================================
   CAMPUSX — Main JavaScript
   Interactive: Navbar, Counter, Filter, Modal, Toast
   ================================================ */

// ── NAVBAR SCROLL EFFECT ──────────────────────────
const navbar = document.getElementById('navbar');
if (navbar) {
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 20);
  });
}

// ── HAMBURGER MOBILE MENU ──────────────────────────
const hamburger = document.getElementById('hamburger');
const navLinks = document.querySelector('.nav-links');
const navCta = document.querySelector('.nav-cta');

if (hamburger) {
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    if (navLinks) classToggle(navLinks, 'nav-links-mobile-open');
    if (navCta) classToggle(navCta, 'nav-cta-mobile-open');
  });
}

function classToggle(el, className) {
  el.classList.toggle(className);
}

// ── NAVBAR AUTH STATE ─────────────────────────────
function updateNavbarAuth() {
  const navAuth = document.getElementById('navAuth');
  if (!navAuth) return;

  const user = getUser();
  const token = getToken();

  if (token && user) {
    const initials = user.avatar_initials || (user.first_name[0] + (user.last_name?.[0] || '')).toUpperCase();
    navAuth.innerHTML = `
      <div class="nav-user-profile" onclick="window.location.href='dashboard.html'" style="display:flex;align-items:center;gap:12px;cursor:pointer;background:rgba(255,255,255,0.05);padding:6px 14px;border-radius:100px;border:1px solid rgba(255,255,255,0.1);">
        <div class="nav-avatar" style="width:32px;height:32px;background:var(--primary);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:0.8rem;font-weight:700;color:white;">${initials}</div>
        <span style="font-size:0.9rem;font-weight:500;color:var(--text);">${user.first_name}</span>
        <button onclick="event.stopPropagation();logout()" class="btn-logout-small" style="background:none;border:none;color:var(--text-muted);cursor:pointer;font-size:1.1rem;padding:0;margin-left:4px;" title="Logout">🚪</button>
      </div>
    `;
  }
}

// ── TOAST SYSTEM ──────────────────────────────────
function showToast(title, msg, type = 'info', duration = 4000) {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const icons = { success: '✅', error: '❌', info: '💡', warning: '⚠️' };
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <span class="toast-icon">${icons[type] || '💡'}</span>
    <div class="toast-text">
      <div class="toast-title">${title}</div>
      ${msg ? `<div class="toast-msg">${msg}</div>` : ''}
    </div>
    <span class="toast-close" onclick="this.parentElement.remove()">✕</span>
  `;

  container.appendChild(toast);
  setTimeout(() => { toast.style.animation = 'slideInRight 0.3s ease reverse'; setTimeout(() => toast.remove(), 300); }, duration);
}

// ── ANIMATED COUNTER ──────────────────────────────
function animateCounter(el, target, suffix = '') {
  const duration = 2000;
  const start = performance.now();
  const isLarge = target >= 1000;

  function update(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3); // ease-out cubic
    const current = Math.round(ease * target);
    el.textContent = isLarge ? (current >= 1000 ? (current / 1000).toFixed(1) + 'K' : current) : current + suffix;
    if (progress < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}

function initCounters() {
  const els = document.querySelectorAll('[data-target]');
  if (!els.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        animateCounter(e.target, parseInt(e.target.dataset.target));
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.3 });

  els.forEach(el => observer.observe(el));
}

// ── CATEGORY CHIP FILTER (Home page) ──────────────
function initCatChips() {
  const chips = document.querySelectorAll('.cat-chip');
  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      chips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
    });
  });
}

// ── EVENTS FILTER (Events page) ───────────────────
function initEventFilter() {
  const searchInput = document.getElementById('searchInput');
  const catFilter = document.getElementById('catFilter');
  const dateFilter = document.getElementById('dateFilter');
  const statusFilter = document.getElementById('statusFilter');
  const grid = document.getElementById('eventsGrid');
  const emptyState = document.getElementById('emptyState');
  const countNum = document.getElementById('countNum');

  if (!searchInput && !catFilter) return;

  function filterEvents() {
    const q = searchInput ? searchInput.value.toLowerCase() : '';
    const cat = catFilter ? catFilter.value : 'all';
    const date = dateFilter ? dateFilter.value : 'all';
    const status = statusFilter ? statusFilter.value : 'all';

    const cards = grid.querySelectorAll('.event-card');
    let visible = 0;

    cards.forEach(card => {
      const title = card.querySelector('.card-title').textContent.toLowerCase();
      const desc = card.querySelector('.card-desc').textContent.toLowerCase();
      const cCat = card.dataset.cat;
      const cDate = card.dataset.date;
      const cStatus = card.dataset.status;

      const matchQ = !q || title.includes(q) || desc.includes(q);
      const matchCat = cat === 'all' || cCat === cat;
      const matchDate = date === 'all' || cDate === date;
      const matchStatus = status === 'all' || cStatus === status;

      const show = matchQ && matchCat && matchDate && matchStatus;
      card.style.display = show ? '' : 'none';
      if (show) visible++;
    });

    if (countNum) countNum.textContent = visible;
    if (emptyState) emptyState.style.display = visible === 0 ? 'block' : 'none';
  }

  if (searchInput) searchInput.addEventListener('input', filterEvents);
  if (catFilter) catFilter.addEventListener('change', filterEvents);
  if (dateFilter) dateFilter.addEventListener('change', filterEvents);
  if (statusFilter) statusFilter.addEventListener('change', filterEvents);
}

// ── REGISTRATION MODAL ────────────────────────────
let currentEventData = {};

function openModal(id, title, icon, date, venue, category, fee, paymentRequired) {
  currentEventData = { id, title, icon, date, venue, category, fee: fee || 0, paymentRequired: !!paymentRequired };

  const overlay = document.getElementById('modalOverlay');
  if (!overlay) return;

  const eventIdInput = document.getElementById('rEventId');
  if (eventIdInput) eventIdInput.value = id;

  const rFeeInput = document.getElementById('rFee');
  if (rFeeInput) rFeeInput.value = fee || 0;

  const rEventTitleInput = document.getElementById('rEventTitle');
  if (rEventTitleInput) rEventTitleInput.value = title || '';

  document.getElementById('modalTitle').textContent = title;
  document.getElementById('modalIcon').textContent = icon;
  document.getElementById('modalMeta').textContent = `📅 ${date} · 📍 ${venue} · 🏷 ${category}`;

  // Fee banner for paid events
  const feeBanner = document.getElementById('rFeeBanner');
  const feeDisplay = document.getElementById('rFeeDisplay');
  if (feeBanner && feeDisplay) {
    const feeNum = parseFloat(fee || 0);
    if (paymentRequired && feeNum > 0) {
      feeDisplay.textContent = '₹' + feeNum.toLocaleString('en-IN');
      feeBanner.style.display = 'block';
      document.getElementById('regSubmitBtn').textContent = 'Proceed to Payment →';
    } else {
      feeBanner.style.display = 'none';
      document.getElementById('regSubmitBtn').textContent = 'Confirm Registration →';
    }
  }

  // Pre-fill user data if available
  const user = getUser();
  if (user) {
    const rName = document.getElementById('rName');
    const rRoll = document.getElementById('rRoll');
    const rEmail = document.getElementById('rEmail');
    const rDept = document.getElementById('rDept');

    if (rName) rName.value = `${user.first_name} ${user.last_name}`;
    if (rRoll && !rRoll.value) rRoll.value = user.roll_number || '';
    if (rEmail) rEmail.value = user.email || '';
    if (rDept) rDept.value = user.department || 'Computer Science';
  }

  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}


function closeModal() {
  const overlay = document.getElementById('modalOverlay');
  if (overlay) overlay.classList.remove('open');
  document.body.style.overflow = '';
}

// Close on overlay click
document.addEventListener('click', (e) => {
  const overlay = document.getElementById('modalOverlay');
  if (e.target === overlay) closeModal();
});

// Close on Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModal();
});

function submitRegistration(e) {
  e.preventDefault();

  const user = getUser();
  if (!user) {
    showToast('Login Required', 'Please sign in to register for events.', 'warning');
    setTimeout(() => { window.location.href = 'login.html'; }, 1500);
    return;
  }

  const eventId = document.getElementById('rEventId')?.value;
  const rollNumber = document.getElementById('rRoll')?.value.trim();
  const phone = document.getElementById('rPhone')?.value.trim();
  const fee = parseFloat(document.getElementById('rFee')?.value || '0');
  const eventTitle = document.getElementById('rEventTitle')?.value || (currentEventData?.title || '');

  if (!eventId) {
    showToast('Error', 'Invalid event data.', 'error');
    return;
  }
  if (!rollNumber) {
    showToast('Roll Number Required', 'Please enter your roll number to register.', 'warning');
    document.getElementById('rRoll')?.focus();
    return;
  }

  const btn = document.getElementById('regSubmitBtn');
  const originalText = btn.textContent;
  btn.textContent = fee > 0 ? 'Processing…' : 'Registering…';
  btn.disabled = true;

  apiPost('/registrations', { event_id: eventId, phone: phone, roll_number: rollNumber })
    .then(data => {
      closeModal();
      document.getElementById('regForm')?.reset();

      if (data.paymentRequired && data.id) {
        // Paid event — redirect to friendly payment route
        const url = `/event/${eventId}/payment?regId=${data.id}&fee=${fee}`;
        showToast('Payment Required 💳', `Redirecting to payment page for ₹${fee}…`, 'warning', 3000);
        setTimeout(() => { window.location.href = url; }, 2000);
      } else {
        // Free event — instant confirm
        showToast('Registration Confirmed! 🎉', `You are registered for ${eventTitle}.`, 'success', 5000);
        if (window.location.pathname.includes('dashboard')) initDashboard();
        if (window.location.pathname.includes('events')) initEventsFromAPI();
      }
    })
    .catch(err => {
      showToast('Registration Failed', err.error || 'Please try again.', 'error');
    })
    .finally(() => {
      btn.textContent = originalText;
      btn.disabled = false;
    });
}


// ── WISHLIST TOGGLE (local UI only) ──────────────
function toggleWishlist(btn) {
  const liked = btn.dataset.liked === 'true';
  btn.dataset.liked = !liked;
  btn.textContent = liked ? '🤍' : '❤️';
  btn.classList.toggle('liked', !liked);

  if (!liked) {
    showToast('Added to Wishlist', 'Event saved to your wishlist.', 'success', 2500);
  } else {
    showToast('Removed from Wishlist', 'Event removed from wishlist.', 'info', 2000);
  }
}

// ── WISHLIST TOGGLE (API-backed for event cards) ──
async function handleWishlistToggle(btn, eventId) {
  const liked = btn.dataset.liked === 'true';
  const token = getToken();
  if (!token) {
    showToast('Login Required', 'Please sign in to use the wishlist.', 'warning');
    return;
  }
  try {
    if (liked) {
      await apiDelete('/wishlist/' + eventId);
      btn.dataset.liked = 'false';
      btn.textContent = '🤍';
      btn.classList.remove('liked');
      showToast('Removed', 'Event removed from wishlist.', 'info', 2000);
    } else {
      await apiPost('/wishlist', { event_id: eventId });
      btn.dataset.liked = 'true';
      btn.textContent = '❤️';
      btn.classList.add('liked');
      showToast('Added to Wishlist ❤️', 'Event saved to your wishlist.', 'success', 2500);
    }
  } catch (err) {
    showToast('Error', err.error || 'Could not update wishlist.', 'error');
  }
}

// ── PASSWORD STRENGTH ──────────────────────────────
function checkStrength(pwd) {
  let score = 0;
  if (pwd.length >= 8) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;

  const colors = ['', '#d63031', '#e17055', '#fdcb6e', '#00b894'];
  const labels = ['Enter a password', 'Weak', 'Fair', 'Good', 'Strong'];

  for (let i = 1; i <= 4; i++) {
    const seg = document.getElementById(`s${i}`);
    if (seg) seg.style.background = i <= score ? colors[score] : 'var(--dark3)';
  }

  const label = document.getElementById('strengthLabel');
  if (label) {
    label.textContent = pwd.length ? labels[score] : 'Enter a password';
    label.style.color = colors[score] || 'var(--text-dim)';
  }
}

// ── SHOW/HIDE PASSWORD ─────────────────────────────
function togglePwd(inputId, btn) {
  const input = document.getElementById(inputId);
  if (!input) return;
  const isHidden = input.type === 'password';
  input.type = isHidden ? 'text' : 'password';
  btn.textContent = isHidden ? '🙈' : '👁';
}

// ── API CONFIG & HELPERS ───────────────────────────
// Spring Boot serves the API on the same origin — use relative path
const API_BASE = '/api';


function getToken() { return localStorage.getItem('cx_token'); }
function getUser() { try { return JSON.parse(localStorage.getItem('cx_user')); } catch { return null; } }

async function apiGet(endpoint) {
  const res = await fetch(API_BASE + endpoint, {
    headers: { 'Authorization': 'Bearer ' + getToken() }
  });
  if (!res.ok) throw await res.json();
  return res.json();
}

async function apiPost(endpoint, data) {
  const res = await fetch(API_BASE + endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + getToken() },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw await res.json();
  return res.json();
}

async function apiDelete(endpoint) {
  const res = await fetch(API_BASE + endpoint, {
    method: 'DELETE',
    headers: { 'Authorization': 'Bearer ' + getToken() }
  });
  if (!res.ok) throw await res.json();
  return res.json();
}

async function apiPatch(endpoint, data) {
  const res = await fetch(API_BASE + endpoint, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + getToken() },
    body: data ? JSON.stringify(data) : null
  });
  if (!res.ok) throw await res.json();
  return res.json();
}

// ── AUTH FORM HANDLERS ─────────────────────────────
function handleRegister(e) {
  e.preventDefault();

  const firstName = document.getElementById('firstName')?.value.trim();
  const lastName = document.getElementById('lastName')?.value.trim();
  const email = document.getElementById('regEmail')?.value.trim();
  const rollNo = document.getElementById('rollNo')?.value.trim();
  const dept = document.getElementById('department')?.value;
  const year = document.getElementById('year')?.value;
  const phone = document.getElementById('phone')?.value?.trim() || '';
  const password = document.getElementById('regPassword')?.value;
  const confirm = document.getElementById('regConfirm')?.value;
  const terms = document.getElementById('terms')?.checked;

  if (!firstName) { showToast('Required', 'Please enter your first name.', 'error'); return; }
  if (!email) { showToast('Required', 'Please enter your email.', 'error'); return; }
  if (!rollNo) { showToast('Required', 'Please enter your roll number.', 'error'); return; }
  if (!dept) { showToast('Required', 'Please select your department.', 'error'); return; }
  if (password !== confirm) { showToast('Password mismatch', 'Passwords do not match.', 'error'); return; }
  if (!terms) { showToast('Terms required', 'Please accept the terms to continue.', 'error'); return; }

  const btn = document.getElementById('regBtn');
  btn.textContent = 'Creating account...';
  btn.disabled = true;

  apiPost('/auth/register', { first_name: firstName, last_name: lastName || '', email, roll_number: rollNo, department: dept, year: year || '1st Year', phone, password })
    .then(data => {
      localStorage.setItem('cx_token', data.token);
      localStorage.setItem('cx_user', JSON.stringify(data.user));
      showToast('Account Created! 🎉', 'Welcome to CampusX! Redirecting to your dashboard...', 'success', 3000);
      setTimeout(() => { window.location.href = '/dashboard.html'; }, 2500);
    })
    .catch(err => {
      showToast('Registration Failed', err.error || 'Please try again.', 'error');
      btn.textContent = 'Create Account →';
      btn.disabled = false;
    });
}

function handleLogin(e) {
  e.preventDefault();

  const email = document.getElementById('loginEmail')?.value.trim();
  const password = document.getElementById('loginPassword')?.value;

  if (!email) { showToast('Required', 'Please enter your email.', 'error'); return; }
  if (!password) { showToast('Required', 'Please enter your password.', 'error'); return; }

  const btn = document.getElementById('loginBtn');
  btn.textContent = 'Signing in...';
  btn.disabled = true;

  apiPost('/auth/login', { email, password })
    .then(data => {
      localStorage.setItem('cx_token', data.token);
      localStorage.setItem('cx_user', JSON.stringify(data.user));
      showToast('Welcome back! 👋', `Hello ${data.user.first_name}! Redirecting...`, 'success', 3000);
      setTimeout(() => { window.location.href = '/dashboard.html'; }, 2000);
    })
    .catch(err => {
      showToast('Login Failed', err.error || 'Invalid credentials.', 'error');
      btn.textContent = 'Sign In →';
      btn.disabled = false;
    });
}

// ── SIDEBAR QUICK ACTIONS HOVER ────────────────────
function initDashActionHovers() {
  document.querySelectorAll('.dash-action-btn').forEach(btn => {
    btn.addEventListener('mouseenter', () => btn.style.transform = 'translateY(-2px)');
    btn.addEventListener('mouseleave', () => btn.style.transform = '');
  });
}

// ── SORT BUTTON (Events page) ──────────────────────
const sortBtn = document.getElementById('sortBtn');
if (sortBtn) {
  let asc = true;
  sortBtn.addEventListener('click', () => {
    asc = !asc;
    sortBtn.textContent = `Sort: Date ${asc ? '↑' : '↓'}`;
    const grid = document.getElementById('eventsGrid');
    if (!grid) return;
    const cards = [...grid.querySelectorAll('.event-card')];
    cards.sort((a, b) => {
      const da = a.dataset.date;
      const db = b.dataset.date;
      return asc ? da.localeCompare(db) : db.localeCompare(da);
    });
    cards.forEach(c => grid.appendChild(c));
  });
}

// ── FADE-IN ON SCROLL ──────────────────────────────
function initScrollReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.style.opacity = '1';
        e.target.style.transform = 'translateY(0)';
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.event-card, .feature-item, .side-event-card, .stat-card').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    observer.observe(el);
  });
}

// ── SIDEBAR MOBILE ──────────────────────────────────
function initSidebarMobile() {
  const sidebar = document.getElementById('sidebar');
  if (!sidebar) return;
  // Tap outside to close
  document.addEventListener('click', (e) => {
    if (window.innerWidth < 768) {
      if (!sidebar.contains(e.target) && sidebar.classList.contains('open')) {
        sidebar.classList.remove('open');
      }
    }
  });
}

// ── INIT ──────────────────────────────────────────
// ── LOGOUT ────────────────────────────────────────
function logout() {
  localStorage.removeItem('cx_token');
  localStorage.removeItem('cx_user');
  window.location.href = '/login.html';
}

// ── DASHBOARD LIVE LOAD ───────────────────────────
async function initDashboard() {
  const user = getUser();
  const token = getToken();

  // Redirect to login if not authenticated
  if (!token || !user) { window.location.href = '/login.html'; return; }

  // Populate all user elements
  const fullName = `${user.first_name} ${user.last_name}`;
  const initials = user.avatar_initials || (user.first_name[0] + (user.last_name?.[0] || '')).toUpperCase();

  const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  set('dashUserName', fullName);
  set('dashUserEmail', user.email || '');
  set('dashAvatar', initials);
  set('dashGreetName', user.first_name);

  // Greeting by time of day
  const hour = new Date().getHours();
  const greetWord = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const greetEl = document.querySelector('.dash-topbar-left h2');
  if (greetEl) greetEl.innerHTML = `${greetWord}, <span id="dashGreetName">${user.first_name}</span> 👋`;

  // Today's date
  set('dashTodayDate', new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) + ' — Spring Semester');

  // Load stats
  try {
    const stats = await apiGet('/dashboard/stats');
    const statMap = {
      statTotalEvents: stats.total_events,
      statRegistered: stats.registered,
      statUpcoming: stats.upcoming,
      statCerts: stats.certificates
    };
    Object.entries(statMap).forEach(([id, val]) => {
      const el = document.getElementById(id);
      if (el) { el.textContent = val; }
    });

    // Update notification badge
    _notifCount = stats.unread_notifs;
    _updateNotifBadges();

    // Welcome toast
    const fn = user.first_name;
    setTimeout(() => showToast(`Welcome back, ${fn}! 👋`,
      `You have ${stats.upcoming} upcoming event${stats.upcoming !== 1 ? 's' : ''} this month.`, 'info', 5000), 800);
  } catch (e) { console.warn('Stats load failed', e); }

  // Load activity feed
  try {
    const activities = await apiGet('/dashboard/activity');
    const feed = document.getElementById('activityFeed');
    if (feed) {
      if (!activities.length) {
        feed.innerHTML = `
          <div class="activity-item" style="justify-content:center;padding:16px 0;">
            <div style="text-align:center;color:var(--text-muted);">
              <div style="font-size:1.5rem;margin-bottom:4px;">🌱</div>
              <div style="font-size:0.85rem;">Your activity will appear here as you register for events.</div>
            </div>
          </div>`;
      } else {
        const actionLabels = {
          registered: 'Registered for',
          unregistered: 'Cancelled registration for',
          wishlist_add: 'Added to wishlist',
          wishlist_remove: 'Removed from wishlist',
          certificate_earned: 'Certificate earned',
          profile_updated: 'Profile updated',
          login: 'Signed in',
          logout: 'Signed out'
        };
        feed.innerHTML = activities.map(a => `
          <div class="activity-item">
            <div class="activity-dot" style="background:var(--primary);"></div>
            <div>
              <div class="activity-text"><strong>${actionLabels[a.action_type] || a.action_type}</strong>${a.event_title ? ' ' + a.event_title : ''}</div>
              <div class="activity-time">${new Date(a.created_at).toLocaleDateString()}</div>
            </div>
          </div>`).join('');
      }
    }   // end if (feed)
  } catch (e) { console.warn('Activity load failed', e); }

  // Load registered events
  try {
    const regs = await apiGet('/registrations');
    // Cache registered events too so openEventDetail can find them
    _dashboardRegsCache = regs;

    // Also fetch all events to ensure we have full descriptions/details for modals
    const allEvents = await apiGet('/events');
    _eventsCache = allEvents;

    const listEl = document.getElementById('registeredEventsList');
    if (listEl) {
      if (!regs.length) {
        listEl.innerHTML = `
          <div style="text-align:center;padding:40px 24px;">
            <div style="font-size:3rem;margin-bottom:12px;">📭</div>
            <div style="font-size:1rem;font-weight:600;color:var(--text-secondary);margin-bottom:6px;">No events registered yet</div>
            <div style="font-size:0.85rem;color:var(--text-muted);margin-bottom:20px;">Browse available events and register to see them here.</div>
            <a href="events.html" class="btn btn-primary btn-sm">Browse Events →</a>
          </div>`;
      } else {
        const statusClass = { confirmed: 'status-confirmed', cancelled: 'status-cancelled', attended: 'status-past', pending: 'status-pending' };
        listEl.innerHTML = regs.map(r => {
          const s = (r.status || 'pending').toLowerCase();
          return `
          <div class="registered-event-item" onclick="openEventDetail(${r.event_id})" style="cursor:pointer;">
            <div class="reg-event-icon" style="background:rgba(108,99,255,0.15);">${r.icon_emoji || '🎓'}</div>
            <div class="reg-event-info">
              <div class="reg-event-name">${r.title}</div>
              <div class="reg-event-meta">📅 ${new Date(r.event_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} · 📍 ${r.venue}</div>
            </div>
            <span class="reg-event-status ${statusClass[s] || ''}">${s.charAt(0).toUpperCase() + s.slice(1)}</span>
          </div>`;
        }).join('');
      }
    }
  } catch (e) { console.warn('Registrations load failed', e); }
}

// ── EVENTS PAGE LIVE LOAD ─────────────────────────
let _eventsCache = [];

async function initEventsFromAPI() {
  const grid = document.getElementById('eventsGrid');
  if (!grid) return;

  const catColors = {
    technical: 'rgba(108,99,255,0.8)',
    hackathon: 'rgba(0,206,201,0.8)',
    workshop: 'rgba(253,121,168,0.8)',
    sports: 'rgba(253,203,110,0.8)',
    academic: 'rgba(0,184,148,0.8)',
    cultural: 'rgba(255,118,117,0.8)'
  };
  const catEmoji = { technical: '💻', cultural: '🎵', hackathon: '⚡', sports: '🏆', academic: '📚', workshop: '🎨' };

  try {
    const events = await apiGet('/events');
    _eventsCache = events;

    if (!events.length) {
      const loadingEl = document.getElementById('eventsLoading');
      if (loadingEl) loadingEl.innerHTML = '<div style="font-size:2rem;margin-bottom:12px;">📭</div><div>No events found.</div>';
      return;
    }

    grid.innerHTML = events.map(ev => {
      const dateStr = ev.eventDate || ev.event_date || '';
      const emoji = ev.iconEmoji || ev.icon_emoji || catEmoji[ev.category] || '🎓';
      const filled = ev.seatsFilled != null ? ev.seatsFilled : (ev.seats_filled || 0);
      const cap = ev.capacity || 100;
      const isFeat = ev.featured || ev.isFeatured || ev.is_featured || false;
      const monthKey = dateStr ? dateStr.slice(0, 7) : '';
      const seatsLeft = Math.max(cap - filled, 0);
      const pct = Math.min((filled / cap) * 100, 100);
      const displayDate = dateStr
        ? new Date(dateStr + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
        : 'TBD';
      const bannerUrl = ev.bannerUrl || ev.banner_url || '';
      const prizePool = ev.prizePool || ev.prize_pool || '';
      const color = catColors[ev.category] || 'rgba(108,99,255,0.8)';

      const bannerBg = bannerUrl
        ? `background:linear-gradient(to top, rgba(13,17,23,0.85) 0%, transparent 50%), url('${bannerUrl}') center/cover no-repeat;`
        : `background:linear-gradient(135deg, var(--dark3) 0%, var(--surface2) 100%);`;

      return `<div class="event-card" data-id="${ev.id}" data-cat="${ev.category}" data-date="${monthKey}" data-status="${ev.status}" onclick="openEventDetail(${ev.id})" style="cursor:pointer;">
        <div class="card-banner" style="${bannerBg}height:180px;">
          ${!bannerUrl ? `<div class="card-banner-icon" style="font-size:3rem;">${emoji}</div>` : ''}
          ${isFeat ? '<span class="card-badge">⭐ Featured</span>' : ''}
          ${prizePool ? `<span class="card-prize-badge">🏆 ${prizePool}</span>` : ''}
          <button class="wishlist-btn" data-liked="false" data-event-id="${ev.id}"
            onclick="event.stopPropagation();handleWishlistToggle(this, ${ev.id})">🤍</button>
        </div>
        <div class="card-body">
          <span class="card-cat" style="background:${color};">${ev.category}</span>
          <h3 class="card-title">${ev.title}</h3>
          <p class="card-desc">${ev.description || ''}</p>
          <div class="card-meta">
            <span>📅 ${displayDate}</span>
            <span>📍 ${ev.venue}</span>
          </div>
          <div class="card-footer">
            <div>
              <div class="seats-bar"><div class="seats-fill" style="width:${pct}%"></div></div>
              <span class="seats-text">${seatsLeft > 0 ? seatsLeft + ' seats left' : 'Fully Booked'}</span>
            </div>
            <button class="btn btn-primary btn-sm" ${ev.status === 'full' ? 'disabled' : ''}
              onclick="event.stopPropagation();openDetailAndRegister(${ev.id})">
              ${ev.status === 'full' ? 'Full' : 'Details →'}
            </button>
          </div>
        </div>
      </div>`;
    }).join('');

    const loadingEl = document.getElementById('eventsLoading');
    if (loadingEl) loadingEl.remove();

    const cnt = document.getElementById('countNum');
    if (cnt) cnt.textContent = events.length;

    initEventFilter();
    initScrollReveal();
  } catch (e) {
    console.warn('Events API error:', e);
    const loadingEl = document.getElementById('eventsLoading');
    if (loadingEl) loadingEl.innerHTML = '<div style="text-align:center;padding:60px;color:var(--danger);">⚠️ Could not load events. Make sure the server is running on port 8080.</div>';
  }
}

// ── EVENT DETAIL MODAL ────────────────────────────
let _currentDetailEvent = null;

let _dashboardRegsCache = [];
function openEventDetail(eventId) {
  const ev = _eventsCache.find(e => e.id === eventId) || _dashboardRegsCache.find(r => r.event_id === eventId);
  if (!ev) {
    showToast('Not Found', 'Event details could not be loaded.', 'error');
    return;
  }
  _currentDetailEvent = ev;

  const overlay = document.getElementById('eventDetailOverlay');
  const modal = document.getElementById('eventDetailModal');
  if (!overlay) return;

  const dateStr = ev.eventDate || ev.event_date || '';
  const displayDate = dateStr
    ? new Date(dateStr + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
    : 'TBD';
  const filled = ev.seatsFilled != null ? ev.seatsFilled : (ev.seats_filled || 0);
  const cap = ev.capacity || 100;
  const seatsLeft = Math.max(cap - filled, 0);
  const pct = Math.min((filled / cap) * 100, 100);
  const bannerUrl = ev.bannerUrl || ev.banner_url || '';
  const prizePool = ev.prizePool || ev.prize_pool || '';
  const organizer = ev.organizer || '';
  const contact = ev.contactEmail || ev.contact_email || '';
  const isFeat = ev.featured || ev.isFeatured || ev.is_featured || false;

  const catBg = {
    technical: 'rgba(108,99,255,0.85)', hackathon: 'rgba(0,206,201,0.85)',
    workshop: 'rgba(253,121,168,0.85)', sports: 'rgba(253,203,110,0.85)',
    academic: 'rgba(0,184,148,0.85)', cultural: 'rgba(255,118,117,0.85)'
  };

  // Banner
  const banner = document.getElementById('detailBanner');
  if (bannerUrl) {
    banner.style.background = `linear-gradient(to top, rgba(13,17,23,0.9) 0%, transparent 60%), url('${bannerUrl}') center/cover no-repeat`;
  } else {
    banner.style.background = `linear-gradient(135deg, var(--dark3), var(--surface2))`;
  }

  const catChip = document.getElementById('detailCatChip');
  catChip.textContent = ev.category.charAt(0).toUpperCase() + ev.category.slice(1);
  catChip.style.background = catBg[ev.category] || 'rgba(108,99,255,0.8)';

  const featBadge = document.getElementById('detailFeaturedBadge');
  featBadge.style.display = isFeat ? 'inline-flex' : 'none';

  document.getElementById('detailTitle').textContent = ev.title;
  document.getElementById('detailDesc').textContent = ev.description || '';
  document.getElementById('detailDate').textContent = displayDate;
  document.getElementById('detailVenue').textContent = ev.venue || '';
  document.getElementById('detailType').textContent = (ev.category || '').charAt(0).toUpperCase() + (ev.category || '').slice(1) + ' Event';

  // Prize Pool
  const prizeRow = document.getElementById('detailPrizeRow');
  if (prizePool) {
    document.getElementById('detailPrize').textContent = prizePool;
    prizeRow.style.display = 'flex';
  } else {
    prizeRow.style.display = 'none';
  }

  // Seats
  document.getElementById('detailSeats').textContent = seatsLeft > 0 ? `${seatsLeft} of ${cap} seats left` : 'Fully Booked';
  document.getElementById('detailPct').textContent = Math.round(pct) + '%';
  document.getElementById('detailBar').style.width = pct + '%';

  // Organizer
  const orgRow = document.getElementById('detailOrgRow');
  if (organizer) {
    document.getElementById('detailOrg').textContent = organizer;
    orgRow.style.display = 'flex';
  } else {
    orgRow.style.display = 'none';
  }

  // Contact & Fee
  const contactRow = document.getElementById('detailContactRow');
  const fee = parseFloat(ev.registrationFee || ev.registration_fee || 0);
  const isPaid = (ev.paymentRequired || ev.payment_required) && fee > 0;
  const regFeeHtml = isPaid
    ? `<div style="background:rgba(253,203,110,0.08);border:1px solid rgba(253,203,110,0.25);border-radius:8px;padding:8px 12px;margin-top:8px;font-size:0.82rem;">💳 <b style="color:#FDCB6E;">Paid Event</b> — Fee: <b style="color:#FDCB6E;">₹${fee.toLocaleString('en-IN')}</b></div>`
    : `<div style="font-size:0.78rem;color:rgba(63,185,80,0.8);margin-top:8px;">✅ Free Registration</div>`;
  contactRow.innerHTML = (contact ? `📧 Contact: <a href="mailto:${contact}" style="color:var(--primary-light);">${contact}</a>` : '') + regFeeHtml;

  // Check if registered
  const userReg = _dashboardRegsCache.find(r => r.event_id === ev.id && r.status !== 'cancelled');
  const isReg = !!userReg;


  // Register / Unenroll button
  const regBtn = document.getElementById('detailRegBtn');
  if (isReg) {
    regBtn.textContent = 'Unenroll from Event ✕';
    regBtn.style.background = 'rgba(248,81,73,0.1)';
    regBtn.style.color = '#F85149';
    regBtn.style.border = '1px solid rgba(248,81,73,0.3)';
    regBtn.disabled = false;
    regBtn.onclick = () => handleUnenroll(userReg.id, ev.title);
  } else if (ev.status === 'full') {
    regBtn.textContent = 'Fully Booked';
    regBtn.disabled = true;
    regBtn.style.background = ''; regBtn.style.color = ''; regBtn.style.border = '';
  } else {
    regBtn.textContent = 'Register for this Event →';
    regBtn.disabled = false;
    regBtn.style.background = ''; regBtn.style.color = ''; regBtn.style.border = '';
    const feeValue = parseFloat(ev.registrationFee || ev.registration_fee || 0);
    const paidForBtn = (ev.paymentRequired || ev.payment_required) && feeValue > 0;
    if (paidForBtn) {
      regBtn.textContent = `Register & Pay ₹${feeValue.toLocaleString('en-IN')} →`;
    }
    regBtn.onclick = () => {
      closeEventDetail();
      const emoji = ev.iconEmoji || ev.icon_emoji || '🎓';
      openModal(ev.id, ev.title, emoji, displayDate, ev.venue, ev.category, feeValue, paidForBtn);
    };
  }

  // Wishlist button
  const wishBtn = document.getElementById('detailWishBtn');
  wishBtn.onclick = () => handleWishlistToggle(wishBtn, ev.id);

  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function openDetailAndRegister(eventId) {
  openEventDetail(eventId);
}

function closeEventDetail(e) {
  if (e && e.target !== document.getElementById('eventDetailOverlay')) return;
  const overlay = document.getElementById('eventDetailOverlay');
  if (overlay) overlay.classList.remove('open');
  document.body.style.overflow = '';
}

async function handleUnenroll(regId, title) {
  if (!confirm(`Are you sure you want to unenroll from "${title}"?`)) return;

  try {
    const res = await apiPatch(`/registrations/${regId}/cancel`);
    showToast('Unenrolled', `You have unenrolled from ${title}.`, 'warning');
    closeEventDetail();
    // Refresh dashboard or panel if open
    if (window.location.pathname.includes('dashboard.html')) initDashboard();
    const panel = document.getElementById('slidePanel');
    if (panel && panel.style.display === 'flex') {
      const title = document.getElementById('panelTitle').textContent;
      if (title.includes('Registrations')) openPanel('registrations');
    }
  } catch (err) {
    showToast('Error', err.error || 'Failed to unenroll.', 'error');
  }
}

// ── EXTERNAL EVENTS ───────────────────────────────
async function loadExternalEvents() {
  const grid = document.getElementById('externalGrid');
  if (!grid) return;

  try {
    const res = await fetch('/data/real_events.json');
    const events = await res.json();

    const levelColors = { 'National': 'rgba(0,184,148,0.8)', 'International': 'rgba(108,99,255,0.8)' };
    const catColors = {
      hackathon: 'linear-gradient(135deg,rgba(0,206,201,0.15),rgba(108,99,255,0.08))',
      technical: 'linear-gradient(135deg,rgba(108,99,255,0.15),rgba(162,155,254,0.08))',
      academic: 'linear-gradient(135deg,rgba(0,184,148,0.15),rgba(0,206,201,0.08))'
    };

    grid.innerHTML = events.map(ev => {
      const bg = catColors[ev.category] || 'linear-gradient(135deg,rgba(108,99,255,0.12),rgba(253,121,168,0.06))';
      const levelColor = levelColors[ev.level] || 'rgba(108,99,255,0.8)';
      const deadline = ev.deadline ? new Date(ev.deadline + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'TBD';

      return `
        <div class="ext-event-card" style="background:${bg};">
          <div style="display:flex;align-items:flex-start;gap:14px;margin-bottom:14px;">
            <div style="font-size:2rem;line-height:1;">${ev.icon}</div>
            <div style="flex:1;">
              <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-bottom:4px;">
                <span style="padding:2px 10px;border-radius:50px;font-size:0.7rem;font-weight:700;background:${levelColor};color:white;">${ev.level}</span>
                <span style="padding:2px 10px;border-radius:50px;font-size:0.7rem;font-weight:600;background:var(--dark3);color:var(--text-muted);">${ev.category}</span>
              </div>
              <h3 style="font-size:0.95rem;font-weight:700;line-height:1.3;margin-bottom:2px;">${ev.title}</h3>
              <div style="font-size:0.78rem;color:var(--text-muted);">${ev.organizer}</div>
            </div>
          </div>
          <p style="font-size:0.83rem;color:var(--text-muted);line-height:1.55;margin-bottom:14px;">${ev.description}</p>
          <div style="display:flex;gap:16px;flex-wrap:wrap;margin-bottom:16px;">
            <div style="font-size:0.8rem;"><span style="color:var(--text-dim);">⏰ Deadline: </span><strong>${deadline}</strong></div>
            ${ev.prize_pool ? `<div style="font-size:0.8rem;"><span style="color:var(--text-dim);">🏆 Prize: </span><strong style="color:var(--warning);">${ev.prize_pool}</strong></div>` : ''}
          </div>
          <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px;">
            ${ev.tags.map(t => `<span style="padding:2px 9px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:4px;font-size:0.72rem;color:var(--text-muted);">#${t}</span>`).join('')}
          </div>
          <a href="${ev.url}" target="_blank" rel="noopener" class="btn-primary" style="display:inline-flex;width:100%;justify-content:center;font-size:0.85rem;">
            View &amp; Apply →
          </a>
        </div>`;
    }).join('');
  } catch (e) {
    console.warn('External events load failed', e);
    if (grid) grid.innerHTML = '<div style="text-align:center;padding:40px;color:var(--danger);">⚠️ Could not load external events.</div>';
  }
}

// ── TAB SWITCHER ──────────────────────────────────
function switchTab(tab) {
  const campusPanel = document.getElementById('campusPanel');
  const externalPanel = document.getElementById('externalPanel');
  const campusFilters = document.getElementById('campusFilters');
  const tabCampus = document.getElementById('tabCampus');
  const tabExternal = document.getElementById('tabExternal');
  if (!campusPanel) return;

  if (tab === 'campus') {
    campusPanel.style.display = '';
    externalPanel.style.display = 'none';
    campusFilters.style.display = '';
    tabCampus.classList.add('active');
    tabExternal.classList.remove('active');
  } else {
    campusPanel.style.display = 'none';
    externalPanel.style.display = '';
    campusFilters.style.display = 'none';
    tabCampus.classList.remove('active');
    tabExternal.classList.add('active');
    loadExternalEvents();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initCounters();
  initCatChips();
  initEventFilter();
  initScrollReveal();
  initDashActionHovers();
  initSidebarMobile();
  updateNavbarAuth();

  const path = window.location.pathname;
  if (path.includes('dashboard')) initDashboard();
  if (path.includes('events')) initEventsFromAPI();
  initPublicStats();
});

// Close event detail modal on Escape
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    const detailOverlay = document.getElementById('eventDetailOverlay');
    if (detailOverlay && detailOverlay.classList.contains('open')) {
      detailOverlay.classList.remove('open');
      document.body.style.overflow = '';
      return;
    }
  }
});


// ── SLIDE-IN PANEL SYSTEM ─────────────────────────
const PANEL_TITLES = {
  registrations: '✅ My Registrations',
  certificates: '🏆 My Certificates',
  wishlist: '❤️ My Wishlist',
  profile: '👤 My Profile',
  notifications: '🔔 Notifications',
  settings: '⚙ Settings',
  messages: '💬 Messages',
};

let _notifCount = 3; // track live count

async function openPanel(key) {
  const panel = document.getElementById('slidePanel');
  const overlay = document.getElementById('panelOverlay');
  const title = document.getElementById('panelTitle');
  const body = document.getElementById('panelBody');
  const tpl = document.getElementById(`tpl-${key}`);

  if (!panel) return;

  title.textContent = PANEL_TITLES[key] || key;
  body.innerHTML = '<div style="text-align:center;padding:40px;color:var(--text-muted);"><div style="font-size:2rem;margin-bottom:10px;animation:spin 1s linear infinite;">🔄</div><div>Loading...</div></div>';

  // Show
  overlay.style.display = 'block';
  panel.style.display = 'flex';
  requestAnimationFrame(() => requestAnimationFrame(() => panel.style.transform = 'translateX(0)'));
  document.body.style.overflow = 'hidden';

  try {
    let content = '';
    if (key === 'registrations') {
      const data = await apiGet('/registrations');
      content = renderRegistrationsPanel(data);
    } else if (key === 'wishlist') {
      const data = await apiGet('/wishlist');
      content = renderWishlistPanel(data);
    } else if (key === 'notifications') {
      const data = await apiGet('/notifications');
      content = renderNotificationsPanel(data);
    } else if (key === 'certificates') {
      const data = await apiGet('/certificates');
      content = renderCertificatesPanel(data);
    } else if (tpl) {
      // For static templates like profile, settings, etc.
      body.innerHTML = '';
      body.appendChild(tpl.content.cloneNode(true));
      if (key === 'profile') fillProfileDetails();
      return;
    }

    body.innerHTML = content;
  } catch (err) {
    console.error(`Error loading ${key}:`, err);
    body.innerHTML = `<div style="text-align:center;padding:40px;color:var(--danger);">⚠️ Failed to load ${key}. Please try again later.</div>`;
  }
}

// Category-safe icon helper — uses HTML Unicode entities instead of raw DB emoji
const CAT_ICONS = {
  technical: { icon: '&#x1F4BB;', bg: 'rgba(108,99,255,0.18)' },
  hackathon: { icon: '&#x26A1;', bg: 'rgba(0,206,201,0.18)' },
  workshop: { icon: '&#x1F3A8;', bg: 'rgba(253,121,168,0.18)' },
  sports: { icon: '&#x1F3C6;', bg: 'rgba(253,203,110,0.18)' },
  academic: { icon: '&#x1F4DA;', bg: 'rgba(0,184,148,0.18)' },
  cultural: { icon: '&#x1F3B5;', bg: 'rgba(255,118,117,0.18)' }
};

function catIconHtml(category, fallbackBg) {
  const ci = CAT_ICONS[(category || '').toLowerCase()] || { icon: '&#x1F393;', bg: fallbackBg || 'rgba(108,99,255,0.15)' };
  return `<div style="width:44px;height:44px;background:${ci.bg};border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:1.2rem;flex-shrink:0;">${ci.icon}</div>`;
}

function renderRegistrationsPanel(regs) {
  if (!regs.length) return `<div style="text-align:center;padding:60px 20px;color:var(--text-muted);">
    <div style="font-size:3rem;margin-bottom:15px;">📅</div>
    <div>You haven't registered for any events yet.</div>
    <a href="events.html" class="btn btn-primary btn-sm" style="margin-top:15px;">Browse Events →</a>
  </div>`;

  const statusClass = { confirmed: 'status-confirmed', cancelled: 'status-cancelled', attended: 'status-past', pending: 'status-pending' };

  return `
    <div style="display:flex;flex-direction:column;gap:12px;">
      ${regs.map(r => `
        <div class="registration-panel-item" onclick="openEventDetail(${r.event_id})" style="display:flex;align-items:center;gap:14px;padding:14px;background:var(--dark3);border-radius:var(--radius);cursor:pointer;transition:var(--transition);">
          ${catIconHtml(r.category)}
          <div style="flex:1;">
            <div style="font-size:0.9rem;font-weight:600;margin-bottom:3px;">${r.title}</div>
            <div style="font-size:0.77rem;color:var(--text-muted);">📅 ${new Date(r.event_date).toLocaleDateString()} · 📍 ${r.venue}</div>
          </div>
          <span class="reg-event-status ${statusClass[r.status] || ''}">${r.status.charAt(0).toUpperCase() + r.status.slice(1)}</span>
        </div>
      `).join('')}
      <a href="events.html" style="display:block;text-align:center;padding:12px;background:rgba(108,99,255,0.1);border:1px solid rgba(108,99,255,0.3);border-radius:var(--radius);color:var(--primary-light);font-size:0.88rem;font-weight:600;margin-top:8px;">+ Browse More Events</a>
    </div>`;
}

function renderWishlistPanel(items) {
  if (!items.length) return `<div style="text-align:center;padding:60px 20px;color:var(--text-muted);">
    <div style="font-size:3rem;margin-bottom:15px;">❤️</div>
    <div>Your wishlist is empty.</div>
    <a href="events.html" class="btn btn-primary btn-sm" style="margin-top:15px;">Browse Events →</a>
  </div>`;

  return `
    <div style="display:flex;flex-direction:column;gap:14px;">
      ${items.map(item => `
        <div style="display:flex;align-items:center;gap:14px;padding:14px;background:var(--dark3);border-radius:var(--radius);">
          ${catIconHtml(item.category, 'rgba(162,155,254,0.15)')}
          <div style="flex:1;">
            <div style="font-size:0.9rem;font-weight:600;margin-bottom:3px;">${item.title}</div>
            <div style="font-size:0.77rem;color:var(--text-muted);">📅 ${new Date(item.event_date).toLocaleDateString()} · 📍 ${item.venue}</div>
          </div>
          <button onclick="apiDelete('/wishlist/${item.event_id}').then(()=>openPanel('wishlist'))" style="background:none;border:none;font-size:1.2rem;cursor:pointer;">❤️</button>
        </div>
      `).join('')}
      <a href="events.html" style="display:block;text-align:center;padding:12px;background:rgba(253,121,168,0.1);border:1px solid rgba(253,121,168,0.3);border-radius:var(--radius);color:var(--accent);font-size:0.88rem;font-weight:600;margin-top:8px;">Browse & Add More →</a>
    </div>`;
}

function renderNotificationsPanel(notifs) {
  if (!notifs.length) return `<div style="text-align:center;padding:60px 20px;color:var(--text-muted);">
    <div style="font-size:3rem;margin-bottom:15px;">🔔</div>
    <div>No notifications yet.</div>
  </div>`;

  const icons = { info: '💡', success: '✅', warning: '⚠️', alert: '⏰' };

  return `
    <div style="display:flex;flex-direction:column;gap:10px;" id="notifList">
      ${notifs.map(n => `
        <div class="notif-item" style="display:flex;gap:12px;padding:14px;background:${n.is_read ? 'var(--dark3)' : 'rgba(108,99,255,0.08)'};border:1px solid ${n.is_read ? 'var(--border)' : 'rgba(108,99,255,0.2)'};border-radius:var(--radius);position:relative;">
          <div style="width:36px;height:36px;background:rgba(108,99,255,0.15);border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:1rem;flex-shrink:0;">${icons[n.type] || '🔔'}</div>
          <div style="flex:1;">
            <div style="font-size:0.85rem;font-weight:600;margin-bottom:3px;">${n.title}</div>
            <div style="font-size:0.78rem;color:var(--text-muted);">${n.message}</div>
            <div style="font-size:0.72rem;color:var(--text-dim);margin-top:5px;">${new Date(n.created_at).toLocaleString()}</div>
          </div>
          <button onclick="apiDelete('/notifications/${n.id}').then(()=>openPanel('notifications'))" style="position:absolute;top:10px;right:10px;background:none;border:none;color:var(--text-dim);cursor:pointer;font-size:0.85rem;">✕</button>
        </div>
      `).join('')}
      <button onclick="apiDelete('/notifications').then(()=>openPanel('notifications'))" style="padding:10px;background:var(--dark3);border:1px solid var(--border);border-radius:10px;color:var(--text-muted);font-size:0.82rem;font-weight:600;cursor:pointer;margin-top:6px;">Clear All Notifications</button>
    </div>`;
}

function renderCertificatesPanel(certs) {
  if (!certs.length) return `<div style="text-align:center;padding:60px 20px;color:var(--text-muted);">
    <div style="font-size:3rem;margin-bottom:15px;">🏆</div>
    <div>No certificates earned yet.</div>
    <div style="font-size:0.8rem;margin-top:10px;">Certificates are issued after you attend events.</div>
  </div>`;

  const gradients = [
    'linear-gradient(135deg,rgba(253,203,110,0.12),rgba(253,121,168,0.08))',
    'linear-gradient(135deg,rgba(108,99,255,0.12),rgba(0,206,201,0.08))',
    'linear-gradient(135deg,rgba(0,184,148,0.12),rgba(0,206,201,0.08))'
  ];
  const borderColors = [
    'rgba(253,203,110,0.25)', 'rgba(108,99,255,0.25)', 'rgba(0,184,148,0.25)'
  ];
  const btnColors = [
    { bg: 'rgba(253,203,110,0.2)', border: 'rgba(253,203,110,0.4)', text: 'var(--warning)' },
    { bg: 'rgba(108,99,255,0.2)', border: 'rgba(108,99,255,0.4)', text: 'var(--primary-light)' },
    { bg: 'rgba(0,184,148,0.2)', border: 'rgba(0,184,148,0.4)', text: 'var(--success)' }
  ];
  const catIconMap = {
    technical: { icon: '&#x1F4BB;', color: 'rgba(108,99,255,0.25)' },
    hackathon: { icon: '&#x26A1;', color: 'rgba(0,206,201,0.25)' },
    workshop: { icon: '&#x1F3A8;', color: 'rgba(253,121,168,0.25)' },
    sports: { icon: '&#x1F3C6;', color: 'rgba(253,203,110,0.25)' },
    academic: { icon: '&#x1F4DA;', color: 'rgba(0,184,148,0.25)' },
    cultural: { icon: '&#x1F3B5;', color: 'rgba(255,118,117,0.25)' }
  };
  const typeLabel = { winner: '🥇 Winner', runner_up: '🥈 Runner-Up', '2nd_runner_up': '🥉 2nd Runner-Up', participation: '🎓 Participation', merit: '⭐ Merit' };

  return `
    <div style="display:flex;flex-direction:column;gap:14px;">
      ${certs.map((c, i) => {
    const idx = i % 3;
    const btn = btnColors[idx];
    const cat = (c.category || 'academic').toLowerCase();
    const ci = catIconMap[cat] || catIconMap.academic;
    const certId = 'CERT-2026-' + String(c.id).padStart(4, '0');
    const ptKey = (c.participation_type || 'participation').toLowerCase().replace(/\s+/g, '_');
    const ptLbl = typeLabel[ptKey] || '🎓 Participation';
    return `
        <div style="background:${gradients[idx]};border:1px solid ${borderColors[idx]};border-radius:var(--radius);padding:18px;display:flex;gap:16px;align-items:center;">
          <div style="width:52px;height:52px;background:${ci.color};border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:1.5rem;flex-shrink:0;">${ci.icon}</div>
          <div style="flex:1;">
            <div style="font-size:0.9rem;font-weight:700;margin-bottom:3px;">${c.title}</div>
            <div style="font-size:0.72rem;color:var(--text-dim);margin-bottom:2px;letter-spacing:0.5px;">📋 ${certId} &nbsp;·&nbsp; ${ptLbl}</div>
            <div style="font-size:0.77rem;color:var(--text-muted);margin-bottom:12px;">🗓 Issued: ${new Date(c.issued_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
            <div style="display:flex;gap:8px;flex-wrap:wrap;">
              <a href="certificate-preview.html?certId=${c.id}" target="_blank"
                style="padding:7px 16px;background:${btn.bg};border:1px solid ${btn.border};border-radius:8px;color:${btn.text};font-size:0.8rem;font-weight:600;cursor:pointer;display:inline-flex;align-items:center;gap:6px;text-decoration:none;"
                onclick="showToast('Certificate','Opening ${c.title.replace(/'/g, '&apos;')} preview…','info')">
                &#x1F393; View &amp; Download Certificate
              </a>
              <button onclick="navigator.clipboard.writeText('${certId}').then(()=>showToast('Copied!','Certificate ID copied','success'))" style="padding:7px 14px;background:var(--dark3);border:1px solid var(--border);border-radius:8px;color:var(--text-muted);font-size:0.8rem;cursor:pointer;">&#x1F517; Copy ID</button>
            </div>
          </div>
        </div>`;
  }).join('')}
      <p style="text-align:center;font-size:0.8rem;color:var(--text-dim);margin-top:4px;">Certificates are auto-generated after attending events.</p>
    </div>`;
}

async function initPublicStats() {
  try {
    const events = await apiGet('/events');
    const studentCount = 1240; // Simulated student count for now, or fetch from a stats endpoint

    // Update Hero Stats
    const hEvent = document.getElementById('heroEventCount');
    const hStudent = document.getElementById('heroStudentCount');
    if (hEvent) hEvent.setAttribute('data-target', events.length);
    if (hStudent) hStudent.setAttribute('data-target', studentCount);

    // Update Login Preview Stats
    const lEvent = document.getElementById('loginEventCount');
    const lStudent = document.getElementById('loginStudentCount');
    if (lEvent) lEvent.textContent = events.length;
    if (lStudent) lStudent.textContent = (studentCount / 1000).toFixed(1) + 'K';

    // Update Category Counts (Landing page) — DB stores lowercase category values
    const counts = {
      All: events.length,
      Technical: events.filter(e => e.category === 'technical').length,
      Cultural: events.filter(e => e.category === 'cultural').length,
      Hackathon: events.filter(e => e.category === 'hackathon').length,
      Sports: events.filter(e => e.category === 'sports').length,
      Academic: events.filter(e => e.category === 'academic').length,
      Workshop: events.filter(e => e.category === 'workshop').length
    };

    for (const [key, val] of Object.entries(counts)) {
      const el = document.getElementById(`count${key}`);
      if (el) el.textContent = val;
    }

    // Trigger hero count animation
    if (hEvent) initCounters();
  } catch (err) {
    console.error('Error fetching public stats:', err);
  }
}

function fillProfileDetails() {
  const user = getUser();
  if (!user) return;

  const avatar = document.querySelector('#panelBody [style*="width:72px"]');
  if (avatar) avatar.textContent = user.avatar_initials || (user.first_name[0] + (user.last_name?.[0] || '')).toUpperCase();

  const nameDisplay = document.querySelector('#panelBody [style*="font-size:1rem"]');
  if (nameDisplay) nameDisplay.textContent = `${user.first_name} ${user.last_name}`;

  const emailDisplay = document.querySelector('#panelBody [style*="font-size:0.8rem"]');
  if (emailDisplay) emailDisplay.textContent = user.email;

  const setVal = (id, val) => {
    const el = document.querySelector(`#panelBody #${id}`);
    if (el) el.value = val || '';
  };

  setVal('profFullName', `${user.first_name} ${user.last_name}`);
  setVal('profRoll', user.roll_number);
  setVal('profDept', user.department);
  setVal('profYear', user.year);
  setVal('profPhone', user.phone);
}

function closePanel() {
  const panel = document.getElementById('slidePanel');
  const overlay = document.getElementById('panelOverlay');
  if (!panel) return;

  panel.style.transform = 'translateX(100%)';
  setTimeout(() => {
    panel.style.display = 'none';
    overlay.style.display = 'none';
    document.body.style.overflow = '';
  }, 350);
}

// Close panel with Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    const panel = document.getElementById('slidePanel');
    if (panel && panel.style.display === 'flex') closePanel();
    else closeModal();
  }
});

// ── NOTIFICATION HELPERS ──────────────────────────
function dismissNotif(btn) {
  const item = btn.closest('.notif-item');
  if (!item) return;
  item.style.transition = 'opacity 0.3s, transform 0.3s';
  item.style.opacity = '0';
  item.style.transform = 'translateX(20px)';
  setTimeout(() => {
    item.remove();
    _notifCount = Math.max(0, _notifCount - 1);
    _updateNotifBadges();
  }, 300);
}

function clearAllNotifications() {
  const list = document.getElementById('notifList');
  if (!list) return;
  [...list.querySelectorAll('.notif-item')].forEach(item => {
    item.style.transition = 'opacity 0.3s';
    item.style.opacity = '0';
    setTimeout(() => item.remove(), 300);
  });
  _notifCount = 0;
  _updateNotifBadges();
  setTimeout(() => showToast('Cleared', 'All notifications cleared.', 'info', 2500), 400);
}

function _updateNotifBadges() {
  const dot = document.getElementById('notifDot');
  const badge = document.getElementById('notifSidebarBadge');
  if (dot) dot.style.display = _notifCount > 0 ? 'block' : 'none';
  if (badge) badge.textContent = _notifCount > 0 ? _notifCount : '';
  if (badge) badge.style.display = _notifCount > 0 ? 'inline-block' : 'none';
}

// ── ACTIVITY CLEAR ────────────────────────────────
function clearActivity() {
  const panel = document.querySelector('.dash-panel-body');
  // find the activity panel body specifically
  const allBodies = document.querySelectorAll('.dash-panel-body');
  let activityBody = null;
  allBodies.forEach(b => {
    if (b.querySelector('.activity-item')) activityBody = b;
  });
  if (!activityBody) return;

  [...activityBody.querySelectorAll('.activity-item')].forEach((item, i) => {
    setTimeout(() => {
      item.style.transition = 'opacity 0.3s, transform 0.3s';
      item.style.opacity = '0';
      item.style.transform = 'translateX(10px)';
      setTimeout(() => item.remove(), 300);
    }, i * 80);
  });

  setTimeout(() => {
    activityBody.innerHTML = `
      <div style="text-align:center;padding:30px 20px;color:var(--text-dim);">
        <div style="font-size:2rem;margin-bottom:8px;">🌙</div>
        <div style="font-size:0.85rem;">No recent activity</div>
      </div>`;
    showToast('Cleared', 'Activity feed cleared.', 'info', 2000);
  }, 500);
}
