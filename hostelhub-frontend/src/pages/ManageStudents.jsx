
import { useEffect, useState } from 'react'
import API_URL from '../api'

function ManageStudents({ onBack }) {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [updatingId, setUpdatingId] = useState(null)

  const token = localStorage.getItem('token')

  async function fetchStudents() {
    try {
      setError('')

      const response = await fetch(
        `${API_URL}/api/students`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      if (!response.ok) {
        throw new Error('Unable to load students')
      }

      const data = await response.json()
      setStudents(data)

    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStudents()
  }, [])

  async function updateAcademicYear(studentId, academicYear) {
    try {
      setUpdatingId(studentId)
      setError('')
      setMessage('')

      const response = await fetch(
        `${API_URL}/api/students/${studentId}/academic-year`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            academicYear: Number(academicYear)
          })
        }
      )

      if (!response.ok) {
        throw new Error('Unable to update academic year')
      }

      setStudents(previous =>
        previous.map(student =>
          student.id === studentId
            ? { ...student, academicYear: Number(academicYear) }
            : student
        )
      )

      setMessage('Academic year updated successfully.')

    } catch (err) {
      setError(err.message)
    } finally {
      setUpdatingId(null)
    }
  }

  async function updateAccountStatus(student) {
    const action = student.active ? 'deactivate' : 'reactivate'

    const confirmed = window.confirm(
      `Are you sure you want to ${action} ${student.fullName}'s account?`
    )

    if (!confirmed) return

    try {
      setUpdatingId(student.id)
      setError('')
      setMessage('')

      const response = await fetch(
        `${API_URL}/api/students/${student.id}/${action}`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Unable to update account status')
      }

      setStudents(previous =>
        previous.map(item =>
          item.id === student.id
            ? { ...item, active: !student.active }
            : item
        )
      )

      setMessage(
        student.active
          ? 'Student account deactivated successfully.'
          : 'Student account reactivated successfully.'
      )

    } catch (err) {
      setError(err.message)
    } finally {
      setUpdatingId(null)
    }
  }

  const activeStudents = students.filter(student => student.active).length
  const inactiveStudents = students.length - activeStudents

  return (
    <div className="approved-ids-page">

      <button className="approved-back-button" onClick={onBack}>
        ← Back to Dashboard
      </button>

      <div className="approved-ids-heading">
        <div>
          <h2>Manage Students</h2>
          <p>View student records and manage their accounts.</p>
        </div>
      </div>

      {message && <p className="approved-message success">{message}</p>}
      {error && <p className="approved-message error">{error}</p>}

      <div className="approved-id-stats">

        <div className="approved-stat-card">
          <h3>{students.length}</h3>
          <p>Total Students</p>
        </div>

        <div className="approved-stat-card">
          <h3>{activeStudents}</h3>
          <p>Active Accounts</p>
        </div>

        <div className="approved-stat-card">
          <h3>{inactiveStudents}</h3>
          <p>Deactivated Accounts</p>
        </div>

      </div>

      <div className="approved-list-card">

        <div className="approved-list-heading">
          <div>
            <h3>Registered Students</h3>
            <p>Manage academic years and account status.</p>
          </div>

          <span>{students.length} Students</span>
        </div>

        {loading ? (
          <p>Loading students...</p>
        ) : students.length === 0 ? (
          <p className="approved-empty">No students found.</p>
        ) : (
          <div className="approved-id-list">

            {students.map(student => (
              <div className="approved-id-row" key={student.id}>

                <div>
                  <strong>{student.fullName}</strong>
                  <p>Student ID: {student.studentId}</p>
                  <p>Email: {student.email}</p>
                  <p>Contact: {student.contactNumber}</p>
                  <p>
                    Account Status:{' '}
                    <strong
                      style={{
                        color: student.active ? '#16a34a' : '#dc2626',
                        fontWeight: '700'
                      }}
                    >
                      {student.active ? 'Active' : 'Deactivated'}
                    </strong>
                  </p>
                </div>

                <div className="manage-student-actions">

                  <label>Academic Year</label>

                  <select
                    value={student.academicYear || 1}
                    onChange={event =>
                      updateAcademicYear(student.id, event.target.value)
                    }
                    disabled={updatingId === student.id}
                  >
                    <option value={1}>1st Year</option>
                    <option value={2}>2nd Year</option>
                    <option value={3}>3rd Year</option>
                    <option value={4}>4th Year</option>
                  </select>

                  <button
                    type="button"
                    className={`manage-student-status-button ${
                      student.active ? 'deactivate-button' : 'reactivate-button'
                    }`}
                    onClick={() => updateAccountStatus(student)}
                    disabled={updatingId === student.id}
                  >
                    {updatingId === student.id
                      ? 'Updating...'
                      : student.active
                        ? 'Deactivate Account'
                        : 'Reactivate Account'}
                  </button>

                </div>

              </div>
            ))}

          </div>
        )}

      </div>

    </div>
  )
}

export default ManageStudents

