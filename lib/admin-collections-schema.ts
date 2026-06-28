/**
 * Shared schema for owner-managed admin collections.
 *
 * Pure data (no server imports) so it can drive both the server-side store /
 * API validation and the client-side admin UI. Each collection is persisted as
 * a JSON array in Vercel Blob (see lib/admin-collections.ts).
 */

export type FieldType =
  | 'text'
  | 'textarea'
  | 'select'
  | 'date'
  | 'number'
  | 'file'
  | 'athlete';

export type FieldDef = {
  key: string;
  label: string;
  type: FieldType;
  options?: string[];
  required?: boolean;
  placeholder?: string;
  /** Optional helper text shown under the field. */
  hint?: string;
};

export type CollectionId =
  | 'schools'
  | 'recruitment-tracker'
  | 'responses'
  | 'offers'
  | 'documents'
  | 'fee-agreements'
  | 'email-templates';

export type CollectionDef = {
  id: CollectionId;
  /** Sidebar / tab label. */
  label: string;
  /** Singular noun for buttons ("Add School"). */
  singular: string;
  /** Short description shown at the top of the tab. */
  description: string;
  /** Field used as the row title in the list. */
  titleField: string;
  /** Fields shown as the row subtitle (joined with dots). */
  subtitleFields: string[];
  /** Optional field used to color/label a status pill. */
  statusField?: string;
  fields: FieldDef[];
};

export type CollectionItem = {
  id: string;
  createdAt: string;
  updatedAt: string;
  [key: string]: unknown;
};

export const COLLECTIONS: Record<CollectionId, CollectionDef> = {
  schools: {
    id: 'schools',
    label: 'Schools',
    singular: 'School',
    description: 'Your directory of target schools and programs.',
    titleField: 'name',
    subtitleFields: ['division', 'conference', 'location'],
    statusField: 'interest',
    fields: [
      { key: 'name', label: 'School name', type: 'text', required: true, placeholder: 'e.g. University of Michigan' },
      { key: 'division', label: 'Division', type: 'select', options: ['NCAA D1', 'NCAA D2', 'NCAA D3', 'NAIA', 'NJCAA', 'U SPORTS', 'CCAA', 'Prep', 'Other'] },
      { key: 'conference', label: 'Conference', type: 'text', placeholder: 'e.g. Big Ten' },
      { key: 'location', label: 'Location', type: 'text', placeholder: 'City, State/Province' },
      { key: 'interest', label: 'Interest level', type: 'select', options: ['Target', 'Reach', 'Likely', 'Safety', 'Not a fit'] },
      { key: 'website', label: 'Website', type: 'text', placeholder: 'https://' },
      { key: 'notes', label: 'Notes', type: 'textarea' },
    ],
  },
  'recruitment-tracker': {
    id: 'recruitment-tracker',
    label: 'Recruitment Tracker',
    singular: 'Tracker Entry',
    description: 'Track where each athlete stands with each program.',
    titleField: 'athlete',
    subtitleFields: ['school', 'stage'],
    statusField: 'stage',
    fields: [
      { key: 'athlete', label: 'Athlete', type: 'athlete', required: true },
      { key: 'school', label: 'School', type: 'text', placeholder: 'Program name' },
      { key: 'stage', label: 'Stage', type: 'select', options: ['Identified', 'Contacted', 'Evaluating', 'Visit Scheduled', 'Offer', 'Committed', 'Closed'] },
      { key: 'nextStep', label: 'Next step', type: 'text', placeholder: 'e.g. Send full game film' },
      { key: 'owner', label: 'Owner', type: 'text', placeholder: 'Who is driving this' },
      { key: 'lastUpdate', label: 'Last update', type: 'date' },
      { key: 'notes', label: 'Notes', type: 'textarea' },
    ],
  },
  responses: {
    id: 'responses',
    label: 'Responses',
    singular: 'Response',
    description: 'Log coach and program responses as they come in.',
    titleField: 'school',
    subtitleFields: ['coach', 'athlete', 'responseType'],
    statusField: 'responseType',
    fields: [
      { key: 'school', label: 'School', type: 'text', required: true },
      { key: 'coach', label: 'Coach', type: 'text', placeholder: 'Coach name' },
      { key: 'athlete', label: 'Athlete', type: 'athlete' },
      { key: 'responseType', label: 'Response', type: 'select', options: ['Interested', 'Maybe', 'Follow Up', 'Not Interested', 'No Response'] },
      { key: 'date', label: 'Date', type: 'date' },
      { key: 'message', label: 'Message / detail', type: 'textarea' },
    ],
  },
  offers: {
    id: 'offers',
    label: 'Offers',
    singular: 'Offer',
    description: 'Scholarship, roster, and walk-on offers per athlete.',
    titleField: 'athlete',
    subtitleFields: ['school', 'type', 'amount'],
    statusField: 'status',
    fields: [
      { key: 'athlete', label: 'Athlete', type: 'athlete', required: true },
      { key: 'school', label: 'School', type: 'text', required: true },
      { key: 'type', label: 'Offer type', type: 'select', options: ['Athletic Scholarship', 'Academic Aid', 'Preferred Walk-On', 'Roster Spot', 'Partial', 'Other'] },
      { key: 'amount', label: 'Amount / value', type: 'text', placeholder: 'e.g. 75% or $20,000/yr' },
      { key: 'status', label: 'Status', type: 'select', options: ['Received', 'Under Review', 'Accepted', 'Declined', 'Expired'] },
      { key: 'date', label: 'Offer date', type: 'date' },
      { key: 'notes', label: 'Notes', type: 'textarea' },
    ],
  },
  documents: {
    id: 'documents',
    label: 'Documents',
    singular: 'Document',
    description: 'Upload and organize recruiting and eligibility documents.',
    titleField: 'name',
    subtitleFields: ['category', 'athlete'],
    statusField: 'category',
    fields: [
      { key: 'name', label: 'Document name', type: 'text', required: true, placeholder: 'e.g. Jayden Thompson — Transcript' },
      { key: 'category', label: 'Category', type: 'select', options: ['Recruiting Profile', 'Transcript', 'Eligibility', 'Fee Agreement', 'Highlight Film', 'Other'] },
      { key: 'athlete', label: 'Athlete', type: 'athlete' },
      { key: 'fileUrl', label: 'File', type: 'file' },
      { key: 'notes', label: 'Notes', type: 'textarea' },
    ],
  },
  'fee-agreements': {
    id: 'fee-agreements',
    label: 'Fee Agreements',
    singular: 'Fee Agreement',
    description: 'Track fee agreement status for each family.',
    titleField: 'athlete',
    subtitleFields: ['type', 'amount'],
    statusField: 'status',
    fields: [
      { key: 'athlete', label: 'Athlete / family', type: 'athlete', required: true },
      { key: 'type', label: 'Agreement type', type: 'select', options: ['Standard', 'International'] },
      { key: 'status', label: 'Status', type: 'select', options: ['Sent', 'Viewed', 'Signed', 'Active', 'Expired'] },
      { key: 'amount', label: 'Amount', type: 'text', placeholder: 'e.g. $1,500' },
      { key: 'sentDate', label: 'Sent date', type: 'date' },
      { key: 'signedDate', label: 'Signed date', type: 'date' },
      { key: 'fileUrl', label: 'Signed copy', type: 'file' },
      { key: 'notes', label: 'Notes', type: 'textarea' },
    ],
  },
  'email-templates': {
    id: 'email-templates',
    label: 'Email Templates',
    singular: 'Template',
    description: 'Reusable email templates for coaches and families.',
    titleField: 'name',
    subtitleFields: ['category', 'subject'],
    statusField: 'category',
    fields: [
      { key: 'name', label: 'Template name', type: 'text', required: true, placeholder: 'e.g. Coach intro — PG 2026' },
      { key: 'category', label: 'Category', type: 'select', options: ['Coach Outreach', 'Family', 'Follow Up', 'Welcome', 'Offer', 'Other'] },
      { key: 'subject', label: 'Subject line', type: 'text', placeholder: 'Email subject' },
      { key: 'body', label: 'Body', type: 'textarea', hint: 'You can use placeholders like {{athlete}}, {{school}}, {{coach}}.' },
    ],
  },
};

export const COLLECTION_IDS = Object.keys(COLLECTIONS) as CollectionId[];

export function isCollectionId(value: string): value is CollectionId {
  return Object.prototype.hasOwnProperty.call(COLLECTIONS, value);
}

export function getCollectionDef(id: string): CollectionDef | null {
  return isCollectionId(id) ? COLLECTIONS[id] : null;
}

/** Allowed field keys for a collection (used for server-side validation). */
export function allowedKeys(id: CollectionId): string[] {
  return COLLECTIONS[id].fields.map((field) => field.key);
}
