import React from 'react'
import { Routes, Route } from 'react-router-dom'

import Home from './Home'
import Header from './presets/Header'
import Footer from './presets/Footer'
import About from './About'
import Event from './Event'
import Contact from './Contact'
import Support from './Support'
import ScrollToTop from './ScrollToTop'

function Nav() {
  return (
    <>
      {/* ✅ MUST be outside Routes */}
      <ScrollToTop />

      <Routes basename="/nemsu">

        <Route path='/' element={
          <>
            <Header/>
            <Home/>
            <Footer/>
          </>
        }/>

        <Route path='/about' element={
          <>
            <Header/>
            <About/>
            <Footer/>
          </>
        }/>

        <Route path='/events' element={
          <>
            <Header/>
            <Event/>
            <Footer/>
          </>
        }/>

        <Route path='/contact' element={
          <>
            <Header/>
            <Contact/>
            <Footer/>
          </>
        }/>

        <Route path='/support' element={
          <>
            <Header/>
            <Support/>
            <Footer/>
          </>
        }/>

      </Routes>
    </>
  )
}

export default Nav