-- Platino Ladies: interne Bewerbungsnotizen (SQL Editor -> New query -> Run)
-- Voraussetzung: public.club_leitung, public.bewerbungen und RLS existieren.
-- Alle angemeldeten Mitglieder der Clubleitung dürfen nur die Notiz ändern.
-- Kein direktes UPDATE-Recht auf notizen für normale Benutzer erforderlich.
create or replace function public.leitung_notiz_speichern(
  p_bewerbung_id bigint,
  p_notiz text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (select auth.uid()) is null or not exists (
    select 1 from public.club_leitung
    where user_id = (select auth.uid())
      and rolle in ('owner', 'leader')
  ) then
    raise exception 'Keine Leitungsberechtigung' using errcode = '42501';
  end if;
  if p_notiz is not null and length(p_notiz) > 5000 then
    raise exception 'Notiz darf höchstens 5000 Zeichen enthalten';
  end if;
  update public.bewerbungen
  set notizen = coalesce(p_notiz, '')
  where id = p_bewerbung_id;
  if not found then
    raise exception 'Bewerbung nicht gefunden';
  end if;
end;
$$;

revoke all on function public.leitung_notiz_speichern(bigint,text) from public, anon;
grant execute on function public.leitung_notiz_speichern(bigint,text) to authenticated;
