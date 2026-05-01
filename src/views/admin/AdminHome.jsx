import React, { useState, useRef, useEffect } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import '../../css/adminhome.css'

const adminModules = [
  {
    id: 'finance',
    to: '/admin/finance',
    label: 'Finance & Expense Entry',
    desc: 'Record transactions, manage budgets and expenditure logs.',
    icon: '₹',
    accent: 'teal',
  },
  {
    id: 'events',
    to: '/adminEvent',
    label: 'Event Update',
    desc: 'Create, edit and publish upcoming NEMSU events.',
    icon: '◈',
    accent: 'orange',
  },
  {
    id: 'notice',
    to: '/admin/notice',
    label: 'Notice Upload',
    desc: 'Post official notices and announcements to the portal.',
    icon: '⊞',
    accent: 'teal',
  },
  {
    id: 'export',
    to: '/admin/export',
    label: 'Export Files & Datasheets',
    desc: 'Download reports, member lists and financial datasheets.',
    icon: '↓',
    accent: 'orange',
  },
]

function AdminHome() {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)
  const navigate = useNavigate()

  // ✅ CORRECT logout for your login system
  const handleLogout = () => {
    // remove stored auth data
    localStorage.removeItem('nemsu_token')
    localStorage.removeItem('nemsu_admin')

    // close menu
    setMenuOpen(false)

    // redirect to login page
    navigate('/admin')
  }

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="adminHomeContainer">

      <div className="adminNavbar">
        <div className="adminHeadingContainer">
          <span className="adminBadge">Admin</span>
          <h2 className="adminHeading">Control Panel</h2>
        </div>

        <div className="adminProfileWrapper" ref={menuRef}>
          <button
            className={`adminProfileBtn ${menuOpen ? 'open' : ''}`}
            onClick={() => setMenuOpen(prev => !prev)}
          >
            <div className="adminProfilePic">
              <img src="" alt="Admin" className="displayprofile" />
              <span className="adminProfileInitial">A</span>
            </div>
            <span className="adminProfileChevron">▾</span>
          </button>

          <div className={`hiddenMenu ${menuOpen ? 'visible' : ''}`}>
            <div className="hiddenMenuArrow" />

            <NavLink
              to="/admin/change-password"
              className="menu"
              onClick={() => setMenuOpen(false)}
            >
              <span className="menuIcon">🔑</span>
              Change Password
            </NavLink>

            <div className="menuDivider" />

            {/* ✅ FIXED LOGOUT */}
            <button
              className="menu menuDanger"
              onClick={handleLogout}
              type="button"
            >
              <span className="menuIcon">⏻</span>
              Logout
            </button>

          </div>
        </div>
      </div>

      <div className="adminSectionHeader">
        <p className="adminSectionLabel">Modules</p>
        <h3 className="adminSectionTitle">What would you like to manage?</h3>
      </div>

      <div className="adLinkGrid">
        {adminModules.map((mod, i) => (
          <NavLink
            key={mod.id}
            to={mod.to}
            className={`adLinkContainer accent-${mod.accent}`}
            style={{ '--i': i }}
          >
            <div className="adLinkIcon">{mod.icon}</div>
            <div className="adLinkText">
              <span className="adminLink">{mod.label}</span>
              <span className="adLinkDesc">{mod.desc}</span>
            </div>
            <div className="adLinkArrow">→</div>
          </NavLink>
        ))}
      </div>

    </div>
  )
}

export default AdminHome