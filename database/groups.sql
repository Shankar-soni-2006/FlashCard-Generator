-- Study groups with invite links. Run once in the Supabase SQL editor.
-- The API uses the service-role key, so access control is enforced in server/controllers/groupController.js.
-- RLS is enabled with no policies, which blocks direct access from the anon key.

create table if not exists groups (
  id            uuid primary key default uuid_generate_v4(),
  owner_id      uuid not null references profiles(id) on delete cascade,
  name          text not null,
  description   text,
  invite_token  text not null unique,
  created_at    timestamptz default now()
);

create table if not exists group_members (
  group_id   uuid not null references groups(id) on delete cascade,
  user_id    uuid not null references profiles(id) on delete cascade,
  role       text not null default 'member' check (role in ('owner', 'member')),
  joined_at  timestamptz default now(),
  primary key (group_id, user_id)
);

create table if not exists group_decks (
  group_id   uuid not null references groups(id) on delete cascade,
  deck_id    uuid not null references decks(id) on delete cascade,
  added_by   uuid not null references profiles(id) on delete cascade,
  added_at   timestamptz default now(),
  primary key (group_id, deck_id)
);

create index if not exists idx_group_members_user  on group_members(user_id);
create index if not exists idx_group_decks_group   on group_decks(group_id);

alter table groups         enable row level security;
alter table group_members  enable row level security;
alter table group_decks    enable row level security;
