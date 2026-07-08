create table offices (
  id text primary key,
  name text not null,
  city text not null,
  state text not null,
  address text not null,
  region text not null
);
alter table offices enable row level security;
create policy "offices_anon_select" on offices for select to anon using (true);
create policy "offices_anon_insert" on offices for insert to anon with check (true);
create policy "offices_anon_update" on offices for update to anon using (true) with check (true);

create table users (
  id text primary key,
  name text not null,
  email text not null,
  role text not null,
  assigned_job_ids text[] not null default '{}',
  status text not null
);
alter table users enable row level security;
create policy "users_anon_select" on users for select to anon using (true);
create policy "users_anon_insert" on users for insert to anon with check (true);
create policy "users_anon_update" on users for update to anon using (true) with check (true);

create table role_workflow_templates (
  role_key text primary key,
  label text not null,
  knockout_years int not null,
  approval_chain text[] not null default '{}',
  stages jsonb not null
);
alter table role_workflow_templates enable row level security;
create policy "role_workflow_templates_anon_select" on role_workflow_templates for select to anon using (true);
create policy "role_workflow_templates_anon_insert" on role_workflow_templates for insert to anon with check (true);
create policy "role_workflow_templates_anon_update" on role_workflow_templates for update to anon using (true) with check (true);

create table onboarding_packets (
  state text primary key,
  state_name text not null,
  documents text[] not null default '{}'
);
alter table onboarding_packets enable row level security;
create policy "onboarding_packets_anon_select" on onboarding_packets for select to anon using (true);
create policy "onboarding_packets_anon_insert" on onboarding_packets for insert to anon with check (true);
create policy "onboarding_packets_anon_update" on onboarding_packets for update to anon using (true) with check (true);

create table integrations (
  id text primary key,
  name text not null,
  category text not null,
  description text not null,
  status text not null,
  last_sync text,
  new_hire_count int,
  boards text[],
  tools text[]
);
alter table integrations enable row level security;
create policy "integrations_anon_select" on integrations for select to anon using (true);
create policy "integrations_anon_insert" on integrations for insert to anon with check (true);
create policy "integrations_anon_update" on integrations for update to anon using (true) with check (true);

create table why_dm_hire_features (
  id bigint generated always as identity primary key,
  icon text not null,
  title text not null,
  context text not null,
  pain text not null,
  solution text not null,
  route text not null,
  action text not null
);
alter table why_dm_hire_features enable row level security;
create policy "why_dm_hire_features_anon_select" on why_dm_hire_features for select to anon using (true);
create policy "why_dm_hire_features_anon_insert" on why_dm_hire_features for insert to anon with check (true);
create policy "why_dm_hire_features_anon_update" on why_dm_hire_features for update to anon using (true) with check (true);

create table analytics (
  id text primary key default 'default',
  data jsonb not null
);
alter table analytics enable row level security;
create policy "analytics_anon_select" on analytics for select to anon using (true);
create policy "analytics_anon_insert" on analytics for insert to anon with check (true);
create policy "analytics_anon_update" on analytics for update to anon using (true) with check (true);
