import axios from 'axios'

const API_BASE_URL = 'http://localhost:3000/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000
})

export default {
  async getMessages(room) {
    try {
      const response = await api.get(`/messages/${room}`)
      return response.data
    } catch (error) {
      console.error('Error fetching messages:', error)
      throw error
    }
  },

  async getUsers(room) {
    try {
      const response = await api.get(`/users/${room}`)
      return response.data
    } catch (error) {
      console.error('Error fetching users:', error)
      throw error
    }
  }
}