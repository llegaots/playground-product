create extension if not exists "pgcrypto";

create type public.how_met_type as enum (
  'zoom_call',
  'in_person',
  'introduced_by',
  'conference',
  'other'
);

create type public.contact_source as enum (
  'manual',
  'zoom_auto_import'
);

create type public.connection_relationship_type as enum (
  'knows',
  'introduced_by',
  'worked_with',
  'second_degree'
);

create type public.activity_action_type as enum (
  'note',
  'created',
  'updated',
  'contacted',
  'connection_added',
  'imported'
);

create table public.contacts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  full_name text not null,
  photo_url text,
  company text,
  role_title text,
  email text,
  phone text,
  linkedin_url text,
  how_met public.how_met_type not null default 'other',
  introduced_by_contact_id uuid references public.contacts(id) on delete set null,
  date_first_met date,
  location_met text,
  relationship_strength smallint not null default 3 check (relationship_strength between 1 and 5),
  notes text,
  one_liner_note text,
  last_contacted_at date,
  source public.contact_source not null default 'manual',
  second_degree_through_contact_id uuid references public.contacts(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.tags (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  label text not null,
  color text not null default '#d6a84f',
  created_at timestamptz not null default now(),
  unique (user_id, label)
);

create table public.contact_tags (
  contact_id uuid not null references public.contacts(id) on delete cascade,
  tag_id uuid not null references public.tags(id) on delete cascade,
  primary key (contact_id, tag_id)
);

create table public.connections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  contact_id_a uuid not null references public.contacts(id) on delete cascade,
  contact_id_b uuid not null references public.contacts(id) on delete cascade,
  relationship_type public.connection_relationship_type not null default 'knows',
  notes text,
  created_at timestamptz not null default now(),
  check (contact_id_a <> contact_id_b),
  unique (contact_id_a, contact_id_b)
);

create table public.activity_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  contact_id uuid not null references public.contacts(id) on delete cascade,
  timestamp timestamptz not null default now(),
  note_text text not null,
  action_type public.activity_action_type not null default 'note'
);

create table public.zoom_integrations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade unique,
  zoom_account_id text,
  access_token_encrypted text,
  refresh_token_encrypted text,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index contacts_user_created_idx on public.contacts (user_id, created_at desc);
create index contacts_user_last_contacted_idx on public.contacts (user_id, last_contacted_at);
create index contacts_how_met_idx on public.contacts (how_met);
create index connections_user_a_idx on public.connections (user_id, contact_id_a);
create index connections_user_b_idx on public.connections (user_id, contact_id_b);
create index activity_log_contact_timestamp_idx on public.activity_log (contact_id, timestamp desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger contacts_set_updated_at
before update on public.contacts
for each row execute function public.set_updated_at();

create trigger zoom_integrations_set_updated_at
before update on public.zoom_integrations
for each row execute function public.set_updated_at();

create or replace function public.normalize_connection_order()
returns trigger
language plpgsql
as $$
declare
  smaller uuid;
  larger uuid;
begin
  if new.contact_id_a > new.contact_id_b then
    smaller := new.contact_id_b;
    larger := new.contact_id_a;
    new.contact_id_a := smaller;
    new.contact_id_b := larger;
  end if;
  return new;
end;
$$;

create trigger connections_normalize_order
before insert or update on public.connections
for each row execute function public.normalize_connection_order();

alter table public.contacts enable row level security;
alter table public.tags enable row level security;
alter table public.contact_tags enable row level security;
alter table public.connections enable row level security;
alter table public.activity_log enable row level security;
alter table public.zoom_integrations enable row level security;

create policy "Users manage their contacts"
on public.contacts for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users manage their tags"
on public.tags for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users manage contact tags"
on public.contact_tags for all
using (
  exists (
    select 1 from public.contacts
    where contacts.id = contact_tags.contact_id
    and contacts.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.contacts
    where contacts.id = contact_tags.contact_id
    and contacts.user_id = auth.uid()
  )
);

create policy "Users manage their connections"
on public.connections for all
using (auth.uid() = user_id)
with check (
  auth.uid() = user_id
  and exists (
    select 1 from public.contacts
    where contacts.id = connections.contact_id_a
    and contacts.user_id = auth.uid()
  )
  and exists (
    select 1 from public.contacts
    where contacts.id = connections.contact_id_b
    and contacts.user_id = auth.uid()
  )
);

create policy "Users manage activity log"
on public.activity_log for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users manage Zoom integration scaffold"
on public.zoom_integrations for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
