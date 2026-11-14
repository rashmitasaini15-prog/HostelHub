
import { useEffect, useState } from 'react'
import API_URL from '../api'
import './LeaveRequests.css'

function LeaveRequests({ onBack }) {
  const [requests, setRequests] = useState([])
  const [destination, setDestination] = useState('')
  const [reason, setReason] = useState('')
  const [departureDate, setDepartureDate] = useState('')
  const [expectedReturnDate, setExpectedReturnDate] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)

  const token = localStorage.getItem('token')

  async function fetchRequests() {
    try {
      const response = await fetch(
        `${API_URL}/api/leave-requests/my`,
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
    } catch (error) {
      setMessage(error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRequests()
  }, [])

  async function handleSubmit(event) {
    event.preventDefault()
    setMessage('')

    if (!destination.trim() || !departureDate || !expectedReturnDate) {
      setMessage('Please fill in all required fields')
      return
    }

    if (expectedReturnDate < departureDate) {
      setMessage('Return date cannot be before departure date')
      return
    }

    try {
      const response = await fetch(
        `${API_URL}/api/leave-requests`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            destination,
            reason,
            departureDate,
            expectedReturnDate
          })
        }
      )

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(errorText || 'Unable to submit request')
      }

      setDestination('')
      setReason('')
      setDepartureDate('')
      setExpectedReturnDate('')
      setMessage('Leave request submitted successfully!')

      await fetchRequests()
    } catch (error) {
      setMessage(error.message)
    }
  }

  return (
    <div className="leave-page">

      <button className="leave-back-btn" onClick={onBack}>
        ← Back to Dashboard
      </button>

      <div className="leave-header">
        <p className="leave-tagline">STUDENT SERVICES</p>
        <h2>Leave & Outing Requests</h2>
        <p>Plan your time away and keep track of your leave applications.</p>
      </div>

      <div className="leave-layout">

        <div className="leave-form-card">
          <div className="leave-card-heading">
            <h3>Submit a New Request</h3>
            <p>Enter your travel details below.</p>
          </div>

          <form onSubmit={handleSubmit} className="leave-form">

            <div className="leave-field">
              <label>Destination *</label>
              <input
                type="text"
                placeholder="Where are you going?"
                value={destination}
                onChange={(event) => setDestination(event.target.value)}
                required
              />
            </div>

            <div className="leave-field">
              <label>Reason for Leaving</label>
              <textarea
                placeholder="Enter the reason for your leave..."
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                rows="3"
              />
            </div>

            <div className="leave-date-grid">
              <div className="leave-field">
                <label>Departure Date *</label>
                <input
                  type="date"
                  value={departureDate}
                  onChange={(event) => setDepartureDate(event.target.value)}
                  required
                />
              </div>

              <div className="leave-field">
                <label>Expected Return Date *</label>
                <input
                  type="date"
                  value={expectedReturnDate}
                  onChange={(event) => setExpectedReturnDate(event.target.value)}
                  min={departureDate || undefined}
                  required
                />
              </div>
            </div>

            <button type="submit" className="leave-submit-btn">
              Submit Leave Request
            </button>

          </form>

          {message && (
            <p className={`leave-message ${
              message.includes('successfully') ? 'success' : 'error'
            }`}>
              {message}
            </p>
          )}
        </div>

        <div className="leave-history-card">
          <div className="leave-card-heading">
            <h3>My Leave Requests</h3>
            <p>View the status of your applications.</p>
          </div>

          {loading ? (
            <p className="leave-empty">Loading requests...</p>
          ) : requests.length === 0 ? (
            <p className="leave-empty">
              You have not submitted any leave requests yet.
            </p>
          ) : (
            <div className="leave-request-list">
              {requests.map((request) => (
                <div className="leave-request-item" key={request.id}>
                  <div className="leave-request-top">
                    <h4>{request.destination}</h4>
                    <span className={`leave-status ${
                      request.status?.toLowerCase()
                    }`}>
                      {request.status}
                    </span>
                  </div>

                  <p className="leave-reason">
                    {request.reason || 'No reason specified'}
                  </p>

                  <div className="leave-dates">
                    <div>
                      <span>Departure</span>
                      <strong>{request.departureDate}</strong>
                    </div>
                    <div>
                      <span>Expected Return</span>
                      <strong>{request.expectedReturnDate}</strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}

export default LeaveRequests

