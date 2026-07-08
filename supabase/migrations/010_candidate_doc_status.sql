-- supabase/migrations/010_candidate_doc_status.sql

alter table candidates add column background_check_status text not null default 'not_started';
alter table candidates add column drug_screen_status text not null default 'not_started';
alter table candidates add column cert_verified boolean not null default false;

update candidates set background_check_status = 'cleared', drug_screen_status = 'cleared' where stage = 'hired';
update candidates set background_check_status = 'in_progress', drug_screen_status = 'in_progress' where stage = 'offer';
