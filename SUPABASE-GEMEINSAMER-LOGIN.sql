-- Führt eine begrenzte Anzahl Passwortversuche pro IP und Stunde durch.
create table if not exists public.leitung_login_limits (
  ip_hash text primary key,
  window_start timestamptz not null default now(),
  attempts integer not null default 0
);
revoke all on public.leitung_login_limits from anon, authenticated;
alter table public.leitung_login_limits enable row level security;
create or replace function public.leitung_login_versuch(p_ip text)
returns boolean language plpgsql security definer set search_path = '' as $$
declare n integer;
begin
  insert into public.leitung_login_limits(ip_hash,window_start,attempts)
  values (md5(p_ip),now(),1)
  on conflict (ip_hash) do update set
    attempts = case when public.leitung_login_limits.window_start < now()-interval '1 hour' then 1 else public.leitung_login_limits.attempts+1 end,
    window_start = case when public.leitung_login_limits.window_start < now()-interval '1 hour' then now() else public.leitung_login_limits.window_start end
  returning attempts into n;
  return n <= 12;
end; $$;
revoke all on function public.leitung_login_versuch(text) from public, anon, authenticated;
grant execute on function public.leitung_login_versuch(text) to service_role;
