// public/js/chat.js
document.addEventListener('DOMContentLoaded', () => {
    let io;
    if (typeof io === 'undefined') {
        console.error('Socket.IO client library is missing or failed to load.');
        return;
    }

    // Initialize Socket.IO connection
    const socket = io();

    socket.on('connect', () => {
        console.log('[Socket.IO] Connected to server with ID:', socket.id);

        // Join session once connected
        socket.emit('join_session', {
            resumeId: '66ce1a2b3c4d5e6f7a8b9c0d', // Replace it with dynamic ID
            userId: '66ce1a2b3c4d5e6f7a8b9c0e'
        });
    });

    socket.on('connect_error', (error) => {
        console.error('[Socket.IO Connection Error]:', error);
    });
});