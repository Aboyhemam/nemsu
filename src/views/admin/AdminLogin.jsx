import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import "../../css/adminlogin.css"

function AdminLogin() {
  const navigate = useNavigate()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!username.trim() || !password.trim()) {
      setError('Please fill in both fields.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('https://nemsu-backend.onrender.com/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.message || 'Login failed. Please try again.')
        return
      }

      // Store token + admin info
      localStorage.setItem('nemsu_token', data.token)
      localStorage.setItem('nemsu_admin', JSON.stringify(data.admin))

      navigate('/adminhome')
    } catch (err) {
      setError('Network error. Please check your connection.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="adminLoginFormWrap">
      <div className="adminLoginFormContainer">

        {/* Decorative top stripe */}
        <div className="loginStripe" />

        <div className="loginLogoArea">
          <img src="/NEMSULOGO-1.png" alt="NEMSU" className="loginLogo" />
          <p className="loginLogoSub">Admin Portal</p>
        </div>

        <form className="adminLoginForm" onSubmit={handleSubmit} noValidate>
          <h1 className="adminLoginTitle">Sign In</h1>
          <p className="adminLoginSub">Access restricted to authorised personnel only.</p>

          {/* Error banner */}
          {error && (
            <div className="loginError" role="alert">
              <span className="loginErrorIcon">!</span>
              {error}
            </div>
          )}

          <div className="loginComponent">
            <label className="loginLabel" htmlFor="username">Username</label>
            <div className="loginInputWrap">
              <span className="loginInputIcon">⊙</span>
              <input
                id="username"
                type="text"
                className="loginInput"
                placeholder="Enter username"
                value={username}
                autoComplete="username"
                onChange={e => { setUsername(e.target.value); setError('') }}
                disabled={loading}
              />
            </div>
          </div>

          <div className="loginComponent">
            <label className="loginLabel" htmlFor="password">Password</label>
            <div className="loginInputWrap">
              <span className="loginInputIcon">◉</span>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                className="loginInput"
                placeholder="Enter password"
                value={password}
                autoComplete="current-password"
                onChange={e => { setPassword(e.target.value); setError('') }}
                disabled={loading}
              />
              <button
                type="button"
                className="loginTogglePass"
                onClick={() => setShowPassword(v => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                tabIndex={-1}
              >
                {showPassword ? '🙈' : '👁'}
              </button>
            </div>
          </div>

          <button
            className={`loginBtn ${loading ? 'loginBtnLoading' : ''}`}
            type="submit"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="loginSpinner" />
                Signing in…
              </>
            ) : 'Sign In'}
          </button>
        </form>

        <p className="loginFootnote">
          NEMSU &copy; {new Date().getFullYear()} — Nerist Manipur Students' Union
        </p>
      </div>
    </div>
  )
}

export default AdminLogin