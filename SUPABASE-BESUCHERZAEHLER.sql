-- Platino Ladies – Seitenweiter Besucherzähler (keine Roh-IP-Speicherung)
create table if not exists public.pl_visit_total (
  id integer primary key check (id = 1),
  count bigint not null default 0 check (count >= 0)
);
insert into public.pl_visit_total (id, count) values (1, 0)
on conflict (id) do nothing;

create table if not exists public.pl_visit_windows (
  fingerprint text primary key,
  recorded_at timestamptz not null default now()
);

-- Kein direkter Tabellenzugriff über die öffentlichen API-Rollen.
revoke all on public.pl_visit_total from public, anon, authenticated;
revoke all on public.pl_visit_windows from public, anon, authenticated;
grant usage on schema public to service_role;
grant select, insert, update on public.pl_visit_total to service_role;
grant select, insert, delete on public.pl_visit_windows to service_role;

create or replace function public.pl_record_visit(p_fingerprint text)
returns bigint
language plpgsql
security invoker
set search_path = public
as $$
declare
  inserted_rows integer;
  current_total bigint;
begin
  if p_fingerprint is null or length(p_fingerprint) <> 64 then
    raise exception 'Invalid fingerprint';
  end if;
  insert into public.pl_visit_windows(fingerprint) values (p_fingerprint)
  on conflict do nothing;
  get diagnostics inserted_rows = row_count;
  if inserted_rows > 0 then
    update public.pl_visit_total set count = count + 1 where id = 1;
  end if;
  select count into current_total from public.pl_visit_total where id = 1;
  return current_total;
end;
$$;
revoke all on function public.pl_record_visit(text) from public, anon, authenticated;
grant execute on function public.pl_record_visit(text) to service_role;
