import React, { useState, useRef, useEffect, useCallback } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import '../../css/adminhome.css'

// ─── API base — swap in your real URL ───────────────────────
const API_BASE = 'YOUR_API_URL_HERE'  // e.g. https://nemsu-backend.onrender.com

const adminModules = [
  {
    id: 'finance',
    to: '/adminFinance',
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

// ─── Message Panel ────────────────────────────────────────────
function MessagePanel({ onClose, onMarkRead }) {
  const [messages, setMessages] = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)
  const [expanded, setExpanded] = useState(null)

  useEffect(() => {
    async function fetchMessages() {
      try {
        setLoading(true)
        const token = localStorage.getItem('nemsu_token')
        const res = await fetch(`${API_BASE}/messages/get`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) throw new Error(`Server error ${res.status}`)
        const data = await res.json()
        setMessages(Array.isArray(data) ? data : data.data ?? data.messages ?? [])
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchMessages()
  }, [])

  const markRead = async (msg) => {
    if (msg.read) return
    try {
      const token = localStorage.getItem('nemsu_token')
      await fetch(`${API_BASE}/messages/read/${msg._id}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      })
      setMessages(prev => prev.map(m => m._id === msg._id ? { ...m, read: true } : m))
      onMarkRead()
    } catch (_) {}
  }

  const handleExpand = (msg) => {
    setExpanded(prev => (prev === msg._id ? null : msg._id))
    markRead(msg)
  }

  const fmtTime = (d) => {
    const diff = Date.now() - new Date(d)
    if (diff < 60000)    return 'just now'
    if (diff < 3600000)  return `${Math.floor(diff / 60000)}m ago`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
    return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
  }

  return (
    <div className="msgPanel">
      {/* Panel header */}
      <div className="msgPanelHeader">
        <div>
          <p className="msgPanelLabel">Admin / Inbox</p>
          <h3 className="msgPanelTitle">Messages</h3>
        </div>
        <button className="msgPanelClose" onClick={onClose} aria-label="Close messages">✕</button>
      </div>

      <div className="msgPanelBody">
        {/* Loading skeletons */}
        {loading && (
          <div className="msgSkeletonWrap">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="msgSkeleton" style={{ '--i': i }} />
            ))}
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="msgState">
            <span className="msgStateIcon msgStateErr">⚠</span>
            <p className="msgStateText">Failed to load messages</p>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && messages.length === 0 && (
          <div className="msgState">
            <span className="msgStateIcon">✉</span>
            <p className="msgStateText">No messages yet</p>
          </div>
        )}

        {/* Message list */}
        {!loading && !error && messages.map((msg, i) => (
          <div
            key={msg._id}
            className={`msgItem ${!msg.read ? 'msgUnread' : ''} ${expanded === msg._id ? 'msgExpanded' : ''}`}
            onClick={() => handleExpand(msg)}
            style={{ '--i': i }}
          >
            {!msg.read && <span className="msgUnreadDot" aria-label="Unread" />}

            <div className="msgItemTop">
              <div className="msgAvatar">
                {(msg.senderName?.charAt(0) ?? '?').toUpperCase()}
              </div>
              <div className="msgItemMeta">
                <span className="msgSender">{msg.senderName}</span>
                <span className="msgEmail">{msg.email}</span>
              </div>
              <span className="msgTime">{fmtTime(msg.createdAt)}</span>
            </div>

            <p className={`msgText ${expanded === msg._id ? '' : 'msgTextClamp'}`}>
              {msg.message}
            </p>

            {expanded === msg._id && (
              <div className="msgReadTag">
                {msg.read ? '✓ Read' : '✓ Marked as read'}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────
function AdminHome() {
  const [menuOpen, setMenuOpen]         = useState(false)
  const [msgPanelOpen, setMsgPanelOpen] = useState(false)
  const [unreadCount, setUnreadCount]   = useState(0)

  const menuRef  = useRef(null)
  const msgRef   = useRef(null)
  const navigate = useNavigate()

  // Fetch unread message count
  useEffect(() => {
    async function fetchUnread() {
      try {
        const token = localStorage.getItem('nemsu_token')
        const res = await fetch(`${API_BASE}/messages/unread-count`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) return
        const data = await res.json()
        setUnreadCount(data.count ?? data.unreadCount ?? 0)
      } catch (_) {}
    }
    fetchUnread()
  }, [])

  const handleMarkRead = useCallback(() => {
    setUnreadCount(c => Math.max(0, c - 1))
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('nemsu_token')
    localStorage.removeItem('nemsu_admin')
    setMenuOpen(false)
    navigate('/admin')
  }

  // Close profile menu on outside click
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Close message panel on outside click
  useEffect(() => {
    const handler = (e) => {
      if (msgRef.current && !msgRef.current.contains(e.target)) setMsgPanelOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div className="adminHomeContainer">

      {/* ══ Navbar ══ */}
      <div className="adminNavbar">
        <div className="adminHeadingContainer">
          <span className="adminBadge">Admin</span>
          <h2 className="adminHeading">Control Panel</h2>
        </div>

        <div className="adminNavRight">

          {/* Message icon + panel */}
          <div className="msgIconWrapper" ref={msgRef}>
            <button
              className={`msgIconBtn ${msgPanelOpen ? 'msgIconActive' : ''}`}
              onClick={() => setMsgPanelOpen(prev => !prev)}
              aria-label={`Messages${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
            >
              {/* Envelope SVG */}
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="1.8"
                strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>

              {/* Unread count badge */}
              {unreadCount > 0 && (
                <span className="msgBadge" aria-hidden="true">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>

            {msgPanelOpen && (
              <MessagePanel
                onClose={() => setMsgPanelOpen(false)}
                onMarkRead={handleMarkRead}
              />
            )}
          </div>

          {/* Profile dropdown */}
          <div className="adminProfileWrapper" ref={menuRef}>
            <button
              className={`adminProfileBtn ${menuOpen ? 'open' : ''}`}
              onClick={() => setMenuOpen(prev => !prev)}
              aria-label="Profile menu"
              aria-expanded={menuOpen}
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
              <button className="menu menuDanger" onClick={handleLogout} type="button">
                <span className="menuIcon">⏻</span>
                Logout
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* ══ Section heading ══ */}
      <div className="adminSectionHeader">
        <p className="adminSectionLabel">Modules</p>
        <h3 className="adminSectionTitle">What would you like to manage?</h3>
      </div>

      {/* ══ Module cards ══ */}
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