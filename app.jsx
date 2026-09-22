import PointingPokerHomePage from '../Pointing-Poker/src/PointingPokerHomePage'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import IntermediaryPage from '../Pointing-Poker/IntermediaryPage'
import GamePage from '../Pointing-Poker/src/GamePage'

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PointingPokerHomePage />} />
        <Route path="/IntermediaryPage" element={<IntermediaryPage />} />
        <Route path="/GamePage" element={<GamePage />} />
      </Routes>
    </BrowserRouter>

  )

}

export default App