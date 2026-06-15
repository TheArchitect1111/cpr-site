'use server';

import { revalidatePath } from 'next/cache';
import { updateTicket, createMessage } from '@/lib/sections-data';

export async function serverUpdateTicket(formData: FormData) {
  const id = (formData.get('id') as string) ?? '';
  const status = (formData.get('status') as string) ?? '';
  const adminNotes = (formData.get('adminNotes') as string) ?? '';

  if (!id) return;

  const fields: { status?: string; adminNotes?: string; dateResolved?: string } = {};
  if (status) fields.status = status;
  if (adminNotes !== undefined) fields.adminNotes = adminNotes;
  if (status === 'Resolved' || status === 'Closed') {
    fields.dateResolved = new Date().toISOString().slice(0, 10);
  }

  await updateTicket(id, fields);
  revalidatePath('/admin');
}

export async function serverSendAdminMessage(formData: FormData) {
  const slug = (formData.get('slug') as string) ?? '';
  const messageBody = ((formData.get('messageBody') as string) ?? '').trim();

  if (!slug || !messageBody) return;

  await createMessage({ athleteSlug: slug, sender: 'Coach Mike', messageBody });
  revalidatePath('/admin');
}
