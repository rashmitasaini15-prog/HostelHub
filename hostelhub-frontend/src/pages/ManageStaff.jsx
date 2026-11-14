
import { useEffect, useState } from 'react'
import API_URL from '../api'

function ManageStaff({ onBack }) {
  const [staff, setStaff] = useState([])
  const [employeeIds, setEmployeeIds] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [updatingId, setUpdatingId] = useState(null)

  const token = localStorage.getItem('token')

  async function fetchStaff() {
    try {
      const response = await fetch(
        `${API_URL}/api/staff`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      if (!response.ok) {
        throw new Error('Unable to load staff members')
      }

      const data = await response.json()
      setStaff(data)

      const ids = {}
      data.forEach(member => {
        ids[member.id] = member.employeeId || ''
      })
      setEmployeeIds(ids)

    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStaff()
  }, [])

  async function assignEmployeeId(staffId) {
    const employeeId = employeeIds[staffId]?.trim()

    if (!employeeId) {
      setError('Please enter an Employee ID.')
      return
    }

    try {
      setUpdatingId(staffId)
      setError('')
      setMessage('')

      const response = await fetch(
        `${API_URL}/api/staff/${staffId}/employee-id`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ employeeId })
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Unable to assign Employee ID')
      }

      setStaff(previous =>
        previous.map(member =>
          member.id === staffId
            ? { ...member, employeeId: data.employeeId }
            : member
        )
      )

      setMessage('Employee ID assigned successfully.')

    } catch (err) {
      setError(err.message)
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <div className="approved-ids-page">

      <button className="approved-back-button" onClick={onBack}>
        ← Back to Dashboard
      </button>

      <div className="approved-ids-heading">
        <div>
          <h2>Manage Staff</h2>
          <p>View staff members and manage Warden Employee IDs.</p>
        </div>
      </div>

      {message && <p className="approved-message success">{message}</p>}
      {error && <p className="approved-message error">{error}</p>}

      <div className="approved-list-card">

        <div className="approved-list-heading">
          <div>
            <h3>Registered Staff</h3>
            <p>Assign an Employee ID to each Warden.</p>
          </div>

          <span>{staff.length} Staff Members</span>
        </div>

        {loading ? (
          <p>Loading staff...</p>
        ) : staff.length === 0 ? (
          <p className="approved-empty">No staff members found.</p>
        ) : (
          <div className="approved-id-list">

            {staff.map(member => (
              <div className="approved-id-row" key={member.id}>

                <div>
                  <strong>{member.fullName}</strong>
                  <p>{member.email}</p>
                  <p>Role: {member.role}</p>
                  <p>
                    Employee ID: {member.employeeId || 'Not assigned'}
                  </p>
                </div>

                {member.role === 'WARDEN' && (
                  <div>
                    <label>Employee ID</label>

                    <input
                      type="text"
                      placeholder="Enter Employee ID"
                      value={employeeIds[member.id] || ''}
                      onChange={event =>
                        setEmployeeIds(previous => ({
                          ...previous,
                          [member.id]: event.target.value
                        }))
                      }
                      disabled={updatingId === member.id}
                    />

                    <button
                      type="button"
                      onClick={() => assignEmployeeId(member.id)}
                      disabled={updatingId === member.id}
                    >
                      {updatingId === member.id
                        ? 'Saving...'
                        : 'Save Employee ID'}
                    </button>
                  </div>
                )}

              </div>
            ))}

          </div>
        )}

      </div>

    </div>
  )
}

export default ManageStaff

