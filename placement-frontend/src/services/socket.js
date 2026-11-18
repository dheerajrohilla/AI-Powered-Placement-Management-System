import { io } from 'socket.io-client';

let socket = null;

export const getSocket = () => {
  if (socket && socket.connected) {
    return socket;
  }

  const token = localStorage.getItem('token');
  const rawApiUrl = import.meta.env.VITE_API_URL || '';
  const serverUrl = rawApiUrl.startsWith('http')
    ? rawApiUrl.replace(/\/api\/?$/, '')
    : (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5000');

  if (!socket) {
    socket = io(serverUrl, {
      auth: { token },
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      transports: ['websocket', 'polling']
    });

    socket.on('connect', () => {
      // connected successfully
    });

    socket.on('connect_error', (err) => {
      console.warn('Real-time connection notice:', err.message);
    });
  } else if (!socket.connected && token) {
    socket.auth = { token };
    socket.connect();
  }

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
