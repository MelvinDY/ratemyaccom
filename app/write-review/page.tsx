'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import api from '@/lib/api/client';
import type { Accommodation, RatingBreakdown } from '@/types';
import styles from '@/components/editorial/editorial.module.css';

interface AccommodationOption {
  id: string;
  name: string;
  slug: string;
  university: string;
  suburb: string;
}

const ROOM_TYPES = [
  { value: 'single', label: 'Single Room' },
  { value: 'twin', label: 'Twin Share' },
  { value: 'studio', label: 'Studio' },
  { value: 'ensuite', label: 'Ensuite' },
  { value: '1-bedroom', label: '1 Bedroom Apartment' },
  { value: '2-bedroom', label: '2 Bedroom Apartment' },
  { value: 'shared', label: 'Shared Room' },
];

const STAY_DURATIONS = [
  { value: '1-semester', label: '1 Semester' },
  { value: '2-semesters', label: '2 Semesters' },
  { value: '1-year', label: '1 Year' },
  { value: '2-years', label: '2+ Years' },
];

const RATING_CATEGORIES = [
  { key: 'cleanliness', label: 'Cleanliness' },
  { key: 'location', label: 'Location' },
  { key: 'value', label: 'Value for money' },
  { key: 'amenities', label: 'Amenities' },
  { key: 'management', label: 'Management' },
  { key: 'safety', label: 'Safety' },
];

function WriteReviewContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedAccommodationId = searchParams.get('accommodation');
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const [accommodations, setAccommodations] = useState<AccommodationOption[]>([]);
  const [selectedAccommodation, setSelectedAccommodation] = useState<AccommodationOption | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [loadingAccommodations, setLoadingAccommodations] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [overallRating, setOverallRating] = useState(0);
  const [ratingBreakdown, setRatingBreakdown] = useState<RatingBreakdown>({
    cleanliness: 0,
    location: 0,
    value: 0,
    amenities: 0,
    management: 0,
    safety: 0,
  });
  const [categoryHover, setCategoryHover] = useState<Record<string, number>>({});

  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [pros, setPros] = useState<string[]>(['']);
  const [cons, setCons] = useState<string[]>(['']);
  const [roomType, setRoomType] = useState('');
  const [stayDuration, setStayDuration] = useState('');
  const [verified, setVerified] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchAccommodations = async () => {
      try {
        const response = await api.get<{ success: boolean; data: Accommodation[] }>(
          '/accommodations?limit=100'
        );
        const options = response.data.map((acc) => ({
          id: acc.id,
          name: acc.name,
          slug: acc.slug,
          university: acc.university,
          suburb: acc.location.suburb,
        }));
        setAccommodations(options);
        if (preselectedAccommodationId) {
          const preselected = options.find(
            (acc) =>
              acc.id === preselectedAccommodationId || acc.slug === preselectedAccommodationId
          );
          if (preselected) {
            setSelectedAccommodation(preselected);
          }
        }
      } catch (err) {
        console.error('Error fetching accommodations:', err);
      } finally {
        setLoadingAccommodations(false);
      }
    };
    fetchAccommodations();
  }, [preselectedAccommodationId]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredAccommodations = accommodations.filter(
    (acc) =>
      acc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      acc.university.toLowerCase().includes(searchQuery.toLowerCase()) ||
      acc.suburb.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const addPro = () => {
    if (pros.length < 5) {
      setPros([...pros, '']);
    }
  };
  const removePro = (index: number) => setPros(pros.filter((_, i) => i !== index));
  const updatePro = (index: number, value: string) => {
    const next = [...pros];
    next[index] = value;
    setPros(next);
  };
  const addCon = () => {
    if (cons.length < 5) {
      setCons([...cons, '']);
    }
  };
  const removeCon = (index: number) => setCons(cons.filter((_, i) => i !== index));
  const updateCon = (index: number, value: string) => {
    const next = [...cons];
    next[index] = value;
    setCons(next);
  };

  useEffect(() => {
    const ratings = Object.values(ratingBreakdown).filter((r) => r > 0);
    if (ratings.length > 0) {
      const avg = ratings.reduce((sum, r) => sum + r, 0) / ratings.length;
      setOverallRating(Math.round(avg * 10) / 10);
    }
  }, [ratingBreakdown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!isAuthenticated) {
      setError('You must be logged in to submit a review');
      return;
    }
    if (!selectedAccommodation) {
      setError('Please select an accommodation to review');
      return;
    }
    if (overallRating === 0) {
      setError('Please provide ratings for the accommodation');
      return;
    }
    if (!Object.values(ratingBreakdown).every((r) => r > 0)) {
      setError('Please rate all categories');
      return;
    }
    if (title.length < 10) {
      setError('Review title must be at least 10 characters');
      return;
    }
    if (text.length < 50) {
      setError('Review must be at least 50 characters');
      return;
    }
    setIsSubmitting(true);
    try {
      await api.post(`/accommodations/${selectedAccommodation.id}/reviews`, {
        rating: overallRating,
        ratingBreakdown,
        title: title.trim(),
        text: text.trim(),
        pros: pros.filter((p) => p.trim().length > 0),
        cons: cons.filter((c) => c.trim().length > 0),
        roomType: roomType || undefined,
        stayDuration: stayDuration || undefined,
        isAnonymous,
      });
      setSuccess(true);
      setTimeout(() => router.push(`/accommodation/${selectedAccommodation.slug}`), 2000);
    } catch (err: unknown) {
      const e2 = err as { message?: string };
      setError(e2.message || 'Failed to submit review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading) {
    return <div className={styles.page} />;
  }

  if (!isAuthenticated) {
    return (
      <div className={styles.page}>
        <div className={styles.titlebarSingle}>
          <div className={styles.kicker}>§ WRITE — SIGN IN REQUIRED</div>
          <h1 className={styles.h1}>
            Verified
            <br />
            <em>only.</em>
          </h1>
          <p className={styles.lede}>
            Only verified students can post reviews. Sign in with your university email to share
            your experience.
          </p>
          <div className={styles.btnRow} style={{ marginTop: 24 }}>
            <Link href="/login" className={`${styles.btnPrimary} ${styles.btnInline}`}>
              Sign in →
            </Link>
            <Link href="/register" className={`${styles.btnSecondary} ${styles.btnInline}`}>
              Create account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className={styles.page}>
        <div className={styles.titlebarSingle}>
          <div className={styles.kicker}>§ WRITE — DONE</div>
          <h1 className={styles.h1}>
            Review
            <br />
            <em>submitted.</em>
          </h1>
          <p className={styles.lede}>
            Thank you — your review helps other students. <em>Redirecting…</em>
          </p>
        </div>
      </div>
    );
  }

  const star = (cat: string, value: number) => {
    const current = categoryHover[cat] || ratingBreakdown[cat as keyof RatingBreakdown];
    return value <= current;
  };

  return (
    <div className={styles.page}>
      {/* Top strip */}
      <div
        style={{
          padding: '20px 48px',
          borderBottom: '1px solid var(--ink)',
          display: 'flex',
          justifyContent: 'space-between',
          fontFamily: 'var(--ed-mono)',
          fontSize: 11,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          color: 'var(--ed-mute)',
        }}
      >
        <Link href="/browse" style={{ color: 'var(--ink)', textDecoration: 'none' }}>
          ← Back to browse
        </Link>
        <span>Share your experience</span>
      </div>

      <div className={styles.titlebarSingle}>
        <div className={styles.kicker}>§ WRITE — A REVIEW</div>
        <h1 className={styles.h1}>
          Share your
          <br />
          <em>experience.</em>
        </h1>
        <p className={styles.lede}>
          Help other students by sharing an <em>honest</em> review — the six numbers, the pros, the
          cons.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        style={{ maxWidth: 880, margin: '0 auto', padding: '40px 48px 96px' }}
      >
        {error && <div className={styles.errorBox}>{error}</div>}

        {/* 1 — Accommodation */}
        <div className={styles.card} style={{ marginBottom: 24, position: 'relative', zIndex: 20 }}>
          <div className={styles.kicker} style={{ marginBottom: 16 }}>
            01 · THE BUILDING
          </div>
          <div ref={dropdownRef} style={{ position: 'relative' }}>
            <input
              className={styles.input}
              type="text"
              value={selectedAccommodation ? selectedAccommodation.name : searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSelectedAccommodation(null);
                setShowDropdown(true);
              }}
              onFocus={() => setShowDropdown(true)}
              placeholder="Search for an accommodation…"
            />
            {selectedAccommodation && (
              <button
                type="button"
                onClick={() => {
                  setSelectedAccommodation(null);
                  setSearchQuery('');
                }}
                style={{
                  position: 'absolute',
                  right: 12,
                  top: 12,
                  background: 'none',
                  border: 0,
                  cursor: 'pointer',
                  color: 'var(--ed-mute)',
                  fontSize: 18,
                }}
              >
                ×
              </button>
            )}
            {showDropdown && !selectedAccommodation && (
              <div
                style={{
                  position: 'absolute',
                  zIndex: 50,
                  width: '100%',
                  marginTop: 4,
                  background: 'white',
                  border: '1px solid var(--ink)',
                  maxHeight: 260,
                  overflowY: 'auto',
                }}
              >
                {loadingAccommodations ? (
                  <div style={{ padding: 16, color: 'var(--ed-mute)', fontSize: 13 }}>Loading…</div>
                ) : filteredAccommodations.length > 0 ? (
                  filteredAccommodations.map((acc) => (
                    <button
                      key={acc.id}
                      type="button"
                      onClick={() => {
                        setSelectedAccommodation(acc);
                        setSearchQuery('');
                        setShowDropdown(false);
                      }}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '12px 14px',
                        background: 'none',
                        border: 0,
                        borderBottom: '1px solid var(--ed-rule)',
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                      }}
                    >
                      <div style={{ fontSize: 16, fontWeight: 500 }}>{acc.name}</div>
                      <div
                        style={{
                          fontFamily: 'var(--ed-mono)',
                          fontSize: 10,
                          letterSpacing: '0.05em',
                          textTransform: 'uppercase',
                          color: 'var(--ed-mute)',
                          marginTop: 2,
                        }}
                      >
                        {acc.university} · {acc.suburb}
                      </div>
                    </button>
                  ))
                ) : (
                  <div style={{ padding: 16, color: 'var(--ed-mute)', fontSize: 13 }}>
                    No accommodations found
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 2 — Ratings */}
        <div className={styles.card} style={{ marginBottom: 24 }}>
          <div className={styles.kicker} style={{ marginBottom: 16 }}>
            02 · THE NUMBERS · RATE EACH 1–5
          </div>
          <div style={{ display: 'grid', gap: 16 }}>
            {RATING_CATEGORIES.map((cat) => (
              <div
                key={cat.key}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderTop: '1px solid var(--ed-rule)',
                  paddingTop: 14,
                  flexWrap: 'wrap',
                  gap: 12,
                }}
              >
                <span style={{ fontSize: 18, fontWeight: 500 }}>{cat.label}</span>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setRatingBreakdown((p) => ({ ...p, [cat.key]: s }))}
                      onMouseEnter={() => setCategoryHover((p) => ({ ...p, [cat.key]: s }))}
                      onMouseLeave={() => setCategoryHover((p) => ({ ...p, [cat.key]: 0 }))}
                      style={{
                        background: 'none',
                        border: 0,
                        cursor: 'pointer',
                        fontSize: 24,
                        lineHeight: 1,
                        color: star(cat.key, s) ? 'var(--blue)' : 'var(--ed-mute-2)',
                        fontStyle: 'italic',
                      }}
                      aria-label={`${cat.label} ${s} stars`}
                    >
                      ★
                    </button>
                  ))}
                  <span
                    style={{
                      marginLeft: 8,
                      fontFamily: 'var(--ed-mono)',
                      fontSize: 11,
                      color: 'var(--ed-mute)',
                      minWidth: 28,
                    }}
                  >
                    {ratingBreakdown[cat.key as keyof RatingBreakdown] > 0
                      ? `${ratingBreakdown[cat.key as keyof RatingBreakdown]}/5`
                      : ''}
                  </span>
                </div>
              </div>
            ))}
          </div>
          {overallRating > 0 && (
            <div
              style={{
                marginTop: 20,
                paddingTop: 16,
                borderTop: '1px solid var(--ink)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
              }}
            >
              <span className={styles.label} style={{ margin: 0 }}>
                Overall
              </span>
              <span style={{ fontSize: 32, fontWeight: 600, letterSpacing: '-0.03em' }}>
                <span style={{ color: 'var(--blue)', fontStyle: 'italic', marginRight: 4 }}>★</span>
                {overallRating.toFixed(1)}
              </span>
            </div>
          )}
        </div>

        {/* 3 — Content */}
        <div className={styles.card} style={{ marginBottom: 24 }}>
          <div className={styles.kicker} style={{ marginBottom: 16 }}>
            03 · THE WRITE-UP
          </div>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="r-title">
              Title <span style={{ color: 'var(--blue)' }}>*</span>
            </label>
            <input
              id="r-title"
              className={styles.input}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Summarise it in a few words"
              maxLength={100}
            />
            <p
              className={styles.errorText}
              style={{ color: 'var(--ed-mute)', fontStyle: 'normal' }}
            >
              {title.length}/100 · minimum 10
            </p>
          </div>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="r-text">
              Your review <span style={{ color: 'var(--blue)' }}>*</span>
            </label>
            <textarea
              id="r-text"
              className={styles.textarea}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="What did you like? What could be improved? Be specific."
              rows={6}
              maxLength={2000}
            />
            <p
              className={styles.errorText}
              style={{ color: 'var(--ed-mute)', fontStyle: 'normal' }}
            >
              {text.length}/2000 · minimum 50
            </p>
          </div>

          {/* Pros */}
          <div className={styles.field}>
            <span className={styles.label}>↑ Pros (optional)</span>
            {pros.map((pro, index) => (
              <div key={index} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                <input
                  className={styles.input}
                  value={pro}
                  onChange={(e) => updatePro(index, e.target.value)}
                  placeholder="Something you liked…"
                  maxLength={100}
                  aria-label={`Pro ${index + 1}`}
                />
                {pros.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removePro(index)}
                    className={styles.btnSecondary}
                    style={{ width: 'auto', padding: '0 16px' }}
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
            {pros.length < 5 && (
              <button
                type="button"
                onClick={addPro}
                className={styles.resend}
                style={{ textTransform: 'none', letterSpacing: 0 }}
              >
                + Add another pro
              </button>
            )}
          </div>

          {/* Cons */}
          <div className={styles.field}>
            <span className={styles.label}>↓ Cons (optional)</span>
            {cons.map((con, index) => (
              <div key={index} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                <input
                  className={styles.input}
                  value={con}
                  onChange={(e) => updateCon(index, e.target.value)}
                  placeholder="Something that could be improved…"
                  maxLength={100}
                  aria-label={`Con ${index + 1}`}
                />
                {cons.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeCon(index)}
                    className={styles.btnSecondary}
                    style={{ width: 'auto', padding: '0 16px' }}
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
            {cons.length < 5 && (
              <button
                type="button"
                onClick={addCon}
                className={styles.resend}
                style={{ textTransform: 'none', letterSpacing: 0 }}
              >
                + Add another con
              </button>
            )}
          </div>

          {/* Room type + duration */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className={styles.field} style={{ marginBottom: 0 }}>
              <label className={styles.label} htmlFor="r-room">
                Room type (optional)
              </label>
              <select
                id="r-room"
                className={styles.select}
                value={roomType}
                onChange={(e) => setRoomType(e.target.value)}
              >
                <option value="">Select room type</option>
                {ROOM_TYPES.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>
            <div className={styles.field} style={{ marginBottom: 0 }}>
              <label className={styles.label} htmlFor="r-dur">
                Stay duration (optional)
              </label>
              <select
                id="r-dur"
                className={styles.select}
                value={stayDuration}
                onChange={(e) => setStayDuration(e.target.value)}
              >
                <option value="">Select duration</option>
                {STAY_DURATIONS.map((d) => (
                  <option key={d.value} value={d.value}>
                    {d.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* 4 — Options */}
        <div className={styles.card} style={{ marginBottom: 24 }}>
          <div className={styles.kicker} style={{ marginBottom: 16 }}>
            04 · BEFORE YOU POST
          </div>
          <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
            <input
              id="r-anon"
              type="checkbox"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              style={{ marginTop: 4, accentColor: 'var(--blue)' }}
            />
            <div>
              <label htmlFor="r-anon" style={{ fontWeight: 600, cursor: 'pointer' }}>
                Post anonymously
              </label>
              <span
                style={{ display: 'block', fontSize: 14, color: 'var(--ed-mute)', marginTop: 2 }}
              >
                Your name and university are hidden — shown as &ldquo;Anonymous Student&rdquo;.
              </span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <input
              id="r-verified"
              type="checkbox"
              checked={verified}
              onChange={(e) => setVerified(e.target.checked)}
              style={{ marginTop: 4, accentColor: 'var(--blue)' }}
            />
            <div>
              <label htmlFor="r-verified" style={{ fontWeight: 600, cursor: 'pointer' }}>
                I lived here
              </label>
              <span
                style={{ display: 'block', fontSize: 14, color: 'var(--ed-mute)', marginTop: 2 }}
              >
                I confirm this review is based on my personal experience. False reviews may be
                removed.
              </span>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className={styles.btnRow} style={{ justifyContent: 'flex-end' }}>
          <Link href="/browse" className={`${styles.btnSecondary} ${styles.btnInline}`}>
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`${styles.btnPrimary} ${styles.btnInline}`}
          >
            {isSubmitting ? 'Submitting…' : 'Submit review →'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function WriteReviewPage() {
  return (
    <Suspense fallback={<div className={styles.page} />}>
      <WriteReviewContent />
    </Suspense>
  );
}
