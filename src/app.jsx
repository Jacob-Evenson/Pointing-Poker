import PointingPokerHomePage from '../PointingPokerHomePage.jsx';
import "../PointingPokerHomePage.css";
import SessionTimer from './components/SessionTimer.jsx';
import VoteStats from './components/VoteStats.jsx';

const App = () => {
  return (
    <>
      <PointingPokerHomePage />
      <VoteStats votes={[1, 2, 3, 5, 8, 13]} />
      <SessionTimer />
    </>
  )
}

export default App