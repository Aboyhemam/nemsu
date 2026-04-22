import React from 'react'
import {
  createHashRouter,
  RouterProvider,
  Outlet
} from 'react-router-dom'

import Home from './Home'
import Header from './presets/Header'
import Footer from './presets/Footer'
import About from './About'
import Event from './Event'
import Contact from './Contact'
import Support from './Support'
import ScrollToTop from './ScrollToTop'

// ✅ Layout component (shared UI)
function RootLayout() {
  return (
    <>
      <Header />
      <ScrollToTop />
      <Outlet />
      <Footer />
    </>
  )
}

// ✅ Router configuration (OUTSIDE component)
const router = createHashRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: "about", element: <About /> },
      { path: "event", element: <Event /> },
      { path: "contact", element: <Contact /> },
      { path: "support", element: <Support /> },
    ],
  },
])

// ✅ Main component
function Nav() {
  return <RouterProvider router={router} />
}

export default Nav