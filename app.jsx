<<<<<<< HEAD
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

=======
import PointingPokerHomePage from './src/PointingPokerHomePage'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import IntermediaryPage from './IntermediaryPage'
import GamePage from './src/GamePage'
 
const App = () => {
  return (
      <BrowserRouter>
    <Routes>
      <Route path="/" element={<PointingPokerHomePage />}/>
      <Route path="/IntermediaryPage" element={<IntermediaryPage />}/>
      <Route path="/GamePage" element={<GamePage />}/>
    </Routes>
    </BrowserRouter>
   
  )
 
}
 
>>>>>>> 124c92dfcc3454d9deae5e1b16de83a7d0a7d7d1
export default App