const AID_TYPES = [
  {
    title: 'Athletic Scholarships',
    sub: 'Awarded by coaches based on athletic ability and program fit',
    points: [
      "A full athletic scholarship covers tuition, room, board, books, and fees. Only headcount sports (including Division I basketball) offer full athletic scholarships. In headcount sports, each scholarship is for one athlete.",
      "Equivalency sports divide a fixed pool of scholarships among multiple athletes. A coach with 10 equivalencies might give 10 athletes partial awards rather than 4 athletes full ones.",
      "Partial athletic scholarships are common and significant. A 40% scholarship at a school with $50,000 annual costs is still $20,000 per year. Do not dismiss partial offers without calculating the actual dollar value.",
      "Under NCAA rules, athletic scholarships are renewed annually. However, most coaches verbally commit to multi-year packages. As long as an athlete meets academic and athletic standards, renewal is standard practice.",
      "Scholarship amounts are capped at the cost of attendance, which includes tuition, housing, meals, transportation, and personal expenses. Schools in expensive cities often have higher cost-of-attendance figures.",
    ],
  },
  {
    title: 'Academic Scholarships',
    sub: 'Awarded by the university based on academic achievement',
    points: [
      "Academic scholarships are based on GPA, test scores, and sometimes class rank or extracurricular achievement. They are awarded by the university admissions or financial aid office, not the coaching staff.",
      "Athletic and academic scholarships can be stacked up to the full cost of attendance. An athlete with both types of aid can receive more total support than from an athletic scholarship alone.",
      "Many academic scholarships are automatic: apply by the deadline, meet the GPA threshold, and the award is applied to your account. Ask each school's financial aid office which automatic awards you qualify for.",
      "Academic scholarship maintenance typically requires a minimum GPA (often 3.0 or higher). The requirements are usually similar to athletic scholarship standards, so maintaining one generally means maintaining both.",
    ],
  },
  {
    title: 'Need-Based Financial Aid',
    sub: 'Awarded based on family financial situation, not athletic or academic achievement',
    points: [
      "In the US, need-based aid is calculated using the FAFSA (Free Application for Federal Student Aid). The FAFSA opens October 1 each year. Many schools have priority deadlines in November or December. File early.",
      "The FAFSA calculates an Expected Family Contribution (EFC). Schools use this to determine how much grant and loan aid to offer. A lower EFC means greater eligibility for need-based grants.",
      "For Canadian students attending school in Canada, need-based aid comes through provincial student assistance programs (OSAP in Ontario, StudentAidBC in British Columbia, and equivalents in other provinces) and federal Canada Student Grants.",
      "Need-based aid stacks with athletic and academic scholarships. The total package across all sources determines your actual out-of-pocket cost. Always look at total cost, not just scholarship size.",
      "Even if you expect a full athletic scholarship, file the FAFSA. It unlocks access to federal grants and subsidized loans that are not available without it, and can provide a safety net if scholarship terms change.",
    ],
  },
  {
    title: 'Walk-On Opportunities',
    sub: 'Joining a team without an initial scholarship offer',
    points: [
      "A walk-on is an athlete who earns a roster spot without a scholarship. Walk-ons try out for the team or are invited by a coach who sees potential but does not have scholarship money available at the time.",
      "A preferred walk-on is an athlete the coaching staff verbally commits to bring onto the roster. This is not a scholarship, but it is a guaranteed opportunity to compete and prove yourself.",
      "Walk-ons earn scholarships. Many Division I athletes who start as walk-ons receive athletic aid after their first or second year once they demonstrate their value to the program. It is a proven path.",
      "Walking on at a higher level without a scholarship is often better for development than taking a full scholarship at a program where you will not play or grow. Level of competition and playing time matter more than the initial dollar amount.",
    ],
  },
];

export default function ScholarshipCenter() {
  return (
    <section className="pp-section">
      <p className="pp-section-eyebrow">Recruiting Resources</p>
      <h2 className="pp-section-title">Scholarship Center</h2>
      <p className="res-intro">
        Athletic financial aid is more nuanced than most families expect. Here is a plain-language breakdown of the types of aid available and how they work together.
      </p>

      <div className="res-aid-cards">
        {AID_TYPES.map(aid => (
          <div key={aid.title} className="res-aid-card">
            <div className="res-aid-card-header">
              <div className="res-aid-title">{aid.title}</div>
              <div className="res-aid-sub">{aid.sub}</div>
            </div>
            <div className="res-aid-body">
              {aid.points.map((point, i) => (
                <div key={i} className="res-aid-point">
                  <div className="res-aid-bullet" aria-hidden="true" />
                  <div className="res-aid-text">{point}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
