-- Add the cancelled status in its own migration.
-- Postgres cannot use a newly added enum value until this transaction commits.
-- 039_reservation_notifications.sql depends on this value.

alter type public.booking_request_status add value if not exists 'cancelled';
