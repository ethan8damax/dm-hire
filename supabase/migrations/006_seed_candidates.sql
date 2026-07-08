insert into candidates (id, name, initials, avatar_color, job_id, stage, source, location, email, phone, "current_role", expected_salary, availability, days_in_stage, ai_score, ai_dimensions, skills, prior_interaction, is_duplicate, is_stale, is_top_candidate, is_internal_applicant) values
('cand-001', 'Jordan Alvarez', 'JA', 'navy', 'job-001', 'hired', 'LinkedIn', 'Chicago, IL', 'j.alvarez@email.com', '(312) 555-0142', 'Payroll Sr. Assoc. · ADP', '$95K–$105K', '2 weeks notice', 4, 87, '{"payrollExpertise":96,"softwareSystems":88,"compliance":82,"leadership":74,"cultureFit":91}', ARRAY['ADP Workforce Now','CPP Certified','Multi-state Tax'], null, false, false, true, false),
('cand-002', 'Priya Natarajan', 'PN', 'green', 'job-001', 'offer', 'Referral', 'Detroit, MI', 'p.natarajan@email.com', '(313) 555-0198', 'Payroll Manager · Paychex', '$100K–$110K', 'Immediate', 3, 93, '{"payrollExpertise":94,"softwareSystems":90,"compliance":95,"leadership":89,"cultureFit":88}', ARRAY['UKG Pro','CPP Certified','Team Leadership'], '{"year":2024,"role":"Tax Analyst","recruiter":"T. Smith"}', false, false, true, false),
('cand-003', 'Chris Lawson', 'CL', 'orange', 'job-002', 'screening', 'Indeed', 'Troy, MI', 'c.lawson@email.com', '(248) 555-0177', 'Staff Accountant · RSM', '$60K–$66K', '4 weeks notice', 4, 71, '{"payrollExpertise":58,"softwareSystems":74,"compliance":70,"leadership":45,"cultureFit":79}', ARRAY['QuickBooks','Excel','GAAP'], null, true, false, false, false),
('cand-004', 'Maya Okafor', 'MO', 'purple', 'job-003', 'interviewing', 'LinkedIn', 'Chicago, IL', 'm.okafor@email.com', '(312) 555-0163', 'VP Client Services · Insperity', '$140K–$150K', '3 weeks notice', 9, 90, '{"payrollExpertise":70,"softwareSystems":82,"compliance":85,"leadership":97,"cultureFit":93}', ARRAY['Client Retention','Team Leadership','HRIS Implementation'], null, false, true, true, false),
('cand-005', 'Diego Fernandez', 'DF', 'blue', 'job-002', 'new', 'Internal Job Board', 'Grand Rapids, MI', 'd.fernandez@email.com', '(616) 555-0104', 'Jr. Accountant · Rehmann', '$55K–$60K', '2 weeks notice', 1, 64, '{"payrollExpertise":40,"softwareSystems":68,"compliance":60,"leadership":30,"cultureFit":75}', ARRAY['Excel','NetSuite'], null, false, false, false, true),
('cand-006', 'Sara Kim', 'SK', 'green', 'job-001', 'new', 'Career Site', 'Detroit, MI', 's.kim@email.com', '(313) 555-0121', 'Payroll Coordinator · Kelly Services', '$78K–$88K', '2 weeks notice', 1, 74, '{"payrollExpertise":68,"softwareSystems":72,"compliance":65,"leadership":55,"cultureFit":80}', ARRAY['Excel','Multi-state Tax'], null, false, false, false, false),
('cand-007', 'Marcus Webb', 'MW', 'blue', 'job-001', 'screening', 'Indeed', 'Detroit, MI', 'm.webb@email.com', '(313) 555-0134', 'Payroll Specialist · Gusto', '$82K–$92K', '3 weeks notice', 4, 68, '{"payrollExpertise":62,"softwareSystems":70,"compliance":66,"leadership":48,"cultureFit":71}', ARRAY['Gusto','Payroll Reconciliation'], null, false, false, false, false),
('cand-008', 'Elena Vasquez', 'EV', 'purple', 'job-001', 'interviewing', 'LinkedIn', 'Detroit, MI', 'e.vasquez@email.com', '(313) 555-0147', 'Sr. Payroll Analyst · Ceridian', '$92K–$102K', '2 weeks notice', 6, 81, '{"payrollExpertise":84,"softwareSystems":79,"compliance":80,"leadership":68,"cultureFit":83}', ARRAY['Ceridian Dayforce','CPP Certified','Compliance Audits'], null, false, false, false, false),
('cand-009', 'Brian Yoder', 'BY', 'orange', 'job-001', 'rejected', 'Indeed', 'Detroit, MI', 'b.yoder@email.com', '(313) 555-0158', 'AP Clerk · Local Company', '$60K–$65K', 'Immediate', 20, 52, '{"payrollExpertise":38,"softwareSystems":55,"compliance":40,"leadership":30,"cultureFit":60}', ARRAY['Accounts Payable'], null, false, false, false, false);

insert into candidate_notes (candidate_id, author, office, date, body) values
('cand-001', 'T. Smith', 'Detroit', '2026-06-18', 'Strong technical interview. Very sharp on multi-state compliance.'),
('cand-002', 'T. Smith', 'Detroit', '2026-06-27', 'Referred by current employee. Excellent culture fit signals.'),
('cand-003', 'M. Reyes', 'Troy', '2026-06-24', 'Possible duplicate: matches candidate cand-003b on phone + resume similarity, different email domain.'),
('cand-007', 'T. Smith', 'Detroit', '2026-06-29', 'Solid fundamentals, light on multi-state experience.'),
('cand-009', 'T. Smith', 'Detroit', '2026-06-15', 'Did not meet minimum payroll experience requirement.');

insert into candidate_timeline_events (candidate_id, stage, date, note) values
('cand-001', 'Application', '2026-06-15', 'Applied via LinkedIn'),
('cand-002', 'Application', '2026-06-10', 'Referred by A. Chen'),
('cand-003', 'Application', '2026-06-21', 'Applied via Indeed'),
('cand-004', 'Application', '2026-06-05', 'Applied via LinkedIn'),
('cand-005', 'Application', '2026-07-01', 'Applied via Internal Job Board'),
('cand-006', 'Application', '2026-07-01', 'Applied via Career Site'),
('cand-007', 'Application', '2026-06-27', 'Applied via Indeed'),
('cand-008', 'Application', '2026-06-19', 'Applied via LinkedIn'),
('cand-009', 'Application', '2026-06-10', 'Applied via Indeed');

insert into candidate_scorecards (candidate_id, interviewer, date, dimensions) values
('cand-001', 'T. Smith', '2026-06-18', '{"payrollExpertise":9,"softwareSystems":8,"compliance":8,"leadership":7,"cultureFit":9}'),
('cand-002', 'T. Smith', '2026-06-22', '{"payrollExpertise":9,"softwareSystems":9,"compliance":10,"leadership":9,"cultureFit":9}'),
('cand-004', 'A. Chen', '2026-06-19', '{"payrollExpertise":6,"softwareSystems":8,"compliance":8,"leadership":10,"cultureFit":9}');
