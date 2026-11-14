
import { useEffect, useState } from 'react'
import Login from './pages/Login'
import Register from './pages/Register'
import Rooms from './pages/Rooms'
import Complaints from './pages/Complaints'
import Fees from './pages/Fees'
import Profile from './pages/Profile'
import ApprovedStudentIds from './pages/ApprovedStudentIds'
import LeaveRequests from './pages/LeaveRequests'
import ManageLeaveRequests from './pages/ManageLeaveRequests'
import ManageStudents from './pages/ManageStudents'
import ManageStaff from './pages/ManageStaff'
import NotificationBell from './NotificationBell'
import './App.css'

// Read information from the login token
function getTokenPayload(token) {
  try {
    return JSON.parse(
      atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))
    )
  } catch {
    return null
  }
}

function App() {
  const [currentPage, setCurrentPage] = useState('home')
  const [userRole, setUserRole] = useState('STUDENT')
  const [userEmail, setUserEmail] = useState('')

  const [dashboardRooms, setDashboardRooms] = useState([])
  const [dashboardComplaints, setDashboardComplaints] = useState([])
  const [dashboardFees, setDashboardFees] = useState([])
  const [dashboardLoading, setDashboardLoading] = useState(false)

  // Restore login after page refresh
  useEffect(() => {
    const token = localStorage.getItem('token')
    const savedRole = localStorage.getItem('role')

    if (token && savedRole) {
      const payload = getTokenPayload(token)

      if (!payload || (payload.exp && payload.exp * 1000 <= Date.now())) {
        localStorage.removeItem('token')
        localStorage.removeItem('role')
        return
      }

      setUserRole(savedRole.toUpperCase())
      setUserEmail(payload.sub || '')
      setCurrentPage('dashboard')
    }
  }, [])

  // Load dashboard information
  useEffect(() => {
    if (currentPage !== 'dashboard') return

    const loadDashboardData = async () => {
      setDashboardLoading(true)

      try {
        const token = localStorage.getItem('token')
        if (!token) return

        const payload = getTokenPayload(token)
        if (!payload) return

        const email = payload.sub

        const complaintUrl = userRole === 'STUDENT'
          ? `http://localhost:8080/api/complaints/student/${encodeURIComponent(email)}`
          : 'http://localhost:8080/api/complaints'

        const [roomsResponse, complaintsResponse] = await Promise.all([
          fetch('http://localhost:8080/api/rooms', {
            headers: { Authorization: `Bearer ${token}` }
          }),
          fetch(complaintUrl, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ])

        let fees = []

        if (userRole === 'STUDENT') {
          const feesResponse = await fetch(
            `http://localhost:8080/api/fees/student/${encodeURIComponent(email)}`,
            {
              headers: { Authorization: `Bearer ${token}` }
            }
          )

          if (!feesResponse.ok) {
            throw new Error('Unable to load fee records')
          }

          fees = await feesResponse.json()
        }

        if (!roomsResponse.ok || !complaintsResponse.ok) {
          throw new Error('Unable to load dashboard information')
        }

        setDashboardRooms(await roomsResponse.json())
        setDashboardComplaints(await complaintsResponse.json())
        setDashboardFees(fees)

      } catch (error) {
        console.error('Dashboard loading error:', error)
      } finally {
        setDashboardLoading(false)
      }
    }

    loadDashboardData()
  }, [currentPage, userRole])

  // Dashboard calculations
  const availableRooms = dashboardRooms.filter(
    room => room.status === 'Available'
  ).length

  const totalComplaints = dashboardComplaints.length

  const pendingComplaints = dashboardComplaints.filter(
    complaint => complaint.status === 'Pending'
  ).length

  const resolvedComplaints = dashboardComplaints.filter(
    complaint => complaint.status === 'Resolved'
  ).length

  const pendingFeeAmount = dashboardFees.reduce(
    (sum, fee) => sum + (Number(fee.pendingAmount) || 0),
    0
  )

  // Logout
  function handleLogout() {
    localStorage.removeItem('token')
    localStorage.removeItem('role')

    setUserRole('STUDENT')
    setUserEmail('')

    setDashboardRooms([])
    setDashboardComplaints([])
    setDashboardFees([])

    setCurrentPage('home')
  }

  // Role-specific sidebar navigation
  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '⌂' },
    { id: 'profile', label: 'My Profile', icon: '♙' },
    {
      id: 'rooms',
      label: userRole === 'STUDENT' ? 'Rooms' : 'Manage Rooms',
      icon: '▦'
    },
    {
      id: 'complaints',
      label: userRole === 'STUDENT' ? 'My Complaints' : 'Complaints',
      icon: '▤'
    },
    ...(userRole !== 'WARDEN'
      ? [{
          id: 'fees',
          label: userRole === 'ADMIN' ? 'Fee Management' : 'Fee Records',
          icon: '₹'
        }]
      : []),
    ...(userRole === 'STUDENT'
      ? [{ id: 'leave', label: 'Leave & Outing', icon: '↗' }]
      : []),
    ...(userRole !== 'STUDENT'
      ? [{
          id: 'manageLeave',
          label: 'Manage Leave Requests',
          icon: '☷'
        }]
      : []),
    ...(userRole === 'ADMIN'
      ? [
          { id: 'approvedIds', label: 'Approved Student IDs', icon: '✓' },
          { id: 'manageStudents', label: 'Manage Students', icon: '♙' },
          { id: 'manageStaff', label: 'Manage Staff', icon: '♟' }
        ]
      : [])
  ]

  const pageTitles = {
    dashboard: 'Dashboard',
    profile: 'My Profile',
    rooms: userRole === 'STUDENT' ? 'Room Information' : 'Room Management',
    complaints: 'Complaint Management',
    fees: 'Fee Management',
    leave: 'Leave & Outing Requests',
    manageLeave: 'Manage Leave Requests',
    approvedIds: 'Approved Student IDs',
    manageStudents: 'Manage Students',
    manageStaff: 'Manage Staff'
  }

  // Display selected page
  function renderPage() {
    switch (currentPage) {
      case 'profile':
        return <Profile onBack={() => setCurrentPage('dashboard')} />

      case 'rooms':
        return <Rooms onBack={() => setCurrentPage('dashboard')} />

      case 'complaints':
        return <Complaints onBack={() => setCurrentPage('dashboard')} />

      case 'fees':
        return <Fees onBack={() => setCurrentPage('dashboard')} />

      case 'leave':
        return <LeaveRequests onBack={() => setCurrentPage('dashboard')} />

      case 'manageLeave':
        return <ManageLeaveRequests onBack={() => setCurrentPage('dashboard')} />

      case 'approvedIds':
        return <ApprovedStudentIds onBack={() => setCurrentPage('dashboard')} />

      case 'manageStudents':
        return userRole === 'ADMIN'
          ? <ManageStudents onBack={() => setCurrentPage('dashboard')} />
          : <p>You are not authorized to access this page.</p>

      case 'manageStaff':
        return userRole === 'ADMIN'
          ? <ManageStaff onBack={() => setCurrentPage('dashboard')} />
          : <p>You are not authorized to access this page.</p>

      default:
        return (
          <div className="dashboard-content">

            <div className="welcome-section">
              <div>
                <p className="section-label">HOSTELHUB OVERVIEW</p>

                <h1>
                  Welcome back, {userRole === 'ADMIN'
                    ? 'Administrator'
                    : userRole === 'WARDEN'
                      ? 'Warden'
                      : 'Student'}!
                </h1>

                <p>
                  Here's an overview of your hostel activities.
                </p>
              </div>

              <div className="welcome-date">
                <span>Academic Year</span>
                <strong>2026–27</strong>
              </div>
            </div>

            {dashboardLoading ? (
              <p className="loading-message">
                Loading dashboard information...
              </p>
            ) : (
              <>
                <div className="dashboard-stats">

                  <div className="dashboard-stat-card">
                    <span className="stat-icon">▦</span>
                    <p>
                      {userRole === 'STUDENT'
                        ? 'Available Rooms'
                        : 'Total Rooms'}
                    </p>
                    <h2>
                      {userRole === 'STUDENT'
                        ? availableRooms
                        : dashboardRooms.length}
                    </h2>
                  </div>

                  <div className="dashboard-stat-card">
                    <span className="stat-icon">▤</span>
                    <p>
                      {userRole === 'STUDENT'
                        ? 'My Complaints'
                        : 'Pending Complaints'}
                    </p>
                    <h2>
                      {userRole === 'STUDENT'
                        ? totalComplaints
                        : pendingComplaints}
                    </h2>
                  </div>

                  <div className="dashboard-stat-card">
                    <span className="stat-icon">✓</span>
                    <p>
                      {userRole === 'STUDENT'
                        ? 'Pending Complaints'
                        : 'Resolved Complaints'}
                    </p>
                    <h2>
                      {userRole === 'STUDENT'
                        ? pendingComplaints
                        : resolvedComplaints}
                    </h2>
                  </div>

                  {userRole === 'STUDENT' && (
                    <div className="dashboard-stat-card">
                      <span className="stat-icon">₹</span>
                      <p>Pending Fee Amount</p>
                      <h2>
                        ₹{pendingFeeAmount.toLocaleString('en-IN')}
                      </h2>
                    </div>
                  )}

                </div>

                <div className="dashboard-lower">

                  <div className="dashboard-panel">
                    <h3>Quick Access</h3>
                    <p>Open the services available to your account.</p>

                    <div className="quick-access-grid">
                      {navigationItems
                        .filter(item =>
                          item.id !== 'dashboard' &&
                          item.id !== 'profile'
                        )
                        .map(item => (
                          <button
                            key={item.id}
                            className="quick-access-item"
                            onClick={() => setCurrentPage(item.id)}
                          >
                            <span>{item.icon}</span>
                            <strong>{item.label}</strong>
                            <small>Open section →</small>
                          </button>
                        ))}
                    </div>
                  </div>

                  <div className="dashboard-panel account-panel">
                    <h3>Account Information</h3>

                    <div className="account-detail">
                      <span>Login Email</span>
                      <strong>{userEmail || 'Not available'}</strong>
                    </div>

                    <div className="account-detail">
                      <span>Account Role</span>
                      <strong>{userRole}</strong>
                    </div>

                    <div className="account-detail">
                      <span>Portal Status</span>
                      <strong className="status-active">Active</strong>
                    </div>

                    <button
                      className="profile-link"
                      onClick={() => setCurrentPage('profile')}
                    >
                      View My Profile →
                    </button>
                  </div>

                </div>
              </>
            )}
          </div>
        )
    }
  }

  // Login page
  if (currentPage === 'login') {
    return (
      <Login
        onBack={() => setCurrentPage('home')}
        onRegister={() => setCurrentPage('register')}
        onLogin={(role) => {
          const token = localStorage.getItem('token')
          const payload = token ? getTokenPayload(token) : null

          setUserRole(role.toUpperCase())
          setUserEmail(payload?.sub || '')
          setCurrentPage('dashboard')
        }}
      />
    )
  }

  // Registration page
  if (currentPage === 'register') {
    return <Register onBack={() => setCurrentPage('login')} />
  }

  // Logged-in application layout
  if (localStorage.getItem('token') && currentPage !== 'home') {
    return (
      <div className="portal-layout">

        <aside className="portal-sidebar">

          <div className="sidebar-brand">
            <h2>Hostel<span>Hub</span></h2>
            <p>HOSTEL MANAGEMENT PORTAL</p>
          </div>

          <div className="sidebar-user">
            <div className="sidebar-avatar">
              {userRole.charAt(0)}
            </div>

            <div>
              <strong>
                {userRole === 'ADMIN'
                  ? 'Administrator'
                  : userRole === 'WARDEN'
                    ? 'Warden'
                    : 'Student'}
              </strong>
              <span>{userRole}</span>
            </div>
          </div>

          <p className="sidebar-heading">MAIN MENU</p>

          <nav className="sidebar-navigation">
            {navigationItems.map(item => (
              <button
                key={item.id}
                className={`sidebar-link ${currentPage === item.id ? 'active' : ''}`}
                onClick={() => setCurrentPage(item.id)}
              >
                <span className="sidebar-icon">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </nav>

          <div className="sidebar-footer">
            <button
              className="sidebar-link logout-link"
              onClick={handleLogout}
            >
              <span className="sidebar-icon">↪</span>
              Logout
            </button>

            <p>HostelHub © 2026</p>
          </div>

        </aside>

        <main className="portal-main">

          <header className="portal-header">
            <div>
              <p className="header-label">HOSTEL & ACCOMMODATION</p>
              <h2>{pageTitles[currentPage] || 'HostelHub Portal'}</h2>
            </div>

            <div className="header-user">

              <NotificationBell
                userRole={userRole}
                userEmail={userEmail}
                onNavigate={(page) => setCurrentPage(page)}
              />

              <button
                className="header-profile"
                onClick={() => setCurrentPage('profile')}
              >
                <span className="header-avatar">
                  {userRole.charAt(0)}
                </span>

                <span className="header-user-text">
                  <strong>{userEmail || 'User Account'}</strong>
                  <small>{userRole}</small>
                </span>
              </button>

              <button
                className="header-logout"
                onClick={handleLogout}
              >
                Logout
              </button>

            </div>
          </header>

          <section className="portal-content">
            {renderPage()}
          </section>

        </main>
      </div>
    )
  }

  // Public home page
  return (
    <div className="app">

      <nav className="navbar">
        <div className="logo">
          Hostel<span>Hub</span>
        </div>

        <div className="nav-links">
          <a href="#home">Home</a>
          <a href="#about">About</a>
          <a href="#features">Features</a>
        </div>

        <button
          className="login-btn"
          onClick={() => setCurrentPage('login')}
        >
          Login
        </button>
      </nav>

      <main className="hero" id="home">
        <div className="hero-content">

          <p className="tagline">
            A BETTER WAY TO MANAGE HOSTEL LIFE
          </p>

          <h1>
            Your Hostel,<br />
            Your Space,<br />
            <span>Our Responsibility.</span>
          </h1>

          <p className="description">
            HostelHub brings student accommodation management
            into one place. Manage rooms, stay updated with
            hostel activities and raise complaints easily.
          </p>

          <div className="hero-buttons">
            <button
              className="primary-btn"
              onClick={() => setCurrentPage('login')}
            >
              Get Started
            </button>

            <button
              className="secondary-btn"
              onClick={() =>
                document.getElementById('features')?.scrollIntoView({
                  behavior: 'smooth'
                })
              }
            >
              Explore Features
            </button>
          </div>

        </div>

        <div className="hero-info">
          <div className="info-card">
            <h3>One Platform</h3>
            <p>For students, wardens and administrators.</p>
          </div>

          <div className="info-card">
            <h3>Easy Management</h3>
            <p>Rooms, complaints and hostel records in one place.</p>
          </div>
        </div>
      </main>

      <section className="features" id="features">
        <div className="features-heading">
          <p className="tagline">WHAT WE OFFER</p>
          <h2>Everything Your Hostel Needs</h2>
          <p>
            A simple platform to make hostel management
            easier for students and staff.
          </p>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <h3>Room Management</h3>
            <p>
              Check room availability, view room details
              and manage student allocations.
            </p>
          </div>

          <div className="feature-card">
            <h3>Complaint Management</h3>
            <p>
              Submit hostel complaints and track their
              progress until they are resolved.
            </p>
          </div>

          <div className="feature-card">
            <h3>Fee Records</h3>
            <p>
              View hostel fee details and keep track
              of payment records.
            </p>
          </div>

          <div className="feature-card">
            <h3>Role-Based Dashboards</h3>
            <p>
              Separate dashboards for students,
              wardens and administrators.
            </p>
          </div>
        </div>
      </section>

      <section className="about" id="about">
        <div className="about-content">
          <p className="tagline">ABOUT HOSTELHUB</p>
          <h2>Making Hostel Life Simpler</h2>

          <p>
            Managing a hostel involves students, rooms,
            payments and everyday maintenance. HostelHub
            brings these activities together in one
            organized platform.
          </p>

          <p>
            Our goal is to make hostel-related tasks
            easier for students while helping wardens
            and administrators manage operations efficiently.
          </p>
        </div>
      </section>

      <footer>
        © 2026 HostelHub | Hostel & Accommodation Management
      </footer>

    </div>
  )
}

export default App

