-- MS AI Workforce — Phase 1 schema
-- Run this once in your Supabase project's SQL Editor (or via `supabase db push`).

-- ORGANIZATIONS & PROFILES --------------------------------------------------

create table organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz default now()
);

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  organization_id uuid references organizations(id) on delete cascade,
  email text not null,
  role text not null default 'owner',
  created_at timestamptz default now()
);

-- AI EMPLOYEES ----------------------------------------------------------

create table ai_employees (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id) on delete cascade,
  slug text not null,
  name text not null,
  role text not null,
  system_prompt text not null,
  status text not null default 'active',
  created_at timestamptz default now()
);

-- CONVERSATIONS & MESSAGES ------------------------------------------------

create table conversations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id) on delete cascade,
  ai_employee_id uuid references ai_employees(id) on delete cascade,
  status text not null default 'open',
  created_at timestamptz default now()
);

create table messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid references conversations(id) on delete cascade,
  role text not null,
  content text not null,
  created_at timestamptz default now()
);

-- ROW LEVEL SECURITY ------------------------------------------------

alter table organizations enable row level security;
alter table profiles enable row level security;
alter table ai_employees enable row level security;
alter table conversations enable row level security;
alter table messages enable row level security;

create policy "select own profile" on profiles
  for select using (id = auth.uid());

create policy "select own org" on organizations
  for select using (
    id = (select organization_id from profiles where id = auth.uid())
  );

create policy "select org employees" on ai_employees
  for select using (
    organization_id = (select organization_id from profiles where id = auth.uid())
  );

create policy "select own conversations" on conversations
  for select using (
    organization_id = (select organization_id from profiles where id = auth.uid())
  );
create policy "insert own conversations" on conversations
  for insert with check (
    organization_id = (select organization_id from profiles where id = auth.uid())
  );

create policy "select own messages" on messages
  for select using (
    conversation_id in (
      select id from conversations
      where organization_id = (select organization_id from profiles where id = auth.uid())
    )
  );
create policy "insert own messages" on messages
  for insert with check (
    conversation_id in (
      select id from conversations
      where organization_id = (select organization_id from profiles where id = auth.uid())
    )
  );

-- AUTO-PROVISIONING ------------------------------------------------
-- When someone signs up, automatically create their organization, profile,
-- and hire their first 3 AI Employees (Ava, Noah, Priya).

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  new_org_id uuid;
  org_name text;
begin
  org_name := coalesce(new.raw_user_meta_data->>'company_name', split_part(new.email, '@', 1) || '''s Workspace');

  insert into organizations (name) values (org_name) returning id into new_org_id;

  insert into profiles (id, organization_id, email, role)
  values (new.id, new_org_id, new.email, 'owner');

  insert into ai_employees (organization_id, slug, name, role, system_prompt) values
    (new_org_id, 'ava', 'Ava', 'Customer Support',
     'You are Ava, an AI Customer Support Employee at ' || org_name || '. Be warm, concise, and helpful. If a question involves a real customer account, billing, or something you cannot know, say you would escalate it to a human teammate. Keep replies under 100 words unless asked for more detail.'),
    (new_org_id, 'noah', 'Noah', 'Sales',
     'You are Noah, an AI Sales Employee at ' || org_name || '. Be friendly and consultative, never pushy. Ask a clarifying question about the prospect''s needs before recommending anything. Keep replies under 100 words unless asked for more detail.'),
    (new_org_id, 'priya', 'Priya', 'HR',
     'You are Priya, an AI HR Employee at ' || org_name || '. Help with onboarding questions and general HR policy explanations. Be professional and clear. For anything involving a real employee''s personal or legal situation, say you would escalate to a human HR representative. Keep replies under 100 words unless asked for more detail.');

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
