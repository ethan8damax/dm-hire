import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { PersonaProvider } from './context/PersonaContext'
import { TourProvider } from './context/TourContext'
import AppShell from './components/layout/AppShell'
import Dashboard from './views/Dashboard'
import JobRequisitions from './views/JobRequisitions'
import Pipeline from './views/Pipeline'
import CandidateProfile from './views/CandidateProfile'
import Offers from './views/Offers'
import Reports from './views/Reports'
import Integrations from './views/Integrations'
import Settings from './views/Settings'
import InternalJobs from './views/InternalJobs'
import CandidatePortal from './views/CandidatePortal'
import WhyDMHire from './views/WhyDMHire'

export default function App() {
  return (
    <PersonaProvider>
      <TourProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<AppShell />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/jobs" element={<JobRequisitions />} />
              <Route path="/pipeline" element={<Pipeline />} />
              <Route path="/candidates/:id" element={<CandidateProfile />} />
              <Route path="/offers" element={<Offers />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/integrations" element={<Integrations />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/internal-jobs" element={<InternalJobs />} />
              <Route path="/why-dm-hire" element={<WhyDMHire />} />
            </Route>
            {/* Candidate-facing portal renders full-page — no recruiter sidebar/topbar chrome */}
            <Route path="/portal" element={<CandidatePortal />} />
          </Routes>
        </BrowserRouter>
      </TourProvider>
    </PersonaProvider>
  )
}
