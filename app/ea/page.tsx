import './ea.css';
import { ScrollReveal } from './ScrollReveal';
import { StatCounter } from './StatCounter';

const painBubbles = [
  "There aren't enough hours in the day",
  "If I step away, things fall apart",
  "I'm always the one putting out fires",
  "I can't remember the last real day off",
  "There's so much falling through the cracks",
];

const painPoints = [
  {
    icon: '⏳',
    title: 'Your time belongs to everyone but you',
    body: 'Your calendar is full. Your brain never shuts off. You started this for freedom and ended up with a second job — one you can never leave.',
  },
  {
    icon: '🔁',
    title: "You're the only one who knows how anything works",
    body: 'Every decision, every problem, every question — it comes back to you. Nothing moves unless you push it. That was fine at the start. It isn\'t anymore.',
  },
  {
    icon: '🚪',
    title: 'Good people come and go and the gaps stay',
    body: 'You hire, you hope, it doesn\'t stick. The holes in your team keep costing you — in time, in stress, in the work you end up absorbing yourself.',
  },
  {
    icon: '📈',
    title: "Growth sounds great — until you think about what it costs",
    body: 'More clients means more pressure on a team already stretched thin. You can see the opportunity. You just can\'t see how to grab it without burning out.',
  },
  {
    icon: '😔',
    title: "You know something needs to change — but when?",
    body: "Every week you tell yourself you'll get to it. But the urgent always wins. The thing that would actually fix your life keeps getting pushed to next month.",
  },
  {
    icon: '🌀',
    title: 'The business is running you instead of the other way around',
    body: "You had a vision. You still believe in it. But somewhere along the way, the business stopped being yours to lead and started being yours to survive.",
  },
];

const journeySteps = [
  {
    n: '1',
    nowTitle: 'Where you are right now',
    nowBody: 'Working long hours, wearing every hat, unable to step back without something breaking. You\'re in the business all day — not on it.',
    afterTitle: 'Where this conversation leads',
    afterBody: 'You sit across from someone who\'s heard this before and actually knows how to help. No jargon. No pitch. Just listening.',
  },
  {
    n: '2',
    nowTitle: 'The picture is blurry',
    nowBody: 'You know something is wrong — it\'s costing you time, money, energy — but you\'re too close to see it clearly. You\'re solving symptoms, not causes.',
    afterTitle: 'We map what\'s draining you',
    afterBody: 'We look at where your time actually goes, what\'s falling through, and what\'s missing. For the first time, you see the whole picture.',
  },
  {
    n: '3',
    nowTitle: 'The gaps stay invisible until they cost you',
    nowBody: 'There are things that need to happen in your business that nobody is doing — or doing well. These gaps quietly eat your growth every single day.',
    afterTitle: 'We name exactly what\'s missing',
    afterBody: 'Not vague advice — specific gaps. The role that doesn\'t exist. The thing no one owns. The bottleneck with your name on it.',
  },
  {
    n: '4',
    nowTitle: 'Fixing it feels like more work on top of everything',
    nowBody: 'You know it needs to change. But even thinking about change takes energy you don\'t have. So it stays broken, and you stay tired.',
    afterTitle: 'We bring what\'s needed — and we build it with you',
    afterBody: 'Whether it\'s the right person, a clearer process, or someone to take things off your plate — we make it real. You\'re not alone in this anymore.',
  },
  {
    n: '5',
    nowTitle: 'Your normal is surviving',
    nowBody: 'You haven\'t felt genuinely on top of things in a long time. Keeping up has become the goal. That was never supposed to be the point.',
    afterTitle: 'Your new normal is leading',
    afterBody: 'The business moves without you needing to push every part of it. You have time to think, space to breathe, and energy for the things that actually matter.',
  },
];

const visionCards = [
  { check: '✦', text: 'Leaving at 5pm without your phone buzzing with problems' },
  { check: '✦', text: 'Taking a week off and coming back to a business that\'s still standing' },
  { check: '✦', text: 'Watching your team handle things you used to handle yourself' },
  { check: '✦', text: 'Having the headspace to actually think about what comes next' },
  { check: '✦', text: 'Being present — really present — for the people who matter to you' },
  { check: '✦', text: 'Feeling proud of what you\'ve built, instead of buried by it' },
];

const testimonials = [
  {
    quote:
      "I thought I just needed to work harder. What I actually needed was someone to show me what I couldn\'t see. Three months in, I have my evenings back. That sounds small. It isn\'t.",
    name: 'S. R.',
    role: 'Owner, Logistics Company',
    initials: 'SR',
  },
  {
    quote:
      "We\'d been stuck at the same ceiling for two years. I kept hiring and hoping. What changed everything was finally understanding where the real gap was — not just who was missing, but what.",
    name: 'M. T.',
    role: 'Founder, Service Business',
    initials: 'MT',
  },
  {
    quote:
      "I was skeptical. I\'ve heard a lot of promises. But they didn\'t promise me anything — they just asked questions no one had ever asked. That\'s when I knew this was different.",
    name: 'D. A.',
    role: 'Director, Growing Agency',
    initials: 'DA',
  },
];

export default function EAFreedomPage() {
  return (
    <div className="ea-page">
      {/* ── NAV ─────────────────────────────────────────── */}
      <nav className="ea-nav">
        <div className="ea-nav-inner">
          <a href="#" className="ea-nav-logo">
            <span>EA</span>
            EFFICIENCY ARCHITECTS
          </a>
          <a href="#talk" className="ea-nav-cta">
            Book a Free Call
          </a>
        </div>
      </nav>

      {/* ── HERO ─────────────────────────────────────────── */}
      <section className="ea-hero">
        <div className="ea-wrap">
          <div className="ea-hero-grid">
            <div>
              <p className="ea-hero-eyebrow ea-display">Find your way to freedom</p>
              <h1 className="ea-display">
                You get your<br />
                <em>life back.</em>
              </h1>
              <p className="ea-hero-sub">
                We find what&rsquo;s stealing your time, name what&rsquo;s missing in your business, and
                build what you need — so you can finally step back without it falling apart.
              </p>
              <div className="ea-hero-actions">
                <a href="#talk" className="ea-btn ea-btn-gold ea-display">
                  Let&rsquo;s Find Your Freedom &#10140;
                </a>
                <a href="#journey" className="ea-btn ea-btn-ghost">
                  See how it works
                </a>
              </div>
            </div>

            {/* Floating pain bubbles */}
            <div className="ea-bubbles">
              {painBubbles.map((b, i) => (
                <div key={i} className="ea-bubble">
                  <span className="ea-bubble-dot" />
                  {b}
                </div>
              ))}
              <div className="ea-hero-center-text ea-display" aria-hidden>
                <div className="big">15+ hrs</div>
                <div className="sub">given back each week</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── WHAT'S DRAINING YOU ──────────────────────────── */}
      <section className="ea-drain" id="pain">
        <div className="ea-wrap">
          <ScrollReveal>
            <div className="ea-drain-head">
              <h2 className="ea-display">
                More of what matters.<br />
                <em>Less of what drains you.</em>
              </h2>
              <p>
                You didn&rsquo;t build this business to be buried by it. But somewhere along the
                way, the gap between where you are and where you want to be got very, very wide.
              </p>
            </div>
          </ScrollReveal>
          <div className="ea-pain-grid">
            {painPoints.map((p, i) => (
              <ScrollReveal key={p.title} delay={i * 90}>
                <div className="ea-pain-card">
                  <span className="ea-pain-icon">{p.icon}</span>
                  <h3>{p.title}</h3>
                  <p>{p.body}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── JOURNEY ──────────────────────────────────────── */}
      <section className="ea-journey" id="journey">
        <div className="ea-wrap">
          <ScrollReveal>
            <div className="ea-journey-head">
              <p className="ea-label ea-display">The path forward</p>
              <h2 className="ea-display">
                From where you are<br />to where you want to be.
              </h2>
              <p>
                Five steps. No jargon. No guesswork. Just a clear path from exhausted to
                free — one that&rsquo;s built around your specific situation.
              </p>
            </div>
          </ScrollReveal>

          {journeySteps.map((step, i) => (
            <ScrollReveal key={step.n} delay={i * 100}>
              <div className="ea-step">
                <div className="ea-step-num ea-display">{step.n}</div>

                <div className="ea-step-before">
                  <span className="ea-step-badge ea-badge-now">Where you are</span>
                  <h3>{step.nowTitle}</h3>
                  <p>{step.nowBody}</p>
                </div>

                <div className="ea-step-after">
                  <span className="ea-step-badge ea-badge-after">Where you&rsquo;re headed</span>
                  <h3>{step.afterTitle}</h3>
                  <p>{step.afterBody}</p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* ── VISION ───────────────────────────────────────── */}
      <section className="ea-vision">
        <div className="ea-wrap">
          <ScrollReveal>
            <div className="ea-vision-head">
              <h2 className="ea-display">Picture your week.</h2>
              <p>This is what&rsquo;s possible on the other side. Not a fantasy — just what happens when the right things are finally in the right place.</p>
            </div>
          </ScrollReveal>
          <div className="ea-vision-grid">
            {visionCards.map((c, i) => (
              <ScrollReveal key={c.text} delay={i * 80}>
                <div className="ea-vision-card">
                  <span className="check">{c.check}</span>
                  <p>{c.text}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
          <ScrollReveal delay={200}>
            <div className="ea-vision-cta">
              <a href="#talk" className="ea-btn ea-btn-white ea-display">
                I want this. Let&rsquo;s talk. &#10140;
              </a>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ── STATS ────────────────────────────────────────── */}
      <section className="ea-stats">
        <div className="ea-wrap">
          <ScrollReveal>
            <div className="ea-stats-head">
              <h2 className="ea-display">Real results. Real people.</h2>
              <p>These aren&rsquo;t averages from a spreadsheet. They&rsquo;re what happens when you stop guessing and start building what&rsquo;s actually missing.</p>
            </div>
          </ScrollReveal>
          <ScrollReveal delay={100}>
            <div className="ea-stats-row">
              <div className="ea-stat-box">
                <span className="val ea-display">
                  <StatCounter target={15} suffix="+" />
                  <em> hrs</em>
                </span>
                <span className="lbl">Given back each week</span>
                <p className="sub">Time you get back — to lead, to think, to actually live.</p>
              </div>
              <div className="ea-stat-box">
                <span className="val ea-display">
                  <StatCounter target={3} suffix="x" />
                </span>
                <span className="lbl">Bigger impact, less effort</span>
                <p className="sub">When the right people are doing the right things, everything multiplies.</p>
              </div>
              <div className="ea-stat-box">
                <span className="val ea-display">
                  <StatCounter target={100} suffix="%" />
                </span>
                <span className="lbl">Never went back</span>
                <p className="sub">Once you see what&rsquo;s possible, there&rsquo;s no going back to surviving.</p>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ── TESTIMONIALS ─────────────────────────────────── */}
      <section className="ea-testi" id="stories">
        <div className="ea-wrap">
          <ScrollReveal>
            <div className="ea-testi-head">
              <h2 className="ea-display">They were where you are.</h2>
              <p>They weren&rsquo;t looking for magic. Just clarity, the right support, and a path forward.</p>
            </div>
          </ScrollReveal>
          <div className="ea-testi-grid">
            {testimonials.map((t, i) => (
              <ScrollReveal key={t.name} delay={i * 110}>
                <div className="ea-testi-card">
                  <p className="ea-testi-quote">{t.quote}</p>
                  <div className="ea-testi-who">
                    <div className="ea-testi-avatar ea-display">{t.initials}</div>
                    <div>
                      <div className="name">{t.name}</div>
                      <div className="role">{t.role}</div>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ────────────────────────────────────── */}
      <section className="ea-cta" id="talk">
        <div className="ea-wrap">
          <ScrollReveal>
            <h2 className="ea-display">
              Your freedom starts with<br />
              <em>one honest conversation.</em>
            </h2>
            <p>
              No pitch. No pressure. Just 30 minutes to hear what&rsquo;s really going on and tell
              you honestly whether we can help — and how.
            </p>
            <a href="mailto:hello@efficiencyarchitects.com" className="ea-btn ea-btn-gold ea-display" style={{ fontSize: '16px', padding: '18px 40px' }}>
              Book Your Free 30-Minute Call &#10140;
            </a>
            <span className="ea-cta-note">
              No commitment. No sales pressure. Just a real conversation.
            </span>
          </ScrollReveal>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────── */}
      <footer className="ea-footer">
        <div className="ea-wrap">
          <p>
            &copy; 2026 Efficiency Architects. All rights reserved. &nbsp;&middot;&nbsp;{' '}
            <a href="mailto:hello@efficiencyarchitects.com">hello@efficiencyarchitects.com</a>
          </p>
        </div>
      </footer>
    </div>
  );
}
