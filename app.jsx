import PointingPokerHomePage from './src/PointingPokerHomePage'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import IntermediaryPage from './IntermediaryPage'
import GamePage from './src/GamePage'

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PointingPokerHomePage />} />
        <Route path="/room/:roomCode/join" element={<IntermediaryPage />} />
        <Route path="/room/:roomCode" element={<GamePage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App