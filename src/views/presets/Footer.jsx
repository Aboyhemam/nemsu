import React from 'react'
import { NavLink } from 'react-router-dom'
import "../../css/footer.css";
import logo from '../../assets/pictures/logo.png'

function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="footerRoot">

      {/* Top accent stripe — mirrors the Header's orange top border */}
      <div className="footerStripe" />

      <div className="footerInner">

        {/* ── Column 1 : Brand ── */}
        <div className="footerBrand">
          <div className="footerLogo">
            <img src={logo} alt="NEMSU" />
          </div>
          <p className="footerTagline">
            Nerist Manipur<br />Students' Union
          </p>
          <p className="footerMotto">" Learn, Unity &amp; Peace "</p>
        </div>

        {/* ── Column 2 : Quick Links ── */}
        <div className="footerCol">
          <h4 className="footerColTitle">Quick Links</h4>
          <ul className="footerLinks">
            {[
              { to: '/',        label: 'Home'       },
              { to: '/events',  label: 'Events'     },
              { to: '/about',   label: 'About Us'   },
              { to: '/contact', label: 'Contact'    },
              { to: '/support', label: 'Support Us' },
            ].map(({ to, label }) => (
              <li key={to}>
                <NavLink to={to} className="footerLink" end={to === '/'}>
                  <span className="footerLinkArrow">›</span>
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>

        {/* ── Column 3 : Contact ── */}
        <div className="footerCol">
          <h4 className="footerColTitle">Get In Touch</h4>
          <ul className="footerContact">
            <li>
              <span className="footerContactIcon">✉</span>
              <a href="mailto:nemsuofficial1@gmail.com" className="footerContactLink">
                nemsuofficial1@gmail.com
              </a>
            </li>
            <li>
              <span className="footerContactIcon">📍</span>
              <span className="footerContactText">
                NERIST, Nirjuli,<br />Arunachal Pradesh — 791 109
              </span>
            </li>
            <li>
              <span className="footerContactIcon">📞</span>
              <a href="tel:+910000000000" className="footerContactLink">
                +91 00000 00000
              </a>
            </li>
          </ul>
        </div>

        {/* ── Column 4 : Social ── */}
        <div className="footerCol">
          <h4 className="footerColTitle">Follow Us</h4>
          <div className="footerSocials">
            {[
              { href: 'https://facebook.com',  label: 'Facebook',  icon: 'f' },
              { href: 'https://www.instagram.com/nemsu_official?igsh=enZ0NXJpcGs5Ym83', label: 'Instagram', icon: '◈' },
              { href: 'https://twitter.com',   label: 'X / Twitter', icon: '𝕏' },
              { href: 'https://youtube.com/@nemsuofficial?si=tENQ4WN6O7DUHIHA',   label: 'YouTube',   icon: '▶' },
            ].map(({ href, label, icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="footerSocialBtn"
                aria-label={label}
                title={label}
              >
                <span>{icon}</span>
              </a>
            ))}
          </div>
          <p className="footerSocialNote">
            Stay updated with events,<br />announcements &amp; more.
          </p>
        </div>

      </div>

      {/* ── Bottom bar ── */}
      <div className="footerBottom">
        <div className="footerBottomInner">
          <p className="footerCopy">
            © {currentYear} NEMSU — Nerist Manipur Students' Union. All rights reserved.
          </p>
          <p className="footerCredit">
            Built with <span className="footerHeart">♥</span> by NEMSU Tech Team
          </p>
        </div>
      </div>

    </footer>
  )
}

export default Footer