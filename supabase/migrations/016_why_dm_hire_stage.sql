alter table why_dm_hire_features add column stage text not null default 'ats';

update why_dm_hire_features set stage = 'onboarding' where title in (
  'Automated department notifications',
  'State-based onboarding packets',
  'Background check + drug screen integrations'
);

update why_dm_hire_features set stage = 'payroll' where title = 'Payroll + onboarding integration';
