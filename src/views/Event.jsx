import React, { useState, useEffect } from 'react'
import "../css/event.css"

// ─── Single event card with its own independent gallery state ─
function EventCard({ event, index }) {
  const [activeIndex, setActiveIndex] = useState(0)

  // picUrl can be a single string or an array of strings
  const images = Array.isArray(event.picUrl)
    ? event.picUrl
    : event.picUrl
    ? [event.picUrl]
    : []

  const prev = () =>
    setActiveIndex(i => (i - 1 + images.length) % images.length)
  const next = () =>
    setActiveIndex(i => (i + 1) % images.length)

  const isEven = index % 2 === 0

  return (
    <div
      className={`event ${isEven ? 'eventRight' : 'eventLeft'}`}
      style={{ '--delay': `${index * 0.1}s` }}
    >

      {/* ── Gallery ── */}
      <div className="galleryWrap">
        <div className="galleryView">

          <div className="mainIndex">
            {images.length > 0 ? `${activeIndex + 1} / ${images.length}` : ''}
          </div>

          {images.length > 0 ? (
            images.map((url, i) => (
              <img
                key={i}
                src={url}
                alt={`${event.title} — photo ${i + 1}`}
                className={`viewimg ${i === activeIndex ? 'active' : ''}`}
              />
            ))
          ) : (
            <div className="noImagePlaceholder">No images available</div>
          )}

          {images.length > 1 && (
            <>
              <button
                className="galleryArrow galleryArrowPrev"
                onClick={prev}
                aria-label="Previous image"
              >‹</button>
              <button
                className="galleryArrow galleryArrowNext"
                onClick={next}
                aria-label="Next image"
              >›</button>
            </>
          )}
        </div>

        {/* Thumbnails — only when multiple images exist */}
        {images.length > 1 && (
          <div className="gallery">
            {images.map((url, i) => (
              <div
                key={i}
                className={`eventImgContainer ${i === activeIndex ? 'active' : ''}`}
                onClick={() => setActiveIndex(i)}
              >
                <div className="imgContent">
                  <img src={url} alt="" className="imgEvent" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Text ── */}
      <div className="eventAbout">
        <div className="eventTitle">
          <h3 className="titleText">{event.title}</h3>
        </div>
        <div className="eventDescript">
          <div className="descripttext">
            <p className="textEvent">{event.describe}</p>
          </div>
        </div>
      </div>

    </div>
  )
}

// ─── Skeleton placeholder card ────────────────────────────────
function SkeletonCard() {
  return (
    <div className="event skeletonCard">
      <div className="galleryWrap">
        <div className="galleryView skeletonBox" />
        <div className="gallery">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="eventImgContainer skeletonThumb" />
          ))}
        </div>
      </div>
      <div className="eventAbout">
        <div className="skeletonLine skeletonTitle" />
        <div className="skeletonLine" />
        <div className="skeletonLine" />
        <div className="skeletonLine skeletonShort" />
      </div>
    </div>
  )
}

// ─── Main Events page ─────────────────────────────────────────
function Event() {
  const [events, setEvents]   = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  useEffect(() => {
    const controller = new AbortController()

    async function fetchEvents() {
      try {
        setLoading(true)
        setError(null)
        const res = await fetch('https://nemsu-backend.onrender.com/admin/getEvents', { signal: controller.signal })
        if (!res.ok) throw new Error(`Server error ${res.status}`)
        const data = await res.json()
        // Response shape: { success, count, data: [...] }
        setEvents(Array.isArray(data) ? data : data.data ?? [])
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError(err.message || 'Failed to load events.')
        }
      } finally {
        setLoading(false)
      }
    }

    fetchEvents()
    return () => controller.abort()
  }, [])

  return (
    <div className="eventContainer">

      {/* ══ Page Heading ══ */}
      <div className="eventsPageHeader">
        <p className="eventsPageLabel">NEMSU</p>
        <h1 className="eventsPageTitle">Event Updates</h1>
        <p className="eventsPageSub">
          Relive our celebrations — cultural festivals, sports meets &amp; community moments.
        </p>
        <div className="eventsPageRule" />
      </div>

      {/* ══ Loading state ══ */}
      {loading && (
        <div className="eventsList">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      )}

      {/* ══ Error state ══ */}
      {!loading && error && (
        <div className="eventStateBox">
          <div className="eventStateIcon eventStateIconError">⚠</div>
          <h3 className="eventStateTitle">Could not load events</h3>
          <p className="eventStateMsg">{error}</p>
          <button className="eventStateBtn" onClick={() => window.location.reload()}>
            Try Again
          </button>
        </div>
      )}

      {/* ══ Empty state ══ */}
      {!loading && !error && events.length === 0 && (
        <div className="eventStateBox">
          <div className="eventStateIcon">◈</div>
          <h3 className="eventStateTitle">No events published yet</h3>
          <p className="eventStateMsg">
            Events will appear here once they are published by the admin.
          </p>
        </div>
      )}

      {/* ══ Event cards ══ */}
      {!loading && !error && events.length > 0 && (
        <div className="eventsList">
          {events.map((event, i) => (
            <EventCard key={event._id ?? i} event={event} index={i} />
          ))}
        </div>
      )}

    </div>
  )
}

export default Event