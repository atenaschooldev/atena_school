import { getSupabaseAdmin } from '../supabase-admin';
import { ContactFormParams } from './types';
import { ContactMessageStatus } from '@atena/api-types';

export async function submitContact(dto: ContactFormParams) {
  const supabase = getSupabaseAdmin();
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
  });

  if (error) {
    console.error('Contact message insert error:', error.message);
    throw new Error(`Failed to submit message: ${error.message}`);
  }

  // Asynchronously send notification email to school admin
  import('../email-service').then(({ sendContactFormNotificationEmail }) => {
    sendContactFormNotificationEmail({
      firstName,
      lastName,
      email,
      phone: phone || undefined,
      interest: interest || undefined,
      message,
    }).catch((err) => console.warn('Async contact email notification error:', err));
  });

  return { success: true, message: 'Message sent successfully' };
}
