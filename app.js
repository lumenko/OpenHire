// app.js
require('dotenv').config();
const http = require('http');
const express = require('express');
const { Server } = require('socket.io');

const connectDB = require('./config/db');
const registerChatHandlers = require('./sockets/chatHandler');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Connect Mongo
connectDB().then(r => {});

// Socket.IO Gateway
io.on('connection', (socket) => {
  registerChatHandlers(io, socket);
});

module.exports = app