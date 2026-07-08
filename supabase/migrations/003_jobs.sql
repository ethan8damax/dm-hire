create table jobs (
  id text primary key,
  title text not null,
  department text not null,
  location text not null,
  office_id text references offices(id),
  comp_range text not null,
  posted_date date not null,
  status text not null,
  is_internal boolean not null default false,
  role_template text not null,
  boards text[] not null default '{}',
  knockout_rules jsonb not null default '[]',
  approval_chain text[] not null default '{}',
  hiring_manager_id text references users(id),
  days_open int not null default 0,
  applicant_count int not null default 0
);
alter table jobs enable row level security;
create policy "jobs_anon_select" on jobs for select to anon using (true);
create policy "jobs_anon_insert" on jobs for insert to anon with check (true);
create policy "jobs_anon_update" on jobs for update to anon using (true) with check (true);
