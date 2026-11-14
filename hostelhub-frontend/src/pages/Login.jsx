
import { useState } from 'react'

function Login({ onBack, onRegister, onLogin }) {

  const [role, setRole] = useState('')

  const getLoginLabel = () => {
    if (role === 'STUDENT') return 'Student ID'
    if (role === 'WARDEN') return 'Employee ID'
    if (role === 'ADMIN') return 'Email Address'
    return 'Login ID'
  }

  const getLoginPlaceholder = () => {
    if (role === 'STUDENT') return 'Enter your Student ID'
    if (role === 'WARDEN') return 'Enter your Employee ID'
    if (role === 'ADMIN') return 'Enter your email'
    return 'Select your account type first'
  }

  async function handleSubmit(event) {
    event.preventDefault()

    const formData = new FormData(event.target)

    const loginId = formData.get('loginId')
    const password = formData.get('password')

    try {
      const response = await fetch(
        'http://localhost:8080/api/auth/login',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            loginId: loginId,
            password: password,
            role: role
          })
        }
      )

      const data = await response.json()

      if (response.ok) {
        localStorage.setItem('token', data.token)
        localStorage.setItem('role', data.role)

        alert('Login successful! Welcome to HostelHub.')

        onLogin(data.role)
      } else {
        alert(data.message || 'Invalid login ID or password.')
      }

    } catch (error) {
      alert('Unable to connect to the server. Please try again.')
      console.error(error)
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">

        <button
          className="back-btn"
          onClick={onBack}
        >
          ← Back to Home
        </button>

        <h2>Welcome Back</h2>
        <p>Login to your HostelHub account</p>

        <form onSubmit={handleSubmit}>

          <label>Login As</label>
          <select
            name="role"
            value={role}
            onChange={(event) => setRole(event.target.value)}
            required
          >
            <option value="" disabled>
              Select your account type
            </option>
            <option value="STUDENT">Student</option>
            <option value="WARDEN">Warden</option>
            <option value="ADMIN">Admin</option>
          </select>

          <label>{getLoginLabel()}</label>
          <input
            type={role === 'ADMIN' ? 'email' : 'text'}
            name="loginId"
            placeholder={getLoginPlaceholder()}
            disabled={!role}
            required
          />

          <label>Password</label>
          <input
            type="password"
            name="password"
            placeholder="Enter your password"
            required
          />

          <button type="submit">
            Login
          </button>
        </form>

        <p className="login-note">
          Don't have an account?{' '}
          <button
            type="button"
            className="register-link"
            onClick={onRegister}
          >
            Register here
          </button>
        </p>

      </div>
    </div>
  )
}

export default Login

