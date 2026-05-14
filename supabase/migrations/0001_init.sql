-- Extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pg_cron";
create extension if not exists "pgcrypto";

-- 1. businesses
create table businesses (
  id               uuid primary key default uuid_generate_v4(),
  name             text not null,
  slug             text unique not null,
  vertical         text not null,
  country          text not null default 'HN',
  default_language text not null default 'es' check (default_language in ('es','en')),
  default_currency text not null default 'HNL',
  logo_url         text,
  onboarding_completed boolean not null default false,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- 2. branches
create table branches (
  id               uuid primary key default uuid_generate_v4(),
  business_id      uuid not null references businesses(id) on delete cascade,
  name             text not null,
  slug             text not null,
  address          text,
  city             text,
  country          text not null default 'HN',
  phone            text,
  whatsapp_number  text,
  timezone         text not null default 'America/Tegucigalpa',
  is_active        boolean not null default true,
  created_at       timestamptz not null default now(),
  unique (business_id, slug)
);

-- 3. users
create table users (
  id          uuid primary key references auth.users(id) on delete cascade,
  business_id uuid references businesses(id) on delete set null,
  email       text not null,
  phone       text,
  full_name   text,
  avatar_url  text,
  role        text not null check (role in ('owner','staff')),
  provider    text,
  created_at  timestamptz not null default now()
);

-- 4. staff
create table staff (
  id           uuid primary key default uuid_generate_v4(),
  business_id  uuid not null references businesses(id) on delete cascade,
  user_id      uuid references users(id) on delete set null,
  display_name text not null,
  slug         text not null,
  avatar_url   text,
  is_active    boolean not null default true,
  created_at   timestamptz not null default now(),
  unique (business_id, slug)
);

-- 5. staff_branches (N:M)
create table staff_branches (
  id        uuid primary key default uuid_generate_v4(),
  staff_id  uuid not null references staff(id) on delete cascade,
  branch_id uuid not null references branches(id) on delete cascade,
  unique (staff_id, branch_id)
);

-- 6. services
create table services (
  id               uuid primary key default uuid_generate_v4(),
  business_id      uuid not null references businesses(id) on delete cascade,
  name             text not null,
  duration_minutes int not null check (duration_minutes > 0),
  price            numeric(10,2) not null,
  currency         text not null default 'HNL',
  is_active        boolean not null default true,
  created_at       timestamptz not null default now()
);

-- 7. branch_services
create table branch_services (
  id             uuid primary key default uuid_generate_v4(),
  branch_id      uuid not null references branches(id) on delete cascade,
  service_id     uuid not null references services(id) on delete cascade,
  price_override numeric(10,2),
  unique (branch_id, service_id)
);

-- 8. staff_availability
create table staff_availability (
  id          uuid primary key default uuid_generate_v4(),
  staff_id    uuid not null references staff(id) on delete cascade,
  branch_id   uuid not null references branches(id) on delete cascade,
  day_of_week int not null check (day_of_week between 0 and 6),
  start_time  time not null,
  end_time    time not null,
  check (start_time < end_time)
);

-- 9. clients
create table clients (
  id                 uuid primary key default uuid_generate_v4(),
  business_id        uuid not null references businesses(id) on delete cascade,
  full_name          text not null,
  email              text,
  phone              text,
  whatsapp_number    text,
  preferred_language text default 'es' check (preferred_language in ('es','en')),
  total_visits       int not null default 0,
  total_spent        numeric(12,2) not null default 0,
  created_at         timestamptz not null default now()
);

-- 10. appointments
create table appointments (
  id           uuid primary key default uuid_generate_v4(),
  business_id  uuid not null references businesses(id) on delete cascade,
  branch_id    uuid not null references branches(id) on delete cascade,
  client_id    uuid not null references clients(id),
  staff_id     uuid not null references staff(id),
  service_id   uuid not null references services(id),
  starts_at    timestamptz not null,
  ends_at      timestamptz not null,
  status       text not null default 'confirmed'
                 check (status in ('pending','confirmed','completed','noshow','cancelled')),
  notes        text,
  created_at   timestamptz not null default now(),
  cancelled_at timestamptz
);

create index idx_appointments_business_starts on appointments (business_id, starts_at);
create index idx_appointments_staff_starts    on appointments (staff_id, starts_at);
create index idx_appointments_branch_starts   on appointments (branch_id, starts_at);

-- 11. messages
create table messages (
  id                  uuid primary key default uuid_generate_v4(),
  appointment_id      uuid references appointments(id) on delete cascade,
  business_id         uuid not null references businesses(id) on delete cascade,
  type                text not null check (type in ('confirmation','reminder_24h','cancellation','reschedule')),
  channel             text not null check (channel in ('whatsapp','sms','email')),
  status              text not null default 'pending'
                        check (status in ('pending','sent','delivered','failed')),
  provider_message_id text,
  scheduled_at        timestamptz,
  sent_at             timestamptz,
  error               text,
  created_at          timestamptz not null default now()
);

create index idx_messages_scheduled on messages (status, scheduled_at)
  where status = 'pending';

-- 12. message_templates
create table message_templates (
  id        uuid primary key default uuid_generate_v4(),
  type      text not null,
  channel   text not null,
  language  text not null check (language in ('es','en')),
  vertical  text not null,
  content   text not null,
  variables jsonb not null default '[]',
  is_active boolean not null default true,
  unique (type, channel, language, vertical)
);
