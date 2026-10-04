import { useEffect, useRef, useState } from 'react'

// ── Previews ──────────────────────────────────────────────────────────────────

function PreviewGenerate() {
  return (
    <div className="w-full rounded-lg border border-[var(--color-border,#e5e5e3)] bg-[var(--color-bg,#fafaf9)] p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-[var(--color-text-primary,#1a1a18)]">Create flashcards</span>
        <span className="text-[10px] text-[var(--color-text-muted,#9b9b97)] font-mono">Topic</span>
      </div>
      <div className="h-px bg-[var(--color-border-subtle,#f0f0ee)]" />
      <div className="rounded border border-[var(--color-border,#e5e5e3)] px-3 py-2 text-xs text-[var(--color-text-secondary,#6b6b67)]">
        Database Normalization
      </div>
      <div className="flex items-center gap-1.5">
        {['5', '10', '15', '20'].map(n => (
          <span
            key={n}
            className={`w-7 h-7 rounded border text-[10px] flex items-center justify-center transition-colors duration-200 ${
              n === '10'
                ? 'border-[var(--color-text-primary,#1a1a18)] bg-[var(--color-text-primary,#1a1a18)] text-[var(--color-bg,#fafaf9)]'
                : 'border-[var(--color-border,#e5e5e3)] text-[var(--color-text-muted,#9b9b97)]'
            }`}
          >{n}</span>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1.5 rounded-full bg-[var(--color-border-subtle,#f0f0ee)] overflow-hidden">
          <div className="h-full w-2/3 rounded-full bg-[var(--color-accent,#2563eb)] animate-pulse" />
        </div>
        <span className="text-[10px] text-[var(--color-text-muted,#9b9b97)]">Generating…</span>
      </div>
      <div className="flex gap-1.5 flex-wrap">
        {['Concepts', 'Questions', 'Answers'].map(t => (
          <span key={t} className="px-2 py-0.5 rounded text-[10px] border border-[var(--color-border,#e5e5e3)] text-[var(--color-text-muted,#9b9b97)]">{t}</span>
        ))}
      </div>
    </div>
  )
}

function PreviewSM2() {
  const rows = [
    { label: 'Today',    w: '100%', active: true },
    { label: 'Tomorrow', w: '72%',  active: false },
    { label: '3 days',   w: '48%',  active: false },
    { label: '7 days',   w: '28%',  active: false },
  ]
  return (
    <div className="w-full rounded-lg border border-[var(--color-border,#e5e5e3)] bg-[var(--color-bg,#fafaf9)] p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-[var(--color-text-primary,#1a1a18)]">Next review</span>
        <span className="text-[10px] font-mono text-[var(--color-accent,#2563eb)]">SM-2</span>
      </div>
      <div className="h-px bg-[var(--color-border-subtle,#f0f0ee)]" />
      {rows.map(({ label, w, active }) => (
        <div key={label} className="flex items-center gap-3">
          <span className={`text-[10px] w-16 shrink-0 ${active ? 'text-[var(--color-text-primary,#1a1a18)] font-medium' : 'text-[var(--color-text-muted,#9b9b97)]'}`}>
            {label}
          </span>
          <div className="flex-1 h-1 rounded-full bg-[var(--color-border-subtle,#f0f0ee)]">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: w, background: active ? 'var(--color-accent,#2563eb)' : 'var(--color-border,#e5e5e3)' }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

function PreviewCode() {
  return (
    <div className="w-full rounded-lg border border-[var(--color-border,#e5e5e3)] bg-[var(--color-bg,#fafaf9)] p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[var(--color-border-subtle,#f0f0ee)] text-[var(--color-text-secondary,#6b6b67)]">JAVA</span>
        <span className="text-[10px] text-[var(--color-text-muted,#9b9b97)]">Method overloading</span>
      </div>
      <pre className="text-[10px] font-mono leading-relaxed text-[var(--color-text-secondary,#6b6b67)] bg-[var(--color-border-subtle,#f0f0ee)] rounded p-3 overflow-hidden">{`class Calculator {
  int add(int a, int b) {
    return a + b;
  }
  int add(int a, int b,
          int c) {
    return a + b + c;
  }
}`}</pre>
    </div>
  )
}

function PreviewVocab() {
  return (
    <div className="w-full rounded-lg border border-[var(--color-border,#e5e5e3)] bg-[var(--color-bg,#fafaf9)] p-4 flex flex-col gap-3">
      <div>
        <p className="text-base font-semibold tracking-tight text-[var(--color-text-primary,#1a1a18)]">EPHEMERAL</p>
        <p className="text-[10px] text-[var(--color-text-muted,#9b9b97)] italic mt-0.5">adjective</p>
      </div>
      <div className="h-px bg-[var(--color-border-subtle,#f0f0ee)]" />
      <p className="text-xs text-[var(--color-text-secondary,#6b6b67)] leading-relaxed">Existing for a short period of time.</p>
      <p className="text-[10px] text-[var(--color-text-muted,#9b9b97)] italic">"The beauty of the sunset was ephemeral."</p>
      <div className="flex gap-1.5 flex-wrap">
        {['temporary', 'fleeting', 'transient'].map(s => (
          <span key={s} className="text-[10px] text-[var(--color-text-muted,#9b9b97)] border border-[var(--color-border-subtle,#f0f0ee)] px-1.5 py-0.5 rounded">{s}</span>
        ))}
      </div>
    </div>
  )
}

function PreviewImage() {
  return (
    <div className="w-full rounded-lg border border-[var(--color-border,#e5e5e3)] bg-[var(--color-bg,#fafaf9)] p-4 flex flex-col gap-3">
      <span className="text-xs font-medium text-[var(--color-text-primary,#1a1a18)]">Generate from image</span>
      <div className="border-2 border-dashed border-[var(--color-border,#e5e5e3)] rounded-lg p-5 flex flex-col items-center gap-2">
        <div className="w-8 h-8 rounded border border-[var(--color-border,#e5e5e3)] flex items-center justify-center">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-[var(--color-text-muted,#9b9b97)]">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
          </svg>
        </div>
        <p className="text-[10px] text-[var(--color-text-muted,#9b9b97)]">Drop diagram here</p>
        <p className="text-[9px] text-[var(--color-text-muted,#9b9b97)] opacity-60">PNG · JPG · WEBP</p>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-warning,#d97706)] animate-pulse" />
        <span className="text-[10px] text-[var(--color-text-muted,#9b9b97)]">Analyzing diagram…</span>
      </div>
    </div>
  )
}

function PreviewQueue() {
  return (
    <div className="w-full rounded-lg border border-[var(--color-border,#e5e5e3)] bg-[var(--color-bg,#fafaf9)] p-4 flex flex-col gap-3">
      <span className="text-xs font-medium text-[var(--color-text-primary,#1a1a18)]">Today's review</span>
      <div className="h-px bg-[var(--color-border-subtle,#f0f0ee)]" />
      <div className="flex items-end justify-between">
        <div>
          <p className="text-3xl font-semibold tracking-tight text-[var(--color-text-primary,#1a1a18)]">18</p>
          <p className="text-[10px] text-[var(--color-text-muted,#9b9b97)] mt-0.5">cards due</p>
        </div>
        <div className="flex flex-col gap-1 items-end">
          {[
            ['Again', '#dc2626'],
            ['Hard',  '#d97706'],
            ['Good',  '#6b6b67'],
            ['Easy',  '#16a34a'],
          ].map(([l, c]) => (
            <div key={l} className="flex items-center gap-1.5">
              <span className="text-[9px] text-[var(--color-text-muted,#9b9b97)]">{l}</span>
              <div className="w-8 h-1 rounded-full opacity-50" style={{ background: c }} />
            </div>
          ))}
        </div>
      </div>
      <div className="h-8 rounded border border-[var(--color-border,#e5e5e3)] flex items-center justify-center">
        <span className="text-[10px] font-medium text-[var(--color-text-primary,#1a1a18)]">Start review →</span>
      </div>
    </div>
  )
}

function PreviewAnalytics() {
  const bars = [3, 5, 4, 7, 6, 8, 5, 9, 7, 10, 8, 11, 9, 12]
  const max = Math.max(...bars)
  return (
    <div className="w-full rounded-lg border border-[var(--color-border,#e5e5e3)] bg-[var(--color-bg,#fafaf9)] p-4 flex flex-col gap-3">
      <div className="grid grid-cols-4 gap-2">
        {[['Reviews', '142'], ['Accuracy', '84%'], ['Streak', '7d'], ['Mastered', '38']].map(([l, v]) => (
          <div key={l} className="flex flex-col gap-0.5">
            <span className="text-sm font-semibold text-[var(--color-text-primary,#1a1a18)]">{v}</span>
            <span className="text-[9px] text-[var(--color-text-muted,#9b9b97)]">{l}</span>
          </div>
        ))}
      </div>
      <div className="h-px bg-[var(--color-border-subtle,#f0f0ee)]" />
      <div className="flex items-end gap-0.5 h-10">
        {bars.map((h, i) => (
          <div
            key={i}
            className="flex-1 rounded-sm transition-all duration-300"
            style={{
              height: `${(h / max) * 100}%`,
              background: 'var(--color-text-primary,#1a1a18)',
              opacity: 0.15 + (h / max) * 0.6,
            }}
          />
        ))}
      </div>
    </div>
  )
}

function PreviewSharing() {
  return (
    <div className="w-full rounded-lg border border-[var(--color-border,#e5e5e3)] bg-[var(--color-bg,#fafaf9)] p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-[var(--color-text-primary,#1a1a18)]">DBMS Fundamentals</span>
        <span className="text-[10px] px-1.5 py-0.5 rounded border border-[var(--color-border,#e5e5e3)] text-[var(--color-text-muted,#9b9b97)]">Public</span>
      </div>
      <div className="h-px bg-[var(--color-border-subtle,#f0f0ee)]" />
      <div className="flex items-center gap-2 rounded border border-[var(--color-border,#e5e5e3)] px-2.5 py-1.5">
        <span className="text-[9px] font-mono text-[var(--color-text-muted,#9b9b97)] truncate flex-1">flashcards.app/shared/a3f9…</span>
        <span className="text-[9px] text-[var(--color-accent,#2563eb)] shrink-0">Copy</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex -space-x-1.5">
          {[0, 1, 2].map(i => (
            <div key={i} className="w-5 h-5 rounded-full border-2 border-[var(--color-surface,#ffffff)] bg-[var(--color-border,#e5e5e3)]" />
          ))}
        </div>
        <span className="text-[10px] text-[var(--color-text-muted,#9b9b97)]">3 people viewing</span>
      </div>
    </div>
  )
}

// ── Feature data ──────────────────────────────────────────────────────────────

const FEATURES = [
  { n: '01', tag: 'AI Generation',   title: 'AI Flashcard\nGeneration',       desc: 'Turn topics, notes and study material into structured flashcards using AI. Five generation modes — topic, notes, programming, vocabulary, and image.', Preview: PreviewGenerate },
  { n: '02', tag: 'Memory Science',  title: 'Spaced\nRepetition',             desc: 'The SM-2 algorithm automatically determines when each card should be reviewed. Study less. Retain more.',                                                Preview: PreviewSM2 },
  { n: '03', tag: 'Developer Tools', title: 'Programming\nLearning',          desc: 'Generate programming-focused flashcards with syntax-highlighted code examples for Java, Python, JavaScript, C++ and more.',                              Preview: PreviewCode },
  { n: '04', tag: 'Language',        title: 'Vocabulary\nLearning',           desc: 'Create structured vocabulary cards with definitions, pronunciation, example sentences, synonyms and antonyms.',                                           Preview: PreviewVocab },
  { n: '05', tag: 'Multimodal AI',   title: 'Image & Diagram\nUnderstanding', desc: 'Upload diagrams, flowcharts, technical images or handwritten notes. Gemini extracts the concepts and generates cards automatically.',                     Preview: PreviewImage },
  { n: '06', tag: 'Daily Practice',  title: 'Smart Review\nQueue',            desc: 'See exactly which cards are due today. The queue prioritizes overdue cards so you always focus on what matters most.',                                    Preview: PreviewQueue },
  { n: '07', tag: 'Progress',        title: 'Learning\nAnalytics',            desc: 'Track reviews, accuracy, streaks, mastered cards and learning progress over time with clean minimal charts.',                                             Preview: PreviewAnalytics },
  { n: '08', tag: 'Collaboration',   title: 'Deck\nSharing',                  desc: 'Generate a secure public link for any deck. Private decks stay protected. Perfect for study groups and classrooms.',                                      Preview: PreviewSharing },
]

// ── Card layout ───────────────────────────────────────────────────────────────

function CardContent({ feature }) {
  const { n, tag, title, desc, Preview } = feature
  return (
    <div className="grid grid-cols-1 md:grid-cols-2" style={{ minHeight: CARD_H }}>
      <div className="p-8 md:p-10 flex flex-col justify-between gap-6 border-b md:border-b-0 md:border-r border-[var(--color-border-subtle,#f0f0ee)]">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono text-[var(--color-text-muted,#9b9b97)]">{n}</span>
          <span className="text-[10px] uppercase tracking-widest text-[var(--color-text-muted,#9b9b97)] font-medium">{tag}</span>
        </div>
        <div className="flex flex-col gap-4 flex-1 justify-center">
          <h3 className="text-2xl md:text-[1.75rem] font-semibold tracking-tight text-[var(--color-text-primary,#1a1a18)] leading-tight whitespace-pre-line">
            {title}
          </h3>
          <p className="text-sm text-[var(--color-text-secondary,#6b6b67)] leading-relaxed max-w-xs">{desc}</p>
        </div>
        <div className="h-px w-8 bg-[var(--color-border,#e5e5e3)]" />
      </div>
      <div
        className="p-8 md:p-10 flex items-center justify-center"
        style={{ background: 'var(--color-border-subtle,#f0f0ee)' }}
      >
        <div className="w-full max-w-[280px]">
          <Preview />
        </div>
      </div>
    </div>
  )
}

// ── Stack constants ───────────────────────────────────────────────────────────
const CARD_H = 420
const STACK_TOP = 88
const STACK_OFFSET = 18

export default function StackedFeatures() {
  return (
    <section
      id="features"
      className="border-t border-[var(--color-border-subtle,#f0f0ee)]"
    >
      {/* Intro */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-24 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-end">
          <div>
            <p className="text-xs font-medium text-[var(--color-text-muted,#9b9b97)] uppercase tracking-widest mb-4">
              Features
            </p>

            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[var(--color-text-primary,#1a1a18)] leading-tight">
              Everything you need to
              <br />
              <span className="text-[var(--color-text-secondary,#6b6b67)] font-normal">
                remember what you learn.
              </span>
            </h2>
          </div>

          <p className="text-sm text-[var(--color-text-secondary,#6b6b67)] leading-relaxed md:max-w-xs md:ml-auto">
            From AI generation to spaced repetition, every part of the system
            is designed around one goal — helping knowledge stick.
          </p>
        </div>
      </div>

      {/* Scroll-driven stacked cards */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-[20vh]">
        {FEATURES.map((feature, i) => (
          <article
            key={feature.n}
            className="
              feature-card-stack
              sticky
              mb-15
              rounded-xl
              border
              border-[var(--color-border,#e5e5e3)]
              bg-[var(--color-surface,#ffffff)]
              overflow-hidden
              shadow-[0_1px_4px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.06)]
            "
            style={{
              top: `calc(${STACK_TOP}px + ${i} * ${STACK_OFFSET}px)`,
              zIndex: 10 + i,
              transformOrigin: "top center",
            }}
          >
            <CardContent feature={feature} />
          </article>
        ))}

        {/* End spacing */}
        <div style={{ height: CARD_H }} />
      </div>
    </section>
  )
}