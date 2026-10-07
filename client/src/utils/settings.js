// Per-user study preferences, stored in the Supabase user metadata (no extra table needed).
export const CARD_COUNT_OPTIONS = [5, 10, 15, 20, 30]
export const DIFFICULTY_OPTIONS = ['auto', 'easy', 'medium', 'hard']
export const DAILY_NEW_OPTIONS = [5, 10, 20, 50, 100]

export const DEFAULT_SETTINGS = {
  default_card_count: 10,
  default_difficulty: 'auto',
  daily_new_limit: 50,
}

export function getSettings(user) {
  const saved = user?.user_metadata?.settings || {}
  return {
    default_card_count: CARD_COUNT_OPTIONS.includes(saved.default_card_count) ? saved.default_card_count : DEFAULT_SETTINGS.default_card_count,
    default_difficulty: DIFFICULTY_OPTIONS.includes(saved.default_difficulty) ? saved.default_difficulty : DEFAULT_SETTINGS.default_difficulty,
    daily_new_limit: DAILY_NEW_OPTIONS.includes(saved.daily_new_limit) ? saved.daily_new_limit : DEFAULT_SETTINGS.daily_new_limit,
  }
}
