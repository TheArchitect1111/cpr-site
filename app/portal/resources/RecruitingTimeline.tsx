import { getYearsUntilGrad } from '@/lib/portal-data';

type GradeStatus = 'done' | 'active' | 'future';

const GRADES = [
  {
    grade: 9,
    label: '9th Grade',
    subtitle: 'Freshman',
    categories: [
      {
        label: 'Academic',
        text: 'Start strong from day one. Every grade counts toward your cumulative GPA. Meet with your guidance counselor to map out four years of core courses that qualify for NCAA or U SPORTS requirements.',
      },
      {
        label: 'Highlight Film',
        text: 'Start recording games now. Raw footage today becomes your highlight reel in two years. Build your footage library every season, every tournament.',
      },
      {
        label: 'Camps and Showcases',
        text: 'Attend local skill development camps. The priority at this stage is development, not exposure. Focus on getting better and competing at the highest level available to you.',
      },
      {
        label: 'Coach Outreach',
        text: 'No outreach needed yet. Your job is to develop and compete. The recruiting process will come. Right now, build the game that makes coaches come to you.',
      },
      {
        label: 'Eligibility',
        text: 'Learn what the NCAA Eligibility Center is and why it matters. Understand which high school courses count as core courses so you can plan your four-year academic schedule correctly.',
      },
      {
        label: 'Campus Visits',
        text: 'There are no rules, no pressure, and no cost to walking a college campus as a curious student. Visit schools that interest you whenever you get the chance.',
      },
    ],
  },
  {
    grade: 10,
    label: '10th Grade',
    subtitle: 'Sophomore',
    categories: [
      {
        label: 'Academic',
        text: 'Maintain a GPA of 3.0 or higher. Check your core course progress and confirm you are on track for NCAA or U SPORTS eligibility requirements before 11th grade.',
      },
      {
        label: 'Highlight Film',
        text: 'Compile your best clips into a working highlight reel. Even a rough 3 to 4 minute cut gives coaches something to evaluate and gives CPR something to work with.',
      },
      {
        label: 'Camps and Showcases',
        text: 'Start attending regional exposure camps and showcases. College coaches scout these events. Being seen at the right events early establishes your name before the junior year rush.',
      },
      {
        label: 'Coach Outreach',
        text: 'Research schools that match your academic and athletic profile. Follow programs you are genuinely interested in. Understand what they look for in a recruit before you reach out.',
      },
      {
        label: 'Eligibility',
        text: 'Register with the NCAA Eligibility Center (eligibilitycenter.org) by spring of 10th grade if you plan to play Division I or Division II. Early registration prevents problems later.',
      },
      {
        label: 'Campus Visits',
        text: 'Unofficial visits (paid out of pocket) are allowed at any time under NCAA rules. Visit schools you are considering before junior year so you are not making decisions under pressure.',
      },
    ],
  },
  {
    grade: 11,
    label: '11th Grade',
    subtitle: 'Junior, The Most Critical Year',
    categories: [
      {
        label: 'Academic',
        text: 'This is the year that matters most. If targeting US schools, start SAT or ACT preparation. A higher test score improves your positioning on the NCAA sliding scale and can increase scholarship potential.',
      },
      {
        label: 'Highlight Film',
        text: 'Create a polished 2 to 3 minute highlight reel from your junior season. This is the most important film you will send to coaches. CPR helps prepare and distribute it to the right programs.',
      },
      {
        label: 'Camps and Showcases',
        text: 'Junior year is your highest-visibility window. Attend every quality exposure event you can access. Division I and Division II coaches are actively evaluating prospects at this stage.',
      },
      {
        label: 'Coach Outreach',
        text: 'Starting June 15 after junior year, Division I coaches can call, text, and email you directly. CPR launches your official coach outreach campaign this year and tracks every response.',
      },
      {
        label: 'Eligibility',
        text: 'Send your official transcript and test scores to the NCAA Eligibility Center before senior year begins. Amateurism certification must also be completed before coaches can legally recruit you.',
      },
      {
        label: 'Campus Visits',
        text: 'Begin scheduling unofficial visits to your top schools. Narrow your list to 5 to 8 programs before senior year. Arriving at 12th grade with a focused list gives you a major advantage.',
      },
    ],
  },
  {
    grade: 12,
    label: '12th Grade',
    subtitle: 'Senior',
    categories: [
      {
        label: 'Academic',
        text: 'Do not let grades slip. Scholarship offers are conditional on maintaining your GPA through graduation. Stay enrolled in core courses and finish every semester strong.',
      },
      {
        label: 'Highlight Film',
        text: 'Update your highlight reel with early senior season footage as soon as it is available. Coaches who evaluated you in the spring want to see how you developed over the summer.',
      },
      {
        label: 'Camps and Showcases',
        text: 'If you are still evaluating options, attend high-visibility fall events. The fall showcase circuit is your last major window before decisions close for most programs.',
      },
      {
        label: 'Coach Outreach',
        text: 'Manage conversations with interested coaches. CPR guides you through offers, official visit coordination, scholarship comparisons, and the final decision.',
      },
      {
        label: 'Eligibility',
        text: 'Submit your final transcript to the NCAA Eligibility Center after graduation. Your eligibility certification must be complete before you can practice or compete at your college program.',
      },
      {
        label: 'Signing Periods',
        text: 'The Early Signing Period for basketball opens in mid-November. National Signing Day is in February. Division I allows up to 5 official paid campus visits per recruit. Schedule your strongest options first.',
      },
    ],
  },
];

function gradeFromGradYear(gradYear: number, currentYear: number): number {
  if (gradYear <= 0) return 0;
  const yearsUntil = getYearsUntilGrad(gradYear, currentYear);
  if (yearsUntil <= 0) return 12;
  if (yearsUntil === 1) return 11;
  if (yearsUntil === 2) return 10;
  if (yearsUntil === 3) return 9;
  return 0;
}

function gradeStatus(grade: number, current: number): GradeStatus {
  if (current === 0) return 'future';
  if (grade < current) return 'done';
  if (grade === current) return 'active';
  return 'future';
}

export default function RecruitingTimeline({
  gradYear,
  currentYear,
}: {
  gradYear: number;
  currentYear: number;
}) {
  const currentGrade = gradeFromGradYear(gradYear, currentYear);

  return (
    <section className="pp-section">
      <p className="pp-section-eyebrow">Recruiting Resources</p>
      <h2 className="pp-section-title">Recruiting Timeline by Grade</h2>
      {currentGrade > 0 && gradYear > 0 && (
        <p className="res-intro">
          Class of {gradYear}. Your current stage is highlighted below.
        </p>
      )}
      {currentGrade === 0 && (
        <p className="res-intro">
          A grade-by-grade guide to what athletes and families should be doing at each stage of the recruiting process.
        </p>
      )}

      <div className="res-timeline">
        {GRADES.map(g => {
          const status = gradeStatus(g.grade, currentGrade);
          return (
            <div key={g.grade} className={`res-grade ${status}`}>
              <div className="res-grade-indicator">
                <div className="res-grade-dot">
                  {status === 'done' ? '✓' : g.grade}
                </div>
              </div>
              <div className="res-grade-content">
                <div className="res-grade-header">
                  <span className="res-grade-title">{g.label} · {g.subtitle}</span>
                  {status === 'active' && (
                    <span className="res-grade-badge">Your Grade</span>
                  )}
                </div>
                <div className="res-grade-body">
                  {g.categories.map(cat => (
                    <div key={cat.label} className="res-category">
                      <div className="res-category-label">{cat.label}</div>
                      <div className="res-category-text">{cat.text}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
