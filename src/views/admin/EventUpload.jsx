import React, { useState, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import '../../css/eventupload.css'

const MAX_IMAGES = 5
const MAX_MB = 5
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

function EventUpload() {
  const navigate = useNavigate()
  const fileInputRef = useRef(null)
  const dropZoneRef = useRef(null)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [images, setImages] = useState([])   // [{ file, preview, id }]
  const [dragging, setDragging] = useState(false)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  // ── Image helpers ──────────────────────────────────────────
  const addFiles = useCallback((files) => {
    const incoming = Array.from(files)
    const valid = []
    const newErrors = {}

    incoming.forEach((file) => {
      if (!ALLOWED_TYPES.includes(file.type)) {
        newErrors.images = `"${file.name}" is not a supported image type.`
        return
      }
      if (file.size > MAX_MB * 1024 * 1024) {
        newErrors.images = `"${file.name}" exceeds ${MAX_MB}MB limit.`
        return
      }
      valid.push(file)
    })

    setImages((prev) => {
      const combined = [...prev, ...valid.map((file) => ({
        file,
        preview: URL.createObjectURL(file),
        id: `${file.name}-${Date.now()}-${Math.random()}`,
      }))]
      if (combined.length > MAX_IMAGES) {
        newErrors.images = `Maximum ${MAX_IMAGES} images allowed.`
        return combined.slice(0, MAX_IMAGES)
      }
      return combined
    })

    if (Object.keys(newErrors).length) {
      setErrors((e) => ({ ...e, ...newErrors }))
    } else {
      setErrors((e) => { const n = { ...e }; delete n.images; return n })
    }
  }, [])

  const removeImage = (id) => {
    setImages((prev) => {
      const removed = prev.find((i) => i.id === id)
      if (removed) URL.revokeObjectURL(removed.preview)
      return prev.filter((i) => i.id !== id)
    })
  }

  // ── Drag & drop ───────────────────────────────────────────
  const onDragOver = (e) => { e.preventDefault(); setDragging(true) }
  const onDragLeave = (e) => { if (!dropZoneRef.current?.contains(e.relatedTarget)) setDragging(false) }
  const onDrop = (e) => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files) }

  // ── Validation ────────────────────────────────────────────
  const validate = () => {
    const e = {}
    if (!title.trim()) e.title = 'Event title is required.'
    if (title.trim().length > 120) e.title = 'Title must be under 120 characters.'
    if (!description.trim()) e.description = 'Description is required.'
    if (description.trim().length < 20) e.description = 'Description must be at least 20 characters.'
    if (images.length === 0) e.images = 'Upload at least one image.'
    return e
  }

  // ── Submit ────────────────────────────────────────────────
  const handleSubmit = async () => {
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setErrors({})
    setSubmitting(true)

    const formData = new FormData()
    formData.append('title', title.trim())
    formData.append('describe', description.trim())
    images.forEach((img) => formData.append('images', img.file))

    try {
      const res = await fetch('https://nemsu-backend.onrender.com/admin/createEvents', {
        method: 'POST',
        body: formData,
        // Do NOT set Content-Type — browser sets it with boundary automatically
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setErrors({ submit: data.message || `Server error: ${res.status}` })
        setSubmitting(false)
        return
      }

      // Cleanup previews
      images.forEach((img) => URL.revokeObjectURL(img.preview))
      setSubmitted(true)
    } catch (err) {
      setErrors({ submit: 'Network error. Please try again.' })
      setSubmitting(false)
    }
  }

  const handleReset = () => {
    images.forEach((img) => URL.revokeObjectURL(img.preview))
    setTitle('')
    setDescription('')
    setImages([])
    setErrors({})
    setSubmitted(false)
    setSubmitting(false)
  }

  // ── Success screen ────────────────────────────────────────
  if (submitted) {
    return (
      <div className="euContainer">
        <div className="euSuccess">
          <div className="euSuccessIcon">✓</div>
          <h2 className="euSuccessTitle">Event Published!</h2>
          <p className="euSuccessMsg">Your event has been uploaded successfully.</p>
          <div className="euSuccessActions">
            <button className="euBtn euBtnPrimary" onClick={handleReset}>
              Upload Another
            </button>
            <button className="euBtn euBtnGhost" onClick={() => navigate('/adminhome')}>
              Back to Admin
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="euContainer">

      {/* ── Page Header ── */}
      <div className="euHeader">
        <div className="euHeaderLeft">
          <button className="euBackBtn" onClick={() => navigate('/adminhome')} aria-label="Go back">
            ← Back
          </button>
          <div>
            <p className="euLabel">Admin / Events</p>
            <h1 className="euTitle">Upload New Event</h1>
          </div>
        </div>
        <div className="euHeaderRight">
          <span className="euImageCount">
            {images.length} / {MAX_IMAGES} images
          </span>
        </div>
      </div>

      {/* ── Form Body ── */}
      <div className="euBody">

        {/* Left: Fields */}
        <div className="euFields">

          {/* Title */}
          <div className={`euField ${errors.title ? 'hasError' : ''}`}>
            <label className="euFieldLabel" htmlFor="event-title">
              Event Title <span className="euRequired">*</span>
            </label>
            <div className="euInputWrapper">
              <input
                id="event-title"
                type="text"
                className="euInput"
                placeholder="e.g. Fresher Meet 2025"
                value={title}
                maxLength={120}
                onChange={(e) => {
                  setTitle(e.target.value)
                  if (errors.title) setErrors((err) => { const n={...err}; delete n.title; return n })
                }}
              />
              <span className="euCharCount">{title.length}/120</span>
            </div>
            {errors.title && <p className="euError">{errors.title}</p>}
          </div>

          {/* Description */}
          <div className={`euField ${errors.description ? 'hasError' : ''}`}>
            <label className="euFieldLabel" htmlFor="event-desc">
              Description <span className="euRequired">*</span>
            </label>
            <div className="euInputWrapper">
              <textarea
                id="event-desc"
                className="euTextarea"
                placeholder="Describe the event — what it's about, who can attend, when and where it's happening…"
                value={description}
                rows={7}
                onChange={(e) => {
                  setDescription(e.target.value)
                  if (errors.description) setErrors((err) => { const n={...err}; delete n.description; return n })
                }}
              />
              <span className="euCharCount textarea">{description.length} chars</span>
            </div>
            {errors.description && <p className="euError">{errors.description}</p>}
          </div>

          {/* Submit error */}
          {errors.submit && (
            <div className="euSubmitError">
              <span>⚠</span> {errors.submit}
            </div>
          )}

          {/* Actions */}
          <div className="euActions">
            <button
              className="euBtn euBtnGhost"
              onClick={handleReset}
              disabled={submitting}
              type="button"
            >
              Clear
            </button>
            <button
              className={`euBtn euBtnPrimary ${submitting ? 'loading' : ''}`}
              onClick={handleSubmit}
              disabled={submitting}
              type="button"
            >
              {submitting ? (
                <>
                  <span className="euSpinner" />
                  Publishing…
                </>
              ) : (
                'Publish Event'
              )}
            </button>
          </div>
        </div>

        {/* Right: Images */}
        <div className="euImagePanel">
          <div className="euFieldLabel">
            Event Images <span className="euRequired">*</span>
            <span className="euFieldHint"> — up to {MAX_IMAGES}, max {MAX_MB}MB each</span>
          </div>

          {/* Drop zone */}
          <div
            ref={dropZoneRef}
            className={`euDropZone ${dragging ? 'dragging' : ''} ${errors.images ? 'hasError' : ''}`}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            onClick={() => fileInputRef.current?.click()}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
            aria-label="Upload images"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept={ALLOWED_TYPES.join(',')}
              multiple
              className="euFileInput"
              onChange={(e) => addFiles(e.target.files)}
            />
            <div className="euDropIcon">
              {dragging ? '↓' : '⊕'}
            </div>
            <p className="euDropPrimary">
              {dragging ? 'Drop images here' : 'Click or drag images here'}
            </p>
            <p className="euDropSub">JPG, PNG, WEBP, GIF</p>
          </div>

          {errors.images && <p className="euError" style={{marginTop:'8px'}}>{errors.images}</p>}

          {/* Preview grid */}
          {images.length > 0 && (
            <div className="euPreviewGrid">
              {images.map((img, idx) => (
                <div key={img.id} className="euPreviewCard">
                  {idx === 0 && <span className="euCoverBadge">Cover</span>}
                  <img src={img.preview} alt={img.file.name} className="euPreviewImg" />
                  <div className="euPreviewOverlay">
                    <span className="euPreviewName">{img.file.name}</span>
                    <span className="euPreviewSize">
                      {(img.file.size / 1024).toFixed(0)} KB
                    </span>
                  </div>
                  <button
                    className="euRemoveBtn"
                    onClick={(e) => { e.stopPropagation(); removeImage(img.id) }}
                    aria-label={`Remove ${img.file.name}`}
                    type="button"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default EventUpload