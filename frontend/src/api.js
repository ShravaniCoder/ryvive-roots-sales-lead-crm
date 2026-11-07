import axios from 'axios'

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api`,
  withCredentials: true
  // Do not set a global Content-Type here. Axios must set the multipart
  // boundary automatically when a FormData request uploads location photos.
})

export default api
