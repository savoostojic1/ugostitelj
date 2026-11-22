-- Bot protection: guest booking inquiries must go through /api/booking-requests,
-- which applies honeypot, timing and rate-limit checks. Before this, anyone with
-- the public anon key could call the RPC directly and skip those checks.

revoke execute on function public.submit_booking_request(
  text, text, text, text, date, date, integer, text
) from public, anon, authenticated;

grant execute on function public.submit_booking_request(
  text, text, text, text, date, date, integer, text
) to service_role;

-- Rate-limit rows only matter inside their window; keep the table small.
create or replace function public.prune_public_endpoint_hits()
returns void
language sql
security definer
set search_path = public
as $$
  delete from public.public_endpoint_hits
  where created_at < now() - interval '2 days';
$$;

revoke all on function public.prune_public_endpoint_hits() from public, anon, authenticated;
grant execute on function public.prune_public_endpoint_hits() to service_role;
