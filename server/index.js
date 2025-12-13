import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());

// Serve static files from the dist directory (one level up from server)
app.use(express.static(path.join(__dirname, '../dist')));

const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "*", // Allow all origins for simplicity in development
        methods: ["GET", "POST"]
    }
});

// Store game states
const rooms = new Map();

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('create_room', () => {
        const roomCode = Math.random().toString(36).substring(2, 7).toUpperCase();
        rooms.set(roomCode, {
            players: [{ id: socket.id, symbol: 'X' }],
            board: Array(9).fill(null),
            currentPlayer: 'X',
            winner: null,
            scores: { X: 0, O: 0, draws: 0 }
        });

        socket.join(roomCode);
        socket.emit('room_created', roomCode);
        console.log(`Room ${roomCode} created by ${socket.id}`);
    });

    socket.on('join_room', (roomCode) => {
        const room = rooms.get(roomCode);

        if (!room) {
            socket.emit('error', 'Room not found');
            return;
        }

        if (room.players.length >= 2) {
            socket.emit('error', 'Room is full');
            return;
        }

        room.players.push({ id: socket.id, symbol: 'O' });
        socket.join(roomCode);

        // Notify Creator
        io.to(room.players[0].id).emit('game_start', {
            symbol: 'X',
            roomCode: roomCode,
            roomState: room
        });

        // Notify Joiner
        io.to(socket.id).emit('game_start', {
            symbol: 'O',
            roomCode: roomCode,
            roomState: room
        });

        console.log(`User ${socket.id} joined room ${roomCode}`);
    });

    socket.on('make_move', ({ roomCode, index, symbol }) => {
        const room = rooms.get(roomCode);
        if (!room) return;

        if (room.currentPlayer !== symbol) return; // Not your turn
        if (room.board[index] !== null) return; // Cell occupied

        // Update board
        room.board[index] = symbol;

        // Check win/draw (Basic logic)
        // ... Or just rely on client for "logic" and sync data. 
        // Ideally server should validate. Let's do a simple relay for now + board update.

        room.currentPlayer = symbol === 'X' ? 'O' : 'X';

        io.to(roomCode).emit('move_made', {
            board: room.board,
            currentPlayer: room.currentPlayer
        });
    });

    socket.on('request_restart', (roomCode) => {
        console.log(`Restart requested for room ${roomCode} by ${socket.id}`);
        const room = rooms.get(roomCode);
        if (room) {
            // Initialize restartRequests if needed
            if (!room.restartRequests) {
                room.restartRequests = new Set();
            }

            room.restartRequests.add(socket.id);
            console.log(`Room ${roomCode} restart requests: ${room.restartRequests.size}`);

            // Notify pending status
            io.to(roomCode).emit('restart_requested', socket.id);
            console.log(`Emitted restart_requested to ${roomCode}`);

            // If both players requested, reset the game
            if (room.restartRequests.size >= 2) {
                room.board = Array(9).fill(null);
                room.currentPlayer = 'X';
                room.winner = null;
                room.restartRequests.clear();
                io.to(roomCode).emit('game_reset', room);
            }
        }
    });

    socket.on('reject_restart', (roomCode) => {
        const room = rooms.get(roomCode);
        if (room) {
            room.restartRequests = new Set(); // Clear all requests
            io.to(roomCode).emit('restart_rejected'); // Notify clients to reset UI
        }
    });

    const handleLeave = () => {
        // Find room and handle disconnect
        for (const [code, room] of rooms.entries()) {
            const playerIndex = room.players.findIndex(p => p.id === socket.id);
            if (playerIndex !== -1) {
                console.log(`Player ${socket.id} leaving room ${code}`);
                room.players.splice(playerIndex, 1);

                if (room.players.length === 0) {
                    rooms.delete(code);
                    console.log(`Room ${code} deleted (empty)`);
                } else {
                    io.to(code).emit('player_left');
                    console.log(`Emitted player_left to room ${code}`);
                }
                break;
            }
        }
    };

    socket.on('leave_room', () => {
        console.log(`User ${socket.id} triggered leave_room`);
        handleLeave();
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        handleLeave();
    });
});

// Handle SPA routing - return index.html for all other routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
});

import os from 'os';

// ... (existing imports)

// ... (existing code)

const PORT = process.env.PORT || 3005;
httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(); // Empty line
    console.log(`  ➜  Local:   http://localhost:${PORT}/`);

    // Get network interfaces to show LAN IP
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            // Skip internal and non-IPv4 addresses
            if (iface.family === 'IPv4' && !iface.internal) {
                console.log(`  ➜  Network: http://${iface.address}:${PORT}/`);
            }
        }
    }
    console.log(); // Empty line
});
