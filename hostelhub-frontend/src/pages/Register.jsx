
function Register({ onBack }) {

  async function handleSubmit(event) {
    event.preventDefault()

    const formData = new FormData(event.target)

    const password = formData.get('password')
    const confirmPassword = formData.get('confirmPassword')

    if (password !== confirmPassword) {
      alert('Passwords do not match!')
      return
    }

    const studentData = {
      studentId: formData.get('studentId').trim(),
      password: password
    }

    try {
      const response = await fetch(
        'http://localhost:8080/api/students/register',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(studentData)
        }
      )

      if (response.ok) {
        alert('Registration successful! You can now log in.')
        event.target.reset()
        onBack()
      } else {
        const errorData = await response.json()
        alert(
          'Registration failed: ' +
          (errorData.message || 'Please check your details.')
        )
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
          ← Back to Login
        </button>

        <h2>Create Student Account</h2>
        <p>Use your Admin-approved Student ID to register.</p>

        <form onSubmit={handleSubmit}>

          <label>Student ID</label>
          <input
            type="text"
            name="studentId"
            placeholder="Enter your approved Student ID"
            required
          />

          <label>Create Password</label>
          <input
            type="password"
            name="password"
            placeholder="Create a password"
            minLength="8"
            required
          />

          <label>Confirm Password</label>
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm your password"
            minLength="8"
            required
          />

          <button type="submit">
            Create Account
          </button>

        </form>
      </div>
    </div>
  )
}

export default Register

