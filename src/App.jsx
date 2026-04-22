import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'
import Home from "./views/Home"
import Nav from "./views/Nav"
import { HashRouter } from 'react-router-dom'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
    <HashRouter>
      <Nav/>
    </HashRouter>
    
    </>
  )
}

export default App
