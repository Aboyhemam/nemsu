import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { NavLink } from 'react-router-dom'
import "./../css/home.css"

import pic      from "../assets/pictures/IMG-20260422-WA0075.jpg"
import sunPic   from "../assets/pictures/SUN.jpg"
import neristPic from "../assets/pictures/NERIST.png"
import pic1     from "../assets/pictures/pic1.jpg"

import flag1 from "../assets/pictures/flags/flag1.jpg"
import flag2 from "../assets/pictures/flags/flag2.jpg"
import flag3 from "../assets/pictures/flags/flag3.jpg"
import flag4 from "../assets/pictures/flags/flag4.jpg"
import flag5 from "../assets/pictures/flags/flag5.jpg"
import flag6 from "../assets/pictures/flags/flag6.png"
import ph1 from "../assets/pictures/Gallery/1.jpg"
import ph2 from "../assets/pictures/Gallery/2.jpg"
import ph3 from "../assets/pictures/Gallery/3.JPG"
import ph4 from "../assets/pictures/Gallery/4.jpg"
import ph5 from "../assets/pictures/Gallery/5.JPG"
import ph6 from "../assets/pictures/Gallery/6.jpg"
import ph7 from "../assets/pictures/Gallery/7.jpg"

const FLAGS = [flag1, flag2, flag3, flag4, flag5, flag6]

const SECTIONS = [
  {
    id: 1, photo: pic, alt: "NEMSU group photo",
    topic: "NEMSU",
    text: "The Nerist Manipur Students' Union (NEMSU) is a student-driven organization established to promote the welfare, unity, and overall development of Manipuri students at NERIST. Rooted in the values of community support and cultural identity, NEMSU serves as a platform for students to connect, collaborate, and address their academic and social needs. Guided by its motto, Learn, Unity and Peace, the union strives to foster a harmonious environment where students can grow intellectually, support one another, and contribute positively to campus life.",
  },
  {
    id: 2, photo: neristPic, alt: "NERIST campus",
    topic: "NERIST",
    text: "North Eastern Regional Institute of Science and Technology, located in Nirjuli, Arunachal Pradesh, is one of the leading technical and educational institutions in Northeast India, known for its diverse student community and multidisciplinary education system. Students from different states of the region come together at NERIST, creating a vibrant atmosphere of cultural exchange and mutual understanding. Within this diverse environment, NEMSU plays an important role in promoting the traditions, values, and unity of the Manipuri student community while maintaining strong cooperation with other student bodies on campus.",
  },
  {
    id: 3, photo: sunPic, alt: "Student Union of NERIST",
    topic: "Student Union of NERIST",
    text: "The Student Union of NERIST (SUN) is the apex student representative body of the North Eastern Regional Institute of Science and Technology. Established with the aim of safeguarding student interests and promoting unity among the diverse student community, SUN plays a vital role in maintaining harmony, discipline, and cooperation within the institute. It acts as a bridge between the students and the administration, addressing academic, cultural, and welfare-related concerns while also organizing major events, activities, and student initiatives throughout the academic year.",
  },
  {
    id: 4, photo: pic1, alt: "NEMSU under SUN",
    topic: "NEMSU Under SUN",
    text: "The NERIST Manipur Students' Union is one of the recognized constituent student bodies functioning under SUN. It represents the students from Manipur studying at NERIST and actively participates in the social, cultural, and academic activities of the institute. Under the umbrella of SUN, the union works to preserve and promote the cultural heritage and identity of Manipuri students while contributing to the overall welfare and development of the student community at NERIST.",
  },
]

// ── Gallery data — add/remove items freely ───────────────────
// Each entry: { src, caption }
const GALLERY = [
  { src: ph1,      caption: "General Freshers Meet 2024 — Thougal Jagoi" },
  { src: ph2,      caption: "Tadar Eachu 2023 — Nemsu audience" },
  { src: ph3,      caption: "Picnic 2023 — " },
  { src: ph4,      caption: "NERIST Foundation Day 2024 — " },
  { src: ph5,      caption: "Picnic 2023 — Thabal" },
  { src: ph6,      caption: "Tadar Eachu 2023 — Champion" },
  { src: ph7,      caption: "AIFO 5.0 — " },
]

// ── Helpers ──────────────────────────────────────────────────
const isNew   = (d) => (Date.now() - new Date(d)) / 86_400_000 <= 7
const fmtDate = (d) => new Date(d).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' })

// ── Notice Board ─────────────────────────────────────────────
function NoticeBoard({ notices, loading, error }) {
  if (loading)
    return (
      <div className="noticeBoardBody">
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className="noticeSkeleton" style={{ '--i': i }} />
        ))}
      </div>
    )

  if (error)
    return (
      <div className="noticeState">
        <span className="noticeStateIcon noticeStateErr">⚠</span>
        <p className="noticeStateText">Could not load notices</p>
      </div>
    )

  if (!notices.length)
    return (
      <div className="noticeState">
        <span className="noticeStateIcon">📋</span>
        <p className="noticeStateText">No notices posted yet</p>
      </div>
    )

  return (
    <div className="noticeBoardBody">
      {notices.map((n, i) => (
        <a key={n._id ?? i} href={n.fileUrl} target="_blank" rel="noopener noreferrer"
          className="noticeItem" style={{ '--i': i }}>
          <span className="noticePinDot" />
          <div className="noticeContent">
            <div className="noticeTitleRow">
              <span className="noticeTitle">{n.title}</span>
              {isNew(n.createdAt) && <span className="noticeBadgeNew">NEW</span>}
            </div>
            <span className="noticeDate">{fmtDate(n.createdAt)}</span>
          </div>
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

// ── Gallery Section ───────────────────────────────────────────
function Gallery() {
  const [active, setActive] = useState(0)

  const prev = useCallback(() => setActive(i => (i - 1 + GALLERY.length) % GALLERY.length), [])
  const next = useCallback(() => setActive(i => (i + 1) % GALLERY.length), [])

  // Keyboard nav
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'ArrowLeft')  prev()
      if (e.key === 'ArrowRight') next()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [prev, next])

  return (
    <section className="gallerySectionWrap" aria-label="NEMSU Photo Gallery">

      {/* Heading */}
      <div className="galleryHeading">
        <p className="galleryLabel">NEMSU</p>
        <h2 className="galleryTitle">Photo Gallery</h2>
        <div className="galleryRule" />
      </div>

      {/* Main viewer */}
      <div className="galleryViewer">

        {/* Counter */}
        <span className="galleryCounter">{active + 1} / {GALLERY.length}</span>

        {/* Images — all stacked, only active visible */}
        {GALLERY.map((item, i) => (
          <img
            key={i}
            src={item.src}
            alt={item.caption}
            className={`galleryMainImg ${i === active ? 'galleryMainActive' : ''}`}
            loading="lazy"
          />
        ))}

        {/* Prev / Next */}
        <button className="galleryNavBtn galleryNavPrev" onClick={prev} aria-label="Previous">‹</button>
        <button className="galleryNavBtn galleryNavNext" onClick={next} aria-label="Next">›</button>

        {/* Caption bar */}
        <div className="galleryCaptionBar">
          <p className="galleryCaptionText">{GALLERY[active].caption}</p>
        </div>
      </div>

      {/* Thumbnail strip */}
      <div className="galleryStrip">
        {GALLERY.map((item, i) => (
          <button
            key={i}
            className={`galleryStripThumb ${i === active ? 'galleryStripActive' : ''}`}
            onClick={() => setActive(i)}
            aria-label={`Photo ${i + 1}`}
            style={{ '--ti': i }}
          >
            <img src={item.src} alt="" className="galleryStripImg" loading="lazy" />
          </button>
        ))}
      </div>

    </section>
  )
}

// ── Main ─────────────────────────────────────────────────────
function Home() {
  const [notices, setNotices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  useEffect(() => {
    const ctrl = new AbortController()
    ;(async () => {
      try {
        setLoading(true); setError(null)
        const res  = await fetch('https://nemsu-backend.onrender.com/admin/getNotice', { signal: ctrl.signal })
        if (!res.ok) throw new Error(`Server error ${res.status}`)
        const data = await res.json()
        const list = (Array.isArray(data) ? data : data.data ?? [])
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        setNotices(list)
      } catch (e) {
        if (e.name !== 'AbortError') setError(e.message)
      } finally { setLoading(false) }
    })()
    return () => ctrl.abort()
  }, [])

  const newCount     = useMemo(() => notices.filter(n => isNew(n.createdAt)).length, [notices])
  const tickerFlags  = useMemo(() => [...FLAGS, ...FLAGS, ...FLAGS], [])

  return (
    <div className="homeBody">

      {/* ══ FLAG TICKER ══ */}
      <div className="flagTicker" aria-hidden="true">
        <div className="flagTrack">
          {tickerFlags.map((flag, i) => (
            <div className="flagItem" key={i}>
              <img src={flag} alt="" className="flagImage" loading="lazy" />
            </div>
          ))}
        </div>
      </div>

      {/* ══ HERO HEADING ══ */}
      <div className="heading">
        <h2 className="name">Nerist Manipur Students' Union</h2>
        <p className="motoText">Learn Unity and Peace</p>
      </div>

      {/* NEE Selected and Waiting List Register */}
      <div className="registerContainer">
       <div className="registerLink">
        <div className="formLinkHeader">
          <h2 className="linkHeader">Alert for candidates who appeared NEE 2026</h2>
        </div>
        <p className="rLink">
           All candidates from Manipur, including Manipuri candidates from other states, who are selected or placed on the waiting list for NEE, are requested to sign up using this form so that we can assist you.
        </p>

        <NavLink to="/neeRegister" className="formLink">
          Fill Up the Form Here
        </NavLink>
       </div>
      </div>
      {/* ══ NOTICE BOARD ══ */}
      <section className="noticeSectionWrap" aria-label="Notice board">
        <div className="noticeBoardContainer">
          <div className="noticeBoardHeader">
            <div className="noticeBoardTitleRow">
              <div className="noticeBoardTitleLeft">
                <svg className="noticePinIcon" width="16" height="16" viewBox="0 0 24 24"
                  fill="none" stroke="currentColor" strokeWidth="2.2"
                  strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="17" x2="12" y2="22"/>
                  <path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z"/>
                </svg>
                <h3 className="noticeBoardTitle">Notice Board</h3>
              </div>
              <div className="noticeBoardMeta">
                {newCount > 0 && <span className="noticeBoardNewCount">{newCount} new</span>}
                {!loading && <span className="noticeBoardTotal">{notices.length} notices</span>}
              </div>
            </div>
            <p className="noticeBoardSub">
              Official announcements &amp; circulars — click any notice to view the file
            </p>
          </div>
          <NoticeBoard notices={notices} loading={loading} error={error} />
        </div>
      </section>

      {/* ══ ABOUT / SUN SECTIONS ══ */}
      <section className="sunSectionWrap" aria-label="About NEMSU and SUN">
        {SECTIONS.map((s, i) => (
          <article key={s.id}
            className={`sunRow ${i % 2 === 0 ? 'sunRowImgLeft' : 'sunRowImgRight'}`}
            style={{ '--si': i }}>
            <div className="sunImgWrap">
              <div className={`sunImgFrame ${i % 2 === 0 ? 'frameLeft' : 'frameRight'}`}>
                <img src={s.photo} alt={s.alt} className="sunImg" loading="lazy" />
              </div>
            </div>
            <div className="sunTextWrap">
              <span className="sunCounter" aria-hidden="true">0{s.id}</span>
              <div className="sunCard">
                <p className="sunTopic">{s.topic}</p>
                <p className="sunText">{s.text}</p>
              </div>
            </div>
          </article>
        ))}
      </section>

      {/* ══ GALLERY ══ */}
      <Gallery />

    </div>
  )
}

export default Home