import React from 'react'
import {
  createBrowserRouter,
  RouterProvider,
  Outlet,
  Navigate
} from 'react-router-dom'

import FullAbout from './fullviews/FullAbout'
import FullHome from './fullviews/FullHome'
import FullContact from './fullviews/FullContact'
import FullEvent from './fullviews/FullEvent'
import FullSupport from './fullviews/FullSupport'
import ScrollToTop from './ScrollToTop'

import AdminLogin from './admin/AdminLogin'
import AdminHome from './admin/AdminHome'
import EventUpload from './admin/EventUpload'
import ProtectedRoute from './Protectedroute'
import Finance from './admin/Finance'
import ExportPage from './admin/ExportPage'

// ✅ Layout wrapper
function RootLayout() {
  return (
    <>
      <ScrollToTop />
      <Outlet />
    </>
  )
}

// ✅ Router
const router = createBrowserRouter(
  [
    {
      path: "/",
      element: <RootLayout />,
      children: [
        // ── Public pages ──
        { index: true, element: <FullHome /> },
        { path: "about", element: <FullAbout /> },
        { path: "events", element: <FullEvent /> },
        { path: "contact", element: <FullContact /> },
        { path: "support", element: <FullSupport /> },

        // ── Admin login (must be public) ──
        { path: "admin", element: <AdminLogin /> },
        

        // ── Protected routes ──
        {
          path: "adminhome",
          element: (
            <ProtectedRoute>
              <AdminHome />
            </ProtectedRoute>
          )
        },
        {
          path: "adminEvent",
          element: (
            <ProtectedRoute>
              <EventUpload />
            </ProtectedRoute>
          )
        },
        {
          path: "adminFinance",
          element: (
            <ProtectedRoute>
              <Finance/>
            </ProtectedRoute>
          )
        },
        {
          path: "admin/export",
          element: (
            <ProtectedRoute>
              <ExportPage/>
            </ProtectedRoute>
          )
        },

        // ── Fallback ──
        { path: "*", element: <Navigate to="/" replace /> }
      ]
    }
  ],
  {
    basename: "/"
  }
)

function Nav() {
  return <RouterProvider router={router} />
}

export default Nav