import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service';

export interface GlobalSearchResult {
  id: string;
  type:
    | 'payment'
    | 'student'
    | 'booking'
    | 'group'
    | 'course'
    | 'teacher'
    | 'membership'
    | 'user'
    | 'document'
    | 'promo';
  title: string;
  subtitle?: string;
  url: string;
  badge?: string;
  matchedField?: string;
  matchedValue?: string;
}

function isUUID(str: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
}

function isNumeric(str: string): boolean {
  return /^\d+$/.test(str);
}

@Injectable()
export class SearchService {
  constructor(private readonly prisma: PrismaService) {}

  async globalSearch(query: string): Promise<GlobalSearchResult[]> {
    const q = (query || '').trim();
    if (!q || q.length < 2) return [];

    const isUuid = isUUID(q);
    const isNum = isNumeric(q);
    const bigId = isNum ? BigInt(q) : undefined;

    const results: GlobalSearchResult[] = [];

    // 1. Search Payments & Stripe IDs
    try {
      const paymentWhere: any = {
        OR: [
          { providerTransactionId: { contains: q, mode: 'insensitive' } },
          { notes: { contains: q, mode: 'insensitive' } },
        ],
      };
      if (isUuid) {
        paymentWhere.OR.push({ id: q });
        paymentWhere.OR.push({ bookingId: q });
        paymentWhere.OR.push({ studentId: q });
      }

      const payments = await this.prisma.payment.findMany({
        where: paymentWhere,
        include: {
          booking: {
            select: {
              purchaserName: true,
              purchaserEmail: true,
              studentName: true,
              courseName: true,
            },
          },
          student: {
            select: { full_name: true, tax_code: true, email: true },
          },
        },
        take: 6,
        orderBy: { createdAt: 'desc' },
      });

      for (const p of payments) {
        const clientName =
          p.student?.full_name ||
          p.booking?.studentName ||
          p.booking?.purchaserName ||
          'Cliente';
        const stripeId = p.providerTransactionId;
        const amountStr = `€${Number(p.amount).toFixed(2)}`;

        results.push({
          id: p.id,
          type: 'payment',
          title: `${amountStr} • ${clientName}`,
          subtitle: stripeId
            ? `Stripe: ${stripeId} • ${p.booking?.courseName || 'Pagamento'}`
            : `ID: ${p.id.slice(0, 8)}... • ${p.booking?.courseName || 'Pagamento'}`,
          url: `/pagamenti?highlight=${p.id}&search=${encodeURIComponent(stripeId || p.id)}`,
          badge: stripeId?.startsWith('pi_') ? 'Stripe PI' : 'Pagamento',
          matchedField: stripeId?.toLowerCase().includes(q.toLowerCase())
            ? 'Stripe ID'
            : 'Pagamento ID',
          matchedValue: stripeId || p.id,
        });
      }
    } catch {
      // Ignore
    }

    // 2. Search Students (Full name, Email, Phone, Tax Code, UUID)
    try {
      const studentWhere: any = {
        OR: [
          { full_name: { contains: q, mode: 'insensitive' } },
          { first_name: { contains: q, mode: 'insensitive' } },
          { last_name: { contains: q, mode: 'insensitive' } },
          { email: { contains: q, mode: 'insensitive' } },
          { phone: { contains: q, mode: 'insensitive' } },
          { tax_code: { contains: q, mode: 'insensitive' } },
        ],
      };
      if (isUuid) {
        studentWhere.OR.push({ id: q });
      }

      const students = await this.prisma.students.findMany({
        where: studentWhere,
        take: 6,
        orderBy: { created_at: 'desc' },
      });

      for (const s of students) {
        const name =
          s.full_name || `${s.first_name || ''} ${s.last_name || ''}`.trim() || 'Studente';
        const sub = [s.tax_code, s.email, s.phone].filter(Boolean).join(' • ');

        results.push({
          id: s.id,
          type: 'student',
          title: name,
          subtitle: sub || `ID: ${s.id.slice(0, 8)}...`,
          url: `/studenti?highlight=${s.id}&search=${encodeURIComponent(s.tax_code || name)}`,
          badge: s.annual_fee_paid ? 'Quota Saldata' : 'Studente',
          matchedField: s.tax_code?.toLowerCase().includes(q.toLowerCase())
            ? 'Codice Fiscale'
            : s.email?.toLowerCase().includes(q.toLowerCase())
            ? 'Email'
            : 'Nome',
          matchedValue: s.tax_code || s.email || name,
        });
      }
    } catch {
      // Ignore
    }

    // 3. Search Bookings (Purchaser / Student details, Course, Session ID)
    try {
      const bookingWhere: any = {
        OR: [
          { studentName: { contains: q, mode: 'insensitive' } },
          { purchaserName: { contains: q, mode: 'insensitive' } },
          { studentEmail: { contains: q, mode: 'insensitive' } },
          { purchaserEmail: { contains: q, mode: 'insensitive' } },
          { studentTaxCode: { contains: q, mode: 'insensitive' } },
          { purchaserTaxCode: { contains: q, mode: 'insensitive' } },
          { purchaserPhone: { contains: q, mode: 'insensitive' } },
          { studentPhone: { contains: q, mode: 'insensitive' } },
          { courseName: { contains: q, mode: 'insensitive' } },
          { sessionId: { contains: q, mode: 'insensitive' } },
        ],
      };
      if (isUuid) {
        bookingWhere.OR.push({ id: q });
      }

      const bookings = await this.prisma.booking.findMany({
        where: bookingWhere,
        take: 6,
        orderBy: { createdAt: 'desc' },
      });

      for (const b of bookings) {
        const amount = `€${Number(b.amountPaid || 0).toFixed(2)}`;
        const name = b.studentName || b.purchaserName || 'Prenotazione';
        const sub = [b.courseName, b.purchaserEmail, b.purchaserTaxCode]
          .filter(Boolean)
          .join(' • ');

        results.push({
          id: b.id,
          type: 'booking',
          title: `${name} — ${b.courseName || 'Corso'} (${amount})`,
          subtitle: sub || `ID: ${b.id.slice(0, 8)}...`,
          url: `/prenotazioni?highlight=${b.id}&search=${encodeURIComponent(b.studentName || b.purchaserName || b.id)}`,
          badge: 'Prenotazione',
          matchedField: b.purchaserTaxCode?.toLowerCase().includes(q.toLowerCase())
            ? 'CF Acquirente'
            : b.sessionId?.toLowerCase().includes(q.toLowerCase())
            ? 'Stripe Session'
            : 'Prenotazione',
          matchedValue: b.purchaserTaxCode || b.sessionId || b.id,
        });
      }
    } catch {
      // Ignore
    }

    // 4. Search Groups (Name, Room, Course, Teacher)
    try {
      const groupWhere: any = {
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { room: { contains: q, mode: 'insensitive' } },
          { course: { name: { contains: q, mode: 'insensitive' } } },
          { teacher: { fullName: { contains: q, mode: 'insensitive' } } },
        ],
      };
      if (bigId !== undefined) {
        groupWhere.OR.push({ id: bigId });
      }

      const groups = await this.prisma.group.findMany({
        where: groupWhere,
        include: {
          course: { select: { name: true } },
          teacher: { select: { fullName: true } },
        },
        take: 5,
        orderBy: { createdAt: 'desc' },
      });

      for (const g of groups) {
        const idStr = g.id.toString();
        const sub = [
          g.course?.name,
          g.teacher?.fullName ? `Docente: ${g.teacher.fullName}` : null,
          g.room ? `Aula: ${g.room}` : null,
        ]
          .filter(Boolean)
          .join(' • ');

        results.push({
          id: idStr,
          type: 'group',
          title: g.name,
          subtitle: sub,
          url: `/gruppi?highlight=${idStr}&search=${encodeURIComponent(g.name)}`,
          badge: g.room || 'Gruppo',
          matchedField: 'Gruppo',
          matchedValue: g.name,
        });
      }
    } catch {
      // Ignore
    }

    // 5. Search Courses
    try {
      const courseWhere: any = {
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { slug: { contains: q, mode: 'insensitive' } },
          { description: { contains: q, mode: 'insensitive' } },
        ],
      };
      if (bigId !== undefined) {
        courseWhere.OR.push({ id: bigId });
      }

      const courses = await this.prisma.course.findMany({
        where: courseWhere,
        take: 5,
        orderBy: { createdAt: 'desc' },
      });

      for (const c of courses) {
        const idStr = c.id.toString();
        const priceStr = c.price ? `€${Number(c.price).toFixed(2)}` : '';

        results.push({
          id: idStr,
          type: 'course',
          title: c.name,
          subtitle: [priceStr, c.slug].filter(Boolean).join(' • '),
          url: `/corsi?highlight=${idStr}&search=${encodeURIComponent(c.name)}`,
          badge: 'Corso',
          matchedField: 'Corso',
          matchedValue: c.name,
        });
      }
    } catch {
      // Ignore
    }

    // 6. Search Teachers
    try {
      const teacherWhere: any = {
        OR: [
          { fullName: { contains: q, mode: 'insensitive' } },
          { experience: { contains: q, mode: 'insensitive' } },
          { users: { email: { contains: q, mode: 'insensitive' } } },
          { users: { phone: { contains: q, mode: 'insensitive' } } },
          { users: { taxCode: { contains: q, mode: 'insensitive' } } },
        ],
      };
      if (bigId !== undefined) {
        teacherWhere.OR.push({ id: bigId });
      }

      const teachers = await this.prisma.teacher.findMany({
        where: teacherWhere,
        include: { users: { select: { email: true, phone: true } } },
        take: 5,
      });

      for (const t of teachers) {
        const idStr = t.id.toString();
        results.push({
          id: idStr,
          type: 'teacher',
          title: t.fullName || 'Docente',
          subtitle: [t.users?.email, t.users?.phone, t.experience]
            .filter(Boolean)
            .join(' • '),
          url: `/insegnanti?highlight=${idStr}&search=${encodeURIComponent(t.fullName || '')}`,
          badge: 'Docente',
          matchedField: 'Docente',
          matchedValue: t.fullName || idStr,
        });
      }
    } catch {
      // Ignore
    }

    // 7. Search Users (Auth & Staff)
    try {
      const userWhere: any = {
        OR: [
          { fullName: { contains: q, mode: 'insensitive' } },
          { email: { contains: q, mode: 'insensitive' } },
          { phone: { contains: q, mode: 'insensitive' } },
          { taxCode: { contains: q, mode: 'insensitive' } },
        ],
      };
      if (isUuid) {
        userWhere.OR.push({ id: q });
      }

      const users = await this.prisma.user.findMany({
        where: userWhere,
        take: 5,
      });

      for (const u of users) {
        results.push({
          id: u.id,
          type: 'user',
          title: u.fullName || u.email,
          subtitle: [u.email, u.phone, u.taxCode].filter(Boolean).join(' • '),
          url: `/users?highlight=${u.id}&search=${encodeURIComponent(u.email || u.fullName)}`,
          badge: 'Utente',
          matchedField: 'Utente',
          matchedValue: u.email,
        });
      }
    } catch {
      // Ignore
    }

    // 8. Search Documents
    try {
      const docWhere: any = {
        OR: [
          { document_number: { contains: q, mode: 'insensitive' } },
          { student_name: { contains: q, mode: 'insensitive' } },
          { student_email: { contains: q, mode: 'insensitive' } },
          { parent_name: { contains: q, mode: 'insensitive' } },
        ],
      };
      if (isUuid) {
        docWhere.OR.push({ id: q });
      }

      const docs = await this.prisma.documents.findMany({
        where: docWhere,
        take: 5,
      });

      for (const d of docs) {
        results.push({
          id: d.id,
          type: 'document',
          title: `Doc: ${d.document_number} — ${d.student_name}`,
          subtitle: [d.student_email, d.parent_name].filter(Boolean).join(' • '),
          url: `/documenti?highlight=${d.id}&search=${encodeURIComponent(d.document_number || d.student_name)}`,
          badge: 'PDF / Doc',
          matchedField: 'Documento',
          matchedValue: d.document_number,
        });
      }
    } catch {
      // Ignore
    }

    return results;
  }
}
