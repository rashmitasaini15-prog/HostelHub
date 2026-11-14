
import { useEffect, useState } from 'react'

function NotificationBell({ userRole, userEmail, onNavigate }) {
  const [notifications, setNotifications] = useState([])
  const [isOpen, setIsOpen] = useState(false)

  const storageKey = `hostelhub_notifications_${userRole}_${userEmail}`

  useEffect(() => {
    if (!userEmail) return

    const token = localStorage.getItem('token')
    if (!token) return

    let previousData = null
    let active = true

    // Load previously saved notifications
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) || '[]')
      setNotifications(saved)
    } catch {
      setNotifications([])
    }

    function saveNotifications(updated) {
      if (!active) return

      setNotifications(updated)

      localStorage.setItem(
        storageKey,
        JSON.stringify(updated)
      )
    }

    async function checkNotifications() {
      try {
        let newData = {}

        if (userRole === 'STUDENT') {
          const response = await fetch(
            'http://localhost:8080/api/leave-requests/my',
            {
              headers: {
                Authorization: `Bearer ${token}`
              }
            }
          )

          if (!response.ok) return

          newData.leaveRequests = await response.json()
        } else {
          const [complaintsResponse, leaveResponse] = await Promise.all([
            fetch('http://localhost:8080/api/complaints', {
              headers: {
                Authorization: `Bearer ${token}`
              }
            }),
            fetch('http://localhost:8080/api/leave-requests', {
              headers: {
                Authorization: `Bearer ${token}`
              }
            })
          ])

          if (!complaintsResponse.ok || !leaveResponse.ok) return

          newData.complaints = await complaintsResponse.json()
          newData.leaveRequests = await leaveResponse.json()
        }

        if (!active) return

        // First check establishes the existing records as a baseline.
        // This prevents old requests from appearing as new notifications.
        if (previousData === null) {
          previousData = newData
          return
        }

        const savedNotifications = JSON.parse(
          localStorage.getItem(storageKey) || '[]'
        )

        const additions = []

        if (userRole === 'STUDENT') {
          const oldRequests = new Map(
            previousData.leaveRequests.map(request => [
              request.id,
              request.status
            ])
          )

          newData.leaveRequests.forEach(request => {
            const oldStatus = oldRequests.get(request.id)

            if (
              oldStatus !== request.status &&
              ['APPROVED', 'REJECTED'].includes(request.status)
            ) {
              additions.push({
                id: `leave-status-${request.id}-${request.status}`,
                title: 'Leave Request Updated',
                message: `Your leave request for ${request.destination} has been ${request.status.toLowerCase()}.`,
                type: 'leave',
                read: false,
                time: new Date().toISOString()
              })
            }
          })
        } else {
          const oldComplaintIds = new Set(
            previousData.complaints.map(item => item.id)
          )

          const oldLeaveIds = new Set(
            previousData.leaveRequests.map(item => item.id)
          )

          newData.complaints.forEach(complaint => {
            if (!oldComplaintIds.has(complaint.id)) {
              additions.push({
                id: `new-complaint-${complaint.id}`,
                title: 'New Student Complaint',
                message: `${complaint.studentEmail || 'A student'} submitted a ${complaint.category || 'complaint'}.`,
                type: 'complaint',
                read: false,
                time: new Date().toISOString()
              })
            }
          })

          newData.leaveRequests.forEach(request => {
            if (!oldLeaveIds.has(request.id)) {
              additions.push({
                id: `new-leave-${request.id}`,
                title: 'New Leave Request',
                message: `${request.studentName || request.studentEmail || 'A student'} submitted a leave request for ${request.destination}.`,
                type: 'manageLeave',
                read: false,
                time: new Date().toISOString()
              })
            }
          })
        }

        previousData = newData

        if (additions.length > 0) {
          const existingIds = new Set(
            savedNotifications.map(item => item.id)
          )

          const uniqueAdditions = additions.filter(
            item => !existingIds.has(item.id)
          )

          if (uniqueAdditions.length > 0) {
            saveNotifications(
              [...uniqueAdditions, ...savedNotifications].slice(0, 30)
            )
          }
        }
      } catch (error) {
        console.error('Notification error:', error)
      }
    }

    checkNotifications()

    // Check for new notifications every 30 seconds
    const interval = setInterval(checkNotifications, 30000)

    return () => {
      active = false
      clearInterval(interval)
    }
  }, [userRole, userEmail, storageKey])

  function toggleNotifications() {
    const nextOpen = !isOpen
    setIsOpen(nextOpen)

    if (nextOpen) {
      const updated = notifications.map(item => ({
        ...item,
        read: true
      }))

      setNotifications(updated)
      localStorage.setItem(storageKey, JSON.stringify(updated))
    }
  }

  function openNotification(notification) {
    setIsOpen(false)
    onNavigate(notification.type)
  }

  const unreadCount = notifications.filter(
    item => !item.read
  ).length

  return (
    <div className="notification-container">

      <button
        className="notification-bell"
        onClick={toggleNotifications}
        title="Notifications"
      >
        <span>♧</span>

        {unreadCount > 0 && (
          <span className="notification-count">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="notification-dropdown">

          <div className="notification-heading">
            <div>
              <h3>Notifications</h3>
              <p>
                {unreadCount > 0
                  ? `${unreadCount} unread notification(s)`
                  : 'You are all caught up'}
              </p>
            </div>

            <button
              className="notification-close"
              onClick={() => setIsOpen(false)}
            >
              ×
            </button>
          </div>

          <div className="notification-list">

            {notifications.length === 0 ? (
              <p className="notification-empty">
                No notifications yet.
              </p>
            ) : (
              notifications.map(item => (
                <button
                  key={item.id}
                  className={`notification-item ${
                    item.read ? '' : 'unread'
                  }`}
                  onClick={() => openNotification(item)}
                >
                  <span className="notification-dot"></span>

                  <span className="notification-item-content">
                    <strong>{item.title}</strong>
                    <span>{item.message}</span>
                    <small>
                      {new Date(item.time).toLocaleString()}
                    </small>
                  </span>
                </button>
              ))
            )}

          </div>
        </div>
      )}

    </div>
  )
}

export default NotificationBell

