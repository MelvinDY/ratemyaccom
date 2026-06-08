'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { QuizPreferences } from '@/types';
import styles from '@/components/editorial/editorial.module.css';

const UNIVERSITIES = [
  { value: 'UNSW', label: 'University of New South Wales (UNSW)' },
  { value: 'USYD', label: 'University of Sydney' },
  { value: 'UTS', label: 'University of Technology Sydney' },
  { value: 'MQ', label: 'Macquarie University' },
  { value: 'WSU', label: 'Western Sydney University' },
];

const ACCOMMODATION_TYPES = [
  { value: 'on-campus', label: 'On Campus', description: 'Live right on university grounds' },
  { value: 'college', label: 'Residential College', description: 'Traditional college with meals' },
  { value: 'off-campus', label: 'Off Campus', description: 'Independent living near campus' },
  { value: 'private', label: 'Private Housing', description: 'Private rentals and share houses' },
];

const ROOM_TYPES = [
  { value: 'single', label: 'Single Room', description: 'Your own private space' },
  { value: 'twin', label: 'Twin Share', description: 'Share with one roommate' },
  { value: 'studio', label: 'Studio', description: 'Self-contained unit' },
  { value: 'ensuite', label: 'Ensuite', description: 'Private bathroom' },
  { value: '1-bedroom', label: '1 Bedroom Apt', description: 'Full apartment' },
];

const AMENITIES = [
  { value: 'wifi', label: 'High-Speed WiFi' },
  { value: 'gym', label: 'Gym / Fitness' },
  { value: 'meals', label: 'Meal Plan' },
  { value: 'parking', label: 'Parking' },
  { value: 'laundry', label: 'Laundry' },
  { value: 'study-rooms', label: 'Study Rooms' },
];

const PRIORITY_FACTORS = [
  { key: 'cleanliness', label: 'Cleanliness' },
  { key: 'location', label: 'Location' },
  { key: 'value', label: 'Value for money' },
  { key: 'amenities', label: 'Amenities' },
  { key: 'management', label: 'Management' },
  { key: 'safety', label: 'Safety' },
];

const SOCIAL = [
  { value: 'quiet', label: 'Quiet & peaceful', description: 'A calm environment focused on study' },
  { value: 'balanced', label: 'Balanced', description: 'A mix of social and quiet time' },
  { value: 'social', label: 'Social & active', description: 'I love meeting people and events' },
];

type Step = 1 | 2 | 3 | 4 | 5 | 6 | 7;
const TOTAL_STEPS = 7;

const STEP_META: Record<Step, { kicker: string; question: React.ReactNode }> = {
  1: {
    kicker: '01 / 07 · WHERE',
    question: (
      <>
        Which <em>university?</em>
      </>
    ),
  },
  2: {
    kicker: '02 / 07 · BUDGET',
    question: (
      <>
        What can you <em>spend?</em>
      </>
    ),
  },
  3: {
    kicker: '03 / 07 · TYPE',
    question: (
      <>
        What kind of <em>place?</em>
      </>
    ),
  },
  4: {
    kicker: '04 / 07 · ROOM',
    question: (
      <>
        How do you want to <em>live?</em>
      </>
    ),
  },
  5: {
    kicker: '05 / 07 · PRIORITIES',
    question: (
      <>
        What <em>matters most?</em>
      </>
    ),
  },
  6: {
    kicker: '06 / 07 · AMENITIES',
    question: (
      <>
        Any <em>must-haves?</em>
      </>
    ),
  },
  7: {
    kicker: '07 / 07 · SOCIAL',
    question: (
      <>
        Loud, or <em>quiet?</em>
      </>
    ),
  },
};

export default function QuizPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [preferences, setPreferences] = useState<QuizPreferences>({
    university: '',
    budgetMin: 200,
    budgetMax: 500,
    accommodationType: [],
    priorityFactors: {
      cleanliness: 3,
      location: 3,
      value: 3,
      amenities: 3,
      management: 3,
      safety: 3,
    },
    mustHaveAmenities: [],
    maxDistanceToCampus: 5,
    roomType: '',
    socialPreference: 'balanced',
    moveInDate: '',
  });

  const updatePreference = <K extends keyof QuizPreferences>(key: K, value: QuizPreferences[K]) => {
    setPreferences((prev) => ({ ...prev, [key]: value }));
  };
  const updatePriorityFactor = (factor: string, value: number) => {
    setPreferences((prev) => ({
      ...prev,
      priorityFactors: { ...prev.priorityFactors, [factor]: value },
    }));
  };
  const toggleAccommodationType = (type: string) => {
    setPreferences((prev) => ({
      ...prev,
      accommodationType: prev.accommodationType.includes(type)
        ? prev.accommodationType.filter((t) => t !== type)
        : [...prev.accommodationType, type],
    }));
  };
  const toggleAmenity = (amenity: string) => {
    setPreferences((prev) => ({
      ...prev,
      mustHaveAmenities: prev.mustHaveAmenities.includes(amenity)
        ? prev.mustHaveAmenities.filter((a) => a !== amenity)
        : [...prev.mustHaveAmenities, amenity],
    }));
  };

  const canProceed = (): boolean => {
    switch (currentStep) {
      case 1:
        return preferences.university !== '';
      case 2:
        return preferences.budgetMin > 0 && preferences.budgetMax > preferences.budgetMin;
      case 3:
        return preferences.accommodationType.length > 0;
      case 4:
        return preferences.roomType !== '';
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep((prev) => (prev + 1) as Step);
    }
  };
  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as Step);
    }
  };
  const handleSubmit = async () => {
    setIsSubmitting(true);
    sessionStorage.setItem('quizPreferences', JSON.stringify(preferences));
    router.push('/quiz/results');
  };

  const progress = (currentStep / TOTAL_STEPS) * 100;

  // selectable option row
  const optionRow = (selected: boolean): React.CSSProperties => ({
    width: '100%',
    textAlign: 'left',
    padding: '20px 22px',
    border: '1px solid var(--ink)',
    background: selected ? 'var(--blue)' : 'white',
    color: selected ? 'white' : 'var(--ink)',
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 16,
    fontFamily: 'inherit',
    transition: 'background 0.12s',
  });

  return (
    <div className={styles.page}>
      {/* Top strip */}
      <div
        style={{
          padding: '20px 48px',
          borderBottom: '1px solid var(--ink)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontFamily: 'var(--ed-mono)',
          fontSize: 11,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          color: 'var(--ed-mute)',
        }}
      >
        <Link href="/" style={{ color: 'var(--ink)', textDecoration: 'none' }}>
          ← Back to home
        </Link>
        <span>
          STEP {currentStep} <span style={{ color: 'var(--ed-mute-2)' }}>/ {TOTAL_STEPS}</span>
        </span>
      </div>
      {/* Progress */}
      <div style={{ height: 4, background: 'var(--ed-rule)' }}>
        <div
          style={{
            height: '100%',
            width: `${progress}%`,
            background: 'var(--blue)',
            transition: 'width 0.4s ease',
          }}
        />
      </div>

      <div style={{ maxWidth: 880, margin: '0 auto', padding: '56px 48px 96px' }}>
        <div className={styles.kicker}>§ THE QUIZ · {STEP_META[currentStep].kicker}</div>
        <h1 className={styles.h2} style={{ marginBottom: 40 }}>
          {STEP_META[currentStep].question}
        </h1>

        {/* Step 1 — University */}
        {currentStep === 1 && (
          <div style={{ display: 'grid', gap: 10 }}>
            {UNIVERSITIES.map((uni) => (
              <button
                key={uni.value}
                style={optionRow(preferences.university === uni.value)}
                onClick={() => updatePreference('university', uni.value)}
              >
                <span style={{ fontSize: 18, fontWeight: 500 }}>{uni.label}</span>
                {preferences.university === uni.value && <span>✓</span>}
              </button>
            ))}
          </div>
        )}

        {/* Step 2 — Budget */}
        {currentStep === 2 && (
          <div>
            <div
              style={{
                fontSize: 'clamp(40px,7vw,72px)',
                fontWeight: 600,
                letterSpacing: '-0.04em',
                fontVariantNumeric: 'tabular-nums',
                marginBottom: 8,
              }}
            >
              ${preferences.budgetMin}
              <span style={{ color: 'var(--ed-mute-2)', margin: '0 12px' }}>—</span>$
              {preferences.budgetMax}
            </div>
            <div className={styles.kickerMute} style={{ marginBottom: 40 }}>
              PER WEEK
            </div>
            <label className={styles.label} htmlFor="bmin">
              Minimum
            </label>
            <input
              id="bmin"
              type="range"
              min="100"
              max="800"
              step="25"
              value={preferences.budgetMin}
              onChange={(e) => {
                const v = parseInt(e.target.value);
                if (v < preferences.budgetMax) {
                  updatePreference('budgetMin', v);
                }
              }}
              style={{ width: '100%', accentColor: 'var(--blue)', marginBottom: 32 }}
            />
            <label className={styles.label} htmlFor="bmax">
              Maximum
            </label>
            <input
              id="bmax"
              type="range"
              min="100"
              max="1000"
              step="25"
              value={preferences.budgetMax}
              onChange={(e) => {
                const v = parseInt(e.target.value);
                if (v > preferences.budgetMin) {
                  updatePreference('budgetMax', v);
                }
              }}
              style={{ width: '100%', accentColor: 'var(--blue)' }}
            />
          </div>
        )}

        {/* Step 3 — Type */}
        {currentStep === 3 && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))',
              gap: 10,
            }}
          >
            {ACCOMMODATION_TYPES.map((type) => {
              const sel = preferences.accommodationType.includes(type.value);
              return (
                <button
                  key={type.value}
                  style={{
                    ...optionRow(sel),
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    gap: 6,
                  }}
                  onClick={() => toggleAccommodationType(type.value)}
                >
                  <span style={{ fontSize: 20, fontWeight: 600 }}>{type.label}</span>
                  <span style={{ fontSize: 14, opacity: sel ? 0.9 : 0.6 }}>{type.description}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Step 4 — Room */}
        {currentStep === 4 && (
          <div style={{ display: 'grid', gap: 10 }}>
            {ROOM_TYPES.map((room) => {
              const sel = preferences.roomType === room.value;
              return (
                <button
                  key={room.value}
                  style={optionRow(sel)}
                  onClick={() => updatePreference('roomType', room.value)}
                >
                  <span>
                    <span style={{ fontSize: 18, fontWeight: 600, display: 'block' }}>
                      {room.label}
                    </span>
                    <span style={{ fontSize: 14, opacity: sel ? 0.9 : 0.6 }}>
                      {room.description}
                    </span>
                  </span>
                  {sel && <span>✓</span>}
                </button>
              );
            })}
          </div>
        )}

        {/* Step 5 — Priorities */}
        {currentStep === 5 && (
          <div style={{ display: 'grid', gap: 18 }}>
            {PRIORITY_FACTORS.map((factor) => {
              const val =
                preferences.priorityFactors[factor.key as keyof typeof preferences.priorityFactors];
              return (
                <div
                  key={factor.key}
                  style={{ borderTop: '1px solid var(--ed-rule)', paddingTop: 16 }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'baseline',
                      marginBottom: 10,
                    }}
                  >
                    <span style={{ fontSize: 18, fontWeight: 500 }}>{factor.label}</span>
                    <span
                      style={{
                        fontFamily: 'var(--ed-mono)',
                        fontSize: 11,
                        color: 'var(--ed-mute)',
                      }}
                    >
                      {val} / 5
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {[1, 2, 3, 4, 5].map((v) => (
                      <button
                        key={v}
                        onClick={() => updatePriorityFactor(factor.key, v)}
                        style={{
                          flex: 1,
                          padding: '12px 0',
                          border: '1px solid var(--ink)',
                          background: val >= v ? 'var(--blue)' : 'white',
                          color: val >= v ? 'white' : 'var(--ink)',
                          fontFamily: 'var(--ed-mono)',
                          fontSize: 13,
                          cursor: 'pointer',
                        }}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Step 6 — Amenities */}
        {currentStep === 6 && (
          <div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))',
                gap: 10,
              }}
            >
              {AMENITIES.map((a) => {
                const sel = preferences.mustHaveAmenities.includes(a.value);
                return (
                  <button
                    key={a.value}
                    style={optionRow(sel)}
                    onClick={() => toggleAmenity(a.value)}
                  >
                    <span style={{ fontSize: 16, fontWeight: 500 }}>{a.label}</span>
                    {sel && <span>✓</span>}
                  </button>
                );
              })}
            </div>
            <div style={{ borderTop: '1px solid var(--ed-rule)', marginTop: 32, paddingTop: 20 }}>
              <label className={styles.label} htmlFor="dist">
                Max distance to campus · {preferences.maxDistanceToCampus} km
              </label>
              <input
                id="dist"
                type="range"
                min="1"
                max="15"
                step="1"
                value={preferences.maxDistanceToCampus}
                onChange={(e) => updatePreference('maxDistanceToCampus', parseInt(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--blue)' }}
              />
            </div>
          </div>
        )}

        {/* Step 7 — Social */}
        {currentStep === 7 && (
          <div style={{ display: 'grid', gap: 10 }}>
            {SOCIAL.map((option) => {
              const sel = preferences.socialPreference === option.value;
              return (
                <button
                  key={option.value}
                  style={optionRow(sel)}
                  onClick={() =>
                    updatePreference(
                      'socialPreference',
                      option.value as 'quiet' | 'social' | 'balanced'
                    )
                  }
                >
                  <span>
                    <span style={{ fontSize: 18, fontWeight: 600, display: 'block' }}>
                      {option.label}
                    </span>
                    <span style={{ fontSize: 14, opacity: sel ? 0.9 : 0.6 }}>
                      {option.description}
                    </span>
                  </span>
                  {sel && <span>✓</span>}
                </button>
              );
            })}
          </div>
        )}

        {/* Nav */}
        <div className={styles.btnRow} style={{ justifyContent: 'space-between', marginTop: 48 }}>
          <button
            onClick={handleBack}
            disabled={currentStep === 1}
            className={`${styles.btnSecondary} ${styles.btnInline}`}
            style={{ width: 'auto' }}
          >
            ← Back
          </button>
          {currentStep < TOTAL_STEPS ? (
            <button
              onClick={handleNext}
              disabled={!canProceed()}
              className={`${styles.btnPrimary} ${styles.btnInline}`}
              style={{ width: 'auto' }}
            >
              Next →
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={`${styles.btnPrimary} ${styles.btnInline}`}
              style={{ width: 'auto' }}
            >
              {isSubmitting ? 'Finding…' : 'Get my shortlist →'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
