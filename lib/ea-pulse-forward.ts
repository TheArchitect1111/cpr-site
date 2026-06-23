/**
 * Forward normalized activity events to the EA platform Pulse ingestion API.
 * Set EA_PULSE_INGEST_URL (e.g. https://www.efficiencyarchitects.online/api/pulse/events)
 * and EA_CAPTURE_API_KEY (same as ea-payments PULSE_INGEST_KEY / EA_CAPTURE_API_KEY).
 */
export async function forwardPulseEvent(event: {
  product: 'cpr';
  type: string;
  title: string;
  detail?: string;
  priority?: 'critical' | 'high' | 'medium' | 'low';
  href?: string;
  tenantId?: string;
  objectId?: string;
}): Promise<void> {
  const url = process.env.EA_PULSE_INGEST_URL?.trim();
  const key = process.env.EA_CAPTURE_API_KEY?.trim();
  if (!url || !key) return;

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-ea-pulse-key': key,
      },
      body: JSON.stringify(event),
    });
    if (!res.ok) {
      console.warn('[cpr-pulse] ingest failed:', res.status);
    }
  } catch (err) {
    console.warn('[cpr-pulse] ingest threw:', err);
  }
}
