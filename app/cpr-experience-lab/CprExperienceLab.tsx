'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import RotatingImagePanel from '@/app/components/RotatingImagePanel';
import {
  athletes,
  beliefs,
  camps,
  closing,
  dream,
  explore,
  guide,
  hero,
  journey,
  profiles,
  question,
  quietWork,
  results,
  testimonials,
} from '@/lib/cpr-experience-lab';

function Reveal({
  children,
  className,
  delay = 0,
  as = 'div',
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  as?: 'div' | 'li' | 'article' | 'section';
}) {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === 'undefined') {
      const raf = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(raf);
    }
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.18, rootMargin: '0px 0px -8% 0px' },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const Tag = as as 'div';
  return (
    <Tag
      ref={ref as React.RefObject<HTMLDivElement>}
      className={`cpx-reveal${visible ? ' is-visible' : ''}${className ? ` ${className}` : ''}`}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </Tag>
  );
}

function ActivityIcon({ name }: { name: string }) {
  const common = {
    width: 20,
    height: 20,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
  };
  switch (name) {
    case 'profile':
      return (
        <svg {...common}>
          <circle cx="12" cy="8" r="4" />
          <path d="M4 21c0-4 3.5-6 8-6s8 2 8 6" />
        </svg>
      );
    case 'film':
      return (
        <svg {...common}>
          <rect x="3" y="4" width="18" height="16" rx="2" />
          <path d="M8 4v16M16 4v16M3 9h5M3 15h5M16 9h5M16 15h5" />
        </svg>
      );
    case 'outreach':
      return (
        <svg {...common}>
          <path d="M3 8l9 6 9-6" />
          <rect x="3" y="5" width="18" height="14" rx="2" />
        </svg>
      );
    case 'event':
      return (
        <svg {...common}>
          <rect x="3" y="4" width="18" height="17" rx="2" />
          <path d="M3 9h18M8 2v4M16 2v4M12 13v4M10 15h4" />
        </svg>
      );
    case 'docs':
      return (
        <svg {...common}>
          <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
          <path d="M14 3v5h5M9 13h6M9 17h6" />
        </svg>
      );
    case 'notify':
      return (
        <svg {...common}>
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.7 21a2 2 0 0 1-3.4 0" />
        </svg>
      );
    case 'followup':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 2" />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <path d="M20 6L9 17l-5-5" />
        </svg>
      );
  }
}

export default function CprExperienceLab() {
  return (
    <main className="cpx" id="main-content">
      {/* Nav */}
      <header className="cpx-nav">
        <a href="/" className="cpx-brand" aria-label="Canadian Prospects Recruitment home">
          <img src={closing.logo} alt="" width={36} height={36} />
          <span className="display">CPR Experience Lab</span>
        </a>
        <a href={hero.cta.href === '#dream' ? '#dream' : '#dream'} className="cpx-nav-cta">
          Begin
        </a>
      </header>

      {/* 0. Hero */}
      <section className="cpx-hero" aria-labelledby="cpx-hero-title">
        <div
          className="cpx-hero-bg"
          style={{ backgroundImage: `url('${hero.image}')` }}
          aria-hidden="true"
        />
        <div className="cpx-hero-scrim" aria-hidden="true" />
        <div className="cpx-hero-copy">
          <p className="cpx-eyebrow">{hero.eyebrow}</p>
          <h1 id="cpx-hero-title" className="display">
            {hero.title} <span className="cpx-red">{hero.titleAccent}</span>
          </h1>
          <p className="cpx-hero-sub">{hero.sub}</p>
          <a href={hero.cta.href} className="cpx-btn cpx-btn-red">
            {hero.cta.label}
          </a>
        </div>
        <div className="cpx-scroll-hint" aria-hidden="true">
          <span />
        </div>
      </section>

      {/* Meet the players */}
      <section className="cpx-section cpx-meet" aria-labelledby="cpx-meet-title">
        <div className="cpx-container">
          <Reveal className="cpx-head cpx-head-center">
            <p className="cpx-eyebrow">The Players</p>
            <h2 id="cpx-meet-title" className="display">
              Meet {athletes.her.name} &amp; {athletes.him.name}.
            </h2>
          </Reveal>
          <div className="cpx-meet-grid">
            {[athletes.her, athletes.him].map((a, i) => (
              <Reveal as="article" className="cpx-meet-card" delay={i * 100} key={a.full}>
                <div className="cpx-meet-photo" style={{ backgroundImage: `url('${a.portrait}')` }} role="img" aria-label={a.full} />
                <div className="cpx-meet-meta">
                  <span className="cpx-meet-name display">{a.full}</span>
                  <span className="cpx-meet-role">{a.role}</span>
                  <span className="cpx-meet-home">{a.home}</span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 1. The Dream */}
      <section className="cpx-section cpx-dark" id={dream.id} aria-labelledby="cpx-dream-title">
        <div className="cpx-container">
          <Reveal className="cpx-head">
            <p className="cpx-eyebrow">{dream.eyebrow}</p>
            <h2 id="cpx-dream-title" className="display">
              {dream.headline}
            </h2>
            <p className="cpx-lead">{dream.copy}</p>
          </Reveal>
          <div className="cpx-duo">
            <Reveal as="article" className="cpx-duo-card">
              <div className="cpx-duo-img" style={{ backgroundImage: `url('${dream.her.image}')` }} role="img" aria-label={dream.her.imageAlt} />
              <div className="cpx-duo-scrim" aria-hidden="true" />
              <div className="cpx-duo-body">
                <span className="cpx-duo-name display">{athletes.her.name}</span>
                <p>{dream.her.line}</p>
              </div>
            </Reveal>
            <Reveal as="article" className="cpx-duo-card" delay={100}>
              <div className="cpx-duo-img" style={{ backgroundImage: `url('${dream.him.image}')` }} role="img" aria-label={dream.him.imageAlt} />
              <div className="cpx-duo-scrim" aria-hidden="true" />
              <div className="cpx-duo-body">
                <span className="cpx-duo-name display">{athletes.him.name}</span>
                <p>{dream.him.line}</p>
              </div>
            </Reveal>
          </div>
          <Reveal className="cpx-beats" delay={150}>
            {dream.beats.map((b) => (
              <span key={b} className="cpx-beat">
                {b}
              </span>
            ))}
          </Reveal>
        </div>
      </section>

      {/* 2. The Question */}
      <section className="cpx-section cpx-dark" id={question.id} aria-labelledby="cpx-question-title">
        <div className="cpx-container">
          <Reveal className="cpx-head">
            <p className="cpx-eyebrow">{question.eyebrow}</p>
            <h2 id="cpx-question-title" className="display">
              {question.headline} <span className="cpx-red">{question.headlineAccent}</span>
            </h2>
            <p className="cpx-lead">{question.copy}</p>
          </Reveal>
          <div className="cpx-question-grid">
            {question.cards.map((q, i) => (
              <Reveal as="div" className="cpx-question-card" delay={i * 70} key={q}>
                {q}
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 3. The Guide */}
      <section className="cpx-split" id={guide.id} aria-labelledby="cpx-guide-title">
        <div className="cpx-container cpx-split-grid">
          <Reveal className="cpx-split-copy">
            <p className="cpx-eyebrow">{guide.eyebrow}</p>
            <h2 id="cpx-guide-title" className="display">
              {guide.headline}
            </h2>
            <p className="cpx-lead">{guide.copy}</p>
            <ul className="cpx-doing">
              {guide.doing.map((d) => (
                <li key={d}>{d}</li>
              ))}
            </ul>
          </Reveal>
          <Reveal className="cpx-split-visual" delay={120}>
            <div className="cpx-photo" style={{ backgroundImage: `url('${guide.image}')` }} role="img" aria-label={guide.imageAlt} />
            <div className="cpx-coach-badge">
              <span className="display">{guide.coachName}</span>
              <span>{guide.coachRole}</span>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 4. What CPR Believes */}
      <section className="cpx-section cpx-dark" id={beliefs.id} aria-labelledby="cpx-beliefs-title">
        <div className="cpx-container">
          <Reveal className="cpx-head">
            <p className="cpx-eyebrow">{beliefs.eyebrow}</p>
            <h2 id="cpx-beliefs-title" className="display">
              {beliefs.headline}
            </h2>
          </Reveal>
          <div className="cpx-belief-grid">
            {beliefs.cards.map((card, i) => (
              <Reveal as="article" className="cpx-belief-card" delay={i * 80} key={card.title}>
                <span className="cpx-belief-num display">{String(i + 1).padStart(2, '0')}</span>
                <h3 className="display">{card.title}</h3>
                <p>{card.body}</p>
              </Reveal>
            ))}
          </div>
          <Reveal className="cpx-global-note" delay={120}>
            <p>{beliefs.globalNote}</p>
          </Reveal>
        </div>
      </section>

      {/* 5. The Journey */}
      <section className="cpx-section" id={journey.id} aria-labelledby="cpx-journey-title">
        <div className="cpx-container">
          <Reveal className="cpx-head">
            <p className="cpx-eyebrow">{journey.eyebrow}</p>
            <h2 id="cpx-journey-title" className="display">
              {journey.headline}
            </h2>
            <p className="cpx-lead">{journey.note}</p>
          </Reveal>
          <ol className="cpx-timeline">
            {journey.milestones.map((m, i) => (
              <Reveal as="li" className="cpx-milestone" delay={(i % 4) * 60} key={m}>
                <span className="cpx-milestone-num display">{String(i + 1).padStart(2, '0')}</span>
                <span className="cpx-milestone-label">{m}</span>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* 6. Quiet Work Behind The Scenes */}
      <section className="cpx-scene cpx-quiet" id={quietWork.id} aria-labelledby="cpx-quiet-title">
        <div className="cpx-scene-bg" style={{ backgroundImage: `url('${quietWork.image}')` }} aria-hidden="true" />
        <div className="cpx-scene-scrim" aria-hidden="true" />
        <div className="cpx-container cpx-quiet-body">
          <Reveal className="cpx-quiet-head">
            <p className="cpx-eyebrow">{quietWork.eyebrow}</p>
            <h2 id="cpx-quiet-title" className="display">
              {quietWork.headline} <span className="cpx-red">{quietWork.headlineAccent}</span>
            </h2>
            <p className="cpx-scene-copy">{quietWork.copy}</p>
          </Reveal>
          <ul className="cpx-activity" aria-label="Work CPR manages behind the scenes">
            {quietWork.activity.map((a, i) => (
              <Reveal as="li" className="cpx-activity-card" delay={i * 60} key={a.label}>
                <span className="cpx-activity-icon">
                  <ActivityIcon name={a.icon} />
                </span>
                <span className="cpx-activity-label">{a.label}</span>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {/* 7. Camps & Exposure */}
      <section className="cpx-section cpx-dark" id={camps.id} aria-labelledby="cpx-camps-title">
        <div className="cpx-container">
          <Reveal className="cpx-head">
            <p className="cpx-eyebrow">{camps.eyebrow}</p>
            <h2 id="cpx-camps-title" className="display">
              {camps.headline}
            </h2>
            <p className="cpx-lead">{camps.copy}</p>
          </Reveal>
          <Reveal className="cpx-camps-gallery" delay={100}>
            <RotatingImagePanel slides={[...camps.gallery]} intervalMs={3200} />
          </Reveal>
          <div className="cpx-feature-grid">
            {camps.features.map((f, i) => (
              <Reveal as="article" className="cpx-feature-card" delay={i * 80} key={f.name}>
                <div className="cpx-feature-img" style={{ backgroundImage: `url('${f.image}')` }} role="img" aria-label={f.name} />
                <div className="cpx-feature-meta">
                  <span className="display">{f.name}</span>
                  <span>{f.caption}</span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 8. Player Profiles */}
      <section className="cpx-split" id={profiles.id} aria-labelledby="cpx-profiles-title">
        <div className="cpx-container cpx-split-grid">
          <Reveal className="cpx-split-copy">
            <p className="cpx-eyebrow">{profiles.eyebrow}</p>
            <h2 id="cpx-profiles-title" className="display">
              {profiles.headline}
            </h2>
            <p className="cpx-lead">{profiles.copy}</p>
            <div className="cpx-profile-cards">
              {profiles.cards.map((card) => (
                <a className="cpx-profile-card" href={card.href} key={card.name}>
                  <div className="cpx-profile-thumb" style={{ backgroundImage: `url('${card.photo}')` }} role="img" aria-label={card.name} />
                  <div>
                    <span className="display">{card.name}</span>
                    <span className="cpx-profile-meta">{card.meta}</span>
                  </div>
                </a>
              ))}
            </div>
          </Reveal>
          <Reveal className="cpx-split-visual" delay={120}>
            <img src={profiles.dashboardImage} alt={profiles.dashboardAlt} className="cpx-dashboard-shot" loading="lazy" decoding="async" />
          </Reveal>
        </div>
      </section>

      {/* 9. Results Speak */}
      <section className="cpx-section cpx-results" id={results.id} aria-labelledby="cpx-results-title">
        <div className="cpx-container">
          <Reveal className="cpx-head">
            <p className="cpx-eyebrow">{results.eyebrow}</p>
            <h2 id="cpx-results-title" className="display">
              {results.headline} <span className="cpx-red">{results.headlineAccent}</span>
            </h2>
          </Reveal>
          <div className="cpx-stats">
            {results.stats.map((s, i) => (
              <Reveal as="div" className="cpx-stat" delay={i * 70} key={s.label}>
                <span className="cpx-stat-value display">{s.value}</span>
                <span className="cpx-stat-label">{s.label}</span>
              </Reveal>
            ))}
          </div>
          <Reveal className="cpx-outcomes" delay={100}>
            {results.outcomes.map((o) => (
              <span key={o} className="cpx-outcome">
                {o}
              </span>
            ))}
          </Reveal>
          <div className="cpx-proof-grid">
            {results.proofs.map((p, i) => (
              <Reveal as="article" className="cpx-proof" delay={i * 80} key={p.name}>
                <div className="cpx-proof-img" style={{ backgroundImage: `url('${p.image}')` }} role="img" aria-label={p.name} />
                <div className="cpx-proof-meta">
                  <span className="display">{p.name}</span>
                  <span>{p.caption}</span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 10. Testimonials */}
      <section className="cpx-section cpx-dark" id={testimonials.id} aria-labelledby="cpx-testi-title">
        <div className="cpx-container">
          <Reveal className="cpx-head">
            <p className="cpx-eyebrow">{testimonials.eyebrow}</p>
            <h2 id="cpx-testi-title" className="display">
              {testimonials.headline}
            </h2>
          </Reveal>
          <div className="cpx-testi-grid">
            {testimonials.items.map((t, i) => (
              <Reveal as="article" className="cpx-testi-card" delay={i * 100} key={t.name}>
                <span className="cpx-testi-mark display" aria-hidden="true">
                  &ldquo;
                </span>
                <p className="cpx-testi-quote">{t.quote}</p>
                <div className="cpx-testi-by">
                  {t.photo ? (
                    <img src={t.photo} alt={t.name} loading="lazy" decoding="async" />
                  ) : (
                    <span className="cpx-testi-initial display" aria-hidden="true">
                      {t.name.charAt(0)}
                    </span>
                  )}
                  <div>
                    <span className="cpx-testi-name display">{t.name}</span>
                    <span className="cpx-testi-role">{t.role}</span>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 11. Explore CPR */}
      <section className="cpx-section" id={explore.id} aria-labelledby="cpx-explore-title">
        <div className="cpx-container">
          <Reveal className="cpx-head">
            <p className="cpx-eyebrow">{explore.eyebrow}</p>
            <h2 id="cpx-explore-title" className="display">
              {explore.headline}
            </h2>
          </Reveal>
          <div className="cpx-explore-grid">
            {explore.cards.map((card, i) => (
              <Reveal as="div" delay={i * 60} key={card.title}>
                <a
                  className={`cpx-explore-card cpx-explore-${card.variant}`}
                  href={card.href}
                  {...(card.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                >
                  <span className="cpx-explore-title display">{card.title}</span>
                  <span className="cpx-explore-desc">{card.description}</span>
                  <span className="cpx-explore-arrow" aria-hidden="true">
                    &#10140;
                  </span>
                </a>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 12. Closing */}
      <section className="cpx-closing" id={closing.id} aria-labelledby="cpx-closing-title">
        <div className="cpx-container cpx-closing-body">
          <Reveal>
            <h2 id="cpx-closing-title" className="display cpx-closing-head">
              {closing.headline}
            </h2>
            <p className="cpx-closing-copy">{closing.copy}</p>
            <a href={closing.cta.href} className="cpx-btn cpx-btn-red cpx-btn-lg" target="_blank" rel="noopener noreferrer">
              {closing.cta.label}
            </a>
          </Reveal>
          <Reveal className="cpx-logo-reveal" delay={150}>
            <img src={closing.logo} alt="" width={96} height={96} />
            <div className="cpx-logo-wordmark display">
              <span>{closing.brandLine1}</span>
              <span>{closing.brandLine2}</span>
            </div>
            <p className="cpx-tagline">{closing.tagline}</p>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
