import React, { useState, useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import "../../css/header.css";

function Header() {
  const [menuOpen, setMenuOpen] = useState(false)

  // Close menu on route change / resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) setMenuOpen(false)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const closeMenu = () => setMenuOpen(false)

  return (
    <div className='navContainer'>
      <header className='navHeader'>

        {/* Logo */}
        <div className="logoContainer">
          <div className="logo">
            <img src="/logo.png" alt="NEMSU" />
          </div>
        </div>

        {/* Hamburger (mobile) */}
        <button
          className={`hamburger ${menuOpen ? 'open' : ''}`}
          onClick={() => setMenuOpen(prev => !prev)}
          aria-label="Toggle navigation"
          aria-expanded={menuOpen}
        >
          <span />
          <span />
          <span />
        </button>

        {/* Nav Links */}
        <nav className={`linkContainer ${menuOpen ? 'open' : ''}`} aria-label="Main navigation">
          {[
            { to: '/',        label: 'Home'       },
            { to: '/events',  label: 'Events'     },
            { to: '/about',   label: 'About'      },
            { to: '/contact', label: 'Contact'    },
            { to: '/support', label: 'Support Us' },
          ].map(({ to, label }) => (
            <div className="linkContainer2" key={to}>
              <div className="link">
                <NavLink
                  to={to}
                  className={({ isActive }) => `navLink${isActive ? ' active' : ''}`}
                  onClick={closeMenu}
                  end={to === '/'}
                >
                  {label}
                </NavLink>
              </div>
            </div>
          ))}
        </nav>

      </header>
    </div>
  )
}

export default Header