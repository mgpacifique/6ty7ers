import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:8000';

let socket = null;

export const connectSocket = () => {
  if (socket) return socket;

  const token = localStorage.getItem('access_token');
  socket = io(SOCKET_URL, {
    auth: {
      token: token || '',
    },
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5,
  });

  socket.on('connect', () => {
    console.log('Socket connected:', socket.id);
  });

  socket.on('disconnect', () => {
    console.log('Socket disconnected');
  });

  socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error);
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const getSocket = () => {
  return socket || connectSocket();
};

export const onQueueUpdate = (callback) => {
  const sock = getSocket();
  sock.on('queue:update', callback);
};

export const onQueuePatientAdded = (callback) => {
  const sock = getSocket();
  sock.on('queue:patient-added', callback);
};

export const onQueuePatientCalled = (callback) => {
  const sock = getSocket();
  sock.on('queue:patient-called', callback);
};

export const onQueuePatientCompleted = (callback) => {
  const sock = getSocket();
  sock.on('queue:patient-completed', callback);
};

export const onPatientPositionUpdate = (callback) => {
  const sock = getSocket();
  sock.on('patient:position-update', callback);
};

export const onPatientCalled = (callback) => {
  const sock = getSocket();
  sock.on('patient:called', callback);
};

export const offQueueUpdate = (callback) => {
  if (socket) {
    socket.off('queue:update', callback);
  }
};

export const offQueuePatientAdded = (callback) => {
  if (socket) {
    socket.off('queue:patient-added', callback);
  }
};

export const offQueuePatientCalled = (callback) => {
  if (socket) {
    socket.off('queue:patient-called', callback);
  }
};

export const offQueuePatientCompleted = (callback) => {
  if (socket) {
    socket.off('queue:patient-completed', callback);
  }
};

export const offPatientPositionUpdate = (callback) => {
  if (socket) {
    socket.off('patient:position-update', callback);
  }
};

export const offPatientCalled = (callback) => {
  if (socket) {
    socket.off('patient:called', callback);
  }
};
