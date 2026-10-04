-- Enable RLS on all tables
alter table profiles      enable row level security;
alter table decks         enable row level security;
alter table cards         enable row level security;
alter table card_progress enable row level security;
alter table reviews       enable row level security;

-- ─────────────────────────────────────────
-- profiles
-- ─────────────────────────────────────────
-- The handle_new_user trigger runs as security definer (postgres role),
-- so it bypasses RLS. But we still need an INSERT policy for any
-- direct inserts and to avoid Supabase auth errors.
create policy "Users can insert own profile"
  on profiles for insert with check (auth.uid() = id);

create policy "Users can read own profile"
  on profiles for select using (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update using (auth.uid() = id);

-- ─────────────────────────────────────────
-- decks
-- ─────────────────────────────────────────
create policy "Users can read own decks"
  on decks for select using (auth.uid() = user_id);

create policy "Users can read public decks"
  on decks for select using (visibility = 'public');

create policy "Users can create decks"
  on decks for insert with check (auth.uid() = user_id);

create policy "Users can update own decks"
  on decks for update using (auth.uid() = user_id);

create policy "Users can delete own decks"
  on decks for delete using (auth.uid() = user_id);

-- ─────────────────────────────────────────
-- cards
-- ─────────────────────────────────────────
create policy "Users can read cards in own decks"
  on cards for select using (
    exists (select 1 from decks where decks.id = cards.deck_id and decks.user_id = auth.uid())
  );

create policy "Users can read cards in public decks"
  on cards for select using (
    exists (select 1 from decks where decks.id = cards.deck_id and decks.visibility = 'public')
  );

create policy "Users can create cards in own decks"
  on cards for insert with check (
    exists (select 1 from decks where decks.id = cards.deck_id and decks.user_id = auth.uid())
  );

create policy "Users can update cards in own decks"
  on cards for update using (
    exists (select 1 from decks where decks.id = cards.deck_id and decks.user_id = auth.uid())
  );

create policy "Users can delete cards in own decks"
  on cards for delete using (
    exists (select 1 from decks where decks.id = cards.deck_id and decks.user_id = auth.uid())
  );

-- ─────────────────────────────────────────
-- card_progress
-- ─────────────────────────────────────────
create policy "Users can read own progress"
  on card_progress for select using (auth.uid() = user_id);

create policy "Users can insert own progress"
  on card_progress for insert with check (auth.uid() = user_id);

create policy "Users can update own progress"
  on card_progress for update using (auth.uid() = user_id);

create policy "Users can delete own progress"
  on card_progress for delete using (auth.uid() = user_id);

-- ─────────────────────────────────────────
-- reviews
-- ─────────────────────────────────────────
create policy "Users can read own reviews"
  on reviews for select using (auth.uid() = user_id);

create policy "Users can insert own reviews"
  on reviews for insert with check (auth.uid() = user_id);

create policy "Users can delete own reviews"
  on reviews for delete using (auth.uid() = user_id);
