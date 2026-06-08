'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import styles from '@/components/editorial/editorial.module.css';

const TABS = [
  { id: 'help', label: 'Help Centre' },
  { id: 'contact', label: 'Contact' },
  { id: 'privacy', label: 'Privacy' },
  { id: 'terms', label: 'Terms' },
];

const FAQS = [
  {
    question: 'How do I create an account?',
    answer:
      'Click "Sign up" and register with your .edu.au email address. You\'ll receive a verification email to complete registration.',
  },
  {
    question: 'Can I leave a review without a verified account?',
    answer:
      'No — all reviews must come from verified .edu.au email addresses to keep the platform trustworthy.',
  },
  {
    question: 'How do I search for accommodations?',
    answer:
      'Use Browse to filter by university, suburb, price and rating, or take the Quiz for a ranked shortlist.',
  },
  {
    question: 'Can I edit or delete my review?',
    answer:
      'Yes. Reviews can be edited or deleted from your profile at any time under "My Reviews".',
  },
  {
    question: 'What if I see an inappropriate review?',
    answer:
      'Use the "Report" action on any review that breaks our guidelines. The moderation team will investigate.',
  },
  {
    question: 'Is my personal information safe?',
    answer:
      'Yes. We use industry-standard encryption, never sell your data, and comply with Australian privacy law.',
  },
  {
    question: 'How are ratings calculated?',
    answer:
      'Overall ratings average six criteria — cleanliness, location, value, amenities, management and safety — weighted equally.',
  },
];

function SupportContent() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(tabParam || 'help');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    if (tabParam && ['help', 'contact', 'privacy', 'terms'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1200));
    setIsSubmitting(false);
    setSubmitSuccess(true);
    setFormData({ name: '', email: '', subject: '', message: '' });
    setTimeout(() => setSubmitSuccess(false), 5000);
  };

  const heading: Record<string, React.ReactNode> = {
    help: (
      <>
        How can we
        <br />
        <em>help?</em>
      </>
    ),
    contact: (
      <>
        Get in
        <br />
        <em>touch.</em>
      </>
    ),
    privacy: (
      <>
        Privacy
        <br />
        <em>policy.</em>
      </>
    ),
    terms: (
      <>
        Terms of
        <br />
        <em>service.</em>
      </>
    ),
  };

  return (
    <div className={styles.page}>
      <div className={styles.titlebarSingle}>
        <div className={styles.kicker}>§ SUPPORT — HELP & LEGAL</div>
        <h1 className={styles.h1}>{heading[activeTab]}</h1>
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        {TABS.map((t) => (
          <button
            key={t.id}
            className={`${styles.tab} ${activeTab === t.id ? styles.tabActive : ''}`}
            onClick={() => setActiveTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── HELP ── */}
      {activeTab === 'help' && (
        <section className={styles.section}>
          <div className={styles.kickerMute} style={{ marginBottom: 24 }}>
            ↘ FREQUENTLY ASKED
          </div>
          <div style={{ maxWidth: 820 }}>
            {FAQS.map((faq, i) => (
              <div key={i} className={styles.accItem}>
                <button
                  className={styles.accBtn}
                  onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                >
                  {faq.question}
                  <span className={styles.accIcon}>{expandedFaq === i ? '−' : '+'}</span>
                </button>
                {expandedFaq === i && <div className={styles.accBody}>{faq.answer}</div>}
              </div>
            ))}
          </div>
          <p className={styles.hint} style={{ marginTop: 28 }}>
            Can&apos;t find it?{' '}
            <button
              onClick={() => setActiveTab('contact')}
              className={styles.resend}
              style={{ textTransform: 'none', letterSpacing: 0 }}
            >
              Contact the team →
            </button>
          </p>
        </section>
      )}

      {/* ── CONTACT ── */}
      {activeTab === 'contact' && (
        <section className={styles.section}>
          <div className={styles.sectionHead}>
            <div className={styles.kicker}>§ CONTACT</div>
            <h2 className={styles.h2}>
              We reply within <em>24 hours.</em>
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.4fr) 1fr', gap: 56 }}>
            <div className={styles.card}>
              {submitSuccess && (
                <div
                  className={styles.errorBox}
                  style={{
                    borderColor: 'var(--blue)',
                    background: 'var(--ed-blue-soft)',
                    color: 'var(--blue)',
                  }}
                >
                  Message sent — we&apos;ll be in touch soon.
                </div>
              )}
              <form onSubmit={handleSubmit}>
                <div className={styles.field}>
                  <label className={styles.label} htmlFor="contact-name">
                    Name
                  </label>
                  <input
                    id="contact-name"
                    className={styles.input}
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    placeholder="Your name"
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.label} htmlFor="contact-email">
                    Email
                  </label>
                  <input
                    id="contact-email"
                    className={styles.input}
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    placeholder="your@email.com"
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.label} htmlFor="contact-subject">
                    Subject
                  </label>
                  <input
                    id="contact-subject"
                    className={styles.input}
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    required
                    placeholder="What's this about?"
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.label} htmlFor="contact-message">
                    Message
                  </label>
                  <textarea
                    id="contact-message"
                    className={styles.textarea}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    required
                    rows={5}
                    placeholder="Tell us more…"
                  />
                </div>
                <button type="submit" disabled={isSubmitting} className={styles.btnPrimary}>
                  {isSubmitting ? 'Sending…' : 'Send message →'}
                </button>
              </form>
            </div>

            <div className={styles.body} style={{ fontSize: 16 }}>
              <p>
                <span className={styles.label}>Email</span>
                <a href="mailto:support@ratemyaccom.com.au" className={styles.link}>
                  support@ratemyaccom.com.au
                </a>
              </p>
              <p>
                <span className={styles.label}>Phone</span>
                1300 ACCOM (1300 226 666)
                <br />
                <span style={{ color: 'var(--ed-mute)', fontSize: 13 }}>
                  Mon–Fri · 9am–5pm AEST
                </span>
              </p>
              <p>
                <span className={styles.label}>Office</span>
                Sydney, NSW, Australia
              </p>
            </div>
          </div>
        </section>
      )}

      {/* ── PRIVACY ── */}
      {activeTab === 'privacy' && (
        <section className={styles.section}>
          <div className={styles.kickerMute} style={{ marginBottom: 24 }}>
            LAST UPDATED · 25 NOV 2025
          </div>
          <div className={styles.body} style={{ maxWidth: 760 }}>
            <h3 className={styles.h3} style={{ marginBottom: 12 }}>
              Information we collect
            </h3>
            <p>
              <em>Account information</em> — name, .edu.au email, and a securely hashed password.{' '}
              <em>Profile data</em> — optional university, picture, bio.{' '}
              <em>Reviews and content</em> you submit. <em>Usage data</em> — IP, browser type, pages
              visited.
            </p>
            <h3 className={styles.h3} style={{ margin: '32px 0 12px' }}>
              How we use it
            </h3>
            <p>
              To verify student status, provide and improve the service, send important updates,
              detect fraud and abuse, and understand usage. <em>We never sell your data.</em>
            </p>
            <h3 className={styles.h3} style={{ margin: '32px 0 12px' }}>
              Data security
            </h3>
            <p>
              Passwords are hashed with bcrypt; all traffic is encrypted over HTTPS/TLS; sessions
              use signed JWTs; auth endpoints have CSRF protection and rate limiting.
            </p>
            <h3 className={styles.h3} style={{ margin: '32px 0 12px' }}>
              Your rights
            </h3>
            <p>
              Under Australian privacy law you can access, correct, delete or export your data, and
              opt out of marketing. Contact{' '}
              <a href="mailto:privacy@ratemyaccom.com.au" className={styles.link}>
                privacy@ratemyaccom.com.au
              </a>
              .
            </p>
          </div>
        </section>
      )}

      {/* ── TERMS ── */}
      {activeTab === 'terms' && (
        <section className={styles.section}>
          <div className={styles.kickerMute} style={{ marginBottom: 24 }}>
            LAST UPDATED · 25 NOV 2025
          </div>
          <div className={styles.body} style={{ maxWidth: 760 }}>
            <h3 className={styles.h3} style={{ marginBottom: 12 }}>
              1 · Acceptance
            </h3>
            <p>
              By using Rate My Accom you agree to these Terms. The platform is for Australian
              university students; you confirm you are at least 18.
            </p>
            <h3 className={styles.h3} style={{ margin: '32px 0 12px' }}>
              2 · Accounts
            </h3>
            <p>
              Posting reviews requires a valid .edu.au email. You&apos;re responsible for your
              credentials, and may hold only one account.
            </p>
            <h3 className={styles.h3} style={{ margin: '32px 0 12px' }}>
              3 · Reviews & content
            </h3>
            <p>
              Reviews must reflect your genuine experience. No false, misleading or defamatory
              content; no hate speech, harassment, spam or promotion.
            </p>
            <h3 className={styles.h3} style={{ margin: '32px 0 12px' }}>
              4 · Acceptable use
            </h3>
            <p>
              No unauthorised access, automated scraping without permission, rating manipulation via
              fake accounts, or harassment of other users.
            </p>
            <h3 className={styles.h3} style={{ margin: '32px 0 12px' }}>
              5 · Disclaimers
            </h3>
            <p>
              The platform is provided &ldquo;as is&rdquo;. Reviews are individual opinions; we do
              not verify their accuracy.
            </p>
            <p style={{ marginTop: 24 }}>
              Questions?{' '}
              <a href="mailto:legal@ratemyaccom.com.au" className={styles.link}>
                legal@ratemyaccom.com.au
              </a>
            </p>
          </div>
        </section>
      )}

      <footer className={styles.colophon}>
        <span>© 2026 RATEMYACCOM · SYDNEY NSW</span>
        <span>
          SET IN INTER · <em>printed on the internet</em>
        </span>
      </footer>
    </div>
  );
}

export default function SupportPage() {
  return (
    <Suspense fallback={<div className={styles.page} />}>
      <SupportContent />
    </Suspense>
  );
}
