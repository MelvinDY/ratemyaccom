'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import styles from './page.module.css';

interface Uni {
  id: string;
  abbr: string;
  name: string;
  suburb: string;
  region: 'sydney' | 'coast' | 'inland' | 'far';
  x: number;
  y: number; // % on main NSW atlas
  ix?: number;
  iy?: number; // % on Sydney inset
  props: number;
  rating: number;
  flip?: boolean; // label on left side of pin
}

const UNIS: Uni[] = [
  {
    id: 'usyd',
    abbr: 'USYD',
    name: 'University of Sydney',
    suburb: 'Camperdown',
    region: 'sydney',
    x: 70.5,
    y: 58.5,
    ix: 64,
    iy: 62,
    props: 38,
    rating: 4.2,
    flip: true,
  },
  {
    id: 'unsw',
    abbr: 'UNSW',
    name: 'University of New South Wales',
    suburb: 'Kensington',
    region: 'sydney',
    x: 71.5,
    y: 60.0,
    ix: 78,
    iy: 82,
    props: 42,
    rating: 4.3,
    flip: true,
  },
  {
    id: 'uts',
    abbr: 'UTS',
    name: 'University of Technology Sydney',
    suburb: 'Ultimo',
    region: 'sydney',
    x: 69.5,
    y: 57.5,
    ix: 76,
    iy: 50,
    props: 27,
    rating: 4.1,
    flip: true,
  },
  {
    id: 'mq',
    abbr: 'MQ',
    name: 'Macquarie University',
    suburb: 'North Ryde',
    region: 'sydney',
    x: 66,
    y: 55.5,
    ix: 52,
    iy: 22,
    props: 31,
    rating: 4.4,
  },
  {
    id: 'wsu',
    abbr: 'WSU',
    name: 'Western Sydney University',
    suburb: 'Parramatta',
    region: 'sydney',
    x: 60,
    y: 57,
    ix: 16,
    iy: 60,
    props: 22,
    rating: 4.0,
  },
  {
    id: 'acu',
    abbr: 'ACU',
    name: 'Australian Catholic University',
    suburb: 'Strathfield',
    region: 'sydney',
    x: 64,
    y: 58.5,
    ix: 40,
    iy: 70,
    props: 14,
    rating: 4.1,
  },
  {
    id: 'uow',
    abbr: 'UOW',
    name: 'University of Wollongong',
    suburb: 'Wollongong',
    region: 'coast',
    x: 65,
    y: 72,
    props: 18,
    rating: 4.2,
    flip: true,
  },
  {
    id: 'newc',
    abbr: 'UoN',
    name: 'University of Newcastle',
    suburb: 'Callaghan',
    region: 'coast',
    x: 62,
    y: 40,
    props: 24,
    rating: 4.3,
  },
  {
    id: 'une',
    abbr: 'UNE',
    name: 'University of New England',
    suburb: 'Armidale',
    region: 'inland',
    x: 55,
    y: 30,
    props: 9,
    rating: 4.0,
  },
  {
    id: 'csu',
    abbr: 'CSU',
    name: 'Charles Sturt University',
    suburb: 'Bathurst',
    region: 'inland',
    x: 38,
    y: 52,
    props: 12,
    rating: 3.9,
  },
  {
    id: 'scu',
    abbr: 'SCU',
    name: 'Southern Cross University',
    suburb: 'Lismore',
    region: 'far',
    x: 60,
    y: 14,
    props: 7,
    rating: 4.0,
  },
];

const REGIONS = [
  { id: 'all', label: 'All', count: UNIS.length },
  { id: 'sydney', label: 'Sydney metro', count: UNIS.filter((u) => u.region === 'sydney').length },
  {
    id: 'coast',
    label: 'South & North coast',
    count: UNIS.filter((u) => u.region === 'coast').length,
  },
  { id: 'inland', label: 'Inland', count: UNIS.filter((u) => u.region === 'inland').length },
  { id: 'far', label: 'Far north', count: UNIS.filter((u) => u.region === 'far').length },
] as const;

const sydUnis = UNIS.filter((u) => u.region === 'sydney');
const sydX = sydUnis.reduce((a, u) => a + u.x, 0) / sydUnis.length;
const sydY = sydUnis.reduce((a, u) => a + u.y, 0) / sydUnis.length;

const sorted = [...UNIS].sort((a, b) => b.props - a.props);

export default function BrowseUniversitiesPage() {
  const [query, setQuery] = useState('');
  const [region, setRegion] = useState<string>('all');
  const [hoverId, setHoverId] = useState<string | null>(null);

  function isVisible(u: Uni) {
    const q = query.toLowerCase();
    if (q && !`${u.abbr} ${u.name} ${u.suburb}`.toLowerCase().includes(q)) {
      return false;
    }
    if (region !== 'all' && u.region !== region) {
      return false;
    }
    return true;
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const visible = useMemo(() => new Set(UNIS.filter(isVisible).map((u) => u.id)), [query, region]);
  const sydVisible = useMemo(
    () =>
      Array.from(visible).filter((id) => UNIS.find((u) => u.id === id)?.region === 'sydney').length,
    [visible]
  );

  return (
    <div className={styles.page}>
      {/* ── TITLEBAR ── */}
      <section className={styles.titlebar}>
        <div>
          <div className={styles.kicker}>§ THE ATLAS — UNIVERSITIES OF NSW</div>
          <h1 className={styles.h1}>
            Find your
            <br />
            <em>university.</em>
          </h1>
        </div>
        <p className={styles.lede}>
          Eleven universities, two hundred and forty student buildings, one map. Search by name,
          click a pin, or browse the index. <em>The properties follow.</em>
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
          placeholder="Type a university, abbreviation, or suburb — usyd, ultimo, wollongong…"
        />
        <div className={styles.searchCount}>
          SHOWING <span className={styles.searchCountB}>{visible.size}</span> OF {UNIS.length}
        </div>
      </div>

      {/* ── REGION PILLS ── */}
      <div className={styles.regions}>
        {REGIONS.map((r) => (
          <button
            key={r.id}
            className={`${styles.regionPill} ${region === r.id ? styles.regionPillActive : ''}`}
            onClick={() => setRegion(r.id)}
          >
            {r.label} <span className={styles.regionPillN}>{r.count}</span>
          </button>
        ))}
      </div>

      <div className={styles.main}>
        {/* ── MAP COLUMN ── */}
        <div className={styles.mapCol}>
          <div className={styles.mapHead}>
            <h2 className={styles.mapHeadH2}>
              The Atlas <em>— New South Wales.</em>
            </h2>
            <div className={styles.mapScale}>SCALE 1 : 8M · WGS-84</div>
          </div>

          {/* Main NSW atlas */}
          <div className={styles.atlas}>
            <div className={styles.compass}>
              <span className={styles.compassArrow} />
              <br />N
            </div>
            <div className={styles.coast} />
            <div className={styles.coastLabel}>Pacific Ocean</div>
            {[
              ['8%', '28°S'],
              ['30%', '31°S'],
              ['52%', '33°S'],
              ['74%', '35°S'],
              ['92%', '37°S'],
            ].map(([top, label]) => (
              <div key={label} className={styles.latLabel} style={{ top }}>
                {label}
              </div>
            ))}
            {[
              ['60%', '12%', 'Lismore'],
              ['55%', '28%', 'Armidale'],
              ['62%', '38%', 'Newcastle'],
              ['38%', '50%', 'Bathurst'],
              ['70%', '58%', 'SYDNEY'],
              ['65%', '70%', 'Wollongong'],
              ['35%', '88%', 'Albury'],
            ].map(([l, t, label]) => (
              <div key={label} className={styles.cityRef} style={{ left: l, top: t }}>
                {label}
              </div>
            ))}
            <div className={styles.atlasLegend}>○ UNIVERSITY · ON PLATFORM</div>
            <div className={styles.atlasCopyright}>© RMA 2026 · NOT TO SCALE</div>

            {/* Sydney cluster on main atlas */}
            <div
              className={styles.cluster}
              style={{ left: `${sydX}%`, top: `${sydY}%`, opacity: sydVisible === 0 ? 0.18 : 1 }}
              onClick={() => setRegion('sydney')}
              onKeyDown={(e) => e.key === 'Enter' && setRegion('sydney')}
              role="button"
              tabIndex={0}
            >
              <div className={styles.clusterRing}>×{sydVisible || sydUnis.length}</div>
              <div className={styles.clusterLabel}>
                Sydney Metro <em>— see inset</em>
              </div>
            </div>

            {/* Non-Sydney pins on main atlas */}
            {UNIS.filter((u) => u.region !== 'sydney').map((u) => {
              const vis = visible.has(u.id);
              return (
                <Link
                  key={u.id}
                  href={`/browse?university=${u.abbr}`}
                  className={`${styles.uniPin} ${!vis ? styles.uniPinDim : ''} ${hoverId === u.id ? styles.uniPinHi : ''}`}
                  style={{ left: `${u.x}%`, top: `${u.y}%` }}
                  onMouseEnter={() => setHoverId(u.id)}
                  onMouseLeave={() => setHoverId(null)}
                >
                  <div className={styles.uniPinRing} />
                  <div className={`${styles.uniPinLabel} ${u.flip ? styles.uniPinLabelFlip : ''}`}>
                    {u.abbr} <span className={styles.uniPinRating}>{u.rating}★</span>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Sydney metro inset */}
          <div className={styles.insetHeadRow}>
            <h3 className={styles.insetH3}>
              Sydney metro <em>— detail.</em>
            </h3>
            <div className={styles.mapScale}>INSET · 1 : 200K · 6 UNIVERSITIES</div>
          </div>
          <div className={styles.inset}>
            <div className={styles.insetCoast} />
            <div className={styles.insetCoastLabel}>Pacific</div>
            <div className={styles.insetRef} style={{ left: '78%', top: '56%' }}>
              CBD
            </div>
            <div className={styles.insetRef} style={{ left: '20%', top: '44%' }}>
              Parramatta
            </div>
            <div className={styles.insetLegend}>○ UNIVERSITY</div>
            <div className={styles.scaleMark}>
              <span className={styles.scaleBar} />
              <span>10 km</span>
            </div>
            {sydUnis.map((u) => {
              const vis = visible.has(u.id);
              return (
                <Link
                  key={u.id}
                  href={`/browse?university=${u.abbr}`}
                  className={`${styles.uniPin} ${!vis ? styles.uniPinDim : ''} ${hoverId === u.id ? styles.uniPinHi : ''}`}
                  style={{ left: `${u.ix}%`, top: `${u.iy}%` }}
                  onMouseEnter={() => setHoverId(u.id)}
                  onMouseLeave={() => setHoverId(null)}
                >
                  <div className={styles.uniPinRing} />
                  <div className={`${styles.uniPinLabel} ${u.flip ? styles.uniPinLabelFlip : ''}`}>
                    {u.abbr} <span className={styles.uniPinRating}>{u.rating}★</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* ── LIST COLUMN ── */}
        <div className={styles.listCol}>
          <div className={styles.listHead}>
            <h2 className={styles.listHeadH2}>
              <em>The</em> Index.
            </h2>
            <div className={styles.listHeadSort}>
              SORT · <span className={styles.listHeadSortB}>BY PROPERTY COUNT</span> ↓
            </div>
          </div>

          {visible.size === 0 ? (
            <div className={styles.empty}>
              No matches. Try <em>&ldquo;sydney&rdquo;</em>, <em>&ldquo;unsw&rdquo;</em>, or clear
              the filters.
            </div>
          ) : (
            <div className={styles.uniList}>
              {sorted
                .filter((u) => visible.has(u.id))
                .map((u, i) => (
                  <Link
                    key={u.id}
                    href={`/browse?university=${u.abbr}`}
                    className={`${styles.uniRow} ${hoverId === u.id ? styles.uniRowHi : ''}`}
                    onMouseEnter={() => setHoverId(u.id)}
                    onMouseLeave={() => setHoverId(null)}
                  >
                    <span className={styles.uniRowNum}>N° {String(i + 1).padStart(2, '0')}</span>
                    <div>
                      <div className={styles.uniRowName}>
                        <span className={styles.uniRowAbbr}>{u.abbr}</span>
                        {u.name}
                      </div>
                      <div className={styles.uniRowMeta}>
                        {u.suburb.toUpperCase()} · {u.region.toUpperCase()}
                      </div>
                    </div>
                    <div className={styles.uniRowProps}>
                      {u.props}
                      <span className={styles.uniRowPropsL}>PROPERTIES</span>
                    </div>
                    <div className={styles.uniRowRating}>
                      {u.rating.toFixed(1)} ★
                      <span className={styles.uniRowPropsL}>AVG. RATING</span>
                    </div>
                    <div className={styles.uniRowArrow}>→</div>
                  </Link>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
