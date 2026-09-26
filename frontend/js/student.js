/**
 * Campus Event Management System - Student Module
 * Role 4: Frontend & Integration
 * Sakura & Kawaii Edition 🌸
 */

let myRegistrationsList = [];
let availableEventsList = [];

document.addEventListener('DOMContentLoaded', () => {
  if (!TokenStorage.requireAuth('student')) return;

  const user = TokenStorage.getUser();
  if (user) {
    const nameEl = document.getElementById('student-name-display');
    if (nameEl) nameEl.textContent = user.name;
  }

  loadMyRegistrations();
  loadAvailableEvents();
  setupFilterListeners();

  document.getElementById('refresh-my-events-btn')?.addEventListener('click', () => {
    loadMyRegistrations();
    showToast('Refreshed registrations 🌸', 'info');
  });
});

// --- Fetch & Render My Registrations ---
async function loadMyRegistrations() {
  const container = document.getElementById('my-registrations-container');
  if (!container) return;

  container.innerHTML = `
    <div class="empty-state">
      <div class="kaomoji-icon">( ˶•ᴗ•˶ )</div>
      <h3>Loading registration records...</h3>
    </div>
  `;

  const res = await api.registrations.getMyRegistrations();

  if (res.success && Array.isArray(res.data) && res.data.length > 0) {
    myRegistrationsList = res.data;
    renderMyRegistrations(myRegistrationsList);
  } else {
    myRegistrationsList = [];
    container.innerHTML = `
      <div class="empty-state">
        <div class="kaomoji-icon">(✿◠‿◠)</div>
        <h3>No Event Registrations Yet</h3>
        <p>${res.message || 'You have not registered for any upcoming events yet. Explore available events below to RSVP!'}</p>
      </div>
    `;
  }
}

function renderMyRegistrations(registrations) {
  const container = document.getElementById('my-registrations-container');

  const rowsHTML = registrations.map(reg => {
    const evt = reg.eventId && typeof reg.eventId === 'object' ? reg.eventId : reg;
    const eventId = evt._id || evt.id || reg.eventId;
    const title = evt.title || 'Campus Event';
    const dateStr = evt.date ? new Date(evt.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'TBD';
    const timeStr = evt.time || 'TBD';
    const venue = evt.location || 'Campus';
    const status = (reg.status || 'REGISTERED').toUpperCase();
    const isCancelled = status === 'CANCELLED';

    const statusBadge = isCancelled
      ? '<span class="badge badge-red">✕ Cancelled</span>'
      : '<span class="badge badge-green">🌸 Registered</span>';

    const actionButton = isCancelled
      ? '<button class="btn btn-outline" disabled style="font-size: 0.8rem; padding: 5px 10px;">Cancelled</button>'
      : `<button class="btn btn-danger cancel-reg-btn" data-id="${eventId}" style="font-size: 0.8rem; padding: 5px 12px;">Cancel RSVP</button>`;

    return `
      <tr>
        <td style="font-weight: 700; color: var(--sumi-slate);">${escapeHTML(title)}</td>
        <td>${dateStr}</td>
        <td>${escapeHTML(timeStr)}</td>
        <td>${escapeHTML(venue)}</td>
        <td>${statusBadge}</td>
        <td style="text-align: right;">${actionButton}</td>
      </tr>
    `;
  }).join('');

  container.innerHTML = `
    <div class="data-table-wrapper">
      <table class="data-table">
        <thead>
          <tr>
            <th>Event Name</th>
            <th>Date</th>
            <th>Time</th>
            <th>Venue</th>
            <th>Status</th>
            <th style="text-align: right;">Action</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHTML}
        </tbody>
      </table>
    </div>
  `;

  // Attach cancel listeners
  container.querySelectorAll('.cancel-reg-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const eventId = e.currentTarget.getAttribute('data-id');
      if (!confirm('Cancel your RSVP for this event? 🌸')) return;

      e.currentTarget.disabled = true;
      e.currentTarget.innerHTML = 'Cancelling...';

      const res = await api.registrations.cancel(eventId);
      if (res.success) {
        showToast(res.message || 'Registration has been cancelled 🌸', 'info');
        loadMyRegistrations();
        loadAvailableEvents();
      } else {
        showToast(res.message || 'Unable to cancel registration.', 'error');
        e.currentTarget.disabled = false;
        e.currentTarget.innerHTML = 'Cancel RSVP';
      }
    });
  });
}

// --- Fetch & Render Available Events ---
async function loadAvailableEvents() {
  const container = document.getElementById('all-events-container');
  if (!container) return;

  const res = await api.events.getAll();

  if (res.success && Array.isArray(res.data)) {
    availableEventsList = res.data;
    renderAvailableEvents(availableEventsList);
  } else {
    container.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <div class="kaomoji-icon">(｡•́︿•̀｡)</div>
        <h3>No Events Currently Available</h3>
        <p>${res.message || 'Check back later for newly scheduled activities.'}</p>
      </div>
    `;
  }
}

function renderAvailableEvents(events) {
  const container = document.getElementById('all-events-container');

  if (events.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <div class="kaomoji-icon">(✿◠‿◠)</div>
        <h3>No Matching Events Found</h3>
        <p>No events matched your current search filters.</p>
      </div>
    `;
    return;
  }

  const registeredIds = new Set(
    myRegistrationsList
      .filter(r => (r.status || 'REGISTERED').toUpperCase() !== 'CANCELLED')
      .map(r => {
        const evt = r.eventId && typeof r.eventId === 'object' ? r.eventId : r;
        return String(evt._id || evt.id || r.eventId);
      })
  );

  container.innerHTML = events.map(evt => {
    const eventId = String(evt._id || evt.id);
    const isRegistered = registeredIds.has(eventId);
    const dateStr = evt.date ? new Date(evt.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'TBD';
    const capacity = evt.capacity !== undefined ? evt.capacity : 100;
    const registered = evt.registeredCount || 0;
    const pct = Math.min(100, Math.round((registered / capacity) * 100));

    let catClass = 'badge-sakura';
    if (evt.category === 'Tech') catClass = 'badge-blue';
    if (evt.category === 'Gaming') catClass = 'badge-purple';
    if (evt.category === 'Sports') catClass = 'badge-orange';
    if (evt.category === 'Workshops') catClass = 'badge-green';

    const registerBtn = isRegistered
      ? `<button class="btn btn-outline" disabled style="width: 100%;">🌸 Already RSVP'd ✓</button>`
      : `<button class="btn btn-primary student-quick-register" data-id="${eventId}" style="width: 100%;">Reserve Spot 🌸</button>`;

    return `
      <article class="event-card">
        <div class="card-header">
          <span class="badge ${catClass}">${escapeHTML(evt.category || 'General')}</span>
          <span class="badge badge-gray">👥 ${registered} / ${capacity} spots</span>
        </div>
        <h3 class="event-title">${escapeHTML(evt.title)}</h3>
        <p class="event-desc">${escapeHTML(evt.description || 'Join campus peers for this event!')}</p>
        
        <div class="capacity-meter">
          <div class="capacity-meter-header">
            <span>Capacity Status</span>
            <span>${pct}% filled</span>
          </div>
          <div class="capacity-track">
            <div class="capacity-fill ${pct >= 90 ? 'full' : ''}" style="width: ${pct}%;"></div>
          </div>
        </div>

        <div class="event-meta">
          <div><span>📅</span> <span>${dateStr}</span></div>
          <div><span>⏰</span> <span>${escapeHTML(evt.time || 'TBD')}</span></div>
          <div><span>📍</span> <span>${escapeHTML(evt.location || 'Campus')}</span></div>
        </div>
        <div class="card-footer" style="display: flex; flex-direction: column; gap: 8px;">
          ${registerBtn}
          <a href="event.html?id=${eventId}" class="btn btn-outline" style="width: 100%; font-size: 0.84rem; padding: 6px 10px;">View Full Details</a>
        </div>
      </article>
    `;
  }).join('');

  // Attach quick registration listeners
  container.querySelectorAll('.student-quick-register').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const eventId = e.currentTarget.getAttribute('data-id');
      e.currentTarget.disabled = true;
      e.currentTarget.innerHTML = 'Reserving... 🌸';

      const res = await api.registrations.register(eventId);
      if (res.success) {
        showToast(res.message || 'Spot reserved! See you there 🌸', 'success');
        await loadMyRegistrations();
        await loadAvailableEvents();
      } else {
        showToast(res.message || 'Registration failed. The event may be full or duplicate.', 'error');
        e.currentTarget.disabled = false;
        e.currentTarget.innerHTML = 'Reserve Spot 🌸';
      }
    });
  });
}

// --- Search & Category Filtering ---
function setupFilterListeners() {
  const searchInput = document.getElementById('student-search-input');
  const catFilter = document.getElementById('student-category-filter');

  function applyFilters() {
    const q = searchInput.value.toLowerCase();
    const cat = catFilter.value;

    const filtered = availableEventsList.filter(evt => {
      const matchesSearch = (evt.title && evt.title.toLowerCase().includes(q)) ||
                            (evt.description && evt.description.toLowerCase().includes(q)) ||
                            (evt.location && evt.location.toLowerCase().includes(q));
      const matchesCat = cat === 'ALL' || (evt.category && evt.category.toLowerCase() === cat.toLowerCase());
      return matchesSearch && matchesCat;
    });

    renderAvailableEvents(filtered);
  }

  searchInput?.addEventListener('input', applyFilters);
  catFilter?.addEventListener('change', applyFilters);
}
