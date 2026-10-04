import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import DotField from '../components/common/DotField'
import { ThemeToggle } from '../components/common/ThemeToggle'
import { useTheme } from '../context/ThemeContext'
import StackedFeatures from '../components/common/StackedFeatures'
import {
  ArrowRight, Github, Linkedin, Menu, X
} from 'lucide-react'

/* ── Floating Nav ── */
function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <header
      className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 w-[calc(100%-2rem)] max-w-4xl
        rounded-xl border px-4 py-2.5 flex items-center justify-between
        ${scrolled
          ? 'bg-[var(--color-surface)]/90 backdrop-blur-md border-[var(--color-border)] shadow-sm'
          : 'bg-[var(--color-surface)]/60 backdrop-blur-sm border-[var(--color-border-subtle)]'
        }`}
    >
      <span className="text-sm font-semibold tracking-tight text-[var(--color-text-primary)]">
        Flashcards
      </span>

      {/* Desktop links */}
      <nav className="hidden md:flex items-center gap-6">
        {['Features', 'About', 'Pricing'].map(item => (
          <a
            key={item}
            href={`#${item.toLowerCase()}`}
            className="text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
          >
            {item}
          </a>
        ))}
      </nav>

      <div className="flex items-center gap-2">
        <ThemeToggle />
        <Link
          to="/login"
          className="hidden md:inline-flex items-center gap-1.5 h-8 px-4 rounded text-xs font-medium
            border border-[var(--color-border)] text-[var(--color-text-secondary)]
            hover:text-[var(--color-text-primary)] hover:border-[var(--color-text-muted)]
            transition-colors bg-[var(--color-surface)]"
        >
          Sign in
        </Link>
        <Link
          to="/register"
          className="hidden md:inline-flex items-center gap-1.5 h-8 px-4 rounded text-xs font-medium
            bg-[var(--color-text-primary)] text-[var(--color-bg)] hover:opacity-85 transition-opacity"
        >
          Get started
        </Link>
        <button
          className="md:hidden p-1.5 text-[var(--color-text-secondary)]"
          onClick={() => setMobileOpen(v => !v)}
        >
          {mobileOpen ? <X size={16} /> : <Menu size={16} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 rounded-xl border border-[var(--color-border)]
          bg-[var(--color-surface)] shadow-md p-4 flex flex-col gap-3">
          {['Features', 'About', 'Pricing'].map(item => (
            <a key={item} href={`#${item.toLowerCase()}`}
              onClick={() => setMobileOpen(false)}
              className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors">
              {item}
            </a>
          ))}
          <div className="h-px bg-[var(--color-border)]" />
          <Link to="/login" onClick={() => setMobileOpen(false)}
            className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors">
            Sign in
          </Link>
          <Link to="/register" onClick={() => setMobileOpen(false)}
            className="flex items-center justify-center h-9 rounded bg-[var(--color-text-primary)]
              text-[var(--color-bg)] text-sm font-medium hover:opacity-85 transition-opacity">
            Get started
          </Link>
        </div>
      )}
    </header>
  )
}

/* ── Hero ── */
function Hero() {
  const { dark } = useTheme()
  const glowColor = dark ? '#3b82f6' : '#2563eb'

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      {/* Radial fade — behind canvas, pointer-events-none */}
      <div className="absolute inset-0 z-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 80% 60% at 50% 50%, transparent 40%, var(--color-bg) 100%)`
        }}
      />

      {/* DotField — z-[1] so it sits above the fade and receives mouse events */}
      <div className="absolute inset-0 z-[1]">
        <DotField
          dotRadius={1.5}
          dotSpacing={22}
          bulgeStrength={67}
          glowRadius={180}
          cursorRadius={500}
          cursorForce={0.12}
          glowColor={glowColor}
        />
      </div>

      {/* Content — z-[2] sits above DotField */}
      <div className="relative z-[2] flex flex-col items-center text-center px-6 max-w-3xl mx-auto pointer-events-none">
        <div className="pointer-events-auto inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[var(--color-border)]
          bg-[var(--color-surface)]/80 backdrop-blur-sm mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-success)]" />
          <span className="text-xs text-[var(--color-text-secondary)]">Powered by Gemini AI</span>
        </div>

        <h1 className="text-5xl sm:text-6xl md:text-7xl font-semibold tracking-tight text-[var(--color-text-primary)] leading-[1.05]">
          Learn anything.<br />
          <span className="text-[var(--color-text-secondary)] font-normal">Remember everything.</span>
        </h1>

        <p className="mt-6 text-base sm:text-lg text-[var(--color-text-secondary)] max-w-xl leading-relaxed">
          Turn any topic, notes, or diagram into intelligent flashcards.
          Spaced repetition schedules your reviews so you study less and retain more.
        </p>

        <div className="pointer-events-auto mt-10 flex items-center gap-3 flex-wrap justify-center">
          <Link
            to="/register"
            className="inline-flex items-center gap-2 h-11 px-6 rounded-lg text-sm font-medium
              bg-[var(--color-text-primary)] text-[var(--color-bg)] hover:opacity-85 transition-opacity"
          >
            Start for free <ArrowRight size={14} />
          </Link>
          <a
            href="#features"
            className="inline-flex items-center gap-2 h-11 px-6 rounded-lg text-sm font-medium
              border border-[var(--color-border)] text-[var(--color-text-secondary)]
              hover:text-[var(--color-text-primary)] hover:border-[var(--color-text-muted)]
              transition-colors bg-[var(--color-surface)]/80 backdrop-blur-sm"
          >
            See how it works
          </a>
        </div>

        <p className="mt-5 text-xs text-[var(--color-text-muted)]">
          No credit card required · Free to use
        </p>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[2] flex flex-col items-center gap-1.5 animate-bounce pointer-events-none">
        <div className="w-px h-8 bg-gradient-to-b from-transparent to-[var(--color-border)]" />
      </div>
    </section>
  )
}

/* ── Features ── */
function Features() {
  return <StackedFeatures />
}

/* ── How it works ── */
const steps = [
  { n: '01', title: 'Generate', desc: 'Pick a topic, paste notes, or upload an image. Gemini creates your deck instantly.' },
  { n: '02', title: 'Study', desc: 'Flip through cards at your own pace. Reveal answers when ready.' },
  { n: '03', title: 'Rate', desc: 'Mark each card Again, Hard, Good, or Easy. Takes two seconds.' },
  { n: '04', title: 'Review', desc: 'The SM-2 algorithm schedules each card at the perfect interval. Come back tomorrow.' },
]

function HowItWorks() {
  return (
    <section id="about" className="py-24 px-6 border-t border-[var(--color-border-subtle)]">
      <div className="max-w-4xl mx-auto">
        <div className="mb-14 text-center">
          <p className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-widest mb-3">How it works</p>
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[var(--color-text-primary)]">
            From zero to fluent in four steps
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map(({ n, title, desc }) => (
            <div key={n} className="flex flex-col gap-4">
              <span className="text-3xl font-semibold text-[var(--color-border)] font-mono">{n}</span>
              <div className="h-px w-8 bg-[var(--color-border)]" />
              <p className="text-sm font-medium text-[var(--color-text-primary)]">{title}</p>
              <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ── CTA ── */
function CTA() {
  return (
    <section className="py-24 px-6 border-t border-[var(--color-border-subtle)]">
      <div className="max-w-2xl mx-auto text-center flex flex-col items-center gap-6">
        <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[var(--color-text-primary)]">
          Start learning smarter today.
        </h2>
        <p className="text-sm text-[var(--color-text-secondary)]">
          Free to use. No credit card required.
        </p>
        <Link
          to="/register"
          className="inline-flex items-center gap-2 h-11 px-8 rounded-lg text-sm font-medium
            bg-[var(--color-text-primary)] text-[var(--color-bg)] hover:opacity-85 transition-opacity"
        >
          Create free account <ArrowRight size={14} />
        </Link>
      </div>
    </section>
  )
}

/* ── Footer ── */
function Footer() {
  return (
    <footer className="border-t border-[var(--color-border)] px-6 py-10">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start justify-between gap-8">
          <div>
            <p className="text-sm font-semibold text-[var(--color-text-primary)]">Flashcards</p>
            <p className="text-xs text-[var(--color-text-muted)] mt-1 max-w-xs">
              AI-powered spaced repetition for students and lifelong learners.
            </p>
          </div>

          <div className="flex gap-12">
            <div className="flex flex-col gap-2">
              <p className="text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wide mb-1">Product</p>
              <Link to="/register" className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors">Get started</Link>
              <Link to="/login" className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors">Sign in</Link>
              <a href="#features" className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors">Features</a>
            </div>
            <div className="flex flex-col gap-2">
              <p className="text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wide mb-1">Legal</p>
              <Link to="/privacy" className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors">Privacy Policy</Link>
              <Link to="/terms" className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors">Terms of Service</Link>
              <Link to="/cookies" className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors">Cookie Policy</Link>
              <Link to="/consent" className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors">Consent</Link>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-[var(--color-border-subtle)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex flex-col gap-1">
            <p className="text-xs text-[var(--color-text-muted)]">
              © {new Date().getFullYear()} Flashcards. All rights reserved.
            </p>
            <p className="text-xs text-[var(--color-text-muted)]">
              Developed by{' '}
              <a
                href="https://github.com/Shankar-soni-2006"
                target="_blank"
                rel="noreferrer"
                className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
              >
                Shankar Soni
              </a>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <a href="https://github.com/Shankar-soni-2006" target="_blank" rel="noreferrer"
              className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors">
              <Github size={14} />
            </a>
            <a href="https://www.linkedin.com/in/shankar-soni-82b246337/" target="_blank" rel="noreferrer"
              className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors">
              <Linkedin size={14} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default function Landing() {
  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <Nav />
      <Hero />
      <Features />
      <HowItWorks />
      <CTA />
      <Footer />
    </div>
  )
}
