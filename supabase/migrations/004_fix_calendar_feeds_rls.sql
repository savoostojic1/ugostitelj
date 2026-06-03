-- INSERT na calendar_feeds zahtijeva eksplicitnu WITH CHECK politiku

drop policy if exists "Users manage feeds on own properties" on public.calendar_feeds;

create policy "Users select feeds on own properties"
  on public.calendar_feeds for select
  using (
    exists (
      select 1 from public.properties p
      where p.id = property_id and p.user_id = auth.uid()
    )
  );

create policy "Users insert feeds on own properties"
  on public.calendar_feeds for insert
  with check (
    exists (
      select 1 from public.properties p
      where p.id = property_id and p.user_id = auth.uid()
    )
  );

create policy "Users update feeds on own properties"
  on public.calendar_feeds for update
  using (
    exists (
      select 1 from public.properties p
      where p.id = property_id and p.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.properties p
      where p.id = property_id and p.user_id = auth.uid()
    )
  );

create policy "Users delete feeds on own properties"
  on public.calendar_feeds for delete
  using (
    exists (
      select 1 from public.properties p
      where p.id = property_id and p.user_id = auth.uid()
    )
  );
