create table offers (
  id text primary key,
  candidate_id text not null references candidates(id),
  job_id text references jobs(id),
  salary numeric not null,
  bonus text not null,
  pto text not null,
  start_date date,
  sent_date date,
  expiry_date date,
  status text not null,
  esig_status text not null,
  esig_viewed_date date,
  esig_signed_date date,
  payroll_synced boolean not null default false
);
alter table offers enable row level security;
create policy "offers_anon_select" on offers for select to anon using (true);
create policy "offers_anon_insert" on offers for insert to anon with check (true);
create policy "offers_anon_update" on offers for update to anon using (true) with check (true);

create table offer_approvals (
  id bigint generated always as identity primary key,
  offer_id text not null references offers(id),
  role text not null,
  name text not null,
  approved boolean not null default false,
  date date
);
alter table offer_approvals enable row level security;
create policy "offer_approvals_anon_select" on offer_approvals for select to anon using (true);
create policy "offer_approvals_anon_insert" on offer_approvals for insert to anon with check (true);
create policy "offer_approvals_anon_update" on offer_approvals for update to anon using (true) with check (true);
