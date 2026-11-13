import { Routes, Route } from "react-router-dom"
import './App.css'
import Register from "./components/Register"
import ProtectedRoute from "./components/ProtectedRoute"
import UserHomePage from "./components/userHomePage"
import Login from "./components/userLogin"
import ChatPage from "./components/ChatPage"

function App() {


  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/conversations/:id"
        element={<ProtectedRoute><ChatPage /></ProtectedRoute>}
      />

      <Route
        path="/home"
        element={
          <ProtectedRoute>
            <UserHomePage />
          </ProtectedRoute>
        }
      >

      </Route>

    </Routes>

  )
}

export default App
