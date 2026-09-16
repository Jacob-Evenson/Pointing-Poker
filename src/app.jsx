import React from 'react'
import PointingPokerHomePage from '../PointingPokerHomePage.jsx';
import Sessions from '../sessions/sessions.jsx';
import { Route, Routes } from 'react-router-dom';

const App = () => {
  return (
    <Routes>
     <Route path="/" element={<PointingPokerHomePage/>}/>
     <Route path="/Sessions" element={<Sessions/>}/>
    </Routes>
  )
}

export default App