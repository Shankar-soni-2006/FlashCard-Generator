import { LegalLayout, Section } from './LegalLayout'

export default function Cookies() {
  return (
    <LegalLayout title="Cookie Policy" lastUpdated="January 1, 2025">
      <Section title="1. What Are Cookies">
        <p>Cookies are small text files stored on your device when you visit a website. We use cookies and similar technologies (such as localStorage) to operate the service.</p>
      </Section>

      <Section title="2. Cookies We Use">
        <div className="border border-[var(--color-border)] rounded-lg overflow-hidden">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[var(--color-border)] bg-[var(--color-border-subtle)]">
                <th className="text-left px-4 py-2.5 text-[var(--color-text-secondary)] font-medium">Name</th>
                <th className="text-left px-4 py-2.5 text-[var(--color-text-secondary)] font-medium">Purpose</th>
                <th className="text-left px-4 py-2.5 text-[var(--color-text-secondary)] font-medium">Duration</th>
              </tr>
            </thead>
            <tbody>
              {[
                { name: 'sb-auth-token', purpose: 'Supabase authentication session', duration: '1 week' },
                { name: 'theme', purpose: 'Stores your light/dark mode preference', duration: 'Persistent' },
              ].map((row, i) => (
                <tr key={i} className="border-b border-[var(--color-border-subtle)] last:border-0">
                  <td className="px-4 py-2.5 font-mono text-[var(--color-text-primary)]">{row.name}</td>
                  <td className="px-4 py-2.5 text-[var(--color-text-muted)]">{row.purpose}</td>
                  <td className="px-4 py-2.5 text-[var(--color-text-muted)]">{row.duration}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section title="3. Essential Cookies">
        <p>The authentication cookie is essential for the service to function. Without it, you cannot remain logged in. This cookie cannot be disabled while using the service.</p>
      </Section>

      <Section title="4. Preference Cookies">
        <p>The theme preference is stored in your browser's localStorage. This is not a cookie but functions similarly. It can be cleared by clearing your browser's site data.</p>
      </Section>

      <Section title="5. No Tracking or Advertising Cookies">
        <p>We do not use any third-party tracking, advertising, or analytics cookies. We do not share cookie data with advertisers.</p>
      </Section>

      <Section title="6. Managing Cookies">
        <p>You can control cookies through your browser settings. Disabling essential cookies will prevent you from using the authenticated parts of the service.</p>
      </Section>

      <Section title="7. Contact">
        <p>For cookie-related questions: <span className="text-[var(--color-text-primary)]">privacy@flashcards.app</span></p>
      </Section>
    </LegalLayout>
  )
}
