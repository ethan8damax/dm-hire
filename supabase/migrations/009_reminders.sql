create table reminders (
  id bigint generated always as identity primary key,
  candidate_id text references candidates(id),
  offer_id text references offers(id),
  type text not null,
  sent_at timestamptz not null default now(),
  sent_by text,
  message text
);
alter table reminders enable row level security;
create policy "reminders_anon_select" on reminders for select to anon using (true);
create policy "reminders_anon_insert" on reminders for insert to anon with check (true);
create policy "reminders_anon_update" on reminders for update to anon using (true) with check (true);
