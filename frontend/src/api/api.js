import axios from "axios"

const API = axios.create({
  baseURL: "http://127.0.0.1:8000",
})

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token")
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export const getCurrentUser = () => API.get("/users/me/")

export const createUser = (userData) => API.post("/register", userData)

export const userLogin = (username, password) => {
  const formData = new URLSearchParams()
  formData.append("username", username)
  formData.append("password", password)
  return API.post("/token", formData)
}

export const getConversations = () => API.get("/conversations")

export const getMessages = (conversationId) =>
  API.get(`/conversations/${conversationId}/messages`)


export const sendMessage = (recipientId, message) => API.post("/conversations/messages", { recipient_id: recipientId, message })

export const searchUsers = (q) => API.get("/conversations/users/search", { params: { q } })

export const summariseConversation = (conversationId) => API.post(`/conversations/${conversationId}/summary`)

export const createGroup = (groupName, memberIds) => API.post(`/conversations/group`, { group_name: groupName, members_id: memberIds, })
