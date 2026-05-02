#!/usr/bin/env node
const express = require('express');
const cors = require('cors');
const { Server } = require('socket.io');
const http = require('http');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Serve the main HTML file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Socket.IO connection handling for real-time features
io.on('connection', (socket) => {
  console.log('✅ User connected:', socket.id);

  // Handle patient updates
  socket.on('patient-added', (patient) => {
    console.log('📝 Patient added:', patient.name);
    socket.broadcast.emit('patient-added', patient);
  });

  socket.on('patient-updated', (patient) => {
    console.log('🔄 Patient updated:', patient.name);
    socket.broadcast.emit('patient-updated', patient);
  });

  socket.on('patient-removed', (patientId) => {
    console.log('🗑️ Patient removed:', patientId);
    socket.broadcast.emit('patient-removed', patientId);
  });

  // Handle room updates
  socket.on('room-updated', (room) => {
    console.log('🏢 Room updated:', room.name);
    socket.broadcast.emit('room-updated', room);
  });

  socket.on('disconnect', () => {
    console.log('❌ User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log('🏥 Priority Management System Server');
  console.log('=====================================');
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 Open http://localhost:${PORT} to view the application`);
  console.log('📡 Real-time features enabled');
  console.log('✅ Ready to accept connections');
});