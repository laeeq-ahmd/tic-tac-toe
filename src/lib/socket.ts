import { io } from 'socket.io-client';

// Use environment variable or default to localhost:3005
// When deployed, we serve from the same origin, so we don't need a URL
const SOCKET_URL = import.meta.env.PROD ? undefined : 'http://localhost:3005';

export const socket = io(SOCKET_URL, {
    autoConnect: false,
    reconnection: true,
});
