import { io } from 'socket.io-client';

// Use environment variable or default to localhost:3005
const SOCKET_URL = 'http://localhost:3005';

export const socket = io(SOCKET_URL, {
    autoConnect: false,
    reconnection: true,
});
