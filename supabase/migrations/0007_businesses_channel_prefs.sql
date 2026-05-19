alter table businesses
  add column if not exists whatsapp_number text,
  add column if not exists sms_enabled boolean not null default false,
  add column if not exists email_enabled boolean not null default false,
  add column if not exists default_cancellation_hours integer not null default 4;
