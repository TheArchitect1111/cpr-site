/** Verified Resend senders to try when the configured client domain is not verified yet. */
export const RESEND_FALLBACK_FROM_CANDIDATES = [
  'Canadian Prospects Recruitment <noreply@efficiencyarchitects.online>',
  'Canadian Prospects Recruitment <onboarding@resend.dev>',
] as const;

export const RESEND_FALLBACK_FROM = RESEND_FALLBACK_FROM_CANDIDATES[0];

export function resolveResendFromEmail(): string {
  const configured = process.env.RESEND_FROM_EMAIL?.trim();
  if (configured) return configured;
  return RESEND_FALLBACK_FROM;
}

function senderAddress(from: string): string {
  const match = from.match(/<([^>]+@[^>]+)>/);
  return (match?.[1] || from).trim().toLowerCase();
}

function senderDomain(from: string): string {
  return senderAddress(from).split('@')[1] || '';
}

export function fallbackResendFromCandidates(primaryFrom: string): string[] {
  const seen = new Set<string>([primaryFrom]);
  const candidates: string[] = [];
  for (const from of RESEND_FALLBACK_FROM_CANDIDATES) {
    if (!seen.has(from)) {
      seen.add(from);
      candidates.push(from);
    }
  }
  return candidates;
}

export async function checkResendSender(): Promise<{ ok: boolean; detail: string }> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    return { ok: false, detail: 'RESEND_API_KEY is missing.' };
  }

  const from = resolveResendFromEmail();
  const domain = senderDomain(from);

  if (!domain) {
    return { ok: false, detail: 'RESEND_FROM_EMAIL is not a valid address.' };
  }

  try {
    const res = await fetch('https://api.resend.com/domains', {
      headers: { Authorization: `Bearer ${apiKey}` },
      cache: 'no-store',
    });
    if (!res.ok) {
      return { ok: false, detail: `Could not verify Resend domains (HTTP ${res.status}).` };
    }
    const data = (await res.json()) as { data?: Array<{ name: string; status: string }> };
    const verified = new Set(
      (data.data || [])
        .filter((entry) => entry.status === 'verified')
        .map((entry) => entry.name.toLowerCase()),
    );

    if (verified.has(domain)) {
      return { ok: true, detail: `Sender domain verified: ${domain}` };
    }

    const fallback = RESEND_FALLBACK_FROM_CANDIDATES.find((candidate) =>
      verified.has(senderDomain(candidate)),
    );
    if (fallback) {
      return {
        ok: true,
        detail: `Configured sender ${domain} is not verified; runtime will fall back to ${senderAddress(fallback)}.`,
      };
    }

    const verifiedList = [...verified].join(', ') || 'none';
    return {
      ok: false,
      detail: `No verified Resend sender for CPR login. Verified domains: ${verifiedList}. Verify mississaugamagic.com or set RESEND_FROM_EMAIL to a verified domain.`,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Resend domain check failed';
    return { ok: false, detail: message };
  }
}
