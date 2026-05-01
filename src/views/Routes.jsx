import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

import Header      from './presets/Header'
import Footer      from './presets/Footer'
import Home        from './Home'
import About       from './About'
import Event       from './Event'
import AdminLogin  from './admin/AdminLogin'
import AdminHome   from './admin/AdminHome'
import EventUpload from './admin/EventUpload'
// import other admin pages here…

import ProtectedRoute from './admin/ProtectedRoute'

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ── Public routes ── */}
        <Route path="/" element={<><Header /><Home /><Footer /></>} />
        <Route path="/about"   element={<><Header /><About /><Footer /></>} />
        <Route path="/events"  element={<><Header /><Event /><Footer /></>} />

        {/* ── Admin login (public) ── */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* ── Protected admin routes ── */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminHome />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/events"
          element={
            <ProtectedRoute>
              <EventUpload />
            </ProtectedRoute>
          }
        />
        {/* Add more protected routes the same way:
        <Route
          path="/admin/finance"
          element={<ProtectedRoute><Finance /></ProtectedRoute>}
        />
        */}

        {/* ── Fallback ── */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </BrowserRouter>
  )
}

export default App