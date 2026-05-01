import React, { useEffect, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'

/**
 * ALLOWED_IPS — list of IPv4 addresses that may access admin pages.
 * Add your actual static IPs here. Leave the array empty ([]) to
 * disable IP restriction on the frontend (rely on backend only).
 *
 * NOTE: Frontend IP checks are a UX convenience, NOT a security boundary.
 * The real enforcement must live on your Express backend (see adminLogin
 * controller) where it cannot be bypassed.
 */
const ALLOWED_IPS = [
   
   
  // '203.0.113.10',   // example: hostel wifi static IP
  // '198.51.100.42',  // example: office IP
]

function isTokenValid(token) {
  if (!token) return false
  try {
    // Decode payload (no verification — server verifies on every API call)
    const payload = JSON.parse(atob(token.split('.')[1]))
    // Check expiry (exp is in seconds)
    return payload.exp * 1000 > Date.now()
  } catch {
    return false
  }
}

function ProtectedRoute({ children }) {
  const location = useLocation()
  const [ipStatus, setIpStatus] = useState('checking') // 'checking' | 'allowed' | 'blocked'

  const token = localStorage.getItem('nemsu_token')
  const tokenValid = isTokenValid(token)

  useEffect(() => {
    // If no IP restriction configured, skip the check
    if (ALLOWED_IPS.length === 0) {
      setIpStatus('allowed')
      return
    }

    // Fetch public IP and compare against whitelist
    fetch('https://api.ipify.org?format=json')
      .then(r => r.json())
      .then(({ ip }) => {
        setIpStatus(ALLOWED_IPS.includes(ip) ? 'allowed' : 'blocked')
      })
      .catch(() => {
        // If IP check fails (network issue), allow through and let
        // the backend enforce security
        setIpStatus('allowed')
      })
  }, [])

  // 1. Not logged in → redirect to login
  if (!tokenValid) {
    // Clear stale data
    localStorage.removeItem('nemsu_token')
    localStorage.removeItem('nemsu_admin')
    return <Navigate to="/admin/login" state={{ from: location }} replace />
  }

  // 2. Waiting for IP check
  if (ipStatus === 'checking') {
    return (
      <div className="protectedChecking">
        <span className="protectedSpinner" />
        <p>Verifying access…</p>
      </div>
    )
  }

  // 3. IP not whitelisted
  if (ipStatus === 'blocked') {
    return (
      <div className="protectedBlocked">
        <div className="protectedBlockedIcon">⛔</div>
        <h2 className="protectedBlockedTitle">Access Denied</h2>
        <p className="protectedBlockedMsg">
          This page is restricted to authorised networks only.
          <br />Connect to the correct network and try again.
        </p>
      </div>
    )
  }

  // 4. All good — render the admin page
  return children
}

export default ProtectedRoute