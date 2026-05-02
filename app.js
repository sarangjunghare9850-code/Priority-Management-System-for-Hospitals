(function() {
  // Configuration
  const STORAGE_KEY = 'triage.patients.v1';
  const ROOMS_KEY = 'triage.rooms.v1';
  const THEME_KEY = 'triage.theme.v1';

  const severityOrder = ['critical', 'high', 'medium', 'low'];
  const defaultRooms = [
    { id: 'room-1', name: 'Room 1', assignedPatientId: null },
    { id: 'room-2', name: 'Room 2', assignedPatientId: null },
    { id: 'room-3', name: 'Room 3', assignedPatientId: null }
  ];

  // Global state
  let socket = null;
  let patients = [];
  let rooms = [];

  // DOM helpers
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => Array.from(document.querySelectorAll(sel));

  // Load state from localStorage
  function loadState() {
    try {
      const savedPatients = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      const savedRooms = JSON.parse(localStorage.getItem(ROOMS_KEY) || 'null') || defaultRooms;
      return { patients: savedPatients, rooms: savedRooms };
    } catch (e) {
      return { patients: [], rooms: defaultRooms };
    }
  }

  // Save state to localStorage
  function saveState(state) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.patients));
    localStorage.setItem(ROOMS_KEY, JSON.stringify(state.rooms));
  }

  // Generate unique ID
  function uid() {
    return 'p_' + Math.random().toString(36).slice(2, 9) + Date.now().toString(36);
  }

  // Socket.IO setup for real-time features
  function setupSocket() {
    if (typeof window.io !== 'function') {
      socket = null;
      updateRealtimeIndicator(false);
      return;
    }

    socket = window.io();
    
    socket.on('connect', () => {
      console.log('✅ Connected to real-time server');
      updateRealtimeIndicator(true);
    });

    socket.on('disconnect', () => {
      console.log('❌ Disconnected from real-time server');
      updateRealtimeIndicator(false);
    });

    // Listen for real-time updates from other users
    socket.on('patient-added', (patient) => {
      if (!patients.find(p => p.id === patient.id)) {
        patients.push(patient);
        saveState({ patients, rooms });
        render();
      }
    });

    socket.on('patient-updated', (patient) => {
      const index = patients.findIndex(p => p.id === patient.id);
      if (index !== -1) {
        patients[index] = patient;
        saveState({ patients, rooms });
        render();
      }
    });

    socket.on('patient-removed', (patientId) => {
      patients = patients.filter(p => p.id !== patientId);
      saveState({ patients, rooms });
      render();
    });

    socket.on('room-updated', (room) => {
      const index = rooms.findIndex(r => r.id === room.id);
      if (index !== -1) {
        rooms[index] = room;
        saveState({ patients, rooms });
        render();
      }
    });
  }

  // Update real-time connection indicator
  function updateRealtimeIndicator(online) {
    let indicator = $('.realtime-indicator');
    if (!indicator) {
      indicator = document.createElement('div');
      indicator.className = 'realtime-indicator';
      document.body.appendChild(indicator);
    }
    
    indicator.classList.toggle('offline', !online);
    indicator.textContent = online ? 'Live' : 'Offline';
  }

  // Compute automatic severity based on vitals
  function computeAutoSeverity(vitals) {
    const { heartRate, systolic, oxygen } = vitals;
    let score = 0;
    if (oxygen !== null && oxygen <= 90) score += 3;
    if (systolic !== null && systolic < 90) score += 3;
    if (heartRate !== null && (heartRate > 130 || heartRate < 40)) score += 2;
    if (oxygen !== null && oxygen <= 85) score += 1;

    if (score >= 5) return 'critical';
    if (score >= 3) return 'high';
    if (score >= 2) return 'medium';
    return null;
  }

  // Format time display
  function formatTime(ts) {
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  // Main render function
  function render() {
    // Clear queues
    severityOrder.forEach(level => {
      const ul = $('#queue-' + level);
      if (ul) ul.innerHTML = '';
    });

    // Filter and sort patients
    const query = $('#searchBox').value.trim().toLowerCase();
    const sorted = [...patients]
      .filter(p => !p.consultingRoomId)
      .sort((a, b) => {
        const sdiff = severityOrder.indexOf(a.severity) - severityOrder.indexOf(b.severity);
        if (sdiff !== 0) return sdiff;
        return a.arrivedAt - b.arrivedAt;
      });

    // Render patient cards
    for (const p of sorted) {
      if (query && !(`${p.name} ${p.symptoms}`.toLowerCase().includes(query))) continue;
      
      const li = document.createElement('li');
      li.className = 'patient-card';
      li.dataset.id = p.id;
      li.innerHTML = `
        <div class="patient-main">
          <div class="patient-name">${p.name} <span class="chip ${p.severity}">${p.severity}</span></div>
          <div class="patient-meta">Age ${p.age} • ${p.symptoms} • Arrived ${formatTime(p.arrivedAt)}</div>
        </div>
        <div class="patient-actions">
          <button class="btn ghost" data-action="promote">Promote</button>
          <button class="btn ghost" data-action="demote">Demote</button>
          <button class="btn danger" data-action="remove">Remove</button>
        </div>`;
      
      const ul = $('#queue-' + p.severity);
      ul && ul.appendChild(li);
    }

    // Update stats
    $('#stat-total').textContent = patients.filter(p => !p.consultingRoomId).length;
    severityOrder.forEach(level => {
      $('#stat-' + level).textContent = patients.filter(p => !p.consultingRoomId && p.severity === level).length;
    });

    // Render rooms
    const roomsList = $('#roomsList');
    roomsList.innerHTML = '';
    for (const room of rooms) {
      const patient = patients.find(p => p.id === room.assignedPatientId) || null;
      const div = document.createElement('div');
      div.className = 'room';
      div.dataset.id = room.id;
      div.innerHTML = `
        <div>
          <div class="room-name">${room.name}</div>
          <div class="room-meta">${patient ? `${patient.name} • ${patient.severity} • since ${formatTime(patient.assignedAt)}` : 'Idle'}</div>
        </div>
        <div>
          <button class="btn ghost" data-action="rename">Rename</button>
          ${patient ? '<button class="btn primary" data-action="complete">Complete</button>' : ''}
        </div>`;
      roomsList.appendChild(div);
    }
  }

  // Assign next patient to room
  function assignNext(state) {
    const idleRoom = state.rooms.find(r => !r.assignedPatientId);
    if (!idleRoom) return false;

    let candidate = null;
    for (const level of severityOrder) {
      const inLevel = state.patients
        .filter(p => !p.consultingRoomId && p.severity === level)
        .sort((a, b) => a.arrivedAt - b.arrivedAt);
      if (inLevel.length) {
        candidate = inLevel[0];
        break;
      }
    }

    if (!candidate) return false;

    candidate.consultingRoomId = idleRoom.id;
    candidate.assignedAt = Date.now();
    idleRoom.assignedPatientId = candidate.id;

    // Emit real-time update
    if (socket) {
      socket.emit('patient-updated', candidate);
      socket.emit('room-updated', idleRoom);
    }

    return true;
  }

  // Export CSV
  function exportCsv(state) {
    const rows = [['ID','Name','Age','Severity','Symptoms','ArrivedAt','AssignedRoom','AssignedAt']];
    for (const p of state.patients) {
      rows.push([
        p.id,
        p.name,
        String(p.age),
        p.severity,
        p.symptoms,
        new Date(p.arrivedAt).toISOString(),
        p.consultingRoomId || '',
        p.assignedAt ? new Date(p.assignedAt).toISOString() : ''
      ]);
    }
    const csv = rows
      .map((r) =>
        r
          .map((v) => '"' + String(v).replace(/"/g, '""') + '"')
          .join(',')
      )
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'patients.csv';
    a.rel = 'noopener';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  // Theme functions
  function initTheme() {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === 'light') document.body.classList.add('theme-light');
  }

  function toggleTheme() {
    document.body.classList.toggle('theme-light');
    localStorage.setItem(THEME_KEY, document.body.classList.contains('theme-light') ? 'light' : 'dark');
  }

  // Event handlers
  function handleIntakeSubmit(e) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    const name = formData.get('name').trim();
    const age = parseInt(formData.get('age'), 10);
    const severity = formData.get('severity');
    const symptoms = formData.get('symptoms').trim();
    const heartRate = formData.get('heartRate') ? parseInt(formData.get('heartRate'), 10) : null;
    const systolic = formData.get('systolic') ? parseInt(formData.get('systolic'), 10) : null;
    const oxygen = formData.get('oxygen') ? parseInt(formData.get('oxygen'), 10) : null;
    const notes = formData.get('notes').trim();

    if (!name || Number.isNaN(age) || !severity || !symptoms) return;

    const auto = computeAutoSeverity({ heartRate, systolic, oxygen });
    const finalSeverity = auto || severity;

    const patient = {
      id: uid(),
      name,
      age,
      severity: finalSeverity,
      symptoms,
      notes,
      vitals: { heartRate, systolic, oxygen },
      arrivedAt: Date.now(),
      consultingRoomId: null,
      assignedAt: null
    };

    patients.push(patient);
    saveState({ patients, rooms });
    render();

    // Emit real-time update
    if (socket) {
      socket.emit('patient-added', patient);
    }

    form.reset();
  }

  function handleQueueAction(e) {
    const btn = e.target.closest('button');
    if (!btn) return;
    
    const action = btn.dataset.action;
    const card = btn.closest('.patient-card');
    const id = card?.dataset.id;
    if (!id) return;
    
    const idx = patients.findIndex(p => p.id === id);
    if (idx === -1) return;
    
    const p = patients[idx];
    
    if (action === 'remove') {
      patients.splice(idx, 1);
    } else if (action === 'promote') {
      const i = severityOrder.indexOf(p.severity);
      if (i > 0) p.severity = severityOrder[i - 1];
    } else if (action === 'demote') {
      const i = severityOrder.indexOf(p.severity);
      if (i < severityOrder.length - 1) p.severity = severityOrder[i + 1];
    }

    saveState({ patients, rooms });
    render();

    // Emit real-time update
    if (socket && action !== 'remove') {
      socket.emit('patient-updated', p);
    } else if (socket && action === 'remove') {
      socket.emit('patient-removed', id);
    }
  }

  function handleRoomAction(e) {
    const btn = e.target.closest('button');
    if (!btn) return;
    
    const action = btn.dataset.action;
    const roomEl = btn.closest('.room');
    const roomId = roomEl?.dataset.id;
    const room = rooms.find(r => r.id === roomId);
    if (!room) return;

    if (action === 'rename') {
      const name = prompt('Room name', room.name);
      if (name && name.trim()) {
        room.name = name.trim();
        saveState({ patients, rooms });
        render();

        // Emit real-time update
        if (socket) {
          socket.emit('room-updated', room);
        }
      }
    } else if (action === 'complete') {
      const p = patients.find(p => p.id === room.assignedPatientId);
      if (p) {
        patients = patients.filter(x => x.id !== p.id);
      }
      room.assignedPatientId = null;
      
      saveState({ patients, rooms });
      render();

      // Emit real-time updates
      if (socket) {
        if (p) socket.emit('patient-removed', p.id);
        socket.emit('room-updated', room);
      }
    }
  }

  function handleAssignNext() {
    const state = { patients, rooms };
    const assigned = assignNext(state);
    
    if (assigned) {
      saveState(state);
      render();
    } else {
      alert('No idle room or no waiting patients.');
    }
  }

  function handleClearAll() {
    if (!confirm('Clear all patients and rooms?')) return;
    
    patients = [];
    rooms = defaultRooms.map(r => ({...r}));
    
    saveState({ patients, rooms });
    render();

    // Emit real-time updates
    if (socket) {
      patients.forEach(p => socket.emit('patient-removed', p.id));
      rooms.forEach(r => socket.emit('room-updated', r));
    }
  }

  // Initialize application
  function main() {
    initTheme();
    
    // Load initial state
    const state = loadState();
    patients = state.patients;
    rooms = state.rooms;

    // Ensure at least three rooms
    if (!rooms || rooms.length === 0) rooms = defaultRooms;

    render();

    // Setup real-time connection
    setupSocket();

    // Event listeners
    $('#toggleThemeBtn').addEventListener('click', toggleTheme);
    $('#intakeForm').addEventListener('submit', handleIntakeSubmit);
    $('#searchBox').addEventListener('input', render);
    $('#exportCsvBtn').addEventListener('click', () => exportCsv({ patients, rooms }));
    $('#clearAllBtn').addEventListener('click', handleClearAll);
    $('#assignNextBtn').addEventListener('click', handleAssignNext);
    $('.queues').addEventListener('click', handleQueueAction);
    $('#roomsList').addEventListener('click', handleRoomAction);
  }

  // Start the application
  window.addEventListener('DOMContentLoaded', main);
})();