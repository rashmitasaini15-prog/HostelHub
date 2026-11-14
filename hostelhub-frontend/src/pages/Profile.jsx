import { useEffect, useState } from 'react'

function Profile({ onBack }) {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const userRole = localStorage.getItem('role') || 'STUDENT'

  function getEmailFromToken() {
    try {
      const token = localStorage.getItem('token')
      const payload = JSON.parse(
        atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))
      )
      return payload.sub || ''
    } catch {
      return ''
    }
  }

  const userEmail = getEmailFromToken()

  useEffect(() => {
    async function fetchProfile() {
      if (userRole !== 'STUDENT') {
        setLoading(false)
        return
      }

      try {
        const token = localStorage.getItem('token')

        const response = await fetch(
          'http://localhost:8080/api/students/profile',
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        )

        if (!response.ok) {
          throw new Error('Unable to load student profile')
        }

        const data = await response.json()
        setProfile(data)
      } catch (error) {
        setError(error.message)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [userRole])

  if (loading) {
    return <div className="page-container">Loading profile...</div>
  }

  if (error) {
    return (
      <div className="page-container">
        <button onClick={onBack}>← Back to Dashboard</button>
        <p>{error}</p>
      </div>
    )
  }

  const accountName =
    userRole === 'STUDENT'
      ? profile?.fullName
      : userRole === 'ADMIN'
        ? 'Administrator'
        : 'Warden'

  return (
    <div className="page-container">

      <button onClick={onBack}>
        ← Back to Dashboard
      </button>

      <h2>My Profile</h2>
      <p>Your account information</p>

      <div className="profile-card">

        <div className="profile-avatar">
          {userRole === 'STUDENT'
            ? profile?.fullName?.charAt(0).toUpperCase()
            : userEmail.charAt(0).toUpperCase()}
        </div>

        <h2>{accountName}</h2>

        <p>{userRole}</p>

        <div className="profile-details">

          <div>
            <strong>Account Name</strong>
            <p>{accountName}</p>
          </div>

          <div>
            <strong>Email Address</strong>
            <p>
              {userRole === 'STUDENT'
                ? profile?.email
                : userEmail}
            </p>
          </div>

          <div>
            <strong>Account Role</strong>
            <p>{userRole}</p>
          </div>

          {userRole === 'WARDEN' && (
            <div>
              <strong>Employee Number</strong>
              <p>WH-2026-001</p>
            </div>
          )}

          {userRole === 'STUDENT' && (
            <>
              <div>
                <strong>Student ID</strong>
                <p>{profile?.studentId}</p>
              </div>

              <div>
                <strong>Contact Number</strong>
                <p>{profile?.contactNumber}</p>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  )
}

export default Profile
