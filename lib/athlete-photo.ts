/** True when the athlete has a real photo — not an empty URL or the old dummy fallback. */
export function hasAthletePhoto(photoUrl?: string) {
  const url = String(photoUrl || '').trim();
  return Boolean(url) && url !== '/hero-athlete.png';
}
