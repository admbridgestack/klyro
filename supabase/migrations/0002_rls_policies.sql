-- Enable RLS on all tables
alter table businesses       enable row level security;
alter table branches         enable row level security;
alter table users            enable row level security;
alter table staff            enable row level security;
alter table staff_branches   enable row level security;
alter table services         enable row level security;
alter table branch_services  enable row level security;
alter table staff_availability enable row level security;
alter table clients          enable row level security;
alter table appointments     enable row level security;
alter table messages         enable row level security;
alter table message_templates enable row level security;

-- ── Helper: get the business_id for the current auth user ────────────────────
create or replace function get_my_business_id()
returns uuid language sql stable security definer as $$
  select business_id from users where id = auth.uid();
$$;

-- ── Helper: get the role for the current auth user ───────────────────────────
create or replace function get_my_role()
returns text language sql stable security definer as $$
  select role from users where id = auth.uid();
$$;

-- ── businesses ────────────────────────────────────────────────────────────────
create policy "owner can manage own business"
  on businesses for all
  using (id = get_my_business_id());

-- ── branches ──────────────────────────────────────────────────────────────────
create policy "users can view own business branches"
  on branches for select
  using (business_id = get_my_business_id());

create policy "owner can manage branches"
  on branches for all
  using (business_id = get_my_business_id() and get_my_role() = 'owner');

-- ── users ─────────────────────────────────────────────────────────────────────
create policy "users can view their own record"
  on users for select
  using (id = auth.uid());

create policy "users can update their own record"
  on users for update
  using (id = auth.uid());

create policy "owner can view all users in business"
  on users for select
  using (business_id = get_my_business_id() and get_my_role() = 'owner');

create policy "service role can insert users"
  on users for insert
  with check (true);

-- ── staff ─────────────────────────────────────────────────────────────────────
create policy "users can view staff in own business"
  on staff for select
  using (business_id = get_my_business_id());

create policy "owner can manage staff"
  on staff for all
  using (business_id = get_my_business_id() and get_my_role() = 'owner');

create policy "staff can view own record"
  on staff for select
  using (user_id = auth.uid());

-- ── staff_branches ────────────────────────────────────────────────────────────
create policy "users can view staff_branches in own business"
  on staff_branches for select
  using (
    staff_id in (select id from staff where business_id = get_my_business_id())
  );

create policy "owner can manage staff_branches"
  on staff_branches for all
  using (
    staff_id in (select id from staff where business_id = get_my_business_id())
    and get_my_role() = 'owner'
  );

-- ── services ──────────────────────────────────────────────────────────────────
create policy "users can view services in own business"
  on services for select
  using (business_id = get_my_business_id());

create policy "owner can manage services"
  on services for all
  using (business_id = get_my_business_id() and get_my_role() = 'owner');

-- ── branch_services ───────────────────────────────────────────────────────────
create policy "users can view branch_services in own business"
  on branch_services for select
  using (
    branch_id in (select id from branches where business_id = get_my_business_id())
  );

create policy "owner can manage branch_services"
  on branch_services for all
  using (
    branch_id in (select id from branches where business_id = get_my_business_id())
    and get_my_role() = 'owner'
  );

-- ── staff_availability ────────────────────────────────────────────────────────
create policy "users can view availability in own business"
  on staff_availability for select
  using (
    staff_id in (select id from staff where business_id = get_my_business_id())
  );

create policy "owner can manage availability"
  on staff_availability for all
  using (
    staff_id in (select id from staff where business_id = get_my_business_id())
    and get_my_role() = 'owner'
  );

create policy "staff can manage own availability"
  on staff_availability for all
  using (
    staff_id in (select id from staff where user_id = auth.uid())
  );

-- ── clients ───────────────────────────────────────────────────────────────────
create policy "owner can view all clients in own business"
  on clients for select
  using (business_id = get_my_business_id() and get_my_role() = 'owner');

create policy "owner can manage clients"
  on clients for all
  using (business_id = get_my_business_id() and get_my_role() = 'owner');

create policy "staff can view clients in own business"
  on clients for select
  using (business_id = get_my_business_id());

-- ── appointments ──────────────────────────────────────────────────────────────
create policy "owner can manage all appointments in own business"
  on appointments for all
  using (business_id = get_my_business_id() and get_my_role() = 'owner');

create policy "staff can view own appointments"
  on appointments for select
  using (
    staff_id in (select id from staff where user_id = auth.uid())
  );

-- ── messages ──────────────────────────────────────────────────────────────────
create policy "owner can view messages in own business"
  on messages for select
  using (business_id = get_my_business_id() and get_my_role() = 'owner');

create policy "service role can manage messages"
  on messages for all
  using (true);

-- ── message_templates ─────────────────────────────────────────────────────────
create policy "anyone can read message_templates"
  on message_templates for select
  using (true);
