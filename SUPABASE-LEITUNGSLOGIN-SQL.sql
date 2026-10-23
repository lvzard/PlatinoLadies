-- Im Supabase SQL Editor ausführen (nicht im schreibgeschützten Table Editor)
-- Nur authentifizierte Leitung sieht ihr eigenes Profil.
create or replace function public.leitungsprofil()
returns table (name text, rolle text)
language sql stable security definer set search_path = ''
as $$
  select l.name, l.rolle
  from public.club_leitung as l
  where l.user_id = (select auth.uid());
$$;
revoke all on function public.leitungsprofil() from public, anon;
grant execute on function public.leitungsprofil() to authenticated;

-- Nur Owner darf den Bewerbungsstatus und Bearbeiter ändern.
create or replace function public.ist_club_owner()
returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.club_leitung
    where user_id = (select auth.uid()) and rolle = 'owner'
  );
$$;
revoke all on function public.ist_club_owner() from public, anon;
grant execute on function public.ist_club_owner() to authenticated;

-- Vorhandene SELECT-Policy aus den bisherigen Schritten bleibt bestehen.
drop policy if exists "Nur Owner darf Bewerbungsstatus ändern" on public.bewerbungen;
create policy "Nur Owner darf Bewerbungsstatus ändern"
on public.bewerbungen for update to authenticated
using ((select public.ist_club_owner()))
with check ((select public.ist_club_owner()));

-- Schreibrecht ausschließlich für diese beiden Spalten.
revoke update on public.bewerbungen from authenticated;
grant update (status, bearbeitet_von) on public.bewerbungen to authenticated;
