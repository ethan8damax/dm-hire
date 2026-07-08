create table candidates (
  id text primary key,
  name text not null,
  initials text not null,
  avatar_color text not null,
  job_id text references jobs(id),
  stage text not null,
  source text not null,
  location text not null,
  email text not null,
  phone text not null,
  "current_role" text not null,
  expected_salary text not null,
  availability text not null,
  days_in_stage int not null default 0,
  ai_score int not null,
  ai_dimensions jsonb not null,
  skills text[] not null default '{}',
  prior_interaction jsonb,
  is_duplicate boolean not null default false,
  is_stale boolean not null default false,
  is_top_candidate boolean not null default false,
  is_internal_applicant boolean not null default false
);
alter table candidates enable row level security;
create policy "candidates_anon_select" on candidates for select to anon using (true);
create policy "candidates_anon_insert" on candidates for insert to anon with check (true);
create policy "candidates_anon_update" on candidates for update to anon using (true) with check (true);

create table candidate_notes (
  id bigint generated always as identity primary key,
  candidate_id text not null references candidates(id),
  author text not null,
  office text not null,
  date date not null,
  body text not null
);
alter table candidate_notes enable row level security;
create policy "candidate_notes_anon_select" on candidate_notes for select to anon using (true);
create policy "candidate_notes_anon_insert" on candidate_notes for insert to anon with check (true);
create policy "candidate_notes_anon_update" on candidate_notes for update to anon using (true) with check (true);

create table candidate_timeline_events (
  id bigint generated always as identity primary key,
  candidate_id text not null references candidates(id),
  stage text not null,
  date date not null,
  note text
);
alter table candidate_timeline_events enable row level security;
create policy "candidate_timeline_events_anon_select" on candidate_timeline_events for select to anon using (true);
create policy "candidate_timeline_events_anon_insert" on candidate_timeline_events for insert to anon with check (true);
create policy "candidate_timeline_events_anon_update" on candidate_timeline_events for update to anon using (true) with check (true);

create table candidate_scorecards (
  id bigint generated always as identity primary key,
  candidate_id text not null references candidates(id),
  interviewer text not null,
  date date not null,
  dimensions jsonb not null
);
alter table candidate_scorecards enable row level security;
create policy "candidate_scorecards_anon_select" on candidate_scorecards for select to anon using (true);
create policy "candidate_scorecards_anon_insert" on candidate_scorecards for insert to anon with check (true);
create policy "candidate_scorecards_anon_update" on candidate_scorecards for update to anon using (true) with check (true);
