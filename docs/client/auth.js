/**
 * auth.js
 * Simulated client-side authentication for the RSRTC Staff Portal capstone.
 *
 * This is a DEMO auth layer only — it does not contact a real server and
 * must never be used as a real security boundary. It exists to demonstrate
 * an authenticated-app flow (login, session persistence, guarded pages,
 * sign-out) using localStorage as the "session store".
 */

const SESSION_KEY = 'rsrtc-session';

/** Returns the current session object, or null if signed out. */
export function getSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/** Persists a session after a successful (simulated) sign-in. */
function setSession(staffId) {
  const session = {
    staffId,
    signedInAt: new Date().toISOString(),
  };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
}

/** Clears the session (sign-out). */
export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

/**
 * Call at the top of any protected page. Redirects to login.html
 * if no session exists.
 */
export function requireAuth() {
  if (!getSession()) {
    window.location.href = 'login.html';
  }
}

/** Wires up the sign-out button, if present on the page. */
export function wireSignOut(buttonEl) {
  if (!buttonEl) return;
  buttonEl.addEventListener('click', () => {
    clearSession();
    window.location.href = 'login.html';
  });
}

// ---- Login form wiring (only runs on login.html) ----
const form = document.getElementById('login-form');
if (form) {
  // If already signed in, skip the login screen entirely.
  if (getSession()) {
    window.location.href = 'index.html';
  }

  const errorBanner = document.getElementById('login-error');
  const errorMessage = document.getElementById('login-error-message');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const staffId = document.getElementById('staff-id').value.trim();
    const password = document.getElementById('staff-password').value;

    // Simulated validation only — never a real auth check.
    if (staffId.length === 0 || password.length < 4) {
      errorMessage.textContent = 'Enter a Staff ID and a password of at least 4 characters.';
      errorBanner.classList.add('is-visible');
      return;
    }

    errorBanner.classList.remove('is-visible');
    setSession(staffId);
    window.location.href = 'index.html';
  });
}
