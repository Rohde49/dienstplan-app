import { Route, Routes } from 'react-router-dom'
import StartPage from './pages/StartPage'
import TeamPage from './pages/TeamPage'
import EintraegePage from './pages/EintraegePage'
import PlanPage from './pages/PlanPage'

function App(): React.JSX.Element {
  return (
    <Routes>
      <Route path="/" element={<StartPage />} />
      <Route path="/team" element={<TeamPage />} />
      <Route path="/eintraege" element={<EintraegePage />} />
      <Route path="/dienstplan" element={<PlanPage />} />
    </Routes>
  )
}

export default App
