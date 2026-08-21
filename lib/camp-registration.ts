import { createItem, listCollection, updateItem } from '@/lib/admin-collections';
import type { CollectionItem } from '@/lib/admin-collections-schema';
import { emailPage, sendEmail } from '@/lib/email';

export type CampRegistrationInput = {
  camperName: string;
  parentGuardianName: string;
  email: string;
  phone: string;
  gradYear?: number;
  emergencyContactName: string;
  emergencyContactPhone: string;
  notes?: string;
  waiverAccepted: boolean;
};

export type PublicCamp = CollectionItem & {
  name: string;
  status: string;
  startDate: string;
  location: string;
  price?: string;
  capacity?: string;
  registeredCount?: string;
  paymentUrl?: string;
  waiverText?: string;
};

function clean(value: unknown, max = 500) {
  return String(value ?? '').trim().slice(0, max);
}

export function campPriceCents(price: unknown) {
  const match = String(price ?? '').replace(/,/g, '').match(/(\d+(?:\.\d{1,2})?)/);
  if (!match) return 0;
  const amount = Number(match[1]);
  return Number.isFinite(amount) && amount > 0 ? Math.round(amount * 100) : 0;
}

function escapeHtml(value: unknown) {
  return clean(value, 2000).replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;',
  })[character] || character);
}

function emailIsValid(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function findPublicCamp(id: string): Promise<PublicCamp | null> {
  const camps = await listCollection('camps');
  const camp = camps.find((item) => item.id === id && item.status === 'Published');
  return camp ? camp as PublicCamp : null;
}

export async function campRegistrationCount(campId: string): Promise<number> {
  const registrations = await listCollection('camp-registrations');
  return registrations.filter((item) => item.campId === campId && item.checkInStatus !== 'Cancelled').length;
}

export function campIsFull(camp: PublicCamp, count: number) {
  const capacity = Number(camp.capacity || 0);
  return capacity > 0 && count >= capacity;
}

export function validateCampRegistration(input: CampRegistrationInput): string[] {
  const errors: string[] = [];
  if (!clean(input.camperName)) errors.push('Camper name is required.');
  if (!clean(input.parentGuardianName)) errors.push('Parent or guardian name is required.');
  if (!emailIsValid(clean(input.email))) errors.push('Enter a valid email address.');
  if (!clean(input.phone)) errors.push('Phone number is required.');
  if (!clean(input.emergencyContactName)) errors.push('Emergency contact name is required.');
  if (!clean(input.emergencyContactPhone)) errors.push('Emergency contact phone is required.');
  if (!input.waiverAccepted) errors.push('The waiver acknowledgment is required.');
  return errors;
}

export async function registerForCamp(campId: string, input: CampRegistrationInput) {
  const errors = validateCampRegistration(input);
  if (errors.length) throw new Error(errors[0]);

  const camp = await findPublicCamp(campId);
  if (!camp) throw new Error('This camp is not currently accepting registrations.');

  const currentCount = await campRegistrationCount(campId);
  if (campIsFull(camp, currentCount)) throw new Error('This camp is full.');

  const email = clean(input.email).toLowerCase();
  const existing = (await listCollection('camp-registrations')).find((item) =>
    item.campId === campId
      && String(item.email || '').toLowerCase() === email
      && String(item.camperName || '').toLowerCase() === clean(input.camperName).toLowerCase()
      && item.checkInStatus !== 'Cancelled',
  );
  if (existing) throw new Error('This camper is already registered for this camp.');

  const acceptedAt = new Date().toISOString();
  const registration = await createItem('camp-registrations', {
    campId,
    campName: camp.name,
    camperName: clean(input.camperName),
    parentGuardianName: clean(input.parentGuardianName),
    email,
    phone: clean(input.phone),
    gradYear: input.gradYear ? String(input.gradYear) : '',
    emergencyContactName: clean(input.emergencyContactName),
    emergencyContactPhone: clean(input.emergencyContactPhone),
    paymentStatus: camp.paymentUrl ? 'Pending' : 'Pending',
    waiverStatus: 'Signed',
    waiverAcceptedAt: acceptedAt,
    checkInStatus: 'Registered',
    registrationDate: acceptedAt.slice(0, 10),
    notes: clean(input.notes, 2000),
  });

  const nextCount = currentCount + 1;
  await updateItem('camps', camp.id, { registeredCount: String(nextCount) });

  const dateAndPlace = [camp.startDate, camp.location].filter(Boolean).join(' · ');
  const confirmation = sendEmail({
    to: email,
    subject: `Registration confirmed — ${camp.name}`,
    html: emailPage('Your camp registration is confirmed', `<p><strong>${escapeHtml(input.camperName)}</strong> is registered for <strong>${escapeHtml(camp.name)}</strong>.</p><p>${escapeHtml(dateAndPlace)}</p>${camp.paymentUrl ? '<p>Your registration is recorded. Complete payment using the link shown after registration.</p>' : ''}`),
    text: `${clean(input.camperName)} is registered for ${camp.name}. ${dateAndPlace}`,
    idempotencyKey: `camp-family-${registration.id}`,
  });
  const adminEmail = process.env.ADMIN_EMAIL?.trim();
  const adminNotice = adminEmail ? sendEmail({
    to: adminEmail,
    subject: `New camp registration — ${camp.name}`,
    html: emailPage('New camp registration', `<p><strong>${escapeHtml(input.camperName)}</strong> was registered by ${escapeHtml(input.parentGuardianName)}.</p><p>${escapeHtml(email)} · ${escapeHtml(input.phone)}</p><p>${escapeHtml(dateAndPlace)}</p>`),
    text: `${clean(input.camperName)} registered for ${camp.name}. Parent/guardian: ${clean(input.parentGuardianName)}. ${email}`,
    idempotencyKey: `camp-admin-${registration.id}`,
  }) : Promise.resolve();
  const emailResults = await Promise.allSettled([confirmation, adminNotice]);

  return {
    registration,
    camp,
    registeredCount: nextCount,
    paymentUrl: clean(camp.paymentUrl) || null,
    confirmationSent: emailResults[0].status === 'fulfilled',
  };
}
