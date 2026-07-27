import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { PersonaProvider } from './context/PersonaContext'
import { TourProvider } from './context/TourContext'
import { CandidateSessionProvider } from './context/CandidateSessionContext'
import AppShell from './components/layout/AppShell'
import CareerShell from './components/layout/CareerShell'
import Dashboard from './views/Dashboard'
import JobRequisitions from './views/JobRequisitions'
import RequisitionDetail from './views/RequisitionDetail'
import Approvals from './views/Approvals'
import Pipeline from './views/Pipeline'
import CandidateProfile from './views/CandidateProfile'
import Offers from './views/Offers'
import Reports from './views/Reports'
import Integrations from './views/Integrations'
import Settings from './views/Settings'
import InternalJobs from './views/InternalJobs'
import WhyDMHire from './views/WhyDMHire'
import CareerHome from './views/CareerHome'
import JobDetail from './views/JobDetail'
import ApplyWizard from './views/apply/ApplyWizard'
import MyApplications from './views/MyApplications'
import ApplicationDetail from './views/ApplicationDetail'
import CandidateAccount from './views/CandidateAccount'

export default function App() {
  return (
    <PersonaProvider>
      <CandidateSessionProvider>
        <TourProvider>
          <BrowserRouter>
            <Routes>
              <Route element={<AppShell />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/jobs" element={<JobRequisitions />} />
                <Route path="/jobs/:id" element={<RequisitionDetail />} />
                <Route path="/approvals" element={<Approvals />} />
                <Route path="/pipeline" element={<Pipeline />} />
                <Route path="/candidates/:id" element={<CandidateProfile />} />
                <Route path="/offers" element={<Offers />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/integrations" element={<Integrations />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/internal-jobs" element={<InternalJobs />} />
                <Route path="/why-dm-hire" element={<WhyDMHire />} />
              </Route>
              {/* Candidate-facing career site — full page, no recruiter sidebar/topbar chrome */}
              <Route element={<CareerShell />}>
                <Route path="/careers" element={<CareerHome />} />
                <Route path="/careers/jobs/:jobId" element={<JobDetail />} />
                <Route path="/careers/jobs/:jobId/apply" element={<ApplyWizard />} />
                <Route path="/careers/applications" element={<MyApplications />} />
                <Route path="/careers/applications/:candidateId" element={<ApplicationDetail />} />
                <Route path="/careers/profile" element={<CandidateAccount />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </TourProvider>
      </CandidateSessionProvider>
    </PersonaProvider>
  )
}
