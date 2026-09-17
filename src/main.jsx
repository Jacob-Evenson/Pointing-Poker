import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import PointingPokerHomePage from './PointingPokerHomePage.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <PointingPokerHomePage />
    </BrowserRouter>
  </StrictMode>,
)