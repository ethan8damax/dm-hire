-- Adds the fields collected by the candidate-facing multi-step application
-- wizard (career site) that didn't exist before candidates could apply
-- directly through the product instead of being entered by a recruiter.

alter table candidates
  add column linkedin text not null default '',
  add column resume_file_name text not null default '',
  add column address jsonb not null default '{}'::jsonb,
  add column work_authorization jsonb not null default '{}'::jsonb,
  add column employment_history jsonb not null default '[]'::jsonb,
  add column education jsonb not null default '[]'::jsonb,
  add column training jsonb not null default '[]'::jsonb,
  add column wotc jsonb,
  add column application_meta jsonb;

-- New career-site applicants start with no AI score until resume parsing +
-- scoring completes, unlike the previously-seeded recruiter-entered candidates.
alter table candidates
  alter column ai_score drop not null,
  alter column ai_dimensions drop not null;

alter table jobs
  add column description text not null default '',
  add column responsibilities text[] not null default '{}'::text[],
  add column requirements text[] not null default '{}'::text[];

update jobs set
  description = 'Own end-to-end multi-state payroll processing for a 1,200+ employee client portfolio, partnering with our Payroll Tax and Client Services teams to keep every pay run accurate and on time.',
  responsibilities = array[
    'Process multi-state payroll runs and reconcile discrepancies before submission',
    'Maintain compliance with federal, state, and local payroll tax regulations',
    'Partner with Client Services to resolve escalated payroll issues',
    'Mentor junior payroll associates on system workflows'
  ],
  requirements = array[
    '3+ years of multi-state payroll processing experience',
    'CPP certification preferred',
    'Hands-on experience with ADP Workforce Now or similar systems',
    'Strong Excel and reconciliation skills'
  ]
where id = 'job-001';

update jobs set
  description = 'Support month-end close, reconciliations, and client reporting as part of our growing Troy Finance & Accounting team.',
  responsibilities = array[
    'Prepare journal entries and assist with month-end close',
    'Reconcile balance sheet accounts',
    'Support client-facing financial reporting',
    'Assist with year-end audit requests'
  ],
  requirements = array[
    '1+ years of accounting experience',
    'Working knowledge of GAAP',
    'Proficiency with Excel and QuickBooks or NetSuite',
    'Bachelor''s degree in Accounting or related field'
  ]
where id = 'job-002';

update jobs set
  description = 'Lead our Chicago Client Services organization, owning retention strategy and executive relationships across our largest accounts.',
  responsibilities = array[
    'Set client retention and satisfaction strategy for the region',
    'Manage and develop a team of client services managers',
    'Serve as executive escalation point for key accounts',
    'Partner with sales on renewal and expansion strategy'
  ],
  requirements = array[
    '8+ years in client services or account management leadership',
    'Proven track record managing enterprise client relationships',
    'Experience building and coaching high-performing teams',
    'HRIS or payroll services industry experience preferred'
  ]
where id = 'job-003';

update jobs set
  description = 'A summer-long, paid internship supporting our Grand Rapids HR team with onboarding, recordkeeping, and employee events.',
  responsibilities = array[
    'Assist with new hire onboarding paperwork and orientation',
    'Maintain accurate employee records',
    'Help coordinate employee engagement events',
    'Support ad-hoc HR projects'
  ],
  requirements = array[
    'Currently pursuing a degree in HR, Business, or related field',
    'Strong organizational skills and attention to detail',
    'Comfortable with Microsoft Office',
    'Available full-time for the summer term'
  ]
where id = 'job-004';

update jobs set
  description = 'Manage multi-jurisdiction payroll tax filings and compliance for our Detroit-based client portfolio.',
  responsibilities = array[
    'Prepare and file multi-state and local payroll tax returns',
    'Research and resolve tax notices',
    'Maintain jurisdiction registrations for new client locations',
    'Audit payroll tax setup for accuracy'
  ],
  requirements = array[
    'CPP certification required',
    '2+ years of payroll tax experience',
    'Familiarity with multi-state tax jurisdictions',
    'Strong analytical and research skills'
  ]
where id = 'job-005';
