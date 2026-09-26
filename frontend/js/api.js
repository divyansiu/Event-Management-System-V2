/**
 * Campus Event Management System - API Client & Mock Engine
 * Role 4: Frontend & Integration
 * Contract Base URL: http://localhost:3000/api
 * Features: Automatic graceful fallback to kawaii Japanese Campus mock data when backend is offline
 */

const API_BASE_URL = "http://localhost:3000/api";

// --- Cute Toast Notification System 🌸 ---
function showToast(message, type = 'info') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  let icon = '🌸';
  if (type === 'success') icon = '✨';
  if (type === 'error') icon = '✕';
  if (type === 'warning') icon = '🍡';

  toast.innerHTML = `
    <span style="font-weight: 700; font-size: 1.25rem;">${icon}</span>
    <span style="flex: 1; font-weight: 500;">${escapeHTML(message)}</span>
  `;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

function escapeHTML(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// --- Session & Token Storage ---
const TokenStorage = {
  getToken() {
    return localStorage.getItem('token');
  },
  setToken(token) {
    localStorage.setItem('token', token);
  },
  getUser() {
    const raw = localStorage.getItem('user');
    try {
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  },
  setUser(user) {
    localStorage.setItem('user', JSON.stringify(user));
  },
  clear() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
  requireAuth(allowedRole = null) {
    const token = this.getToken();
    const user = this.getUser();

    if (!token || !user) {
      showToast('Please sign in to access this page 🌸', 'warning');
      setTimeout(() => {
        window.location.href = allowedRole === 'organizer' ? 'login.html?role=organizer' : 'login.html';
      }, 500);
      return false;
    }

    if (allowedRole && user.role !== allowedRole) {
      showToast(`Access restricted. Requires ${allowedRole} privileges 🌸`, 'error');
      setTimeout(() => {
        window.location.href = user.role === 'organizer' ? 'organizer.html' : 'student.html';
      }, 800);
      return false;
    }

    return true;
  }
};

// --- Initial Kawaii Japanese Campus Mock Events Seed ---
const DEFAULT_MOCK_EVENTS = [
  {
    _id: "evt-sakura-01",
    title: "🌸 Sakura Spring Matsuri & Cultural Fair",
    description: "Welcome spring with campus taiko drum performances, traditional kimono showcase, artisan stalls, and delicious street food under the cherry blossoms.",
    category: "Cultural",
    date: "2026-04-12",
    time: "10:00 AM - 5:00 PM",
    location: "Sakura Courtyard & Main Quad",
    capacity: 250,
    registeredCount: 142
  },
  {
    _id: "evt-tech-02",
    title: "🤖 Neo-Tokyo AI & Robotics Hackathon 2026",
    description: "Build cutting-edge autonomous agents, computer vision pipelines, and intelligent IoT robotics over 24 hours. Mentorship from leading tech innovators.",
    category: "Tech",
    date: "2026-04-18",
    time: "9:00 AM - Next Day 12:00 PM",
    location: "Komorebi Tech Hub & Lab 4",
    capacity: 120,
    registeredCount: 88
  },
  {
    _id: "evt-tea-03",
    title: "🍵 Traditional Matcha Ceremony & Wagashi Workshop",
    description: "Learn the serene art of Japanese chado (Way of Tea) alongside master confectioners crafting handcrafted seasonal nerikiri wagashi sweets.",
    category: "Workshops",
    date: "2026-04-22",
    time: "2:00 PM - 4:30 PM",
    location: "Zen Pavilion, Student Center 2F",
    capacity: 45,
    registeredCount: 39
  },
  {
    _id: "evt-game-04",
    title: "🎮 Akihabara Esports & Indie Game Jam",
    description: "Competitive fighting game tournaments, rhythm games showcase, and a 48-hour cozy game creation showcase with student game designers.",
    category: "Gaming",
    date: "2026-05-02",
    time: "11:00 AM - 8:00 PM",
    location: "Digital Media Arts Arena",
    capacity: 180,
    registeredCount: 110
  },
  {
    _id: "evt-art-05",
    title: "🎨 Manga Illustration & Digital Anime Studio",
    description: "Hands-on drawing masterclass exploring character design, visual storytelling, digital ink techniques, and portfolio reviews with guest animators.",
    category: "Cultural",
    date: "2026-05-08",
    time: "1:00 PM - 4:00 PM",
    location: "Fine Arts Studio B",
    capacity: 60,
    registeredCount: 48
  },
  {
    _id: "evt-sport-06",
    title: "🥋 Martial Arts & Kendo Exhibition Tournament",
    description: "Annual university martial arts showcase featuring Kendo, Judo, and Aikido demonstrations, technique clinics, and friendly inter-club bouts.",
    category: "Sports",
    date: "2026-05-15",
    time: "3:00 PM - 6:30 PM",
    location: "Campus Central Gymnasium",
    capacity: 150,
    registeredCount: 75
  }
];

// --- Mock Engine for Seamless Offline / Demo Operation ---
const MockEngine = {
  getEvents() {
    const raw = localStorage.getItem('mock_events');
    if (!raw) {
      localStorage.setItem('mock_events', JSON.stringify(DEFAULT_MOCK_EVENTS));
      return DEFAULT_MOCK_EVENTS;
    }
    try {
      return JSON.parse(raw);
    } catch (e) {
      return DEFAULT_MOCK_EVENTS;
    }
  },
  setEvents(events) {
    localStorage.setItem('mock_events', JSON.stringify(events));
  },
  getRegistrations() {
    const raw = localStorage.getItem('mock_registrations');
    return raw ? JSON.parse(raw) : [];
  },
  setRegistrations(regs) {
    localStorage.setItem('mock_registrations', JSON.stringify(regs));
  },
  getParticipants() {
    const raw = localStorage.getItem('mock_participants');
    return raw ? JSON.parse(raw) : {};
  },
  setParticipants(map) {
    localStorage.setItem('mock_participants', JSON.stringify(map));
  }
};

// --- Universal API Client with Automatic Fallback ---
let isDemoMode = false;

async function fetchAPI(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  const token = TokenStorage.getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers
  };

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000); // 2s timeout before fallback

    const response = await fetch(url, { ...config, signal: controller.signal });
    clearTimeout(timeoutId);

    let data;
    try {
      data = await response.json();
    } catch (parseErr) {
      data = {
        success: false,
        message: `HTTP ${response.status}: Failed to parse server response`
      };
    }

    data.statusCode = response.status;
    if (!response.ok && data.success === undefined) {
      data.success = false;
    }

    // Handle token expiry / 401
    if (response.status === 401 && !endpoint.includes('/auth/login')) {
      showToast('Session expired. Please log in again 🌸', 'warning');
      TokenStorage.clear();
      setTimeout(() => {
        window.location.href = 'login.html';
      }, 1000);
    }

    isDemoMode = false;
    updateIntegrationIndicator(true);
    return data;
  } catch (networkError) {
    // If backend is not available, execute gracefully in Mock Mode
    isDemoMode = true;
    updateIntegrationIndicator(false);
    return handleMockRequest(endpoint, options);
  }
}

function updateIntegrationIndicator(isBackendLive) {
  let indicator = document.getElementById('api-integration-badge');
  if (!indicator) {
    const navContent = document.querySelector('.navbar .nav-content');
    if (navContent) {
      indicator = document.createElement('span');
      indicator.id = 'api-integration-badge';
      indicator.style.fontSize = '0.74rem';
      indicator.style.fontWeight = '600';
      indicator.style.padding = '3px 8px';
      indicator.style.borderRadius = '9999px';
      indicator.style.marginLeft = '8px';
      indicator.style.cursor = 'default';
      navContent.querySelector('.brand-logo')?.appendChild(indicator);
    }
  }

  if (indicator) {
    if (isBackendLive) {
      indicator.className = 'badge badge-green';
      indicator.textContent = 'API Live 🌸';
      indicator.title = 'Connected to http://localhost:3000/api';
    } else {
      indicator.className = 'badge badge-sakura';
      indicator.textContent = 'Demo Mode 🌸';
      indicator.title = 'Running in frontend interactive demo mode';
    }
  }
}

// --- Mock Request Handler (Role 4 Fallback) ---
function handleMockRequest(endpoint, options) {
  const method = (options.method || 'GET').toUpperCase();
  const events = MockEngine.getEvents();
  const user = TokenStorage.getUser() || { _id: "usr-demo", name: "Demo Scholar", email: "student@university.edu", role: "student" };

  // 1. Auth: POST /auth/login
  if (endpoint === '/auth/login' && method === 'POST') {
    const body = JSON.parse(options.body || '{}');
    const isOrg = body.email && body.email.includes('coordinator') || body.email?.includes('admin');
    const role = isOrg ? 'organizer' : 'student';
    const fakeUser = {
      _id: `usr-${Date.now()}`,
      name: isOrg ? 'Sakura Event Manager' : 'Aoi Tanaka',
      email: body.email || 'student@university.edu',
      role: role
    };
    return {
      success: true,
      token: `demo-jwt-token-${Date.now()}`,
      user: fakeUser,
      message: `Welcome back, ${fakeUser.name}! 🌸`
    };
  }

  // 2. Auth: POST /auth/register
  if (endpoint === '/auth/register' && method === 'POST') {
    const body = JSON.parse(options.body || '{}');
    return {
      success: true,
      message: `Account created successfully for ${body.name}! You may now sign in 🌸`
    };
  }

  // 3. Events: GET /events
  if (endpoint === '/events' && method === 'GET') {
    return {
      success: true,
      data: events
    };
  }

  // 4. Events: GET /events/:id
  const eventIdMatch = endpoint.match(/^\/events\/([a-zA-Z0-9_-]+)$/);
  if (eventIdMatch && method === 'GET') {
    const id = eventIdMatch[1];
    const found = events.find(e => (e._id || e.id) === id);
    if (found) {
      return { success: true, data: found };
    }
    return { success: false, message: 'Event not found 🌸' };
  }

  // 5. Events: POST /events (Create)
  if (endpoint === '/events' && method === 'POST') {
    const body = JSON.parse(options.body || '{}');
    const newEvent = {
      _id: `evt-${Date.now()}`,
      title: body.title,
      description: body.description,
      category: body.category || 'General',
      date: body.date,
      time: body.time,
      location: body.location,
      capacity: Number(body.capacity) || 100,
      registeredCount: 0
    };
    events.unshift(newEvent);
    MockEngine.setEvents(events);
    return {
      success: true,
      data: newEvent,
      message: 'Campus event published successfully! 🌸'
    };
  }

  // 6. Events: PUT /events/:id (Update)
  if (eventIdMatch && method === 'PUT') {
    const id = eventIdMatch[1];
    const body = JSON.parse(options.body || '{}');
    const index = events.findIndex(e => (e._id || e.id) === id);
    if (index !== -1) {
      events[index] = { ...events[index], ...body };
      MockEngine.setEvents(events);
      return { success: true, data: events[index], message: 'Event updated successfully! 🌸' };
    }
    return { success: false, message: 'Event not found' };
  }

  // 7. Events: DELETE /events/:id
  if (eventIdMatch && method === 'DELETE') {
    const id = eventIdMatch[1];
    const filtered = events.filter(e => (e._id || e.id) !== id);
    MockEngine.setEvents(filtered);
    return { success: true, message: 'Event removed from ledger 🌸' };
  }

  // 8. Events: GET /events/:id/participants
  const participantsMatch = endpoint.match(/^\/events\/([a-zA-Z0-9_-]+)\/participants$/);
  if (participantsMatch && method === 'GET') {
    const id = participantsMatch[1];
    const partMap = MockEngine.getParticipants();
    const list = partMap[id] || [
      { name: "Haruto Sato", email: "h.sato@university.edu", date: "2026-04-01" },
      { name: "Yui Takahashi", email: "yui.t@university.edu", date: "2026-04-02" },
      { name: "Ren Suzuki", email: "ren.s@university.edu", date: "2026-04-03" }
    ];
    return {
      success: true,
      data: list
    };
  }

  // 9. Registrations: POST /events/:id/register
  const registerMatch = endpoint.match(/^\/events\/([a-zA-Z0-9_-]+)\/register$/);
  if (registerMatch && method === 'POST') {
    const id = registerMatch[1];
    let regs = MockEngine.getRegistrations();
    const already = regs.some(r => (r.eventId?._id || r.eventId || r.id) === id && r.status !== 'CANCELLED');

    if (already) {
      return { success: false, statusCode: 409, message: 'You are already registered for this event! 🌸' };
    }

    const targetEvt = events.find(e => (e._id || e.id) === id);
    if (targetEvt) {
      targetEvt.registeredCount = (targetEvt.registeredCount || 0) + 1;
      MockEngine.setEvents(events);
    }

    const newReg = {
      _id: `reg-${Date.now()}`,
      eventId: targetEvt || { _id: id, title: "Registered Event" },
      userId: user._id || user.id,
      studentId: user._id || user.id,
      status: 'REGISTERED',
      registeredAt: new Date().toISOString()
    };
    regs.unshift(newReg);
    MockEngine.setRegistrations(regs);

    return { success: true, message: 'Spot reserved successfully! See you there 🌸' };
  }

  // 10. Registrations: DELETE /events/:id/register (Cancel)
  if (registerMatch && method === 'DELETE') {
    const id = registerMatch[1];
    let regs = MockEngine.getRegistrations();
    const reg = regs.find(r => (r.eventId?._id || r.eventId || r.id) === id);
    if (reg) {
      reg.status = 'CANCELLED';
      MockEngine.setRegistrations(regs);

      const targetEvt = events.find(e => (e._id || e.id) === id);
      if (targetEvt && targetEvt.registeredCount > 0) {
        targetEvt.registeredCount -= 1;
        MockEngine.setEvents(events);
      }

      return { success: true, message: 'Registration cancelled 🌸' };
    }
    return { success: false, message: 'Registration not found' };
  }

  // 11. Registrations: GET /registrations/me
  if (endpoint === '/registrations/me' && method === 'GET') {
    let regs = MockEngine.getRegistrations();
    if (regs.length === 0) {
      // Provide default registered item for smooth demo
      regs = [
        {
          _id: "reg-demo-01",
          eventId: events[0],
          studentId: user._id || user.id,
          status: "REGISTERED",
          registeredAt: "2026-04-01"
        }
      ];
      MockEngine.setRegistrations(regs);
    }
    return {
      success: true,
      data: regs
    };
  }

  return { success: false, message: `Mock route not found: ${method} ${endpoint}` };
}

// --- Contract API Object (Matches Member 1, 2, 3 specs) ---
const api = {
  auth: {
    register: (userData) => fetchAPI('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    }),
    login: (credentials) => fetchAPI('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    })
  },
  events: {
    getAll: () => fetchAPI('/events', { method: 'GET' }),
    getById: (id) => fetchAPI(`/events/${id}`, { method: 'GET' }),
    create: (eventData) => fetchAPI('/events', {
      method: 'POST',
      body: JSON.stringify(eventData)
    }),
    update: (id, eventData) => fetchAPI(`/events/${id}`, {
      method: 'PUT',
      body: JSON.stringify(eventData)
    }),
    delete: (id) => fetchAPI(`/events/${id}`, { method: 'DELETE' }),
    getParticipants: (id) => fetchAPI(`/events/${id}/participants`, { method: 'GET' })
  },
  registrations: {
    register: (eventId) => fetchAPI(`/events/${eventId}/register`, { method: 'POST' }),
    cancel: (eventId) => fetchAPI(`/events/${eventId}/register`, { method: 'DELETE' }),
    getMyRegistrations: () => fetchAPI('/registrations/me', { method: 'GET' })
  }
};
