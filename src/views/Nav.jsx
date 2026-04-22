import React from 'react'
import {
  createHashRouter,
  RouterProvider,
  Outlet
} from 'react-router-dom'

import FullAbout from './fullviews/FullAbout'
import FullHome from './fullviews/FullHome'
import FullContact from './fullviews/FullContact'
import FullEvent from './fullviews/FullEvent'
import FullSupport from './fullviews/FullSupport'
import ScrollToTop from './ScrollToTop'


// ✅ Main component
function Nav() {
  const router=createHashRouter([
    {
      element: <ScrollToTop/>,
      children:[
        {path:"/", element:<FullHome/>},
        {path:"/about", element:<FullAbout/>},
        {path:"/events", element:<FullEvent/>},
        {path:"/contact", element:<FullContact/>},
        {path:"/support", element:<FullSupport/>}
      ]
    }
  ])

  return <RouterProvider router={router} />
}

export default Nav