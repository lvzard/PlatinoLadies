-- Nur Serverfunktionen (Service Role) greifen auf diese Tabelle zu.
create table if not exists public.gaestebuch_eintraege (
 id bigint generated always as identity primary key,
 created_at timestamptz not null default now(),
 name text not null check (char_length(name) between 1 and 70),
 club text not null default '' check (char_length(club)<=80),
 message text not null check (char_length(message) between 1 and 1200),
 status text not null default 'pending' check (status in ('pending','approved','rejected'))
);
alter table public.gaestebuch_eintraege enable row level security;
revoke all on public.gaestebuch_eintraege from anon, authenticated;
create table if not exists public.gaestebuch_limits (
 ip_hash text primary key, last_submission timestamptz not null default now()
);
alter table public.gaestebuch_limits enable row level security;
revoke all on public.gaestebuch_limits from anon, authenticated;

create or replace function public.gaestebuch_rate_limit(p_hash text)
returns boolean language plpgsql security definer set search_path = public as $$
declare last_time timestamptz;
begin
 if length(p_hash) <> 64 then return false; end if;
 perform pg_advisory_xact_lock(hashtextextended(p_hash, 0));
 select last_submission into last_time from public.gaestebuch_limits where ip_hash=p_hash;
 if last_time is not null and last_time > now() - interval '5 minutes' then return false; end if;
 insert into public.gaestebuch_limits(ip_hash,last_submission) values(p_hash,now())
 on conflict(ip_hash) do update set last_submission=excluded.last_submission;
 return true;
end;$$;
revoke all on function public.gaestebuch_rate_limit(text) from public, anon, authenticated;
grant execute on function public.gaestebuch_rate_limit(text) to service_role;
