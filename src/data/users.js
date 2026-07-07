// user-002..005 match the hiringManagerId values already referenced in jobs.js;
// A. Chen / L. Torres match the named approvers already referenced in offers.js approvalChains.
export const users = [
  { id: 'user-001', name: 'T. Smith', email: 't.smith@doerenmayhew.com', role: 'Recruiter', assignedJobIds: ['job-001', 'job-002', 'job-003', 'job-004', 'job-005'], status: 'active' },
  { id: 'user-002', name: 'R. Patel', email: 'r.patel@doerenmayhew.com', role: 'Hiring Manager', assignedJobIds: ['job-001', 'job-005'], status: 'active' },
  { id: 'user-003', name: 'K. Nguyen', email: 'k.nguyen@doerenmayhew.com', role: 'Hiring Manager', assignedJobIds: ['job-002'], status: 'active' },
  { id: 'user-004', name: 'J. Brooks', email: 'j.brooks@doerenmayhew.com', role: 'Hiring Manager', assignedJobIds: ['job-003'], status: 'active' },
  { id: 'user-005', name: 'M. Osei', email: 'm.osei@doerenmayhew.com', role: 'Hiring Manager', assignedJobIds: ['job-004'], status: 'active' },
  { id: 'user-006', name: 'A. Chen', email: 'a.chen@doerenmayhew.com', role: 'Admin', assignedJobIds: [], status: 'active' },
  { id: 'user-007', name: 'L. Torres', email: 'l.torres@doerenmayhew.com', role: 'Admin', assignedJobIds: [], status: 'active' },
]
