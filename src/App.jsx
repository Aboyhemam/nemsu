import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'
import Home from "./views/Home"
import Nav from "./views/Nav"


function App() {
  const [count, setCount] = useState(0)

  return (
    <>
    <Nav />
    
    </>
  )
}

export default App
