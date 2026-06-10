create table if not exists public.farm_records (
  user_id uuid not null references auth.users(id) on delete cascade,
  entity_type text not null,
  record_id text not null,
  data jsonb not null default '{}'::jsonb,
  deleted boolean not null default false,
  updated_at timestamptz not null default now(),
  primary key (user_id, entity_type, record_id)
);

alter table public.farm_records enable row level security;

drop policy if exists "Users can read their farm records"
  on public.farm_records;
create policy "Users can read their farm records"
  on public.farm_records for select
  using ((select auth.uid()) = user_id);

drop policy if exists "Users can insert their farm records"
  on public.farm_records;
create policy "Users can insert their farm records"
  on public.farm_records for insert
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update their farm records"
  on public.farm_records;
create policy "Users can update their farm records"
  on public.farm_records for update
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create or replace function public.sync_farm_records(records jsonb)
returns void
language plpgsql
security invoker
set search_path = public
as $$
declare
  record jsonb;
begin
  for record in select * from jsonb_array_elements(records)
  loop
    if (record->>'user_id')::uuid <> auth.uid() then
      raise exception 'Not authorized';
    end if;

    insert into public.farm_records (
      user_id,
      entity_type,
      record_id,
      data,
      deleted,
      updated_at
    ) values (
      (record->>'user_id')::uuid,
      record->>'entity_type',
      record->>'record_id',
      coalesce(record->'data', '{}'::jsonb),
      coalesce((record->>'deleted')::boolean, false),
      (record->>'updated_at')::timestamptz
    )
    on conflict (user_id, entity_type, record_id)
    do update set
      data = excluded.data,
      deleted = excluded.deleted,
      updated_at = excluded.updated_at
    where excluded.updated_at > public.farm_records.updated_at;
  end loop;
end;
$$;
