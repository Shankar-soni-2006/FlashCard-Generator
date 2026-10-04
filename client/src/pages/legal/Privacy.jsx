import { LegalLayout, Section } from './LegalLayout'

export default function Privacy() {
  return (
    <LegalLayout title="Privacy Policy" lastUpdated="January 1, 2025">
      <Section title="1. Information We Collect">
        <p>We collect information you provide directly to us when you create an account, including your name, email address, and password. If you sign in with Google, we receive your name and email from Google.</p>
        <p>We also collect content you create within the application, including flashcard decks, cards, and review history.</p>
      </Section>

      <Section title="2. How We Use Your Information">
        <p>We use the information we collect to:</p>
        <ul className="list-disc list-inside flex flex-col gap-1 text-[var(--color-text-muted)]">
          <li>Provide, maintain, and improve the service</li>
          <li>Process your flashcard generation requests via the Gemini AI API</li>
          <li>Calculate and store your spaced repetition schedule</li>
          <li>Send you transactional emails such as password resets</li>
          <li>Monitor and analyze usage patterns to improve the product</li>
        </ul>
      </Section>

      <Section title="3. Data Storage">
        <p>Your data is stored in Supabase, a PostgreSQL database hosted on AWS infrastructure. All data is encrypted at rest and in transit using TLS.</p>
        <p>Images you upload for flashcard generation are stored in Supabase Storage and are associated with your account.</p>
      </Section>

      <Section title="4. Third-Party Services">
        <p>We use the following third-party services:</p>
        <ul className="list-disc list-inside flex flex-col gap-1 text-[var(--color-text-muted)]">
          <li><strong className="text-[var(--color-text-secondary)]">Supabase</strong> — authentication and database</li>
          <li><strong className="text-[var(--color-text-secondary)]">Google Gemini API</strong> — AI flashcard generation. Content you submit for generation is processed by Google. See Google's privacy policy at policies.google.com.</li>
          <li><strong className="text-[var(--color-text-secondary)]">Google OAuth</strong> — optional sign-in method</li>
        </ul>
      </Section>

      <Section title="5. Data Sharing">
        <p>We do not sell, trade, or rent your personal information to third parties. We may share data with service providers who assist in operating the platform, subject to confidentiality agreements.</p>
        <p>If you make a deck public, its content is accessible to anyone with the share link.</p>
      </Section>

      <Section title="6. Data Retention">
        <p>We retain your data for as long as your account is active. You may delete your account at any time, which will permanently remove your data from our systems within 30 days.</p>
      </Section>

      <Section title="7. Your Rights">
        <p>Depending on your jurisdiction, you may have the right to access, correct, or delete your personal data. To exercise these rights, contact us at the email below.</p>
      </Section>

      <Section title="8. Cookies">
        <p>We use essential cookies for authentication session management. See our Cookie Policy for details.</p>
      </Section>

      <Section title="9. Children's Privacy">
        <p>This service is not directed to children under 13. We do not knowingly collect personal information from children under 13.</p>
      </Section>

      <Section title="10. Contact">
        <p>For privacy-related questions, contact us at: <span className="text-[var(--color-text-primary)]">privacy@flashcards.app</span></p>
      </Section>
    </LegalLayout>
  )
}
