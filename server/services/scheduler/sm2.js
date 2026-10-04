/**
 * SM-2 Algorithm
 * Rating map: again=0, hard=3, good=4, easy=5
 */
const QUALITY_MAP = { again: 0, hard: 3, good: 4, easy: 5 }

export function sm2(progress, rating) {
  const q = QUALITY_MAP[rating] ?? 4

  let { ease_factor = 2.5, interval = 0, repetitions = 0 } = progress

  if (q < 3) {
    // Failed — reset
    repetitions = 0
    interval = 1
  } else {
    if (repetitions === 0) interval = 1
    else if (repetitions === 1) interval = 6
    else interval = Math.round(interval * ease_factor)

    repetitions += 1
  }

  ease_factor = Math.max(1.3, ease_factor + 0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))

  const due_date = new Date()
  due_date.setDate(due_date.getDate() + interval)

  return {
    ease_factor: parseFloat(ease_factor.toFixed(4)),
    interval,
    repetitions,
    due_date: due_date.toISOString(),
    last_reviewed: new Date().toISOString(),
  }
}
