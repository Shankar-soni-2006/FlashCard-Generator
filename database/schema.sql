-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ─────────────────────────────────────────
-- profiles
-- ─────────────────────────────────────────
create table if not exists profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  name        text,
  email       text,
  avatar_url  text,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- Auto-create profile on signup
create or replace function handle_new_user()
returns trigger language plpgsql security definer
set search_path = public as $$
begin
  insert into public.profiles (id, email, name)
  values (
    new.id,
    coalesce(new.email, new.raw_user_meta_data->>'email'),
    coalesce(new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'full_name')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- ─────────────────────────────────────────
-- decks
-- ─────────────────────────────────────────
create table if not exists decks (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references profiles(id) on delete cascade,
  title       text not null,
  description text,
  deck_type   text not null default 'topic',
  visibility  text not null default 'private' check (visibility in ('private', 'public')),
  share_token text unique,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- ─────────────────────────────────────────
-- cards
-- ─────────────────────────────────────────
create table if not exists cards (
  id               uuid primary key default uuid_generate_v4(),
  deck_id          uuid not null references decks(id) on delete cascade,
  question         text,
  answer           text,
  explanation      text,
  code_example     text,
  code_language    text,
  word             text,
  definition       text,
  part_of_speech   text,
  pronunciation    text,
  example_sentence text,
  synonyms         jsonb default '[]',
  antonyms         jsonb default '[]',
  difficulty       text default 'medium' check (difficulty in ('easy', 'medium', 'hard')),
  tags             jsonb default '[]',
  source_type      text default 'topic',
  created_at       timestamptz default now(),
  updated_at       timestamptz default now()
);

-- ─────────────────────────────────────────
-- card_progress
-- ─────────────────────────────────────────
create table if not exists card_progress (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null references profiles(id) on delete cascade,
  card_id         uuid not null references cards(id) on delete cascade,
  ease_factor     decimal(5,4) default 2.5,
  interval        integer default 0,
  repetitions     integer default 0,
  due_date        timestamptz default now(),
  last_reviewed   timestamptz,
  again_count     integer default 0,
  hard_count      integer default 0,
  good_count      integer default 0,
  easy_count      integer default 0,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now(),
  unique (user_id, card_id)
);

-- ─────────────────────────────────────────
-- reviews
-- ─────────────────────────────────────────
create table if not exists reviews (
  id                    uuid primary key default uuid_generate_v4(),
  user_id               uuid not null references profiles(id) on delete cascade,
  card_id               uuid not null references cards(id) on delete cascade,
  rating                text not null check (rating in ('again', 'hard', 'good', 'easy')),
  previous_interval     integer default 0,
  new_interval          integer default 0,
  previous_ease_factor  decimal(5,4) default 2.5,
  new_ease_factor       decimal(5,4) default 2.5,
  reviewed_at           timestamptz default now()
);

-- ─────────────────────────────────────────
-- Indexes
-- ─────────────────────────────────────────
create index if not exists idx_decks_user_id        on decks(user_id);
create index if not exists idx_decks_share_token    on decks(share_token);
create index if not exists idx_cards_deck_id        on cards(deck_id);
create index if not exists idx_card_progress_user   on card_progress(user_id);
create index if not exists idx_card_progress_card   on card_progress(card_id);
create index if not exists idx_card_progress_due    on card_progress(due_date);
create index if not exists idx_reviews_user_id      on reviews(user_id);
create index if not exists idx_reviews_card_id      on reviews(card_id);
create index if not exists idx_reviews_reviewed_at  on reviews(reviewed_at);
