const getWsUrl = () => {
  if (import.meta.env.VITE_SOCKET_URL) return import.meta.env.VITE_SOCKET_URL;
  if (typeof window !== 'undefined' && window.location?.hostname) {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${protocol}//${window.location.hostname}:8000/ws`;
  }
  return 'ws://localhost:8000/ws';
};

const WS_URL = getWsUrl();

let socket = null;
const eventListeners = {};

export const connectSocket = () => {
  if (socket && socket.readyState === WebSocket.OPEN) return socket;

  const wsUrl = WS_URL.startsWith('ws') ? WS_URL : WS_URL.replace(/^http/, 'ws');
  socket = new WebSocket(wsUrl);

  socket.onopen = () => {
    console.log('WebSocket connected');
  };

  socket.onclose = () => {
    console.log('WebSocket disconnected');
  };

  socket.onerror = (error) => {
    console.error('WebSocket error:', error);
  };

  socket.onmessage = (event) => {
    try {
      const payload = JSON.parse(event.data);
      const eventType = payload.event;

      if (eventListeners[eventType]) {
        eventListeners[eventType].forEach(callback => callback(payload));
      }
    } catch (err) {
      console.error('Failed to parse WebSocket message:', err);
    }
  };

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.close();
    socket = null;
  }
};

export const getSocket = () => {
  return socket || connectSocket();
};

const addListener = (eventType, callback) => {
  getSocket();
  if (!eventListeners[eventType]) {
    eventListeners[eventType] = [];
  }
  eventListeners[eventType].push(callback);
};

const removeListener = (eventType, callback) => {
  if (eventListeners[eventType]) {
    eventListeners[eventType] = eventListeners[eventType].filter(cb => cb !== callback);
  }
};

export const onNewPatient = (callback) => {
  addListener('NEW_PATIENT', callback);
};

export const onPatientTriaged = (callback) => {
  addListener('PATIENT_TRIAGED', callback);
};

export const onQueueUpdate = (callback) => {
  addListener('QUEUE_STATS', callback);
};

export const onPatientCalled = (callback) => {
  addListener('PATIENT_CALLED', callback);
};

export const onPatientCompleted = (callback) => {
  addListener('PATIENT_COMPLETED', callback);
};

export const offNewPatient = (callback) => {
  removeListener('NEW_PATIENT', callback);
};

export const offPatientTriaged = (callback) => {
  removeListener('PATIENT_TRIAGED', callback);
};

export const offQueueUpdate = (callback) => {
  removeListener('QUEUE_STATS', callback);
};

export const offPatientCalled = (callback) => {
  removeListener('PATIENT_CALLED', callback);
};

export const offPatientCompleted = (callback) => {
  removeListener('PATIENT_COMPLETED', callback);
};
