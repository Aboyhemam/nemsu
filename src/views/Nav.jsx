import React from 'react'
import {
  createBrowserRouter,
  RouterProvider,
  Outlet
} from 'react-router-dom'

import FullAbout from './fullviews/FullAbout'
import FullHome from './fullviews/FullHome'
import FullContact from './fullviews/FullContact'
import FullEvent from './fullviews/FullEvent'
import FullSupport from './fullviews/FullSupport'
import ScrollToTop from './ScrollToTop'

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
const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { index: true, element: <FullHome /> },
      { path: "about", element: <FullAbout /> },
      { path: "events", element: <FullEvent /> },
      { path: "contact", element: <FullContact /> },
      { path: "support", element: <FullSupport /> }
    ]
  }
])

function Nav() {
  return <RouterProvider router={router} />
}

export default Nav