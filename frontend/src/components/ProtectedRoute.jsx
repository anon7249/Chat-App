import { Navigate } from "react-router-dom"
import { jwtDecode } from "jwt-decode"


function isTokenValid(token) {
  if (!token) return false
  try {
    const { exp } = jwtDecode(token)
    return exp * 1000 > Date.now()

  } catch {
    return false

  }
}


function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token")

  if (!isTokenValid(token)) {
    return <Navigate to="/" replace />
  }
  return children
}

export default ProtectedRoute
