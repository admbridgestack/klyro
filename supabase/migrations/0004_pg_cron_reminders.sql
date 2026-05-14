-- pg_cron job: dispatch due messages every 5 minutes.
-- The cron job calls the dispatch-due-messages Edge Function via pg_net (or http extension).
-- Requires pg_cron and pg_net extensions to be enabled in Supabase.

select cron.schedule(
  'dispatch-due-messages',
  '*/5 * * * *',
  $$
    select net.http_post(
      url     := current_setting('app.supabase_url') || '/functions/v1/dispatch-due-messages',
      headers := jsonb_build_object(
        'Authorization', 'Bearer ' || current_setting('app.service_role_key'),
        'Content-Type',  'application/json'
      ),
      body    := '{}'::jsonb
    );
  $$
);
