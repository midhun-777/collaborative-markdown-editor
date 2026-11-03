const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const { marked } = require('marked');

const app = express();
const server = http.createServer(app);

// Configure CORS for Socket.io
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Store documents and sessions
const documents = new Map(); // roomId -> { content: string, users: Set }
const userSessions = new Map(); // socketId -> { roomId, userId }

// Configure marked for better security
marked.setOptions({
  breaks: true,
  gfm: true,
  sanitize: false // We'll handle sanitization on the frontend
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join a room/document
  socket.on('join-room', ({ roomId, userId }) => {
    console.log(`User ${userId} joining room ${roomId}`);
    
    // Leave previous room if any
    const previousSession = userSessions.get(socket.id);
    if (previousSession) {
      socket.leave(previousSession.roomId);
      const doc = documents.get(previousSession.roomId);
      if (doc) {
        doc.users.delete(previousSession.userId);
        if (doc.users.size === 0) {
          documents.delete(previousSession.roomId);
        }
      }
    }

    // Join new room
    socket.join(roomId);
    userSessions.set(socket.id, { roomId, userId });

    // Initialize or get document
    if (!documents.has(roomId)) {
      documents.set(roomId, {
        content: '',
        users: new Set()
      });
    }

    const document = documents.get(roomId);
    document.users.add(userId);

    // Send current document content to the joining user
    socket.emit('document-content', {
      content: document.content,
      html: marked.parse(document.content)
    });

    // Notify others in the room about new user
    socket.to(roomId).emit('user-joined', { userId, userCount: document.users.size });
  });

  // Handle markdown content updates
  socket.on('content-change', ({ roomId, content, userId }) => {
    const document = documents.get(roomId);
    if (document) {
      document.content = content;
      const html = marked.parse(content);
      
      // Broadcast to all users in the room (including sender)
      io.to(roomId).emit('content-updated', {
        content,
        html,
        userId,
        timestamp: Date.now()
      });
    }
  });

  // Handle cursor position updates
  socket.on('cursor-update', ({ roomId, cursorPosition, userId }) => {
    socket.to(roomId).emit('user-cursor-updated', {
      userId,
      cursorPosition,
      timestamp: Date.now()
    });
  });

  // Handle user leaving
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    
    const session = userSessions.get(socket.id);
    if (session) {
      const { roomId, userId } = session;
      const document = documents.get(roomId);
      
      if (document) {
        document.users.delete(userId);
        
        // Notify others about user leaving
        socket.to(roomId).emit('user-left', {
          userId,
          userCount: document.users.size
        });

        // Clean up empty rooms
        if (document.users.size === 0) {
          documents.delete(roomId);
        }
      }
      
      userSessions.delete(socket.id);
    }
  });

  // Handle typing indicators
  socket.on('typing-start', ({ roomId, userId }) => {
    socket.to(roomId).emit('user-typing', { userId, isTyping: true });
  });

  socket.on('typing-stop', ({ roomId, userId }) => {
    socket.to(roomId).emit('user-typing', { userId, isTyping: false });
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    activeRooms: documents.size,
    activeConnections: io.engine.clientsCount 
  });
});

// Get room info endpoint
app.get('/api/room/:roomId', (req, res) => {
  const { roomId } = req.params;
  const document = documents.get(roomId);
  
  if (document) {
    res.json({
      roomId,
      userCount: document.users.size,
      hasContent: document.content.length > 0
    });
  } else {
    res.status(404).json({ error: 'Room not found' });
  }
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
