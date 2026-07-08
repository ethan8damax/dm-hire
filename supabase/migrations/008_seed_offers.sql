insert into offers (id, candidate_id, job_id, salary, bonus, pto, start_date, sent_date, expiry_date, status, esig_status, esig_viewed_date, esig_signed_date, payroll_synced) values
('offer-001', 'cand-002', 'job-001', 101000, '10% of base', '15 days + 10 holidays', '2026-08-01', '2026-06-28', '2026-07-10', 'awaiting', 'pending', null, null, false),
('offer-002', 'cand-004', 'job-003', 145000, '15% of base', '20 days + 10 holidays', '2026-08-15', '2026-06-20', '2026-06-27', 'expired', 'pending', null, null, false),
('offer-003', 'cand-001', 'job-001', 98000, '8% of base', '15 days + 10 holidays', '2026-07-20', '2026-06-15', '2026-06-22', 'accepted', 'signed', '2026-06-17', '2026-06-18', true),
('offer-004', 'cand-006', 'job-001', 82000, '5% of base', '15 days + 10 holidays', '2026-07-21', '2026-06-25', '2026-07-02', 'declined', 'pending', '2026-06-26', null, false);

insert into offer_approvals (offer_id, role, name, approved, date) values
('offer-001', 'HR Director', 'A. Chen', true, '2026-06-27'),
('offer-001', 'VP Finance', 'L. Torres', false, null),
('offer-002', 'HR Director', 'A. Chen', true, '2026-06-19'),
('offer-002', 'VP Finance', 'L. Torres', true, '2026-06-19'),
('offer-003', 'HR Director', 'A. Chen', true, '2026-06-14'),
('offer-004', 'HR Director', 'A. Chen', true, '2026-06-24');
