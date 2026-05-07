import React, { useState, useEffect } from 'react'
import Header from './presets/Header'
import "./../css/home.css"
import pic from "../assets/pictures/IMG-20260422-WA0075.jpg"

// ── Helpers ──────────────────────────────────────────────────
const isNew = (dateStr) => {
  const uploaded = new Date(dateStr)
  const now = new Date()
  const diffDays = (now - uploaded) / (1000 * 60 * 60 * 24)
  return diffDays <= 7
}

const fmtDate = (d) =>
  new Date(d).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric'
  })

// ── Notice Board Component ────────────────────────────────────
function NoticeBoard({ notices, loading, error }) {
  if (loading) {
    return (
      <div className="noticeBoardBody">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="noticeSkeleton" style={{ '--i': i }} />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="noticeState">
        <span className="noticeStateIcon noticeStateErr">⚠</span>
        <p className="noticeStateText">Could not load notices</p>
      </div>
    )
  }

  if (notices.length === 0) {
    return (
      <div className="noticeState">
        <span className="noticeStateIcon">📋</span>
        <p className="noticeStateText">No notices posted yet</p>
      </div>
    )
  }

  return (
    <div className="noticeBoardBody">
      {notices.map((notice, i) => (
        <a
          key={notice._id ?? i}
          href={notice.fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="noticeItem"
          style={{ '--i': i }}
        >
          {/* Left pin dot */}
          <span className="noticePinDot" />

          <div className="noticeContent">
            <div className="noticeTitleRow">
              <span className="noticeTitle">{notice.title}</span>
              {isNew(notice.createdAt) && (
                <span className="noticeBadgeNew">NEW</span>
              )}
            </div>
            <span className="noticeDate">{fmtDate(notice.createdAt)}</span>
          </div>

          {/* Download/open icon */}
          <span className="noticeArrow">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
              <polyline points="15 3 21 3 21 9"/>
              <line x1="10" y1="14" x2="21" y2="3"/>
            </svg>
          </span>
        </a>
      ))}
    </div>
  )
}

// ── Main Home ────────────────────────────────────────────────
function Home() {
  const [notices, setNotices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  useEffect(() => {
    const controller = new AbortController()

    async function fetchNotices() {
      try {
        setLoading(true)
        setError(null)
        const res = await fetch(
          'https://nemsu-backend.onrender.com/admin/getNotice',
          { signal: controller.signal }
        )
        if (!res.ok) throw new Error(`Server error ${res.status}`)
        const data = await res.json()
        // Accept { success, count, data: [...] } or plain array
        const list = Array.isArray(data) ? data : data.data ?? []
        // Sort newest first
        list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        setNotices(list)
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError(err.message || 'Failed to load notices.')
        }
      } finally {
        setLoading(false)
      }
    }

    fetchNotices()
    return () => controller.abort()
  }, [])

  const newCount = notices.filter(n => isNew(n.createdAt)).length

  return (
    <div className="homeBody">

      {/* ── Hero Heading ── */}
      <div className="heading">
        <div className="nemsu">
          <h2 className="name">Nerist Manipur Students' Union</h2>
        </div>
        <div className="motto">
          <h3 className="motoText">Learn Unity and Peace</h3>
        </div>
      </div>

      {/* ── Body: About + Notice Board ── */}
      <div className="bodyBody">

        {/* Left: Photo + About text */}
        <div className="bodyLeft">
          <div className="picContainer">
            <div className="pic">
              <img src={pic} alt="NEMSU" className="homePic" />
            </div>
          </div>
          <div className="textContainer">
            <div className="bodyText">
              <span className="text">
                The Nerist Manipur Students' Union (NEMSU) is a student-driven organization
                established to promote the welfare, unity, and overall development of Manipuri
                students at NERIST. Rooted in the values of community support and cultural
                identity, NEMSU serves as a platform for students to connect, collaborate, and
                address their academic and social needs. Guided by its motto, "Learn, Unity and
                Peace," the union strives to foster a harmonious environment where students can
                grow intellectually, support one another, and contribute positively to campus life.
              </span>
            </div>
          </div>
        </div>

        {/* Right: Notice Board */}
        <div className="noticeBoardContainer">
          <div className="noticeBoardHeader">
            <div className="noticeBoardTitleRow">
              <div className="noticeBoardTitleLeft">
                {/* Pin icon */}
                <svg className="noticePinIcon" width="16" height="16" viewBox="0 0 24 24"
                  fill="none" stroke="currentColor" strokeWidth="2.2"
                  strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="17" x2="12" y2="22"/>
                  <path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z"/>
                </svg>
                <h3 className="noticeBoardTitle">Notice Board</h3>
              </div>
              {newCount > 0 && (
                <span className="noticeBoardNewCount">
                  {newCount} new
                </span>
              )}
            </div>
            <p className="noticeBoardSub">Official announcements &amp; circulars</p>
          </div>

          <NoticeBoard notices={notices} loading={loading} error={error} />
        </div>

      </div>
    </div>
  )
}

export default Home