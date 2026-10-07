import { LegalLayout, Section } from './LegalLayout'
import { Link } from 'react-router-dom'

export default function Consent() {
  return (
    <LegalLayout title="Consent & Data Processing" lastUpdated="January 1, 2025">
      <Section title="1. Your Consent">
        <p>By creating an account and using Flashcards, you consent to the collection and processing of your personal data as described in our <Link to="/privacy" className="text-[var(--color-accent)] hover:underline">Privacy Policy</Link>.</p>
        <p>You may withdraw consent at any time by deleting your account. Withdrawal of consent does not affect the lawfulness of processing before withdrawal.</p>
      </Section>

      <Section title="2. What You Consent To">
        <ul className="list-disc list-inside flex flex-col gap-1.5 text-[var(--color-text-muted)]">
          <li>Storage of your account information (name, email) in our database</li>
          <li>Storage of flashcard decks, cards, and review history you create</li>
          <li>Processing of text and images you submit through the AI generation feature by our third-party AI providers</li>
          <li>Storage of your spaced repetition progress and review history</li>
          <li>Use of an authentication cookie to maintain your session</li>
          <li>Storage of your theme preference in localStorage</li>
        </ul>
      </Section>

      <Section title="3. AI Content Processing">
        <p>When you use the AI generation features, the content you submit (topics, notes, images) is sent to third-party AI providers for processing (Groq for text generation and Cloudflare Workers AI for image reading). This is subject to those providers' data processing terms. We recommend not submitting sensitive personal information through the generation interface.</p>
      </Section>

      <Section title="4. Legal Basis for Processing">
        <p>We process your data on the following legal bases:</p>
        <ul className="list-disc list-inside flex flex-col gap-1.5 text-[var(--color-text-muted)]">
          <li><strong className="text-[var(--color-text-secondary)]">Contract</strong> — processing necessary to provide the service you signed up for</li>
          <li><strong className="text-[var(--color-text-secondary)]">Consent</strong> — for optional features and communications</li>
          <li><strong className="text-[var(--color-text-secondary)]">Legitimate interests</strong> — for security, fraud prevention, and service improvement</li>
        </ul>
      </Section>

      <Section title="5. Data Subject Rights">
        <p>Under applicable data protection law, you have the right to:</p>
        <ul className="list-disc list-inside flex flex-col gap-1.5 text-[var(--color-text-muted)]">
          <li><strong className="text-[var(--color-text-secondary)]">Access</strong> — request a copy of your personal data</li>
          <li><strong className="text-[var(--color-text-secondary)]">Rectification</strong> — correct inaccurate data</li>
          <li><strong className="text-[var(--color-text-secondary)]">Erasure</strong> — request deletion of your data</li>
          <li><strong className="text-[var(--color-text-secondary)]">Portability</strong> — receive your data in a machine-readable format</li>
          <li><strong className="text-[var(--color-text-secondary)]">Objection</strong> — object to processing based on legitimate interests</li>
          <li><strong className="text-[var(--color-text-secondary)]">Restriction</strong> — request restriction of processing in certain circumstances</li>
        </ul>
        <p>To exercise any of these rights, contact us at <span className="text-[var(--color-text-primary)]">privacy@flashcards.app</span>.</p>
      </Section>

      <Section title="6. International Transfers">
        <p>Your data may be processed in countries outside your own, including the United States, where our service providers operate. We ensure appropriate safeguards are in place for such transfers.</p>
      </Section>

      <Section title="7. Changes to This Notice">
        <p>We will notify you of material changes to how we process your data. Continued use of the service after notification constitutes acceptance.</p>
      </Section>

      <Section title="8. Contact & Complaints">
        <p>For data protection queries: <span className="text-[var(--color-text-primary)]">privacy@flashcards.app</span></p>
        <p>You also have the right to lodge a complaint with your local data protection authority.</p>
      </Section>
    </LegalLayout>
  )
}
