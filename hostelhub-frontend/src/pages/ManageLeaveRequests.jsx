
import { useEffect, useState } from 'react'
import './ManageLeaveRequests.css'

function ManageLeaveRequests({ onBack }) {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [updatingId, setUpdatingId] = useState(null)

  const token = localStorage.getItem('token')

  async function fetchRequests() {
    try {
      const response = await fetch(
        'http://localhost:8080/api/leave-requests',
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      if (!response.ok) {
        throw new Error('Unable to load leave requests')
      }

      const data = await response.json()
      setRequests(data)
      setMessage('')
    } catch (error) {
      setMessage(error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRequests()
  }, [])

  async function updateStatus(id, status) {
    setUpdatingId(id)
    setMessage('')

    try {
      const response = await fetch(
        `http://localhost:8080/api/leave-requests/${id}/status`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ status })
        }
      )

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(errorText || 'Unable to update request')
      }

      setMessage(`Request ${status.toLowerCase()} successfully!`)
      await fetchRequests()
    } catch (error) {
      setMessage(error.message)
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <div className="manage-leave-page">

      <button className="manage-leave-back" onClick={onBack}>
        ← Back to Dashboard
      </button>

      <div className="manage-leave-header">
        <p className="manage-leave-tagline">STAFF SERVICES</p>
        <h2>Manage Leave Requests</h2>
        <p>
          Review student leave applications and update their status.
        </p>
      </div>

      <div className="manage-leave-summary">
        <div className="manage-summary-card">
          <span>Total Requests</span>
          <h3>{requests.length}</h3>
        </div>

        <div className="manage-summary-card">
          <span>Pending</span>
          <h3>
            {requests.filter(r => r.status === 'PENDING').length}
          </h3>
        </div>

        <div className="manage-summary-card">
          <span>Approved</span>
          <h3>
            {requests.filter(r => r.status === 'APPROVED').length}
          </h3>
        </div>

        <div className="manage-summary-card">
          <span>Rejected</span>
          <h3>
            {requests.filter(r => r.status === 'REJECTED').length}
          </h3>
        </div>
      </div>

      {message && (
        <p className={`manage-leave-message ${
          message.toLowerCase().includes('successfully') ? 'success' : 'error'
        }`}>
          {message}
        </p>
      )}

      <div className="manage-requests-section">
        <div className="manage-requests-heading">
          <div>
            <h3>Student Applications</h3>
            <p>Review and manage submitted requests.</p>
          </div>
        </div>

        {loading ? (
          <div className="manage-leave-empty">
            Loading leave requests...
          </div>
        ) : requests.length === 0 ? (
          <div className="manage-leave-empty">
            No leave requests have been submitted yet.
          </div>
        ) : (
          <div className="manage-leave-list">
            {requests.map((request) => (
              <div className="manage-leave-card" key={request.id}>

                <div className="manage-card-top">
                  <div>
                    <p className="manage-card-label">DESTINATION</p>
                    <h3>{request.destination}</h3>
                  </div>

                  <span className={`manage-status ${
                    request.status?.toLowerCase()
                  }`}>
                    {request.status}
                  </span>
                </div>

                <div className="manage-student-info">
                  <div>
                    <span>Student Name</span>
                    <strong>{request.studentName || 'Student'}</strong>
                  </div>

                  <div>
                    <span>Email Address</span>
                    <strong>{request.studentEmail || 'Not available'}</strong>
                  </div>
                </div>

                <div className="manage-reason">
                  <span>Reason for Leaving</span>
                  <p>{request.reason || 'No reason specified'}</p>
                </div>

                <div className="manage-date-grid">
                  <div>
                    <span>Departure Date</span>
                    <strong>{request.departureDate}</strong>
                  </div>

                  <div>
                    <span>Expected Return</span>
                    <strong>{request.expectedReturnDate}</strong>
                  </div>
                </div>

                {request.status === 'PENDING' && (
                  <div className="manage-leave-actions">
                    <button
                      className="manage-approve-btn"
                      onClick={() => updateStatus(request.id, 'APPROVED')}
                      disabled={updatingId === request.id}
                    >
                      {updatingId === request.id ? 'Please wait...' : '✓ Approve'}
                    </button>

                    <button
                      className="manage-reject-btn"
                      onClick={() => updateStatus(request.id, 'REJECTED')}
                      disabled={updatingId === request.id}
                    >
                      {updatingId === request.id ? 'Please wait...' : '✕ Reject'}
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

export default ManageLeaveRequests

