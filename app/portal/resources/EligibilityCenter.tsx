const GOV_BODIES = [
  {
    name: 'NCAA Division I',
    link: 'https://www.eligibilitycenter.org',
    linkLabel: 'eligibilitycenter.org',
    items: [
      {
        label: 'Core Courses',
        val: '16 required: 4 English, 3 math, 2 natural/physical science, 1 additional English/math/science, 2 social science, 4 additional from any qualifying category.',
      },
      {
        label: 'Minimum Core GPA',
        val: '2.3 minimum. A higher GPA allows a lower test score on the sliding scale. A higher test score allows a lower GPA. The two work together.',
      },
      {
        label: 'Test Score',
        val: 'SAT or ACT required. Use the NCAA sliding scale at eligibilitycenter.org to find the exact SAT/ACT score required for your GPA.',
      },
      {
        label: 'Registration',
        val: 'Register at eligibilitycenter.org in 10th or 11th grade. Submit official transcripts and test scores directly through the portal. Early registration avoids last-minute problems.',
      },
    ],
    note: 'Division I is the most academically rigorous eligibility standard. Start tracking core courses in 9th grade so nothing surprises you in senior year.',
  },
  {
    name: 'NCAA Division II',
    link: 'https://www.eligibilitycenter.org',
    linkLabel: 'eligibilitycenter.org',
    items: [
      {
        label: 'Core Courses',
        val: '16 required. Same general distribution as Division I with minor differences in elective flexibility.',
      },
      {
        label: 'Minimum Core GPA',
        val: '2.2 minimum in core courses.',
      },
      {
        label: 'Test Score',
        val: 'Minimum SAT 820 or ACT combined score of 68. No sliding scale at Division II.',
      },
      {
        label: 'Registration',
        val: 'Same NCAA Eligibility Center as Division I. Register at eligibilitycenter.org.',
      },
    ],
    note: 'Division II offers strong athletic competition, academic scholarships, and a balanced student-athlete experience. Requirements are more accessible than Division I, making it a great fit for many Canadian athletes.',
  },
  {
    name: 'NAIA',
    link: 'https://www.playnaia.org',
    linkLabel: 'playnaia.org',
    items: [
      {
        label: 'Eligibility Rule',
        val: 'Two of three: minimum 2.0 GPA, minimum SAT 860 or ACT 18, graduated in the top half of your high school class.',
      },
      {
        label: 'Registration',
        val: 'Register with the NAIA Eligibility Center at playnaia.org. Separate from the NCAA Eligibility Center.',
      },
      {
        label: 'Transfer Rules',
        val: 'More flexible transfer rules than the NCAA. Athletes moving from NJCAA or another NAIA school have cleaner eligibility pathways.',
      },
      {
        label: 'International',
        val: 'More streamlined eligibility process for international students. Less documentation required compared to NCAA.',
      },
    ],
    note: 'NAIA schools compete at a high level and offer athletic scholarships. The two-of-three standard gives athletes more flexibility in how they qualify. A strong fit for athletes who meet one or two of the three criteria comfortably.',
  },
  {
    name: 'NJCAA (Junior College)',
    link: 'https://www.njcaa.org',
    linkLabel: 'njcaa.org',
    items: [
      {
        label: 'Eligibility',
        val: 'High school diploma or GED required. No standardized test score required for most NJCAA programs.',
      },
      {
        label: 'Divisions',
        val: 'Division I: full athletic scholarships allowed. Division II: partial scholarships. Division III: no athletic scholarships.',
      },
      {
        label: 'Transfer Path',
        val: 'A common bridge for athletes who want to develop academically and athletically before transferring to a four-year NCAA or NAIA school.',
      },
      {
        label: 'Eligibility Window',
        val: 'Maximum 2 years of NJCAA eligibility. Those 2 years do not count against your 4-year NCAA or NAIA eligibility.',
      },
    ],
    note: 'Junior college is a legitimate and strategic path, not a fallback. Many athletes sharpen their game at NJCAA programs and transfer to NCAA Division I or II with full scholarships.',
  },
  {
    name: 'U SPORTS (Canadian Universities)',
    link: 'https://www.usports.ca',
    linkLabel: 'usports.ca',
    items: [
      {
        label: 'Academic Eligibility',
        val: 'Must be enrolled full-time (minimum 60% of a full course load) and maintain good academic standing (typically a minimum 60% average).',
      },
      {
        label: 'Eligibility Window',
        val: '5 years of eligibility starting from your first registration in any post-secondary institution. Playing years cannot exceed 5 total.',
      },
      {
        label: 'Registration',
        val: 'No separate eligibility center. Eligibility is verified directly by your university athletic department before each season.',
      },
      {
        label: 'Age Rules',
        val: 'No age restrictions in most U SPORTS sports. Athletes who took gap years or started university later retain their full 5-year eligibility window.',
      },
    ],
    note: "U SPORTS is Canada's top university athletic league. Schools offer partial academic scholarships rather than full athletic scholarships. Competing at U SPORTS while earning a Canadian degree is a strong path for many athletes in this program.",
  },
];

export default function EligibilityCenter() {
  return (
    <section className="pp-section">
      <p className="pp-section-eyebrow">Recruiting Resources</p>
      <h2 className="pp-section-title">Eligibility Center</h2>
      <p className="res-intro">
        Academic eligibility requirements vary by governing body and division. Use this guide to understand what each organization requires and where to register.
      </p>

      <div className="res-gov-cards">
        {GOV_BODIES.map(gov => (
          <div key={gov.name} className="res-gov-card">
            <div className="res-gov-header">
              <span className="res-gov-name">{gov.name}</span>
              <a
                href={gov.link}
                target="_blank"
                rel="noopener noreferrer"
                className="res-gov-link"
              >
                {gov.linkLabel} &#8599;
              </a>
            </div>
            <div className="res-gov-body">
              {gov.items.map(item => (
                <div key={item.label} className="res-gov-item">
                  <div className="res-gov-item-label">{item.label}</div>
                  <div className="res-gov-item-val">{item.val}</div>
                </div>
              ))}
            </div>
            <div className="res-gov-note">{gov.note}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
