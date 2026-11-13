import { useState } from "react"
import { createUser } from "../api/api"



function Register() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: ""
  })

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (formData.password !== formData.confirmPassword) {
      alert("password not found")
      return
    }
    try {
      const res = await createUser(formData)
      console.log(res.data)

    } catch (error) {
      console.error(error.response?.data || error.message)
      alert("signup failed ")
    }
  }


  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-3 bg-white p-8 rounded-lg shadow-md w-80 "
      >

        <div className="flex flex-col">
          <label
            htmlFor="username"
            className="text-sm font-medium text-gray-700 mb-1"
          >
            Enter your username:
          </label>

          <input
            type="text"
            name="username"
            id="username"
            placeholder="Enter your username"
            value={formData.username}
            onChange={handleChange}
            required
            className="border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <div className="flex flex-col">
          <label
            htmlFor="email"
            className="text-sm font-medium text-gray-700 mb-1"
          >
            Enter your email:
          </label>
          <input
            type="email"
            name="email"
            id="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleChange}
            required
            className="border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>


        <div className="flex flex-col">
          <label
            htmlFor="password"
            className="text-sm font-medium text-gray-700 mb-1"
          >
            Enter your password:
          </label>
          <input
            type="password"
            name="password"
            id="password"
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleChange}
            required
            className="border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <div className="flex flex-col">

          <label
            htmlFor="confirmPassword"
            className="text-sm font-medium text-gray-700 mb-1"
          >
            Confirm your password:
          </label>
          <input
            type="password"
            name="confirmPassword"
            id="confirmPassword"
            placeholder="Confirm your password"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            className="border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        {/* Button */}
        <button
          type="submit"
          className="cursor-pointer hover:bg-blue-500 hover:text-white duration-300 rounded-lg p-2">
          Sign Up
        </button>
      </form>
    </div>
  )
}



export default Register
