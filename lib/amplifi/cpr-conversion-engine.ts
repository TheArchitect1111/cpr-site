export type CPRContentType =
  | 'problem-recognition'
  | 'diagnostic'
  | 'expert-video'
  | 'objection-answer'
  | 'direct-invitation'
  | 'client-transformation'
  | 'proof';

export type CPRDraft = {
  id: string;
  day: number;
  contentType: CPRContentType;
  funnelStage: 'attract' | 'trust' | 'help' | 'convert';
  format: 'static' | 'carousel' | 'reel' | 'story';
  title: string;
  facebook: string;
  instagram: string;
  proofStatus: 'not-required' | 'verified' | 'missing';
};

const safePlan: Array<Pick<CPRDraft, 'contentType' | 'funnelStage' | 'format' | 'title'>> = [
  { contentType: 'problem-recognition', funnelStage: 'attract', format: 'static', title: 'Name the recruiting problem' },
  { contentType: 'diagnostic', funnelStage: 'help', format: 'carousel', title: 'Give families a useful self-check' },
  { contentType: 'expert-video', funnelStage: 'trust', format: 'reel', title: 'Share a coachable point of view' },
  { contentType: 'objection-answer', funnelStage: 'help', format: 'reel', title: 'Answer a real parent objection' },
  { contentType: 'direct-invitation', funnelStage: 'convert', format: 'story', title: 'Invite the next step' },
];

function verified(input: string) {
  return /(?:verified proof|permission confirmed|approved quote|verified result|verified stat)\s*:/i.test(input);
}

function fallback(topic: string, audience: string, action: string): CPRDraft[] {
  const subject = topic || 'the recruiting process';
  const who = audience || 'student-athletes and their families';
  const items = [
    {
      facebook: `Recruiting can feel busy long before it becomes productive.\n\nProfiles get created. Clips get posted. Messages get sent. But if the athlete’s story, fit, and next step are not clear, activity can hide the real problem.\n\nFor ${who}, clarity comes before exposure.`,
      instagram: `Busy is not the same as ready.\n\nA profile, clips, and messages only help when the athlete’s story, fit, and next step are clear.\n\nClarity before exposure.\n\n#CPR #StudentAthlete #RecruitingEducation`,
    },
    {
      facebook: `A five-minute ${subject} check:\n\n1. Are the athlete’s current facts accurate?\n2. Is the film recent and easy to watch?\n3. Does the profile show fit—not just ambition?\n4. Is there a clear next action this week?\n\nThe first “no” is the place to begin.`,
      instagram: `CAROUSEL\n\n1 — Is every athlete fact current?\n2 — Is the film recent and easy to watch?\n3 — Does the profile show fit?\n4 — Is this week’s next action clear?\n\nYour first “no” is useful.\n\n#CPR #StudentAthlete #RecruitingEducation`,
    },
    {
      facebook: `VIDEO SCRIPT\n\n“More exposure is not always the next answer. Before sending another message, make sure a coach can quickly understand who the athlete is, what is verified, and why the program may be a real fit.”\n\nVisual: speak directly to camera, then show an anonymized profile checklist.`,
      instagram: `REEL SCRIPT\n\n“Before chasing more exposure, make sure a coach can quickly see who the athlete is, what is verified, and why the fit may be real.”\n\nOn-screen: Clear. Current. Credible.\n\n#CPR #StudentAthlete #RecruitingEducation`,
    },
    {
      facebook: `“We are already late.”\n\nThat fear can push families toward rushed messages and inflated claims. A better response is to get honest about the current position, verify the materials, and choose the next useful action. A clear plan beats panic.`,
      instagram: `“We are already late.”\n\nDo not let panic write the plan.\n\nVerify the facts. Improve the materials. Choose the next useful action.\n\nClear beats rushed.\n\n#CPR #RecruitingEducation`,
    },
    {
      facebook: `The next step does not have to be a promise about scholarships, offers, or roster spots. It should be a clear look at where the athlete is now and what deserves attention next.\n\n${action || 'Start the next verified CPR step.'}`,
      instagram: `No hype. No guarantees.\n\nJust a clear look at where the athlete is now and what deserves attention next.\n\n${action || 'Start the next verified CPR step.'}\n\n#CPR #StudentAthlete`,
    },
  ];
  return safePlan.map((plan, index) => ({
    id: `cpr-${plan.contentType}-${index}`,
    day: index + 1,
    ...plan,
    ...items[index],
    proofStatus: 'not-required',
  }));
}

export async function generateCPRConversionCampaign(input: {
  topic: string;
  audience: string;
  objective: string;
  callToAction: string;
  proof?: string;
}): Promise<CPRDraft[]> {
  const base = fallback(input.topic, input.audience, input.callToAction);
  const hasProof = verified(input.proof || '');
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) return base;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL?.trim() || 'gpt-4o-mini',
        temperature: 0.7,
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content: `You are Amplifi's CPR strategy pack. Write natural, specific conversion content for student-athletes and parents. Follow the required plan. Facebook and Instagram must be different. Reels need spoken and visual direction; carousels need slide copy. Never guarantee recruitment, scholarships, offers, roster placement, playing time, or exposure. Never invent athlete facts, stats, interest, results, quotes, or urgency. Never expose private information about a minor. Only use proof when verifiedProof is true. Return JSON only: {"drafts":[{"facebook":"...","instagram":"..."}]}.`,
          },
          {
            role: 'user',
            content: JSON.stringify({ ...input, verifiedProof: hasProof, requiredPlan: safePlan }),
          },
        ],
      }),
    });
    if (!response.ok) return base;
    const payload = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
    const raw = payload.choices?.[0]?.message?.content;
    if (!raw) return base;
    const parsed = JSON.parse(raw) as { drafts?: Array<{ facebook?: string; instagram?: string }> };
    if (!Array.isArray(parsed.drafts) || parsed.drafts.length !== base.length) return base;
    return base.map((item, index) => ({
      ...item,
      facebook: String(parsed.drafts?.[index]?.facebook || item.facebook).trim(),
      instagram: String(parsed.drafts?.[index]?.instagram || item.instagram).trim(),
    }));
  } catch {
    return base;
  }
}
