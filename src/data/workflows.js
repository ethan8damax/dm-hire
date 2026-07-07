// Per-role-template hiring workflow: interview stages (with approver + SLA),
// the knockout-question default, and the requisition approval chain.
// Shared by the New Requisition modal (JobRequisitions.jsx) and Settings > Workflows,
// so both screens describe the same role template the same way.
export const roleWorkflows = {
  intern: {
    label: 'Intern',
    knockoutYears: 0,
    approvalChain: ['hiring_manager'],
    stages: [
      { name: 'Phone Screen', approver: 'Recruiter', slaDays: 3 },
      { name: 'Team Interview', approver: 'Hiring Manager', slaDays: 5 },
      { name: 'Offer', approver: 'Hiring Manager', slaDays: 3 },
    ],
  },
  ic: {
    label: 'Individual Contributor',
    knockoutYears: 1,
    approvalChain: ['hiring_manager'],
    stages: [
      { name: 'Phone Screen', approver: 'Recruiter', slaDays: 3 },
      { name: 'Interview', approver: 'Hiring Manager', slaDays: 5 },
      { name: 'Offer', approver: 'Hiring Manager', slaDays: 3 },
    ],
  },
  manager: {
    label: 'Manager',
    knockoutYears: 3,
    approvalChain: ['hiring_manager', 'hr_director'],
    stages: [
      { name: 'Phone Screen', approver: 'Recruiter', slaDays: 3 },
      { name: 'Interview', approver: 'Hiring Manager', slaDays: 5 },
      { name: 'Panel Interview', approver: 'Hiring Manager', slaDays: 5 },
      { name: 'Offer', approver: 'HR Director', slaDays: 3 },
    ],
  },
  director: {
    label: 'Director',
    knockoutYears: 8,
    approvalChain: ['hiring_manager', 'hr_director', 'vp_finance'],
    stages: [
      { name: 'Phone Screen', approver: 'Recruiter', slaDays: 3 },
      { name: 'Interview', approver: 'Hiring Manager', slaDays: 5 },
      { name: 'Panel Interview', approver: 'Hiring Manager', slaDays: 5 },
      { name: 'Executive Interview', approver: 'HR Director', slaDays: 7 },
      { name: 'Offer', approver: 'VP Finance', slaDays: 3 },
    ],
  },
  csuite: {
    label: 'C-Suite',
    knockoutYears: 12,
    approvalChain: ['hiring_manager', 'hr_director', 'vp_finance'],
    stages: [
      { name: 'Executive Screen', approver: 'HR Director', slaDays: 5 },
      { name: 'Board Interview', approver: 'VP Finance', slaDays: 10 },
      { name: 'Offer', approver: 'VP Finance', slaDays: 5 },
    ],
  },
  floor: {
    label: 'Production Floor',
    knockoutYears: 0,
    approvalChain: ['hiring_manager'],
    stages: [
      { name: 'Phone Screen', approver: 'Recruiter', slaDays: 2 },
      { name: 'In-Person Interview', approver: 'Hiring Manager', slaDays: 3 },
      { name: 'Offer', approver: 'Hiring Manager', slaDays: 2 },
    ],
  },
}
