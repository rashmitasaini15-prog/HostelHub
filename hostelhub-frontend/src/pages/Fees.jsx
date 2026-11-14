
import { useEffect, useState } from 'react'
import API_URL from '../api'

function Fees({ onBack }) {
  const [fees, setFees] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [updatingId, setUpdatingId] = useState(null)

  const role = (localStorage.getItem('role') || '').toUpperCase()

  useEffect(() => {
    const loadFees = async () => {
      try {
        const token = localStorage.getItem('token')

        const payload = JSON.parse(
          atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))
        )

        const email = payload.sub

        const url = role === 'STUDENT'
          ? `${API_URL}/api/fees/student/${encodeURIComponent(email)}`
          : `${API_URL}/api/fees`

        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })

        if (!response.ok) {
          throw new Error('Unable to load fee records')
        }

        const data = await response.json()
        setFees(data)

      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadFees()
  }, [role])

  async function markAsPaid(feeId) {
    const confirmPayment = window.confirm(
      'Have you verified this student payment?'
    )

    if (!confirmPayment) return

    try {
      setUpdatingId(feeId)
      setMessage('')
      setError('')

      const token = localStorage.getItem('token')

      const response = await fetch(
        `${API_URL}/api/fees/${feeId}/pay`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      if (!response.ok) {
        throw new Error('Unable to approve payment')
      }

      const updatedFee = await response.json()

      setFees(previousFees =>
        previousFees.map(fee =>
          fee.id === feeId ? updatedFee : fee
        )
      )

      setMessage('Payment marked as paid successfully.')

    } catch (err) {
      setError(err.message)
    } finally {
      setUpdatingId(null)
    }
  }

  const totalFee = fees.reduce((sum, fee) => sum + fee.totalFee, 0)
  const paidAmount = fees.reduce((sum, fee) => sum + fee.paidAmount, 0)
  const pendingAmount = fees.reduce((sum, fee) => sum + fee.pendingAmount, 0)

  return (
    <div className="fees-page">

      <div className="fees-header">
        <button className="fees-back-btn" onClick={onBack}>
          ← Back to Dashboard
        </button>

        <div>
          <h1>Fee Management</h1>
          <p>
            {role === 'ADMIN'
              ? 'View and manage student hostel fee records.'
              : 'View your hostel fee details and payment status.'}
          </p>
        </div>
      </div>

      {message && <p>{message}</p>}
      {error && <p>{error}</p>}

      {loading ? (
        <p>Loading fee records...</p>
      ) : fees.length === 0 ? (
        <p>No fee records found.</p>
      ) : (
        <>
          <div className="fees-summary">

            <div className="fee-summary-card">
              <h3>Total Fee</h3>
              <h2>₹{totalFee.toLocaleString('en-IN')}</h2>
            </div>

            <div className="fee-summary-card">
              <h3>Paid Amount</h3>
              <h2>₹{paidAmount.toLocaleString('en-IN')}</h2>
            </div>

            <div className="fee-summary-card">
              <h3>Pending Amount</h3>
              <h2>₹{pendingAmount.toLocaleString('en-IN')}</h2>
            </div>

          </div>

          <div className="fees-record-card">
            <h2>Fee Records</h2>

            {fees.map((fee) => (
              <div className="fee-record" key={fee.id}>

                <div>
                  {role !== 'STUDENT' && (
                    <p>Student: {fee.studentEmail}</p>
                  )}
                  <h3>Room {fee.roomNumber}</h3>
                  <p>Due Date: {fee.dueDate}</p>
                </div>

                <div>
                  <p>Total: ₹{fee.totalFee}</p>
                  <p>Paid: ₹{fee.paidAmount}</p>
                  <p>Pending: ₹{fee.pendingAmount}</p>
                </div>

                <div>
                  <span className="fee-status">
                    {fee.status}
                  </span>

                  {role === 'ADMIN' &&
                    fee.status?.toLowerCase() !== 'paid' && (
                      <button
                        onClick={() => markAsPaid(fee.id)}
                        disabled={updatingId === fee.id}
                      >
                        {updatingId === fee.id
                          ? 'Updating...'
                          : 'Mark as Paid'}
                      </button>
                    )}
                </div>

              </div>
            ))}
          </div>
        </>
      )}

    </div>
  )
}

export default Fees

