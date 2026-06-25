'use client';

import { useEffect, useRef, useState, useCallback, type ReactNode } from 'react';
import Link from 'next/link';

/* ─── Scroll animation hook ────────────────────────────────────────────── */
function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true); },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return [ref, inView] as const;
}

/* ─── Data ─────────────────────────────────────────────────────────────── */
const OUTCOMES = [
  {
    num: '01',
    label: 'Grow',
    icon: '↑',
    iconBg: '#dcfce7',
    sentence: 'Expand your reach, fill your pipeline, and increase revenue — without adding stress.',
  },
  {
    num: '02',
    label: 'Save Time',
    icon: '◷',
    iconBg: '#dbeafe',
    sentence: 'Reclaim hours every week by automating the work that doesn\'t need you.',
  },
  {
    num: '03',
    label: 'Create Better Experiences',
    icon: '★',
    iconBg: '#fef9c3',
    sentence: 'Deliver something your clients remember and tell others about.',
  },
  {
    num: '04',
    label: 'Build Capacity',
    icon: '⬡',
    iconBg: '#ede9fe',
    sentence: 'Scale your operation without burning out your team.',
  },
  {
    num: '05',
    label: 'Increase Profitability',
    icon: '◈',
    iconBg: '#d1fae5',
    sentence: 'Turn smart systems into sustainable margins.',
  },
  {
    num: '06',
    label: 'Gain Peace of Mind',
    icon: '◎',
    iconBg: '#fce7f3',
    sentence: 'Know your business is running — even when you\'re not watching.',
  },
];

/* eslint-disable max-len */
const POLL = (prompt: string, seed: number, h = 1080) =>
  `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1920&height=${h}&seed=${seed}&nologo=true&model=flux`;

const INDUSTRIES = [
  {
    name: 'Restaurant',
    sentence: 'From reservations to reviews, your dining experience runs itself.',
    indicator: 'Table Booked',
    bg: `linear-gradient(rgba(0,0,0,0.6),rgba(0,0,0,0.45)), radial-gradient(ellipse at 30% 70%, rgba(160,60,10,0.35) 0%, transparent 55%), url('${POLL('upscale elegant restaurant interior romantic candlelit tables dark warm amber glow cinematic photography', 401)}') center/cover no-repeat`,
  },
  {
    name: 'Sports',
    sentence: 'Build teams, manage rosters, and grow programs — all in one system.',
    indicator: 'Season Scheduled',
    bg: `linear-gradient(rgba(0,0,0,0.58),rgba(0,0,0,0.42)), radial-gradient(ellipse at 70% 30%, rgba(20,60,140,0.35) 0%, transparent 55%), url('${POLL('dramatic sports stadium at night floodlights on atmospheric cinematic wide angle photography', 402)}') center/cover no-repeat`,
  },
  {
    name: 'Construction',
    sentence: 'Projects move forward, crews stay informed, and clients stay happy.',
    indicator: 'Milestone Logged',
    bg: `linear-gradient(rgba(0,0,0,0.6),rgba(0,0,0,0.42)), radial-gradient(ellipse at 40% 60%, rgba(120,80,10,0.3) 0%, transparent 55%), url('${POLL('building construction site golden hour dramatic sky workers silhouettes cinematic photography', 403)}') center/cover no-repeat`,
  },
  {
    name: 'Photography',
    sentence: 'Capture the moment. Let the system handle everything else.',
    indicator: 'Gallery Delivered',
    bg: `linear-gradient(rgba(0,0,0,0.62),rgba(0,0,0,0.45)), url('${POLL('professional photographer in action outdoors golden hour bokeh background cinematic portrait moody', 404)}') center/cover no-repeat`,
  },
  {
    name: 'Church',
    sentence: 'Connect your community, manage volunteers, and amplify your mission.',
    indicator: 'Event Confirmed',
    bg: `linear-gradient(rgba(0,0,0,0.6),rgba(0,0,0,0.42)), radial-gradient(ellipse at 50% 50%, rgba(60,40,120,0.25) 0%, transparent 55%), url('${POLL('beautiful cathedral interior golden light streaming through stained glass windows spiritual cinematic photography', 405)}') center/cover no-repeat`,
  },
  {
    name: 'Nonprofit',
    sentence: 'Focus on impact. The systems handle the operations.',
    indicator: 'Donation Recorded',
    bg: `linear-gradient(rgba(0,0,0,0.55),rgba(0,0,0,0.38)), radial-gradient(ellipse at 30% 60%, rgba(10,80,40,0.3) 0%, transparent 55%), url('${POLL('diverse volunteers working together outdoors smiling community spirit warm daylight cinematic documentary photography', 406)}') center/cover no-repeat`,
  },
  {
    name: 'Education',
    sentence: 'Students learn. Administrators thrive. Parents stay connected.',
    indicator: 'Assignment Complete',
    bg: `linear-gradient(rgba(0,0,0,0.6),rgba(0,0,0,0.42)), radial-gradient(ellipse at 70% 30%, rgba(50,20,100,0.28) 0%, transparent 55%), url('${POLL('modern university library with dramatic lighting students studying cinematic photography', 407)}') center/cover no-repeat`,
  },
  {
    name: 'Healthcare',
    sentence: 'Patients feel cared for before they walk in the door.',
    indicator: 'Appointment Ready',
    bg: `linear-gradient(rgba(0,0,0,0.55),rgba(0,0,0,0.38)), radial-gradient(ellipse at 40% 60%, rgba(10,80,100,0.28) 0%, transparent 55%), url('${POLL('clean modern hospital corridor warm lighting professional medical environment cinematic photography', 408)}') center/cover no-repeat`,
  },
  {
    name: 'Horse Racing',
    sentence: 'Manage entries, communicate with owners, and run operations at full speed.',
    indicator: 'Entry Submitted',
    bg: `linear-gradient(rgba(0,0,0,0.58),rgba(0,0,0,0.4)), radial-gradient(ellipse at 60% 50%, rgba(40,60,10,0.3) 0%, transparent 55%), url('${POLL('thoroughbred horses racing at golden sunset dramatic motion blur wide angle cinematic photography', 409)}') center/cover no-repeat`,
  },
  {
    name: 'Real Estate',
    sentence: 'From first inquiry to final signature — every step automated.',
    indicator: 'Showing Confirmed',
    bg: `linear-gradient(rgba(0,0,0,0.58),rgba(0,0,0,0.4)), radial-gradient(ellipse at 50% 40%, rgba(100,60,10,0.28) 0%, transparent 55%), url('${POLL('stunning luxury modern home exterior at dusk with warm interior lights architectural photography cinematic', 410)}') center/cover no-repeat`,
  },
];

const CAPABILITIES = [
  {
    category: 'Grow',
    icon: '↑',
    color: '#16a34a',
    bg: '#f0fdf4',
    items: ['Lead Capture Systems', 'Automated Follow-Up', 'Referral Programs', 'Email Marketing', 'Event Registration', 'Social Proof Automation'],
  },
  {
    category: 'Save Time',
    icon: '◷',
    color: '#1d4ed8',
    bg: '#eff6ff',
    items: ['Automated Scheduling', 'Document Workflows', 'Recurring Task Automation', 'Staff Communication', 'Billing & Invoicing', 'Reporting & Analytics'],
  },
  {
    category: 'Create Better Experiences',
    icon: '★',
    color: '#b45309',
    bg: '#fffbeb',
    items: ['Online Booking', 'Automated Reminders', 'Client Portals', 'Onboarding Sequences', 'Feedback Systems', 'Personalized Communications'],
  },
  {
    category: 'Build Capacity',
    icon: '⬡',
    color: '#7c3aed',
    bg: '#f5f3ff',
    items: ['Staff Onboarding', 'Training Systems', 'Knowledge Base', 'Process Documentation', 'Role-Based Access', 'Scalable Workflows'],
  },
  {
    category: 'Increase Profitability',
    icon: '◈',
    color: '#065f46',
    bg: '#ecfdf5',
    items: ['Price Optimization', 'Upsell Sequences', 'Membership Programs', 'Payment Automation', 'Expense Tracking', 'Revenue Dashboards'],
  },
  {
    category: 'Gain Peace of Mind',
    icon: '◎',
    color: '#9d174d',
    bg: '#fdf2f8',
    items: ['Real-Time Visibility', 'Alert Systems', 'Backup Processes', 'Compliance Tracking', 'Team Accountability', 'Performance Insights'],
  },
];

const FLOW_STEPS = [
  { step: 'An opportunity appears.', desc: 'A lead. A booking. A team update.' },
  { step: 'EA captures it automatically.', desc: 'No manual entry. No dropped balls.' },
  { step: 'The right people are informed.', desc: 'Instantly. Precisely. Without you in the middle.' },
  { step: 'The work moves forward.', desc: 'Tasks assigned, reminders sent, steps completed.' },
  { step: 'You have full visibility.', desc: 'Always in control. Never overwhelmed.' },
];

/* ─── Components ─────────────────────────────────────────────────────── */

function AnimatedSection({ children, className = '', delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const [ref, inView] = useInView();
  return (
    <div
      ref={ref}
      className={`poss-anim ${inView ? 'poss-visible' : ''} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

function PulseDesktop() {
  return (
    <div className="poss-pulse-desktop">
      <div className="poss-pulse-desktop-bar">
        <div className="poss-pulse-dot poss-pulse-dot-r" />
        <div className="poss-pulse-dot poss-pulse-dot-y" />
        <div className="poss-pulse-dot poss-pulse-dot-g" />
        <span className="poss-pulse-title">Pulse™ · Your Organization at a Glance</span>
      </div>
      <div className="poss-pulse-body">
        <div className="poss-pulse-metric-card">
          <span className="poss-pulse-metric-label">Today's Revenue</span>
          <span className="poss-pulse-metric-value">$4,280</span>
          <span className="poss-pulse-metric-change up">↑ 18% vs yesterday</span>
        </div>
        <div className="poss-pulse-metric-card">
          <span className="poss-pulse-metric-label">Appointments</span>
          <span className="poss-pulse-metric-value">12</span>
          <span className="poss-pulse-metric-change up">↑ 3 new today</span>
        </div>
        <div className="poss-pulse-metric-card">
          <span className="poss-pulse-metric-label">Team Tasks</span>
          <span className="poss-pulse-metric-value">94%</span>
          <span className="poss-pulse-metric-change neutral">On track</span>
        </div>
      </div>
      <div className="poss-pulse-feed">
        <div className="poss-pulse-feed-head">Live Activity</div>
        {[
          { color: 'poss-row-green', text: 'Appointment confirmed · Sarah M.', time: '2m ago' },
          { color: 'poss-row-blue', text: 'Payment received · $320.00', time: '14m ago' },
          { color: 'poss-row-amber', text: 'Team notified · New workflow', time: '1h ago' },
          { color: 'poss-row-purple', text: 'Training completed · Marcus T.', time: '2h ago' },
          { color: 'poss-row-green', text: 'New lead captured · Website form', time: '3h ago' },
        ].map((row, i) => (
          <div key={i} className="poss-pulse-row">
            <div className={`poss-pulse-row-dot ${row.color}`} />
            <span className="poss-pulse-row-text">{row.text}</span>
            <span className="poss-pulse-row-time">{row.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function PulseMobile() {
  return (
    <div className="poss-pulse-mobile">
      <div className="poss-pulse-mobile-notch">
        <div className="poss-pulse-mobile-notch-bar" />
      </div>
      <div className="poss-pulse-mobile-body">
        <span className="poss-pulse-mobile-head">Pulse™</span>
        <div className="poss-mobile-metric">
          <span className="poss-mobile-metric-label">Revenue Today</span>
          <span className="poss-mobile-metric-value">$4,280</span>
        </div>
        <div className="poss-mobile-rows">
          {[
            { color: 'poss-row-green', text: 'Appt Confirmed', time: '2m' },
            { color: 'poss-row-blue', text: 'Payment · $320', time: '14m' },
            { color: 'poss-row-amber', text: 'Team Notified', time: '1h' },
            { color: 'poss-row-purple', text: 'Training Done', time: '2h' },
          ].map((row, i) => (
            <div key={i} className="poss-mobile-row">
              <div className={`poss-mobile-row-dot ${row.color}`} />
              <span className="poss-mobile-row-text">{row.text}</span>
              <span className="poss-mobile-row-time">{row.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function IndustrySection() {
  const [active, setActive] = useState(0);
  const prev = useCallback(() => setActive(a => (a - 1 + INDUSTRIES.length) % INDUSTRIES.length), []);
  const next = useCallback(() => setActive(a => (a + 1) % INDUSTRIES.length), []);

  useEffect(() => {
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [prev, next]);

  return (
    <section className="poss-industries" id="industries" aria-label="Industry Possibilities">
      <span className="poss-industries-eyebrow">Industry Possibilities</span>
      {INDUSTRIES.map((ind, i) => (
        <div
          key={ind.name}
          className={`poss-industry-panel ${i === active ? 'ind-active' : ''}`}
          style={{ background: ind.bg }}
          aria-hidden={i !== active}
        >
          <div className="poss-industry-content">
            <span className="poss-industry-num">{String(i + 1).padStart(2, '0')} / {INDUSTRIES.length}</span>
            <h2 className="poss-industry-name">{ind.name}</h2>
            <p className="poss-industry-sentence">{ind.sentence}</p>
            <div className="poss-industry-indicator">
              <span className="poss-industry-check">✓</span>
              {ind.indicator}
            </div>
          </div>
        </div>
      ))}
      <div className="poss-industry-nav">
        <button className="poss-industry-prev" onClick={prev} aria-label="Previous industry">←</button>
        <div className="poss-industry-dots" role="tablist">
          {INDUSTRIES.map((_, i) => (
            <button
              key={i}
              role="tab"
              aria-selected={i === active}
              className={`poss-industry-dot ${i === active ? 'ind-dot-active' : ''}`}
              onClick={() => setActive(i)}
              aria-label={`Go to ${INDUSTRIES[i].name}`}
            />
          ))}
        </div>
        <button className="poss-industry-next" onClick={next} aria-label="Next industry">→</button>
      </div>
    </section>
  );
}

function CapabilityItem({ cap, index, open, onToggle }: {
  cap: typeof CAPABILITIES[0];
  index: number;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <div className={`poss-cap-item ${open ? 'cap-open' : ''}`}>
      <button className="poss-cap-trigger" onClick={onToggle} aria-expanded={open}>
        <div className="poss-cap-icon-wrap" style={{ background: cap.bg, color: cap.color }}>
          <span style={{ fontSize: 18 }}>{cap.icon}</span>
        </div>
        <span className="poss-cap-title">{cap.category}</span>
        <svg className="poss-cap-chevron" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M5 7.5l5 5 5-5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <div className="poss-cap-body">
        <div className="poss-cap-cards">
          {cap.items.map(item => (
            <div key={item} className="poss-cap-card">{item}</div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Main Page ─────────────────────────────────────────────────────── */
export default function PossibilitiesPage() {
  const [heroVisible, setHeroVisible] = useState(false);
  const [openCap, setOpenCap] = useState<number | null>(0);

  useEffect(() => {
    const t = setTimeout(() => setHeroVisible(true), 120);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="poss-page">
      {/* ── Navigation ─────────────────────────────────────────────────── */}
      <nav className="poss-nav" aria-label="Main navigation">
        <div className="poss-nav-inner">
          <Link href="/" className="poss-nav-brand" aria-label="Efficiency Architects home">
            <span className="poss-nav-ea">EA</span>
            <span className="poss-nav-name">Efficiency Architects</span>
          </Link>
          <div className="poss-nav-links" role="list">
            <a href="#outcomes">What We Do</a>
            <a href="#industries">Industries</a>
            <a href="#capabilities">Capabilities</a>
            <a href="#cta" className="poss-nav-cta">Let's Talk</a>
          </div>
          <div className="poss-nav-mobile-cta">
            <a href="#cta">Let's Talk</a>
          </div>
        </div>
      </nav>

      {/* ── Screen 1: Hero ─────────────────────────────────────────────── */}
      <section className="poss-hero" aria-label="Hero">
        <div className="poss-hero-bg" aria-hidden="true" />
        <div className="poss-hero-content">
          <p className={`poss-hero-eyebrow ${heroVisible ? 'hero-visible' : ''}`}>
            Efficiency Architects™
          </p>
          <h1 className={`poss-hero-h1 ${heroVisible ? 'hero-visible' : ''}`}>
            What are you trying<br />to accomplish?
          </h1>
          <div className="poss-outcome-cards" role="list">
            {OUTCOMES.map((o, i) => (
              <div
                key={o.label}
                role="listitem"
                className={`poss-outcome-card ${heroVisible ? 'card-visible' : ''}`}
                style={{ transitionDelay: `${300 + i * 90}ms` }}
              >
                <span className="poss-card-icon" aria-hidden="true">{o.icon}</span>
                <span className="poss-card-label">{o.label}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="poss-hero-scroll" aria-hidden="true">
          <span>Scroll</span>
          <div className="poss-scroll-line" />
        </div>
      </section>

      {/* ── Screen 2: Outcomes ─────────────────────────────────────────── */}
      <section className="poss-outcomes" id="outcomes" aria-label="Every organization wants the same things">
        <div className="poss-container">
          <AnimatedSection>
            <h2 className="poss-outcomes-h2">
              Every organization<br />wants the same things.
            </h2>
          </AnimatedSection>
          <AnimatedSection delay={100}>
            <div className="poss-outcomes-grid" role="list">
              {OUTCOMES.map(o => (
                <div key={o.label} className="poss-outcome-item" role="listitem">
                  <span className="poss-outcome-num">{o.num}</span>
                  <h3>{o.label}</h3>
                  <p>{o.sentence}</p>
                </div>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ── Screen 3: Lifestyle ────────────────────────────────────────── */}
      <section className="poss-lifestyle" aria-label="Build a business that doesn't need you every minute">
        <div className="poss-lifestyle-bg" aria-hidden="true" />
        <div className="poss-lifestyle-glow" aria-hidden="true" />
        <AnimatedSection>
          <div className="poss-lifestyle-content">
            <span className="poss-eyebrow">The Goal</span>
            <h2 className="poss-lifestyle-h2">
              Build a business<br />that doesn't need you<br /><em>every minute.</em>
            </h2>
            <p className="poss-lifestyle-sub">
              The leaders we work with aren't just building companies. They're building freedom.
            </p>
          </div>
        </AnimatedSection>
      </section>

      {/* ── Screen 4: Invisible System ─────────────────────────────────── */}
      <section className="poss-invisible" aria-label="The Invisible System">
        <div className="poss-container">
          <AnimatedSection>
            <div className="poss-invisible-header">
              <span className="poss-eyebrow">While you're living</span>
              <h2>The Invisible System</h2>
            </div>
          </AnimatedSection>
          <div className="poss-scenes" role="list">
            {[
              {
                cls: 'poss-scene-1',
                icon: (
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(120,160,255,0.8)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                ),
                desc: 'A customer books.',
                indicator: 'Appointment Confirmed',
              },
              {
                cls: 'poss-scene-2',
                icon: (
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(80,200,120,0.8)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="1" x2="12" y2="23" />
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                  </svg>
                ),
                desc: 'A payment arrives.',
                indicator: 'Payment Received',
              },
              {
                cls: 'poss-scene-3',
                icon: (
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(220,100,80,0.8)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                ),
                desc: 'An employee completes training.',
                indicator: 'Team Updated',
              },
            ].map(scene => (
              <AnimatedSection key={scene.indicator}>
                <div className={`poss-scene ${scene.cls}`} role="listitem">
                  <div className="poss-scene-bg" aria-hidden="true" />
                  <div className="poss-scene-visual">
                    <div className="poss-scene-icon" aria-hidden="true">{scene.icon}</div>
                    <p className="poss-scene-desc">{scene.desc}</p>
                  </div>
                  <div className="poss-scene-indicator">
                    <span className="poss-indicator-dot" aria-hidden="true" />
                    ✓ {scene.indicator}
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ── Screen 5: Control Center ───────────────────────────────────── */}
      <section className="poss-control" aria-label="Control Center">
        <div className="poss-container">
          <AnimatedSection>
            <div className="poss-control-header">
              <span className="poss-eyebrow" style={{ color: '#B21712' }}>Pulse™</span>
              <h2>The same clarity.<br />Anywhere you are.</h2>
              <p>One view of your entire operation. The confidence to step away.</p>
            </div>
          </AnimatedSection>
          <AnimatedSection delay={100}>
            <div className="poss-control-devices">
              <PulseDesktop />
              <PulseMobile />
            </div>
          </AnimatedSection>
          <AnimatedSection delay={200}>
            <div className="poss-control-caption">
              <p>
                <span className="poss-pulse-brand">Pulse™</span> is the visibility layer built into every EA experience.
                Not a dashboard. Not a report. A quiet confidence that everything is working.
              </p>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ── Screen 6: Industries ──────────────────────────────────────── */}
      <IndustrySection />

      {/* ── Screen 7: How It Works ────────────────────────────────────── */}
      <section className="poss-how" aria-label="How It Works">
        <div className="poss-container-sm">
          <AnimatedSection>
            <div className="poss-how-header">
              <span className="poss-eyebrow">The Process</span>
              <h2>How It Works</h2>
            </div>
          </AnimatedSection>
          <div className="poss-flow" role="list">
            {FLOW_STEPS.map((item, i) => (
              <AnimatedSection key={item.step} delay={i * 80}>
                <div className="poss-flow-item" role="listitem">
                  <div className="poss-flow-left">
                    <div className="poss-flow-dot" />
                    {i < FLOW_STEPS.length - 1 && <div className="poss-flow-line" aria-hidden="true" />}
                  </div>
                  <div className="poss-flow-right">
                    <p className="poss-flow-step">{item.step}</p>
                    <p className="poss-flow-desc">{item.desc}</p>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ── Screen 8: Capabilities ────────────────────────────────────── */}
      <section className="poss-capabilities" id="capabilities" aria-label="Capabilities">
        <div className="poss-container">
          <AnimatedSection>
            <div className="poss-capabilities-header">
              <span className="poss-eyebrow" style={{ color: '#B21712' }}>Everything you need</span>
              <h2>Capabilities</h2>
            </div>
          </AnimatedSection>
          <AnimatedSection delay={100}>
            <div className="poss-cap-accordion" role="list">
              {CAPABILITIES.map((cap, i) => (
                <CapabilityItem
                  key={cap.category}
                  cap={cap}
                  index={i}
                  open={openCap === i}
                  onToggle={() => setOpenCap(openCap === i ? null : i)}
                />
              ))}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ── Screen 9: CTA ─────────────────────────────────────────────── */}
      <section className="poss-cta" id="cta" aria-label="Let's build your experience">
        <div className="poss-cta-bg" aria-hidden="true" />
        <AnimatedSection>
          <div className="poss-cta-content">
            <span className="poss-eyebrow" style={{ color: 'rgba(255,255,255,0.35)', letterSpacing: '3px' }}>
              Efficiency Architects™
            </span>
            <h2 className="poss-cta-h2">Imagine<br />What's Possible</h2>
            <p className="poss-cta-sub">
              Every organization we work with started with a single question:<br />
              What would be possible if this actually ran itself?
            </p>
            <a href="mailto:hello@efficiencyarchitects.online" className="poss-cta-btn">
              Let's build your experience →
            </a>
          </div>
        </AnimatedSection>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────── */}
      <footer className="poss-footer">
        <p>
          © {new Date().getFullYear()} Efficiency Architects™ ·{' '}
          <Link href="/">Home</Link>
          {' · '}
          <a href="mailto:hello@efficiencyarchitects.online">hello@efficiencyarchitects.online</a>
        </p>
      </footer>
    </div>
  );
}
