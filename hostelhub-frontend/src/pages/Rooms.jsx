
import { useEffect, useState } from 'react'

function Rooms({ onBack }) {
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const role = localStorage.getItem('role')
  const canManageRooms = role === 'ADMIN' || role === 'WARDEN'

  const [showForm, setShowForm] = useState(false)
  const [editingRoomId, setEditingRoomId] = useState(null)

  const [newRoom, setNewRoom] = useState({
    roomNumber: '',
    roomType: 'Single',
    capacity: '',
    occupied: 0,
    monthlyFee: '',
    status: 'Available'
  })

  useEffect(() => {
    const token = localStorage.getItem('token')

    fetch('http://localhost:8080/api/rooms', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Unable to load rooms')
        }
        return response.json()
      })
      .then(data => {
        setRooms(data)
        setLoading(false)
      })
      .catch(() => {
        setError('Could not load rooms. Please try again.')
        setLoading(false)
      })
  }, [])

  const handleAddRoom = async (e) => {
    e.preventDefault()

    const token = localStorage.getItem('token')

    try {
      const response = await fetch('http://localhost:8080/api/rooms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...newRoom,
          capacity: Number(newRoom.capacity),
          occupied: Number(newRoom.occupied),
          monthlyFee: Number(newRoom.monthlyFee)
        })
      })

      if (!response.ok) {
        throw new Error('Unable to add room')
      }

      const savedRoom = await response.json()

      setRooms([...rooms, savedRoom])
      setShowForm(false)

      setNewRoom({
        roomNumber: '',
        roomType: 'Single',
        capacity: '',
        occupied: 0,
        monthlyFee: '',
        status: 'Available'
      })

      alert('Room added successfully!')

    } catch (error) {
      alert('Could not add room. Please try again.')
    }
  }

  const handleDeleteRoom = async (id) => {
    const confirmDelete = window.confirm(
      'Are you sure you want to delete this room?'
    )

    if (!confirmDelete) return

    const token = localStorage.getItem('token')

    try {
      const response = await fetch(`http://localhost:8080/api/rooms/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Unable to delete room')
      }

      setRooms(rooms.filter(room => room.id !== id))
      alert('Room deleted successfully!')

    } catch (error) {
      alert('Could not delete room. Please try again.')
    }
  }

  const handleUpdateRoom = async (e) => {
    e.preventDefault()

    const token = localStorage.getItem('token')

    try {
      const response = await fetch(
        `http://localhost:8080/api/rooms/${editingRoomId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            ...newRoom,
            capacity: Number(newRoom.capacity),
            occupied: Number(newRoom.occupied),
            monthlyFee: Number(newRoom.monthlyFee)
          })
        }
      )

      if (!response.ok) {
        throw new Error('Unable to update room')
      }

      const updatedRoom = await response.json()

      setRooms(rooms.map(room =>
        room.id === editingRoomId ? updatedRoom : room
      ))

      setEditingRoomId(null)
      setShowForm(false)

      alert('Room updated successfully!')

    } catch (error) {
      alert('Could not update room. Please try again.')
    }
  }

  const startEditingRoom = (room) => {
    setNewRoom({
      roomNumber: room.roomNumber,
      roomType: room.roomType,
      capacity: room.capacity,
      occupied: room.occupied,
      monthlyFee: room.monthlyFee,
      status: room.status
    })

    setEditingRoomId(room.id)
    setShowForm(true)
  }

  const getStatusStyle = (status) => {
    if (status === 'Occupied') {
      return {
        backgroundColor: '#fee2e2',
        color: '#b91c1c'
      }
    }

    if (status === 'Available') {
      return {
        backgroundColor: '#dcfce7',
        color: '#15803d'
      }
    }

    return {
      backgroundColor: '#ffedd5',
      color: '#c2410c'
    }
  }

  return (
    <div className="rooms-page">

      <div className="rooms-header">
        <div className="rooms-heading">
          <h2>Room Management</h2>
          <p>Explore and view available hostel rooms.</p>

          <div className="rooms-count">
            {rooms.length} Rooms Listed
          </div>
        </div>

        {canManageRooms && (
          <button
            className="rooms-back-btn"
            onClick={() => {
              setEditingRoomId(null)
              setNewRoom({
                roomNumber: '',
                roomType: 'Single',
                capacity: '',
                occupied: 0,
                monthlyFee: '',
                status: 'Available'
              })
              setShowForm(true)
            }}
          >
            + Add Room
          </button>
        )}

        <button className="rooms-back-btn" onClick={onBack}>
          ← Back to Dashboard
        </button>
      </div>

      {showForm && (
        <form
          className="room-form"
          onSubmit={editingRoomId ? handleUpdateRoom : handleAddRoom}
        >
          <h3>{editingRoomId ? 'Edit Room' : 'Add New Room'}</h3>

          <input
            type="text"
            placeholder="Room Number"
            value={newRoom.roomNumber}
            onChange={(e) =>
              setNewRoom({ ...newRoom, roomNumber: e.target.value })
            }
            required
          />

          <select
            value={newRoom.roomType}
            onChange={(e) =>
              setNewRoom({ ...newRoom, roomType: e.target.value })
            }
          >
            <option value="Single">Single</option>
            <option value="Double">Double</option>
            <option value="Triple">Triple</option>
          </select>

          <input
            type="number"
            placeholder="Total Capacity"
            min="1"
            value={newRoom.capacity}
            onChange={(e) =>
              setNewRoom({ ...newRoom, capacity: e.target.value })
            }
            required
          />

          <input
            type="number"
            placeholder="Currently Occupied"
            min="0"
            value={newRoom.occupied}
            onChange={(e) =>
              setNewRoom({ ...newRoom, occupied: e.target.value })
            }
            required
          />

          <input
            type="number"
            placeholder="Monthly Fee"
            min="0"
            value={newRoom.monthlyFee}
            onChange={(e) =>
              setNewRoom({ ...newRoom, monthlyFee: e.target.value })
            }
            required
          />

          <select
            value={newRoom.status}
            onChange={(e) =>
              setNewRoom({ ...newRoom, status: e.target.value })
            }
          >
            <option value="Available">Available</option>
            <option value="Occupied">Occupied</option>
            <option value="Maintenance">Maintenance</option>
          </select>

          <button type="submit">
            {editingRoomId ? 'Update Room' : 'Save Room'}
          </button>

          <button type="button" onClick={() => setShowForm(false)}>
            Cancel
          </button>
        </form>
      )}

      {loading && (
        <div className="rooms-message">Loading rooms...</div>
      )}

      {error && (
        <div className="rooms-message">{error}</div>
      )}

      {!loading && !error && rooms.length === 0 && (
        <div className="rooms-message">No rooms available.</div>
      )}

      <div className="rooms-grid">
        {rooms.map(room => (
          <div className="room-card" key={room.id}>

            <div className="room-card-top">
              <h3>Room {room.roomNumber}</h3>

              <span
                className="room-status"
                style={{
                  ...getStatusStyle(room.status),
                  padding: '6px 12px',
                  borderRadius: '20px',
                  fontWeight: '600',
                  fontSize: '13px'
                }}
              >
                {room.status}
              </span>
            </div>

            <p className="room-type">{room.roomType}</p>

            <div className="room-details">

              <div className="room-detail">
                <span>Total Capacity</span>
                <span>{room.capacity} Students</span>
              </div>

              <div className="room-detail">
                <span>Currently Occupied</span>
                <span>{room.occupied} Students</span>
              </div>

              <div className="room-detail">
                <span>Available Beds</span>
                <span>{room.capacity - room.occupied}</span>
              </div>

            </div>

            <div className="room-fee">
              <span>Monthly Accommodation Fee</span>
              <h3>
                ₹{Number(room.monthlyFee).toLocaleString('en-IN')}
              </h3>
            </div>

            {canManageRooms && (
              <button
                className="edit-room-btn"
                onClick={() => startEditingRoom(room)}
              >
                Edit Room
              </button>
            )}

            {canManageRooms && (
              <button
                className="delete-room-btn"
                onClick={() => handleDeleteRoom(room.id)}
              >
                Delete Room
              </button>
            )}

          </div>
        ))}
      </div>

    </div>
  )
}

export default Rooms

