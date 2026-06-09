'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import styles from './page.module.css';

interface Accom {
  id: string;
  name: string;
  slug: string;
  university: string;
  suburb: string;
  type: string;
  priceMin: number;
  priceMax: number;
  pricePeriod: string;
  ratingOverall: number;
  totalReviews: number;
  roomTypes: string[];
  amenities: { name: string; available: boolean }[];
}

type SortKey = 'rating' | 'reviews' | 'priceLow' | 'priceHigh' | 'name';
type ViewMode = 'catalog' | 'grid';

const MAX_PRICE = 800;

export default function BrowsePage() {
  const [items, setItems] = useState<Accom[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [priceMax, setPriceMax] = useState(MAX_PRICE);
  const [minRating, setMinRating] = useState(0);
  const [sort, setSort] = useState<SortKey>('rating');
  const [view, setView] = useState<ViewMode>('catalog');
  const [unis, setUnis] = useState(new Set<string>());
  const [types, setTypes] = useState(new Set<string>());
  const [rooms, setRooms] = useState(new Set<string>());
  const [amens, setAmens] = useState(new Set<string>());

  useEffect(() => {
    fetch('/api/accommodations?limit=100')
      .then((r) => r.json())
      .then((d) => {
        const list: Accom[] = (d.data ?? d ?? []).map((a: Accom) => a);
        setItems(list);

        // Seed the university filter from the ?university= param (e.g. atlas links,
        // which pass an abbreviation like USYD). Match as a substring so it works
        // against the stored "Name (ABBR)" strings regardless of abbr or full name.
        const param = new URLSearchParams(window.location.search).get('university');
        if (param) {
          const needle = param.toLowerCase();
          const matches = Array.from(
            new Set(list.map((a) => a.university).filter((u) => u.toLowerCase().includes(needle)))
          );
          if (matches.length) {
            setUnis(new Set(matches));
          }
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  /* Derived filter option lists */
  const uniList = useMemo(
    () => Array.from(new Set(items.map((a) => a.university))).sort(),
    [items]
  );
  const typeList = useMemo(() => Array.from(new Set(items.map((a) => a.type))).sort(), [items]);
  const roomList = useMemo(
    () => Array.from(new Set(items.flatMap((a) => a.roomTypes ?? []))).sort(),
    [items]
  );
  const amenList = useMemo(
    () =>
      Array.from(
        new Set(
          items.flatMap((a) => (a.amenities ?? []).filter((x) => x.available).map((x) => x.name))
        )
      ).sort(),
    [items]
  );

  /* Filtered + sorted list */
  const visible = useMemo(() => {
    const q = query.toLowerCase();
    let list = items.filter((a) => {
      if (q && !`${a.name} ${a.suburb} ${a.university} ${a.type}`.toLowerCase().includes(q)) {
        return false;
      }
      if (a.priceMin > priceMax) {
        return false;
      }
      if (minRating && a.ratingOverall < minRating) {
        return false;
      }
      if (unis.size && !unis.has(a.university)) {
        return false;
      }
      if (types.size && !types.has(a.type)) {
        return false;
      }
      if (rooms.size && !(a.roomTypes ?? []).some((r) => rooms.has(r))) {
        return false;
      }
      if (
        amens.size &&
        !Array.from(amens).every((am) =>
          (a.amenities ?? []).some((x) => x.available && x.name === am)
        )
      ) {
        return false;
      }
      return true;
    });
    switch (sort) {
      case 'rating':
        list = list.sort((a, b) => b.ratingOverall - a.ratingOverall);
        break;
      case 'reviews':
        list = list.sort((a, b) => b.totalReviews - a.totalReviews);
        break;
      case 'priceLow':
        list = list.sort((a, b) => a.priceMin - b.priceMin);
        break;
      case 'priceHigh':
        list = list.sort((a, b) => b.priceMax - a.priceMax);
        break;
      case 'name':
        list = list.sort((a, b) => a.name.localeCompare(b.name));
        break;
    }
    return list;
  }, [items, query, priceMax, minRating, unis, types, rooms, amens, sort]);

  /* Active filter pills */
  type Pill = { key: string; val: string; label: string };
  const activePills: Pill[] = useMemo(() => {
    const p: Pill[] = [];
    unis.forEach((v) => p.push({ key: 'uni', val: v, label: v }));
    types.forEach((v) => p.push({ key: 'type', val: v, label: v.replace('-', ' ').toUpperCase() }));
    rooms.forEach((v) => p.push({ key: 'room', val: v, label: v.toUpperCase() }));
    amens.forEach((v) => p.push({ key: 'amen', val: v, label: v.toUpperCase() }));
    if (minRating > 0) {
      p.push({ key: 'rating', val: String(minRating), label: `≥ ${minRating}★` });
    }
    if (priceMax < MAX_PRICE) {
      p.push({ key: 'price', val: String(priceMax), label: `≤ $${priceMax}/WK` });
    }
    if (query) {
      p.push({ key: 'q', val: query, label: `"${query}"` });
    }
    return p;
  }, [unis, types, rooms, amens, minRating, priceMax, query]);

  function removePill(key: string, val: string) {
    if (key === 'uni') {
      setUnis((s) => {
        const n = new Set(s);
        n.delete(val);
        return n;
      });
    }
    if (key === 'type') {
      setTypes((s) => {
        const n = new Set(s);
        n.delete(val);
        return n;
      });
    }
    if (key === 'room') {
      setRooms((s) => {
        const n = new Set(s);
        n.delete(val);
        return n;
      });
    }
    if (key === 'amen') {
      setAmens((s) => {
        const n = new Set(s);
        n.delete(val);
        return n;
      });
    }
    if (key === 'rating') {
      setMinRating(0);
    }
    if (key === 'price') {
      setPriceMax(MAX_PRICE);
    }
    if (key === 'q') {
      setQuery('');
    }
  }

  function clearAll() {
    setQuery('');
    setPriceMax(MAX_PRICE);
    setMinRating(0);
    setUnis(new Set());
    setTypes(new Set());
    setRooms(new Set());
    setAmens(new Set());
  }

  function toggleSet(setter: React.Dispatch<React.SetStateAction<Set<string>>>, val: string) {
    setter((s) => {
      const n = new Set(s);
      if (n.has(val)) {
        n.delete(val);
      } else {
        n.add(val);
      }
      return n;
    });
  }

  const fmtPeriod = (p: string) =>
    p === 'WEEK' ? '/wk' : p === 'MONTH' ? '/mo' : `/${p.toLowerCase()}`;

  return (
    <div className={styles.page}>
      {/* ── TITLEBAR ── */}
      <section className={styles.titlebar}>
        <div>
          <div className={styles.kicker}>§ THE INDEX — ALL PROPERTIES</div>
          <h1 className={styles.h1}>
            Browse the
            <br />
            <em>catalogue.</em>
          </h1>
        </div>
        <p className={styles.lede}>
          Every student building in NSW we&apos;ve collected reviews for.{' '}
          <em>Filter, search, sort.</em> Hover a row for details.
        </p>
      </section>

      {/* ── SEARCH ── */}
      <div className={styles.searchStrip}>
        <div className={styles.searchLabel}>SEARCH ↘</div>
        <input
          className={styles.searchInput}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={`Try "UNSW Village", "Ultimo", or "ensuite under 500"…`}
        />
        <div className={styles.searchCount}>
          SHOWING <span className={styles.searchCountB}>{visible.length}</span> OF {items.length}
        </div>
      </div>

      {/* ── ACTIVE FILTERS ── */}
      <div className={styles.activeStrip}>
        <div className={styles.activeLabel}>ACTIVE FILTERS</div>
        {activePills.length === 0 ? (
          <div className={styles.activeEmpty}>
            none — <em>browsing all {items.length}</em>
          </div>
        ) : (
          <>
            {activePills.map((p) => (
              <button
                key={p.key + p.val}
                className={styles.pill}
                onClick={() => removePill(p.key, p.val)}
              >
                {p.label} <span className={styles.pillX}>×</span>
              </button>
            ))}
            <button className={styles.clearBtn} onClick={clearAll}>
              Clear all <em>filters</em>
            </button>
          </>
        )}
      </div>

      <div className={styles.main}>
        {/* ── SIDEBAR ── */}
        <aside className={styles.sidebar}>
          {/* University */}
          <div className={styles.fgroup}>
            <h4 className={styles.fgroupHead}>
              University <span className={styles.fgroupHeadCount}>— pick any</span>
            </h4>
            {uniList.map((u) => {
              const checked = unis.has(u);
              return (
                <label key={u} className={styles.fopt}>
                  <span className={`${styles.foptBox} ${checked ? styles.foptBoxChecked : ''}`} />
                  <input
                    type="checkbox"
                    style={{ display: 'none' }}
                    checked={checked}
                    onChange={() => toggleSet(setUnis, u)}
                  />
                  <span className={`${styles.foptLabel} ${checked ? styles.foptLabelChecked : ''}`}>
                    {u}
                  </span>
                  <span className={styles.foptCount}>
                    {items.filter((a) => a.university === u).length}
                  </span>
                </label>
              );
            })}
          </div>

          {/* Price */}
          <div className={styles.fgroup}>
            <h4 className={styles.fgroupHead}>
              Price <span className={styles.fgroupHeadCount}>— $ per week</span>
            </h4>
            <div className={styles.rangeRow}>
              <span>
                FROM <span className={styles.rangeB}>$280</span>
              </span>
              <span>
                TO <span className={styles.rangeB}>${priceMax}</span>
              </span>
            </div>
            <input
              type="range"
              min="280"
              max={MAX_PRICE}
              step="10"
              value={priceMax}
              onChange={(e) => setPriceMax(Number(e.target.value))}
              className={styles.slider}
            />
            <div className={styles.sliderHint}>DRAG TO CAP THE MAX</div>
          </div>

          {/* Min rating */}
          <div className={styles.fgroup}>
            <h4 className={styles.fgroupHead}>Min. rating</h4>
            <div className={styles.starRow}>
              {([0, 3.5, 4, 4.3] as const).map((r) => (
                <button
                  key={r}
                  className={`${styles.starBtn} ${minRating === r ? styles.starBtnActive : ''}`}
                  onClick={() => setMinRating(r)}
                >
                  {r === 0 ? 'ANY' : `${r}+`}
                </button>
              ))}
            </div>
          </div>

          {/* Type */}
          {typeList.length > 0 && (
            <div className={styles.fgroup}>
              <h4 className={styles.fgroupHead}>Type</h4>
              {typeList.map((t) => {
                const checked = types.has(t);
                return (
                  <label key={t} className={styles.fopt}>
                    <span className={`${styles.foptBox} ${checked ? styles.foptBoxChecked : ''}`} />
                    <input
                      type="checkbox"
                      style={{ display: 'none' }}
                      checked={checked}
                      onChange={() => toggleSet(setTypes, t)}
                    />
                    <span
                      className={`${styles.foptLabel} ${checked ? styles.foptLabelChecked : ''}`}
                    >
                      {t.replace('-', ' ')}
                    </span>
                    <span className={styles.foptCount}>
                      {items.filter((a) => a.type === t).length}
                    </span>
                  </label>
                );
              })}
            </div>
          )}

          {/* Room type */}
          {roomList.length > 0 && (
            <div className={styles.fgroup}>
              <h4 className={styles.fgroupHead}>Room type</h4>
              {roomList.map((r) => {
                const checked = rooms.has(r);
                return (
                  <label key={r} className={styles.fopt}>
                    <span className={`${styles.foptBox} ${checked ? styles.foptBoxChecked : ''}`} />
                    <input
                      type="checkbox"
                      style={{ display: 'none' }}
                      checked={checked}
                      onChange={() => toggleSet(setRooms, r)}
                    />
                    <span
                      className={`${styles.foptLabel} ${checked ? styles.foptLabelChecked : ''}`}
                    >
                      {r}
                    </span>
                    <span className={styles.foptCount}>
                      {items.filter((a) => (a.roomTypes ?? []).includes(r)).length}
                    </span>
                  </label>
                );
              })}
            </div>
          )}

          {/* Amenities */}
          {amenList.length > 0 && (
            <div className={styles.fgroup}>
              <h4 className={styles.fgroupHead}>Amenities</h4>
              {amenList.slice(0, 10).map((a) => {
                const checked = amens.has(a);
                return (
                  <label key={a} className={styles.fopt}>
                    <span className={`${styles.foptBox} ${checked ? styles.foptBoxChecked : ''}`} />
                    <input
                      type="checkbox"
                      style={{ display: 'none' }}
                      checked={checked}
                      onChange={() => toggleSet(setAmens, a)}
                    />
                    <span
                      className={`${styles.foptLabel} ${checked ? styles.foptLabelChecked : ''}`}
                    >
                      {a}
                    </span>
                    <span className={styles.foptCount}>
                      {
                        items.filter((ac) =>
                          (ac.amenities ?? []).some((x) => x.available && x.name === a)
                        ).length
                      }
                    </span>
                  </label>
                );
              })}
            </div>
          )}
        </aside>

        {/* ── RESULTS ── */}
        <section className={styles.content}>
          <div className={styles.toolbar}>
            <h2 className={styles.toolbarH2}>
              The <em>index.</em>
            </h2>
            <div className={styles.toolbarRight}>
              <div className={styles.sortWrap}>
                SORT:
                <select
                  className={styles.sortSelect}
                  value={sort}
                  onChange={(e) => setSort(e.target.value as SortKey)}
                >
                  <option value="rating">★ HIGHEST RATED</option>
                  <option value="reviews">↘ MOST REVIEWED</option>
                  <option value="priceLow">$ LOWEST PRICE</option>
                  <option value="priceHigh">$ HIGHEST PRICE</option>
                  <option value="name">A → Z</option>
                </select>
              </div>
              <div className={styles.viewToggle}>
                <button
                  className={`${styles.viewBtn} ${view === 'catalog' ? styles.viewBtnActive : ''}`}
                  onClick={() => setView('catalog')}
                >
                  CATALOGUE
                </button>
                <button
                  className={`${styles.viewBtn} ${view === 'grid' ? styles.viewBtnActive : ''}`}
                  onClick={() => setView('grid')}
                >
                  GRID
                </button>
              </div>
            </div>
          </div>

          {loading ? (
            <div className={styles.empty}>Loading the index…</div>
          ) : visible.length === 0 ? (
            <div className={styles.empty}>
              No matches. Try <em>&ldquo;on-campus under $400&rdquo;</em> or clear the filters.
            </div>
          ) : view === 'catalog' ? (
            <div className={styles.catalog}>
              {visible.map((a, i) => (
                <Link key={a.id} href={`/accommodation/${a.slug}`} className={styles.crow}>
                  <span className={styles.crowNum}>N° {String(i + 1).padStart(3, '0')}</span>
                  <div className={styles.crowPhoto} />
                  <div className={styles.crowTitle}>
                    <div className={styles.crowName}>
                      {a.name}
                      <em className={styles.crowKicker}>— {a.type.replace('-', ' ')}</em>
                    </div>
                    <div className={styles.crowMeta}>
                      <span className={styles.crowUni}>{a.university}</span> ·{' '}
                      {a.suburb.toUpperCase()}
                      <span className={styles.crowType}>
                        {a.type === 'on-campus' ? 'ON-CAMPUS' : 'OFF-CAMPUS'}
                      </span>
                    </div>
                  </div>
                  <div className={styles.crowRatebox}>
                    <div className={styles.crowRateNum}>
                      <span className={styles.crowRateStar}>★</span>
                      {a.ratingOverall.toFixed(1)}
                    </div>
                    <div
                      className={styles.crowBar}
                      style={
                        {
                          '--w': `${Math.round((a.ratingOverall / 5) * 100)}%`,
                        } as React.CSSProperties
                      }
                    />
                    <div className={styles.crowBarLab}>{a.totalReviews} REVIEWS</div>
                  </div>
                  <div className={styles.crowPricebox}>
                    <div className={styles.crowPrice}>
                      <em className={styles.crowPriceFrom}>from</em>${a.priceMin}
                      <span className={styles.crowPriceUnit}>{fmtPeriod(a.pricePeriod)}</span>
                    </div>
                    <div className={styles.crowPriceLab}>
                      UP TO ${a.priceMax}
                      {fmtPeriod(a.pricePeriod)}
                    </div>
                  </div>
                  <div className={styles.crowArr}>→</div>
                </Link>
              ))}
            </div>
          ) : (
            <div className={styles.grid}>
              {visible.map((a, i) => (
                <Link key={a.id} href={`/accommodation/${a.slug}`} className={styles.gcard}>
                  <div className={styles.gcardHeaderRow}>
                    <span className={styles.gcardNum}>N° {String(i + 1).padStart(3, '0')}</span>
                    <span className={styles.gcardKicker}>
                      {a.type.replace('-', ' ').toUpperCase()}
                    </span>
                  </div>
                  <div className={styles.gcardPhoto} />
                  <h3 className={styles.gcardName}>{a.name}</h3>
                  <div className={styles.gcardMeta}>
                    {a.university} · {a.suburb.toUpperCase()}
                  </div>
                  <div className={styles.gcardFooter}>
                    <div className={styles.gcardVal}>
                      <em className={styles.gcardValStar}>★</em>
                      {a.ratingOverall.toFixed(1)}
                    </div>
                    <div className={styles.gcardVal}>
                      <em className={styles.gcardValFrom}>from</em>${a.priceMin}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
