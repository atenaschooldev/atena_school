import type { SupabaseClient } from '@supabase/supabase-js';
import { ContactMessageStatus } from '@atena/api-types';
import { ContactFormParams } from '../types';
import { sendContactFormNotificationEmail } from '../notifications/notification.service';

export async function submitContactWorkflow(
  supabase: SupabaseClient,
  dto: ContactFormParams,
  options?: { adminEmail?: string }
): Promise<{ success: boolean; message: string }> {
  const firstName = (dto.nome || (dto.name ? dto.name.split(' ')[0] : '') || '').trim();
  const lastName = (dto.cognome || (dto.name ? dto.name.split(' ').slice(1).join(' ') : '') || '').trim();
  const email = (dto.email || '').trim().toLowerCase();
  const phone = (dto.telefono || dto.phone || '').trim() || null;
  const interest = (dto.interesse || dto.interest || dto.courseInterest || '').trim() || null;
  const message = (dto.messaggio || dto.message || '').trim();

  const { error } = await supabase.from('contact_messages').insert({
    first_name: firstName,
    last_name: lastName,
    email: email,
    phone: phone,
    interest: interest,
    message: message,
    status: ContactMessageStatus.NEW,
    custom_fields: dto.custom_fields || {},
    form_id: dto.form_id || null,
  });

  if (error) {
    console.error('Contact message insert error:', error.message);
    throw new Error(`Failed to submit message: ${error.message}`);
  }

  // Asynchronously send notification email to school admin
  sendContactFormNotificationEmail({
    supabase,
    data: {
      firstName,
      lastName,
      email,
      phone: phone || undefined,
      interest: interest || undefined,
      topic: interest || 'Richiesta Contatto',
      message,
    },
    config: { adminEmail: options?.adminEmail },
  }).catch((err) => console.warn('Async contact email notification error:', err));

  return { success: true, message: 'Message sent successfully' };
}
