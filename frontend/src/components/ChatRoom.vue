<template>
  <div class="chat-room">
    <div class="chat-header">
      <h2>Room: {{ room }}</h2>
      <div class="user-info">
        <span>Welcome, {{ username }}!</span>
        <button @click="leaveRoom" class="leave-btn">Leave</button>
      </div>
    </div>
    
    <div class="chat-container">
      <div class="messages-container" ref="messagesContainer">
        <div 
          v-for="message in messages" 
          :key="message._id || message.timestamp"
          :class="['message', message.type]"
        >
          <div class="message-header">
            <span class="username">{{ message.username }}</span>
            <span class="timestamp">{{ formatTime(message.timestamp) }}</span>
          </div>
          <div class="message-content">{{ message.content }}</div>
        </div>
      </div>
      
      <div class="input-container">
        <input
          v-model="newMessage"
          @keyup.enter="sendMessage"
          placeholder="Type your message..."
          class="message-input"
        />
        <button @click="sendMessage" class="send-btn">Send</button>
      </div>
    </div>
    
    <div class="users-sidebar">
      <h3>Online Users</h3>
      <div v-for="user in onlineUsers" :key="user._id" class="user-item">
        {{ user.username }}
      </div>
    </div>
  </div>
</template>

<script>
import socketService from '../services/socket'
import api from '../services/api'

export default {
  name: 'ChatRoom',
  props: {
    username: {
      type: String,
      required: true
    },
    room: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      messages: [],
      newMessage: '',
      onlineUsers: []
    }
  },
  async mounted() {
    try {
      this.messages = await api.getMessages(this.room)
      this.onlineUsers = await api.getUsers(this.room)
      
      socketService.connect()
      socketService.joinRoom(this.username, this.room)
      
      socketService.onMessage((message) => {
        this.messages.push(message)
        this.$nextTick(() => {
          this.scrollToBottom()
        })
      })
      
    } catch (error) {
      console.error('Error initializing chat:', error)
    }
  },
  beforeUnmount() {
    socketService.offMessage()
    socketService.disconnect()
  },
  methods: {
    sendMessage() {
      if (this.newMessage.trim()) {
        const message = {
          content: this.newMessage,
          username: this.username,
          room: this.room
        }
        
        socketService.sendMessage(message)
        this.newMessage = ''
      }
    },
    leaveRoom() {
      this.$emit('leave-room')
    },
    formatTime(timestamp) {
      return new Date(timestamp).toLocaleTimeString()
    },
    scrollToBottom() {
      const container = this.$refs.messagesContainer
      container.scrollTop = container.scrollHeight
    }
  }
}
</script>

<style scoped>
.chat-room {
  display: flex;
  flex-direction: column;
  height: 100vh;
  max-width: 1200px;
  margin: 0 auto;
  border: 1px solid #ddd;
}

.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background-color: #f5f5f5;
  border-bottom: 1px solid #ddd;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.leave-btn {
  padding: 0.5rem 1rem;
  background-color: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.chat-container {
  display: flex;
  flex: 1;
  flex-direction: column;
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  background-color: #fafafa;
}

.message {
  margin-bottom: 1rem;
  padding: 0.5rem;
  border-radius: 8px;
  background-color: white;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.message.join, .message.leave {
  background-color: #e3f2fd;
  font-style: italic;
}

.message-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.25rem;
}

.username {
  font-weight: bold;
  color: #333;
}

.timestamp {
  font-size: 0.8rem;
  color: #666;
}

.message-content {
  color: #444;
}

.input-container {
  display: flex;
  padding: 1rem;
  background-color: white;
  border-top: 1px solid #ddd;
}

.message-input {
  flex: 1;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-right: 0.5rem;
  font-size: 1rem;
}

.send-btn {
  padding: 0.75rem 1.5rem;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
}

.send-btn:hover {
  background-color: #0056b3;
}

.users-sidebar {
  position: fixed;
  right: 20px;
  top: 20px;
  width: 200px;
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.users-sidebar h3 {
  margin-top: 0;
  margin-bottom: 1rem;
  color: #333;
}

.user-item {
  padding: 0.5rem;
  margin-bottom: 0.25rem;
  background-color: #f8f9fa;
  border-radius: 4px;
}
</style>