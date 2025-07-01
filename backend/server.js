require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');

const KafkaService = require('./services/kafka');
const Message = require('./models/Message');
const User = require('./models/User');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || ["http://localhost:8080", "http://chat.local"],
    methods: ["GET", "POST"]
  }
});

app.use(cors({
  origin: process.env.FRONTEND_URL || ["http://localhost:8080", "http://chat.local"]
}));
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

const kafkaService = new KafkaService();

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

app.get('/api/messages/:room', async (req, res) => {
  try {
    const messages = await Message.find({ room: req.params.room })
      .sort({ timestamp: -1 })
      .limit(50);
    res.json(messages.reverse());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/users/:room', async (req, res) => {
  try {
    const users = await User.find({ room: req.params.room, isOnline: true });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join', async (data) => {
    const { username, room } = data;
    
    try {
      await User.findOneAndUpdate(
        { username },
        { 
          socketId: socket.id, 
          room, 
          isOnline: true,
          lastSeen: new Date()
        },
        { upsert: true }
      );
      
      socket.join(room);
      socket.username = username;
      socket.room = room;
      
      const joinMessage = {
        content: `${username} joined the chat`,
        username: 'System',
        room,
        timestamp: new Date(),
        type: 'join'
      };
      
      if (process.env.SKIP_KAFKA !== 'true') {
        await kafkaService.publishMessage('chat-messages', joinMessage);
      } else {
        io.to(room).emit('message', joinMessage);
      }
      
    } catch (error) {
      console.error('Error joining room:', error);
    }
  });

  socket.on('message', async (data) => {
    const { content, username, room } = data;
    
    try {
      const message = new Message({ content, username, room });
      await message.save();
      
      const messageData = {
        content,
        username,
        room,
        timestamp: message.timestamp,
        type: 'message'
      };
      
      if (process.env.SKIP_KAFKA !== 'true') {
        await kafkaService.publishMessage('chat-messages', messageData);
      } else {
        io.to(room).emit('message', messageData);
      }
      
    } catch (error) {
      console.error('Error saving message:', error);
    }
  });

  socket.on('disconnect', async () => {
    console.log('User disconnected:', socket.id);
    
    if (socket.username && socket.room) {
      try {
        await User.findOneAndUpdate(
          { username: socket.username },
          { 
            isOnline: false,
            lastSeen: new Date()
          }
        );
        
        const leaveMessage = {
          content: `${socket.username} left the chat`,
          username: 'System',
          room: socket.room,
          timestamp: new Date(),
          type: 'leave'
        };
        
        if (process.env.SKIP_KAFKA !== 'true') {
          await kafkaService.publishMessage('chat-messages', leaveMessage);
        } else {
          io.to(socket.room).emit('message', leaveMessage);
        }
        
      } catch (error) {
        console.error('Error handling disconnect:', error);
      }
    }
  });
});

async function startServer() {
  try {
    const PORT = process.env.PORT || 3000;
    
    if (process.env.SKIP_KAFKA !== 'true') {
      await kafkaService.connect();
      
      await kafkaService.subscribeToMessages('chat-messages', (message) => {
        io.to(message.room).emit('message', message);
      });
      console.log('Kafka connected successfully');
    } else {
      console.log('Kafka disabled - running in simple mode');
    }
    
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
    
  } catch (error) {
    console.error('Error starting server:', error);
    process.exit(1);
  }
}

process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...');
  await kafkaService.disconnect();
  await mongoose.disconnect();
  process.exit(0);
});

startServer();