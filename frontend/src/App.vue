<template>
  <div id="app">
    <LoginForm 
      v-if="!isLoggedIn" 
      @join-chat="handleJoinChat"
    />
    <ChatRoom 
      v-else 
      :username="username" 
      :room="room"
      @leave-room="handleLeaveRoom"
    />
  </div>
</template>

<script>
import LoginForm from './components/LoginForm.vue'
import ChatRoom from './components/ChatRoom.vue'

export default {
  name: 'App',
  components: {
    LoginForm,
    ChatRoom
  },
  data() {
    return {
      isLoggedIn: false,
      username: '',
      room: ''
    }
  },
  methods: {
    handleJoinChat(userData) {
      this.username = userData.username
      this.room = userData.room
      this.isLoggedIn = true
    },
    handleLeaveRoom() {
      this.isLoggedIn = false
      this.username = ''
      this.room = ''
    }
  }
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

#app {
  min-height: 100vh;
}
</style>