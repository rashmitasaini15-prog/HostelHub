
import { useEffect, useState } from 'react'
import API_URL from '../api'

function ApprovedStudentIds({ onBack }) {
  const [studentIds, setStudentIds] = useState([])

  const [fullName, setFullName] = useState('')
  const [studentId, setStudentId] = useState('')
  const [email, setEmail] = useState('')
  const [contactNumber, setContactNumber] = useState('')

  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('')

  const token = localStorage.getItem('token')

  async function fetchStudentIds() {
    try {
      const response = await fetch(
        `${API_URL}/api/approved-student-ids`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      if (!response.ok) {
        throw new Error('Unable to load approved Student IDs')
      }

      const data = await response.json()
      setStudentIds(data)

    } catch (error) {
      setMessage(error.message)
      setMessageType('error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStudentIds()
  }, [])

  async function handleAddStudent(event) {
    event.preventDefault()
    setMessage('')

    const studentData = {
      fullName: fullName.trim(),
      studentId: studentId.trim(),
      email: email.trim(),
      contactNumber: contactNumber.trim()
    }

    if (
      !studentData.fullName ||
      !studentData.studentId ||
      !studentData.email ||
      !studentData.contactNumber
    ) {
      setMessage('Please fill in all student details.')
      setMessageType('error')
      return
    }

    try {
      const response = await fetch(
        `${API_URL}/api/approved-student-ids/details`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(studentData)
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(
          errorData.message || 'Unable to add student'
        )
      }

      setFullName('')
      setStudentId('')
      setEmail('')
      setContactNumber('')

      setMessage('Student approved successfully!')
      setMessageType('success')

      await fetchStudentIds()

    } catch (error) {
      setMessage(error.message)
      setMessageType('error')
    }
  }

  async function handleRemoveStudent(item) {
    const confirmRemove = window.confirm(
      `Are you sure you want to remove approval for ${item.studentId}?`
    )

    if (!confirmRemove) {
      return
    }

    setMessage('')

    try {
      const response = await fetch(
        `${API_URL}/api/approved-student-ids/${item.id}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(
          errorData.message || 'Unable to remove approval'
        )
      }

      setMessage('Student approval removed successfully!')
      setMessageType('success')

      await fetchStudentIds()

    } catch (error) {
      setMessage(error.message)
      setMessageType('error')
    }
  }

  const availableCount = studentIds.filter(
    item => !item.used
  ).length

  const usedCount = studentIds.filter(
    item => item.used
  ).length

  return (
    <div className="approved-ids-page">

      <button className="approved-back-button" onClick={onBack}>
        ← Back to Dashboard
      </button>

      <div className="approved-ids-heading">
        <div>
          <h2>Approved Student IDs</h2>
          <p>Manage university-approved student registrations.</p>
        </div>
      </div>

      <div className="approved-ids-stats">

        <div className="approved-stat-card">
          <span>Total Student IDs</span>
          <h2>{studentIds.length}</h2>
        </div>

        <div className="approved-stat-card">
          <span>Available IDs</span>
          <h2>{availableCount}</h2>
        </div>

        <div className="approved-stat-card">
          <span>Used IDs</span>
          <h2>{usedCount}</h2>
        </div>

      </div>

      <div className="approved-form-card">

        <h3>Add New Student</h3>
        <p>Enter student details to approve their registration.</p>

        <form onSubmit={handleAddStudent} className="approved-id-form">

          <input
            type="text"
            placeholder="Full Name"
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            required
          />

          <input
            type="text"
            placeholder="University Student ID"
            value={studentId}
            onChange={(event) => setStudentId(event.target.value)}
            required
          />

          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />

          <input
            type="tel"
            placeholder="Contact Number"
            value={contactNumber}
            onChange={(event) => setContactNumber(event.target.value)}
            required
          />

          <button type="submit">
            + Approve Student
          </button>

        </form>

        {message && (
          <p className={`approved-message ${messageType}`}>
            {message}
          </p>
        )}

      </div>

      <div className="approved-list-card">

        <div className="approved-list-heading">
          <div>
            <h3>Student ID List</h3>
            <p>View and track approved registrations.</p>
          </div>

          <span>{studentIds.length} IDs</span>
        </div>

        {loading ? (
          <p>Loading Student IDs...</p>
        ) : studentIds.length === 0 ? (
          <p className="approved-empty">
            No approved Student IDs added yet.
          </p>
        ) : (
          <div className="approved-id-list">

            {studentIds.map((item) => (
              <div className="approved-id-row" key={item.id}>

                <div>
                  <strong>
                    {item.fullName || 'Student details unavailable'}
                  </strong>

                  <p>{item.studentId}</p>

                  <p>
                    {item.email || 'No email'} · {item.contactNumber || 'No contact number'}
                  </p>
                </div>

                <div>
                  <span className={`approved-status ${item.used ? 'used' : 'available'}`}>
                    {item.used ? 'Used' : 'Available'}
                  </span>

                  {!item.used && (
                    <button
                      type="button"
                      className="approved-remove-button"
                      onClick={() => handleRemoveStudent(item)}
                    >
                      Remove
                    </button>
                  )}
                </div>

              </div>
            ))}

          </div>
        )}

      </div>

    </div>
  )
}

export default ApprovedStudentIds

