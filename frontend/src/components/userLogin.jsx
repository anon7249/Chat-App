import { useState } from "react"
import { userLogin } from "../api/api"
import { useNavigate } from "react-router-dom"



function Login() {

  const navigate = useNavigate()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState(null)


  const handleLogin = async (e) => {
    e.preventDefault()

    try {
      const res = await userLogin(username, password)
      localStorage.setItem("token", res.data.access_token)
      navigate("/home")

    } catch (error) {
      setError("incorrect password or email", error)
    }
  }

  return (
    <div>
      <h1>Login</h1>
      <form onSubmit={handleLogin}>

        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
        />

        <input
          value={password}
          type="password"
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
        />
        <button type="submit"
          className="cursor-pointer hover:bg-blue-500 hover:text-white duration-300 rounded-lg p-2"
        >
          Login</button>
        {error && <p>{error}</p>}
        <button
          className="cursor-pointer hover:bg-blue-500 hover:text-white duration-300 rounded-lg p-2"
          type="button"
          onClick={() => navigate("/register")}>
          Sign Up
        </button>
        {error && <p>{error}</p>}

      </form>

    </div>
  )

}


export default Login
