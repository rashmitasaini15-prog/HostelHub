
import { useEffect, useState } from 'react'
import API_URL from '../api'

function Complaints({ onBack }) {
  const [category, setCategory] = useState('Maintenance')
  const [description, setDescription] = useState('')
  const [complaints, setComplaints] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const token = localStorage.getItem('token')
  const role = localStorage.getItem('role')

  let studentEmail = ''

  try {
    const payload = JSON.parse(
      atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))
    )
    studentEmail = payload.sub
  } catch {
    studentEmail = ''
  }

  function loadComplaints() {
    const url = role === 'STUDENT'
      ? `${API_URL}/api/complaints/student/${encodeURIComponent(studentEmail)}`
      : `${API_URL}/api/complaints`

    fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(response => {
        if (!response.ok) throw new Error('Unable to load complaints')
        return response.json()
      })
      .then(data => {
        setComplaints(data)
        setLoading(false)
        setError('')
      })
      .catch(() => {
        setError('Could not load complaints.')
        setLoading(false)
      })
  }

  useEffect(() => {
    loadComplaints()
  }, [])

  function handleSubmit(event) {
    event.preventDefault()
    setMessage('')
    setError('')

    fetch(`${API_URL}/api/complaints`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        studentEmail,
        category,
        description
      })
    })
      .then(response => {
        if (!response.ok) throw new Error('Submission failed')
        return response.json()
      })
      .then(() => {
        setMessage('Complaint submitted successfully!')
        setDescription('')
        loadComplaints()
      })
      .catch(() => {
        setError('Could not submit complaint. Please try again.')
      })
  }

  function handleStatusChange(id, status) {
    fetch(`${API_URL}/api/complaints/${id}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ status })
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`Update failed: HTTP ${response.status}`)
        }
        return response.json()
      })
      .then(updatedComplaint => {
        setComplaints(current =>
          current.map(complaint =>
            complaint.id === id ? updatedComplaint : complaint
          )
        )
      })
      .catch(error => {
        alert(error.message)
      })
  }

  return (
    <div className="complaints-page">

      <div className="complaints-header">
        <div className="complaints-heading">
          <h2>Complaint Management</h2>
          <p>
            {role === 'STUDENT'
              ? 'Submit and track your hostel complaints.'
              : 'View and monitor hostel complaints.'}
          </p>
        </div>

        <button className="complaints-back-btn" onClick={onBack}>
          ← Back to Dashboard
        </button>
      </div>

      <div className="complaints-layout">

        {role === 'STUDENT' && (
          <div className="complaint-form-card">
            <h3>Submit a Complaint</h3>

            <form onSubmit={handleSubmit}>
              <label>Complaint Category</label>

              <select
                value={category}
                onChange={event => setCategory(event.target.value)}
              >
                <option value="Maintenance">Maintenance</option>
                <option value="Cleanliness">Cleanliness</option>
                <option value="Food">Food</option>
                <option value="Electricity">Electricity</option>
                <option value="Other">Other</option>
              </select>

              <label>Describe Your Issue</label>

              <textarea
                value={description}
                onChange={event => setDescription(event.target.value)}
                placeholder="Explain your complaint here..."
                required
              />

              <button className="complaint-submit-btn" type="submit">
                Submit Complaint
              </button>
            </form>

            {message && (
              <p className="complaint-message">{message}</p>
            )}

            {error && (
              <p className="complaint-message">{error}</p>
            )}
          </div>
        )}

        <div className="complaint-history-card">
          <h3>{role === 'STUDENT' ? 'My Complaints' : 'All Hostel Complaints'}</h3>

          {loading && <p>Loading complaints...</p>}

          {!loading && !error && complaints.length === 0 && (
            <p>No complaints submitted yet.</p>
          )}

          {complaints.map(complaint => (
            <div className="complaint-item" key={complaint.id}>
              <h4>{complaint.category || 'Uncategorized'}</h4>

              <p>{complaint.description || 'No description provided.'}</p>

              {role !== 'STUDENT' && (
                <p>Student: {complaint.studentEmail}</p>
              )}

              {role === 'WARDEN' || role === 'ADMIN' ? (
                <select
                  className="complaint-status-select"
                  value={complaint.status || 'Pending'}
                  onChange={event =>
                    handleStatusChange(complaint.id, event.target.value)
                  }
                >
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                </select>
              ) : (
                <span className="complaint-status">
                  {complaint.status || 'Pending'}
                </span>
              )}
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}

export default Complaints

