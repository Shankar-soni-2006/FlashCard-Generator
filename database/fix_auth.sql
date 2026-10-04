-- ─────────────────────────────────────────
-- FIX: Database error saving new user
-- Run this in Supabase SQL Editor
-- ─────────────────────────────────────────

-- 1. Make email nullable (Google OAuth doesn't always provide it at trigger time)
alter table profiles alter column email drop not null;

-- 2. Fix the trigger function with safe search_path and Google OAuth support
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

-- 3. Add missing INSERT policy on profiles
-- (the trigger is security definer so it bypasses RLS,
--  but Supabase auth internals still check for an insert policy)
drop policy if exists "Users can insert own profile" on profiles;
create policy "Users can insert own profile"
  on profiles for insert with check (auth.uid() = id);

-- 4. Fix card_progress: replace broad "for all" with explicit policies
drop policy if exists "Users can manage own progress" on card_progress;

create policy "Users can read own progress"
  on card_progress for select using (auth.uid() = user_id);

create policy "Users can insert own progress"
  on card_progress for insert with check (auth.uid() = user_id);

create policy "Users can update own progress"
  on card_progress for update using (auth.uid() = user_id);

create policy "Users can delete own progress"
  on card_progress for delete using (auth.uid() = user_id);

-- 5. Fix reviews: replace broad "for all" with explicit policies
drop policy if exists "Users can manage own reviews" on reviews;

create policy "Users can read own reviews"
  on reviews for select using (auth.uid() = user_id);

create policy "Users can insert own reviews"
  on reviews for insert with check (auth.uid() = user_id);

create policy "Users can delete own reviews"
  on reviews for delete using (auth.uid() = user_id);
