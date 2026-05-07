import React, { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import '../../css/editEvent.css'

const API_BASE = 'https://nemsu-backend.onrender.com'

function EditEvent() {

  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [savingId, setSavingId] = useState(null)
  const [deletingId, setDeletingId] = useState(null)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {

    try {

      setLoading(true)

      const res = await fetch(`${API_BASE}/admin/getEvents`)

      const data = await res.json()

      setEvents(data.data || [])

    } catch (err) {

      console.log(err)
      setError('Failed to fetch events')

    } finally {

      setLoading(false)

    }
  }

  const handleChange = (id, field, value) => {

    setEvents(prev =>
      prev.map(ev =>
        ev._id === id
          ? { ...ev, [field]: value }
          : ev
      )
    )
  }

  const handleFileChange = (id, files) => {

    setEvents(prev =>
      prev.map(ev =>
        ev._id === id
          ? { ...ev, newFiles: files }
          : ev
      )
    )
  }

  const handleSave = async (event) => {

    try {

      setSavingId(event._id)
      setMessage('')
      setError('')

      const formData = new FormData()

      formData.append('title', event.title)
      formData.append('describe', event.describe)

      if (event.newFiles) {

        for (let file of event.newFiles) {
          formData.append('images', file)
        }

      }

      const token = localStorage.getItem('nemsu_token')

      const res = await fetch(
        `${API_BASE}/admin/updateEvent/${event._id}`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`
          },
          body: formData
        }
      )

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message)
      }

      setMessage('Event updated successfully')

      fetchEvents()

    } catch (err) {

      setError(err.message)

    } finally {

      setSavingId(null)

    }
  }

  const handleDelete = async (id) => {

    const confirmDelete = window.confirm(
      'Are you sure you want to delete this event?'
    )

    if (!confirmDelete) return

    try {

      setDeletingId(id)
      setMessage('')
      setError('')

      const token = localStorage.getItem('nemsu_token')

      const res = await fetch(
        `${API_BASE}/admin/deleteEvent/${id}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message)
      }

      setEvents(prev =>
        prev.filter(ev => ev._id !== id)
      )

      setMessage('Event deleted successfully')

    } catch (err) {

      setError(err.message)

    } finally {

      setDeletingId(null)

    }
  }

  return (
    <div className="editEventPage">

      {/* TOPBAR */}
      <div className="editEventTop">

        <div>
          <p className="editEventMini">
            Admin / Events
          </p>

          <h1 className="editEventHeading">
            Edit Events
          </h1>
        </div>

        <NavLink
          to="/adminHome"
          className="dashboardBtn"
        >
          ← Admin Dashboard
        </NavLink>

      </div>

      {/* ALERTS */}
      {message && (
        <div className="editMessage successMsg">
          {message}
        </div>
      )}

      {error && (
        <div className="editMessage errorMsg">
          {error}
        </div>
      )}

      {/* LOADING */}
      {loading ? (

        <div className="editLoading">
          Loading events...
        </div>

      ) : (

        <div className="editEventGrid">

          {events.map((event, i) => (

            <div
              className="editCard"
              key={event._id}
              style={{ '--i': i }}
            >

              {/* IMAGE */}
              <div className="editImageWrap">

                <img
                  src={
                    Array.isArray(event.picUrl)
                      ? event.picUrl[0]
                      : event.picUrl
                  }
                  alt={event.title}
                  className="editImage"
                />

              </div>

              {/* BODY */}
              <div className="editCardBody">

                <label className="editLabel">
                  Event Title
                </label>

                <input
                  type="text"
                  className="editInput"
                  value={event.title}
                  onChange={(e) =>
                    handleChange(
                      event._id,
                      'title',
                      e.target.value
                    )
                  }
                />

                <label className="editLabel">
                  Description
                </label>

                <textarea
                  rows="5"
                  className="editTextarea"
                  value={event.describe}
                  onChange={(e) =>
                    handleChange(
                      event._id,
                      'describe',
                      e.target.value
                    )
                  }
                />

                <label className="editLabel">
                  Upload New Images
                </label>

                <input
                  type="file"
                  multiple
                  className="editFile"
                  onChange={(e) =>
                    handleFileChange(
                      event._id,
                      e.target.files
                    )
                  }
                />

                {/* BUTTONS */}
                <div className="editBtnRow">

                  <button
                    className="saveBtn"
                    onClick={() => handleSave(event)}
                    disabled={savingId === event._id}
                  >
                    {
                      savingId === event._id
                        ? 'Saving...'
                        : 'Save Changes'
                    }
                  </button>

                  <button
                    className="deleteBtn"
                    onClick={() => handleDelete(event._id)}
                    disabled={deletingId === event._id}
                  >
                    {
                      deletingId === event._id
                        ? 'Deleting...'
                        : 'Delete'
                    }
                  </button>

                </div>

              </div>

            </div>

          ))}

        </div>

      )}

    </div>
  )
}

export default EditEvent