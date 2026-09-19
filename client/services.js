/**
 * services.js
 * Dynamic CRUD (Create, Read, Update, Delete) for the "scheduled services"
 * table on the dashboard. State is persisted to localStorage so it survives
 * page reloads — this is the app's primary example of persistent client state.
 */

const STORAGE_KEY = 'rsrtc-services';

const DEFAULT_SERVICES = [
  { id: 1, route: 'Jaipur → Jodhpur', busNo: 'RJ14 PA 4021', departure: '08:30', status: 'ontime', statusLabel: 'On time' },
  { id: 2, route: 'Jaipur → Udaipur', busNo: 'RJ14 PA 3987', departure: '09:00', status: 'delayed', statusLabel: 'Delayed 20 min' },
  { id: 3, route: 'Jaipur → Kota', busNo: 'RJ14 PA 4102', departure: '09:15', status: 'ontime', statusLabel: 'On time' },
  { id: 4, route: 'Jaipur → Bikaner', busNo: 'RJ14 PA 3860', departure: '09:45', status: 'cancelled', statusLabel: 'Cancelled' },
  { id: 5, route: 'Jaipur → Ajmer', busNo: 'RJ14 PA 4188', departure: '10:00', status: 'ontime', statusLabel: 'On time' },
];

// ---- Persistence ----

function loadServices() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (err) {
    console.error('Could not read services from storage:', err);
  }
  saveServices(DEFAULT_SERVICES);
  return [...DEFAULT_SERVICES];
}

function saveServices(services) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(services));
  } catch (err) {
    console.error('Could not save services to storage:', err);
  }
}

let services = loadServices();

// ---- CRUD operations ----

function nextId() {
  return services.length ? Math.max(...services.map((s) => s.id)) + 1 : 1;
}

function createService({ route, busNo, departure, status = 'ontime', statusLabel = 'On time' }) {
  const service = { id: nextId(), route, busNo, departure, status, statusLabel };
  services.push(service);
  saveServices(services);
  return service;
}

function updateService(id, changes) {
  services = services.map((s) => (s.id === id ? { ...s, ...changes } : s));
  saveServices(services);
}

function deleteService(id) {
  services = services.filter((s) => s.id !== id);
  saveServices(services);
}

function getServices() {
  return services;
}

// ---- DOM wiring ----

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function renderTable() {
  const tbody = document.getElementById('services-tbody');
  if (!tbody) return;

  if (services.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="empty-state">No scheduled services yet. Add one below.</td></tr>';
    return;
  }

  tbody.innerHTML = services
    .map(
      (s) => `
    <tr data-service-id="${s.id}">
      <td>${escapeHtml(s.route)}</td>
      <td>${escapeHtml(s.busNo)}</td>
      <td>${escapeHtml(s.departure)}</td>
      <td><span class="status-pill status-${s.status}">${escapeHtml(s.statusLabel)}</span></td>
      <td class="row-actions">
        <button type="button" data-edit="${s.id}">Edit</button>
        <button type="button" data-delete="${s.id}">Delete</button>
      </td>
    </tr>`
    )
    .join('');
}

function fillFormForEdit(service) {
  document.getElementById('from-stop').value = service.route.split(' → ')[0] || '';
  document.getElementById('to-stop').value = service.route.split(' → ')[1] || '';
  document.getElementById('bus-number').value = service.busNo;
  document.getElementById('service-form').setAttribute('data-editing-id', String(service.id));
  document.getElementById('form-submit-btn').textContent = 'Update service';
  document.getElementById('new-route-heading').scrollIntoView({ behavior: 'smooth', block: 'center' });
  document.getElementById('from-stop').focus();
}

function resetFormMode(form) {
  form.removeAttribute('data-editing-id');
  document.getElementById('form-submit-btn').textContent = 'Save service';
}

export function initServiceCrud() {
  renderTable();

  const tbody = document.getElementById('services-tbody');
  const form = document.getElementById('service-form');

  tbody.addEventListener('click', (e) => {
    const editBtn = e.target.closest('[data-edit]');
    const deleteBtn = e.target.closest('[data-delete]');

    if (editBtn) {
      const id = Number(editBtn.getAttribute('data-edit'));
      const service = services.find((s) => s.id === id);
      if (service) fillFormForEdit(service);
    }

    if (deleteBtn) {
      const id = Number(deleteBtn.getAttribute('data-delete'));
      const confirmed = window.confirm('Remove this service from the schedule?');
      if (confirmed) {
        deleteService(id);
        renderTable();
      }
    }
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const fromStop = document.getElementById('from-stop').value.trim();
    const toStop = document.getElementById('to-stop').value.trim();
    const busNo = document.getElementById('bus-number').value.trim();
    const journeyDate = document.getElementById('journey-date').value;

    if (!fromStop || !toStop || !busNo) return;

    const editingId = form.getAttribute('data-editing-id');
    const departure = journeyDate
      ? new Date(journeyDate).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
      : '—';

    if (editingId) {
      updateService(Number(editingId), {
        route: `${fromStop} → ${toStop}`,
        busNo,
      });
      resetFormMode(form);
    } else {
      createService({
        route: `${fromStop} → ${toStop}`,
        busNo,
        departure: departure !== '—' ? departure : 'TBD',
      });
    }

    form.reset();
    renderTable();
  });

  form.addEventListener('reset', () => {
    resetFormMode(form);
  });
}

export { getServices };
