/**
 * Campus Event Management System - Authentication & Session Handler
 * Role 4: Frontend & Integration
 * Sakura & Kawaii Edition 🌸
 */

document.addEventListener('DOMContentLoaded', () => {
  setupNavbarAuth();
  setupRegisterForm();
});

// --- Dynamic Navbar State ---
function setupNavbarAuth() {
  const navContainer = document.getElementById('nav-auth-container');
  if (!navContainer) return;

  const user = TokenStorage.getUser();
  const token = TokenStorage.getToken();

  if (token && user) {
    const isOrganizer = user.role === 'organizer';
    const dashboardLink = isOrganizer ? 'organizer.html' : 'student.html';
    const roleBadge = isOrganizer 
      ? '<span class="badge badge-purple">👑 Organizer</span>' 
      : '<span class="badge badge-sakura">🌸 Student</span>';

    navContainer.innerHTML = `
      <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
        ${roleBadge}
        <span style="font-weight: 700; font-size: 0.88rem; color: var(--sumi-slate);">
          ${escapeHTML(user.name)}
        </span>
        <a href="${dashboardLink}" class="btn btn-primary" style="padding: 7px 14px; font-size: 0.85rem;">
          Dashboard
        </a>
        <button id="logout-btn" class="btn btn-outline" style="padding: 7px 14px; font-size: 0.85rem;">
          Sign Out
        </button>
      </div>
    `;

    document.getElementById('logout-btn')?.addEventListener('click', handleLogout);
  } else {
    navContainer.innerHTML = `
      <a href="login.html?role=student" class="btn btn-outline" style="padding: 7px 14px; font-size: 0.85rem;">
        🎓 Student Login
      </a>
      <a href="login.html?role=organizer" class="btn btn-admin" style="padding: 7px 14px; font-size: 0.85rem;">
        👑 Manager Portal
      </a>
      <a href="register.html" class="btn btn-primary" style="padding: 7px 14px; font-size: 0.85rem;">
        🌸 Register
      </a>
    `;
  }
}

// --- Logout Handler ---
function handleLogout() {
  TokenStorage.clear();
  showToast('Signed out successfully! See you soon 🌸', 'info');
  setTimeout(() => {
    window.location.href = 'index.html';
  }, 600);
}

// --- Registration Form Handler ---
function setupRegisterForm() {
  const registerForm = document.getElementById('register-form');
  if (!registerForm) return;

  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = registerForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;

    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const roleSelect = document.getElementById('role');
    const role = roleSelect ? roleSelect.value : 'student';

    if (!name || !email || !password) {
      showToast('Please fill in all required fields 🌸', 'warning');
      return;
    }

    if (password.length < 6) {
      showToast('Password must be at least 6 characters 🌸', 'warning');
      return;
    }

    submitBtn.disabled = true;
    submitBtn.innerHTML = 'Creating account... 🌸';

    const res = await api.auth.register({ name, email, password, role });

    submitBtn.disabled = false;
    submitBtn.innerHTML = originalText;

    if (res.success) {
      showToast(res.message || 'Registration successful! Welcome to the campus network 🌸', 'success');
      setTimeout(() => {
        window.location.href = role === 'organizer' ? 'login.html?role=organizer' : 'login.html?role=student';
      }, 1000);
    } else {
      showToast(res.message || 'Registration failed. Please check your credentials.', 'error');
    }
  });
}
