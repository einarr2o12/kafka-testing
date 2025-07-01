import { io } from 'socket.io-client'

class SocketService {
  constructor() {
    this.socket = null
    this.connected = false
  }

  connect(serverUrl = 'http://localhost:3000') {
    this.socket = io(serverUrl)
    
    this.socket.on('connect', () => {
      this.connected = true
      console.log('Connected to server')
    })

    this.socket.on('disconnect', () => {
      this.connected = false
      console.log('Disconnected from server')
    })

    return this.socket
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
      this.connected = false
    }
  }

  joinRoom(username, room) {
    if (this.socket) {
      this.socket.emit('join', { username, room })
    }
  }

  sendMessage(message) {
    if (this.socket) {
      this.socket.emit('message', message)
    }
  }

  onMessage(callback) {
    if (this.socket) {
      this.socket.on('message', callback)
    }
  }

  offMessage() {
    if (this.socket) {
      this.socket.off('message')
    }
  }
}

export default new SocketService()