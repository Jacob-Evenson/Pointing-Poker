import PointingPokerHomePage from './src/PointingPokerHomePage'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import IntermediaryPage from './IntermediaryPage'
import GamePage from './src/GamePage'

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PointingPokerHomePage />} />
        <Route path="/IntermediaryPage" element={<IntermediaryPage />} />
        <Route path="/GamePage" element={<GamePage />} />
        <Route path="/room/:roomCode/join" element={<IntermediaryPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App