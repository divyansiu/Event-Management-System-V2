/**
 * Campus Event Management System - Organizer Module
 * Role 4: Frontend & Integration
 * Sakura & Kawaii Edition 🌸
 */

let organizerEvents = [];

document.addEventListener('DOMContentLoaded', () => {
  if (!TokenStorage.requireAuth('organizer')) return;

  const user = TokenStorage.getUser();
  if (user) {
    const nameEl = document.getElementById('organizer-name-display');
    if (nameEl) nameEl.textContent = user.name;
  }

  loadOrganizerEvents();
  setupCreateEventForm();
  setupEditEventForm();
  setupModalHandlers();

  document.getElementById('refresh-organizer-events-btn')?.addEventListener('click', () => {
    loadOrganizerEvents();
    showToast('Refreshed event ledger 🌸', 'info');
  });
});

// --- Fetch & Render Events Ledger ---
async function loadOrganizerEvents() {
  const container = document.getElementById('organizer-events-container');
  if (!container) return;

  container.innerHTML = `
    <div class="empty-state" style="grid-column: 1 / -1;">
      <div class="kaomoji-icon">( ˶•ᴗ•˶ )</div>
      <h3>Loading event ledger...</h3>
    </div>
  `;

  const res = await api.events.getAll();

  if (res.success && Array.isArray(res.data)) {
    organizerEvents = res.data;
    renderOrganizerEvents(organizerEvents);
  } else {
    container.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <div class="kaomoji-icon">(✿◠‿◠)</div>
        <h3>No Events Recorded</h3>
        <p>${res.message || 'Use the form above to schedule your first campus event 🌸'}</p>
      </div>
    `;
  }
}

function renderOrganizerEvents(events) {
  const container = document.getElementById('organizer-events-container');

  if (events.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <div class="kaomoji-icon">(✿◠‿◠)</div>
        <h3>No Events Published Yet</h3>
        <p>Use the form above to schedule your first campus event 🌸</p>
      </div>
    `;
    return;
  }

  container.innerHTML = events.map(evt => {
    const eventId = evt._id || evt.id;
    const dateStr = evt.date ? new Date(evt.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'TBD';
    const capacity = evt.capacity !== undefined ? evt.capacity : 100;
    const registered = evt.registeredCount || 0;
    const pct = Math.min(100, Math.round((registered / capacity) * 100));

    let catClass = 'badge-sakura';
    if (evt.category === 'Tech') catClass = 'badge-blue';
    if (evt.category === 'Gaming') catClass = 'badge-purple';
    if (evt.category === 'Sports') catClass = 'badge-orange';
    if (evt.category === 'Workshops') catClass = 'badge-green';

    return `
      <article class="event-card">
        <div class="card-header">
          <span class="badge ${catClass}">${escapeHTML(evt.category || 'General')}</span>
          <span class="badge badge-gray">👥 ${registered} / ${capacity} spots</span>
        </div>
        <h3 class="event-title">${escapeHTML(evt.title)}</h3>
        <p class="event-desc">${escapeHTML(evt.description || 'No description provided.')}</p>

        <div class="capacity-meter">
          <div class="capacity-meter-header">
            <span>Roster Filled</span>
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
          <button class="btn btn-outline view-participants-btn" data-id="${eventId}" data-title="${escapeHTML(evt.title)}" style="width: 100%;">
            👥 View Participant Roster
          </button>
          <div style="display: flex; gap: 8px;">
            <button class="btn btn-primary edit-event-btn" data-id="${eventId}" style="flex: 1; padding: 7px 12px; font-size: 0.85rem;">
              ✏️ Edit Details
            </button>
            <button class="btn btn-danger delete-event-btn" data-id="${eventId}" style="flex: 1; padding: 7px 12px; font-size: 0.85rem;">
              🗑️ Delete
            </button>
          </div>
        </div>
      </article>
    `;
  }).join('');

  attachEventCardListeners();
}

function attachEventCardListeners() {
  // View Participants
  document.querySelectorAll('.view-participants-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const eventId = e.currentTarget.getAttribute('data-id');
      const title = e.currentTarget.getAttribute('data-title');
      openParticipantsModal(eventId, title);
    });
  });

  // Edit Event
  document.querySelectorAll('.edit-event-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const eventId = e.currentTarget.getAttribute('data-id');
      openEditModal(eventId);
    });
  });

  // Delete Event
  document.querySelectorAll('.delete-event-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const eventId = e.currentTarget.getAttribute('data-id');
      if (!confirm('Are you sure you want to remove this event from the campus ledger? 🌸')) return;

      const res = await api.events.delete(eventId);
      if (res.success) {
        showToast(res.message || 'Event removed successfully 🌸', 'info');
        loadOrganizerEvents();
      } else {
        showToast(res.message || 'Failed to remove event.', 'error');
      }
    });
  });
}

// --- Create Event Form Handler ---
function setupCreateEventForm() {
  const form = document.getElementById('create-event-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;

    const eventData = {
      title: document.getElementById('event-title').value.trim(),
      category: document.getElementById('event-category').value,
      capacity: parseInt(document.getElementById('event-capacity').value, 10),
      date: document.getElementById('event-date').value,
      time: document.getElementById('event-time').value.trim(),
      location: document.getElementById('event-location').value.trim(),
      description: document.getElementById('event-desc').value.trim()
    };

    submitBtn.disabled = true;
    submitBtn.innerHTML = 'Publishing event... 🌸';

    const res = await api.events.create(eventData);

    submitBtn.disabled = false;
    submitBtn.innerHTML = originalText;

    if (res.success) {
      showToast(res.message || 'Campus event published successfully! 🌸', 'success');
      form.reset();
      loadOrganizerEvents();
    } else {
      showToast(res.message || 'Failed to schedule event.', 'error');
    }
  });
}

// --- Edit Event Form & Modal ---
function openEditModal(eventId) {
  const evt = organizerEvents.find(e => (e._id || e.id) === eventId);
  if (!evt) return;

  document.getElementById('edit-event-id').value = eventId;
  document.getElementById('edit-event-title').value = evt.title || '';
  document.getElementById('edit-event-category').value = evt.category || 'Tech';
  document.getElementById('edit-event-capacity').value = evt.capacity || 100;
  
  if (evt.date) {
    const d = new Date(evt.date);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    document.getElementById('edit-event-date').value = `${yyyy}-${mm}-${dd}`;
  } else {
    document.getElementById('edit-event-date').value = '';
  }

  document.getElementById('edit-event-time').value = evt.time || '';
  document.getElementById('edit-event-location').value = evt.location || '';
  document.getElementById('edit-event-desc').value = evt.description || '';

  document.getElementById('edit-event-modal').style.display = 'flex';
}

function setupEditEventForm() {
  const form = document.getElementById('edit-event-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const eventId = document.getElementById('edit-event-id').value;
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;

    const updatedData = {
      title: document.getElementById('edit-event-title').value.trim(),
      category: document.getElementById('edit-event-category').value,
      capacity: parseInt(document.getElementById('edit-event-capacity').value, 10),
      date: document.getElementById('edit-event-date').value,
      time: document.getElementById('edit-event-time').value.trim(),
      location: document.getElementById('edit-event-location').value.trim(),
      description: document.getElementById('edit-event-desc').value.trim()
    };

    submitBtn.disabled = true;
    submitBtn.innerHTML = 'Saving changes... 🌸';

    const res = await api.events.update(eventId, updatedData);

    submitBtn.disabled = false;
    submitBtn.innerHTML = originalText;

    if (res.success) {
      showToast(res.message || 'Event modifications saved! 🌸', 'success');
      document.getElementById('edit-event-modal').style.display = 'none';
      loadOrganizerEvents();
    } else {
      showToast(res.message || 'Failed to update event.', 'error');
    }
  });
}

// --- Participants Modal ---
async function openParticipantsModal(eventId, title) {
  const modal = document.getElementById('participants-modal');
  const titleEl = document.getElementById('participants-modal-title');
  const contentEl = document.getElementById('participants-list-content');

  titleEl.textContent = `Attendees: ${title} 🌸`;
  contentEl.innerHTML = `
    <div class="empty-state">
      <div class="kaomoji-icon">( ˶•ᴗ•˶ )</div>
      <h3>Loading participant roster...</h3>
    </div>
  `;
  modal.style.display = 'flex';

  const res = await api.events.getParticipants(eventId);

  if (res.success && Array.isArray(res.data) && res.data.length > 0) {
    const rows = res.data.map((p, idx) => {
      const studentName = p.name || p.userId?.name || `Student #${idx + 1}`;
      const studentEmail = p.email || p.userId?.email || 'N/A';
      const regDate = p.date || p.registrationDate 
        ? new Date(p.date || p.registrationDate).toLocaleDateString()
        : 'Registered';

      return `
        <tr>
          <td><span class="badge badge-sakura">🌸</span></td>
          <td style="font-weight: 700; color: var(--sumi-slate);">${escapeHTML(studentName)}</td>
          <td>${escapeHTML(studentEmail)}</td>
          <td>${regDate}</td>
          <td><span class="badge badge-green">Confirmed</span></td>
        </tr>
      `;
    }).join('');

    contentEl.innerHTML = `
      <div class="data-table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th style="width: 40px;"></th>
              <th>Student Name</th>
              <th>Email</th>
              <th>Registration Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
      </div>
      <div style="margin-top: 14px; text-align: right; font-size: 0.85rem; color: var(--text-muted);">
        Total Confirmed Attendees: <strong>${res.data.length}</strong>
      </div>
    `;
  } else {
    contentEl.innerHTML = `
      <div class="empty-state">
        <div class="kaomoji-icon">(✿◠‿◠)</div>
        <h3>No Participants Registered Yet</h3>
        <p>This event currently has open spots. Student registrations will appear here in real-time.</p>
      </div>
    `;
  }
}

// --- Modal Handlers ---
function setupModalHandlers() {
  document.getElementById('close-edit-modal-btn')?.addEventListener('click', () => {
    document.getElementById('edit-event-modal').style.display = 'none';
  });

  document.getElementById('close-participants-modal-btn')?.addEventListener('click', () => {
    document.getElementById('participants-modal').style.display = 'none';
  });

  // Close when clicking modal backdrop
  window.addEventListener('click', (e) => {
    const editModal = document.getElementById('edit-event-modal');
    const partModal = document.getElementById('participants-modal');
    if (e.target === editModal) editModal.style.display = 'none';
    if (e.target === partModal) partModal.style.display = 'none';
  });
}
