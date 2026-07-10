alter table jobs add column office_ids text[] not null default '{}';

update jobs set office_ids = array[office_id] where office_id is not null;

alter table jobs drop column office_id;
