import React from 'react'
import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

import { Navbar } from 'components'
import { Home, Practice, Lobby, Room, Play } from 'pages'

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='practice' element={<Practice />} />
        <Route path='lobby' element={<Lobby />} />
        <Route path='lobby/:roomId' element={<Room />} />
        <Route path='play/:roomId' element={<Play />} />
      </Routes>
    </Router>
  )
}

export default App
