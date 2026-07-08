import { updateCandidateStage } from './candidates'

export const offers = [
  {
    id: 'offer-001',
    candidateId: 'cand-002',
    jobId: 'job-001',
    salary: 101000,
    bonus: '10% of base',
    pto: '15 days + 10 holidays',
    startDate: '2026-08-01',
    sentDate: '2026-06-28',
    expiryDate: '2026-07-10',
    status: 'awaiting',
    approvalChain: [
      { role: 'HR Director', name: 'A. Chen', approved: true, date: '2026-06-27' },
      { role: 'VP Finance', name: 'L. Torres', approved: false, date: null },
    ],
    esigStatus: 'pending',
    esigViewedDate: null,
    esigSignedDate: null,
    payrollSynced: false,
  },
  {
    id: 'offer-002',
    candidateId: 'cand-004',
    jobId: 'job-003',
    salary: 145000,
    bonus: '15% of base',
    pto: '20 days + 10 holidays',
    startDate: '2026-08-15',
    sentDate: '2026-06-20',
    expiryDate: '2026-06-27',
    status: 'expired',
    approvalChain: [
      { role: 'HR Director', name: 'A. Chen', approved: true, date: '2026-06-19' },
      { role: 'VP Finance', name: 'L. Torres', approved: true, date: '2026-06-19' },
    ],
    esigStatus: 'pending',
    esigViewedDate: null,
    esigSignedDate: null,
    payrollSynced: false,
  },
  {
    id: 'offer-003',
    candidateId: 'cand-001',
    jobId: 'job-001',
    salary: 98000,
    bonus: '8% of base',
    pto: '15 days + 10 holidays',
    startDate: '2026-07-20',
    sentDate: '2026-06-15',
    expiryDate: '2026-06-22',
    status: 'accepted',
    approvalChain: [
      { role: 'HR Director', name: 'A. Chen', approved: true, date: '2026-06-14' },
    ],
    esigStatus: 'signed',
    esigViewedDate: '2026-06-17',
    esigSignedDate: '2026-06-18',
    payrollSynced: true,
  },
  {
    id: 'offer-004',
    candidateId: 'cand-006',
    jobId: 'job-001',
    salary: 82000,
    bonus: '5% of base',
    pto: '15 days + 10 holidays',
    startDate: '2026-07-21',
    sentDate: '2026-06-25',
    expiryDate: '2026-07-02',
    status: 'declined',
    approvalChain: [
      { role: 'HR Director', name: 'A. Chen', approved: true, date: '2026-06-24' },
    ],
    esigStatus: 'pending',
    esigViewedDate: '2026-06-26',
    esigSignedDate: null,
    payrollSynced: false,
  },
]

// Mutates the shared offers array in place so any view holding a reference to
// it (recruiter's CandidateProfile, candidate's ApplicationDetail) sees the
// latest offer state on its next render. This is the seam to replace with a
// real API call once a backend exists.
export function addOrUpdateOffer(offer) {
  const idx = offers.findIndex((o) => o.id === offer.id)
  if (idx === -1) offers.push(offer)
  else offers[idx] = offer

  // Keep the candidate's pipeline stage consistent with their offer status,
  // regardless of whether the change came from the recruiter or candidate side.
  if (offer.status === 'awaiting') updateCandidateStage(offer.candidateId, 'offer')
  if (offer.status === 'accepted') updateCandidateStage(offer.candidateId, 'hired')

  return offer
}
