# Rate My Accom — Product Requirements Document

_Last updated: 2026-06-08_

---

## 1. Overview

**Rate My Accom** is an independent, student-run review platform for student
accommodation across New South Wales. It helps students find a place to live based
on **honest, verified reviews from real students** — not operator marketing.

The product's differentiator is **trust**, expressed through an editorial design
language: a magazine-style "Bold" direction (electric blue `#0C06F7`, Inter +
JetBrains Mono, large-scale typography) that signals a point of view rather than
"another listings site." The core promise: _"We don't list the places that pay us.
We list the places students survived, rated, and would do again."_

- **Live:** deployed on Vercel (Next.js) + Neon (Postgres)
- **Repo:** github.com/MelvinDY/ratemyaccom
- **Status:** core loop live; data seeded; ~half the surface area redesigned

---

## 2. Goals & non-goals

### Goals
- Let a student go from "I need somewhere to live" → a shortlist of trustworthy
  options in minutes (Browse, Quiz, Detail).
- Make every rating a **six-dimension** breakdown (cleanliness, location, value,
  amenities, management, safety) — never a single star.
- Only verified students can review; reviews stay up; operators get reply, not delete.
- Serve as a polished portfolio showcase for the author.

### Non-goals (for now)
- Booking/payments — the platform links out to operators and "takes no cut."
- A native mobile app (responsive web only).
- Automated scraping pipeline for live operator data (curated dataset for now).

---

## 3. Target users
- **Prospective students** (domestic & international) choosing accommodation,
  often under time pressure and from overseas.
- **Current/past residents** writing verified reviews.
- **Parents** (secondary) sanity-checking safety and location.

---

## 4. Current state — what's built

### Pages (App Router, `app/**/page.tsx`)
| Route | Purpose | Design state |
|---|---|---|
| `/` | Editorial homepage (word-rotator hero, manifesto, featured index, quiz strip) | ✅ Editorial |
| `/browse` | Property catalogue — filters, search, sort, grid/list | ✅ Editorial |
| `/browse/universities` | NSW atlas map of universities, hover-synced index | ✅ Editorial |
| `/accommodation/[slug]` | Detail: hero, scorecard, photo essay, pricing, amenities, reviews, location, comparables | ✅ Editorial |
| `/login`, `/register` | Auth (password + OTP + Google/Apple OAuth) | ⚠️ Old neumorphic dark + OAuth buttons |
| `/about` | About / the method | ⚠️ Old neumorphic |
| `/quiz`, `/quiz/results` | 12-question recommender | ⚠️ Old neumorphic |
| `/support` | Help / contact / privacy / terms tabs | ⚠️ Old neumorphic |
| `/write-review` | Submit a review | ⚠️ Old neumorphic |
| `/moderator` | Moderation dashboard | ⚠️ Old neumorphic |

Shared **Header** and **Footer** are editorial.

### Backend / API
- Auth: custom **JWT in httpOnly cookies** (`auth-token` / `refresh-token`), OTP
  login, account lockout, CSRF, rate limiting, audit logging.
- **Google + Apple OAuth** routes implemented (`/api/auth/google`, `/api/auth/apple`
  + callbacks) — need real credentials to activate.
- Accommodation & review CRUD, helpful/report, admin audit-log endpoints,
  recommendations endpoint.

### Data
- **Neon Postgres** via Prisma. Models: `User`, `Accommodation`, `Amenity`,
  `AccommodationAmenity`, `Review`, `SavedAccommodation`, `AuditLog`, etc.
- **Seed:** `npm run db:seed:nsw` loads **32 NSW properties** (Scape, Iglu,
  UniLodge, Urbanest + UNSW/USYD/UTS/Macquarie/WSU housing) with sample reviews
  and computed ratings. Photos are validated Unsplash images (see §10).

### Infra / quality
- CI (GitHub Actions): Lint+Typecheck, Build, Component Tests (Vitest),
  Unit/Integration (Jest) — **all green**.
- Deployed on Vercel; auto-deploys from `main`.

---

## 5. Core features (functional spec)

1. **Browse** — fuzzy search + sidebar filters (university, price cap, min rating,
   type, room type, amenities), active-filter pills, sort, catalogue/grid toggle.
2. **Accommodation detail** — six-dimension scorecard vs NSW average, photo essay,
   pricing tiers, amenities grid, featured + column reviews, location mini-atlas,
   "apply" (links to operator), comparables.
3. **Reviews** — verified students post a 6-dimension breakdown + pros/cons; ratings
   roll up into the denormalised accommodation aggregates.
4. **Auth** — email/password, passwordless OTP, Google & Apple OAuth; verified-student
   gating for reviews.
5. **Quiz** — 12 questions → ranked shortlist via the recommendations engine.
6. **Universities atlas** — searchable NSW map linking through to filtered Browse.

---

## 6. Design system
- **Colour:** electric blue `#0C06F7` (`--ed-blue`), ink `#0A0A0F`, paper white.
- **Type:** Inter (display/body, with italics as the editorial counter-voice) +
  JetBrains Mono (labels, data, kickers).
- **Tokens:** `--ed-*` CSS variables in `app/globals.css`; per-page CSS Modules.
- **Motifs:** mono kickers (`§ 01 — THE NUMBERS`), crop marks on photos, hairline
  1px borders, tabular numerals, striped placeholder tiles when an image is absent.

---

## 7. Tech stack
Next.js 14 (App Router) · React 18 · TypeScript · Prisma + Neon Postgres ·
Tailwind (legacy pages) + CSS Modules (editorial pages) · jose/jsonwebtoken ·
Resend (email) · Vercel hosting · Vitest + Jest + Playwright.

---

## 8. Outstanding work — prioritised backlog

> This is the "what needs updating" list. P0 = blocks a credible launch/demo,
> P3 = polish.

### P0 — Make it look finished & function end-to-end
- [x] **Redesign remaining pages to editorial Bold** — done: `/login`, `/register`,
  `/about`, `/quiz`, `/quiz/results`, `/support`, `/write-review` + `not-found.tsx`
  all converted (shared `components/editorial/editorial.module.css`).
- [x] **Wire the dead buttons on the detail page** — done: Save toggles a
  localStorage shortlist, Share uses the Web Share API + clipboard fallback, and
  the review toolbar (All/Positive/Critical/Newest) filters live. "Compare" was
  removed (deferred to the P2 Compare feature).
- [x] **Real counts on homepage & header** — done: `lib/stats.ts` feeds live
  property/review/university counts to the header and homepage (em-dash fallback
  on an empty DB).
- [ ] **Seed the production DB** — run `npm run db:seed:nsw` against Neon so the
  live site isn't empty.

### P1 — Auth & data integrity
- [ ] **Activate OAuth** — add real `GOOGLE_CLIENT_ID/SECRET` and Apple
  (`APPLE_CLIENT_ID/TEAM_ID/KEY_ID/PRIVATE_KEY`) in Vercel; register the live
  callback URLs; test on the deployed HTTPS URL (Apple won't work on localhost).
- [ ] **Email verification** — set `RESEND_API_KEY` + `FROM_EMAIL` so registration/
  verification/reset emails actually send (currently no-op without a key).
- [ ] **Verify the Quiz → recommendations flow** end-to-end (does `/quiz` post to
  `/api/recommendations` and render `/quiz/results`?).
- [ ] **Write-a-review flow** — confirm a logged-in verified student can submit a
  review and see ratings update on the detail page.

### P2 — Features from the design brief not yet built
- [ ] **Shortlist / saved properties** (`SavedAccommodation` model already exists).
- [ ] **Compare** — side-by-side of 2–3 properties (rating dims, price, amenities).
- [ ] **Browse Suburbs** — companion to Browse Universities.
- [ ] **Full property Atlas** — map view of all properties with the Browse filters.
- [ ] **Real photography** — replace Unsplash placeholders with actual building
  photos (licensed/owned), or an operator image pipeline + domain whitelisting.

### P3 — Polish, SEO, tech debt
- [ ] **Brand assets** — editorial favicon/logo, OG images, per-page metadata.
- [ ] **Raise test coverage** — global Jest threshold was lowered to 9% after the
  redesign added untested pages; add page/route tests and raise it back.
- [ ] **Clean up stale files** — remove `*.new.ts` route duplicates
  (`app/api/accommodations/route.new.ts`, `[id]/route.new.ts`, `reviews/route.new.ts`)
  and the analysis scripts in the repo root.
- [ ] **Lint debt** — reduce `@typescript-eslint/no-explicit-any` and
  `no-non-null-assertion` warnings across `lib/` and API routes.
- [ ] **Build warnings** — `rate-limiter-flexible` triggers Edge Runtime warnings;
  husky pre-commit uses deprecated bootstrap lines; `browserslist`/`caniuse-lite`
  are stale.
- [ ] **Mobile QA** — verify the editorial pages (which were built at 1440px) on
  phone/tablet breakpoints.

---

## 9. Success metrics (proposed)
- Quiz completion rate; % who shortlist a recommended property.
- Reviews submitted per week; verified-student ratio.
- Browse → detail → "visit operator" click-through.
- Return-visitor rate (shortlist feature).

---

## 10. Open decisions / notes
- **Photos:** real operator photos proved unhotlinkable (Scape returns 403; sites
  are JS-heavy SPAs). Current galleries use validated Unsplash images on the
  already-whitelisted `images.unsplash.com`. Decision needed on sourcing real
  photography for launch.
- **Illustrative stats** in the hero/manifesto need to become real before any
  public launch (credibility risk on a "trust" product).
- **University string convention** — accommodations store the full university name
  (e.g. `University of New South Wales (UNSW)`); keep new data consistent so Browse
  filters and detail "comparables" match.
