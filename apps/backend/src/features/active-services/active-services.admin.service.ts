import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { QueryActiveServicesDto } from './dto/active-services.admin.dto';

@Injectable()
export class ActiveServicesAdminService {
  private readonly logger = new Logger(ActiveServicesAdminService.name);
  private supabaseAdmin: SupabaseClient;

  constructor(private configService: ConfigService) {
    const supabaseUrl =
      this.configService.get<string>('SUPABASE_URL') ||
      this.configService.get<string>('NEXT_PUBLIC_SUPABASE_URL') ||
      process.env.SUPABASE_URL ||
      process.env.NEXT_PUBLIC_SUPABASE_URL ||
      '';
    const serviceKey =
      this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY') ||
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      '';
    this.supabaseAdmin = createClient(supabaseUrl, serviceKey);
  }

  async getActiveServices(dto: QueryActiveServicesDto) {
    try {
      let query = this.supabaseAdmin
        .from('active_services')
        .select('*', { count: 'exact' });

      // 1. Text search across student name, email, tax code, course name
      if (dto.search && dto.search.trim()) {
        const q = dto.search.trim();
        query = query.or(
          `student_name.ilike.%${q}%,student_email.ilike.%${q}%,student_tax_code.ilike.%${q}%,purchaser_name.ilike.%${q}%,purchaser_email.ilike.%${q}%,course_name.ilike.%${q}%`
        );
      }

      // 2. Course ID filter
      if (dto.courseId) {
        query = query.eq('course_id', dto.courseId);
      }

      // 3. Category filter
      if (dto.category && dto.category !== 'all') {
        query = query.eq('course_category', dto.category);
      }

      // 4. Billing Scheme filter
      if (dto.billingScheme != null) {
        query = query.eq('billing_scheme', dto.billingScheme);
      }

      // 5. Student Annual Fee Paid filter
      if (dto.studentAnnualFeePaid !== undefined) {
        query = query.eq('student_annual_fee_paid', dto.studentAnnualFeePaid);
      }

      // Ordering
      query = query.order('created_at', { ascending: false });

      // Pagination
      const limit = dto.limit || 100;
      const offset = dto.offset || 0;
      query = query.range(offset, offset + limit - 1);

      const { data, count, error } = await query;

      if (error) {
        this.logger.error('Failed to query active_services view:', error);
        throw new BadRequestException(`Failed to retrieve active services: ${error.message}`);
      }

      // Also calculate aggregate metrics for top KPI cards
      const { data: allMetrics, error: metricsErr } = await this.supabaseAdmin
        .from('active_services')
        .select('billing_scheme, student_annual_fee_paid, completed_lessons_count, total_lessons_count, remaining_lessons_count');

      let totalActive = 0;
      let activeSubscriptions = 0;
      let totalCompletedLessons = 0;
      let totalRemainingLessons = 0;
      let unpaidAnnualFeeCount = 0;

      if (!metricsErr && allMetrics) {
        totalActive = allMetrics.length;
        for (const item of allMetrics) {
          if (item.billing_scheme === 2) {
            activeSubscriptions++;
          }
          if (item.student_annual_fee_paid === false) {
            unpaidAnnualFeeCount++;
          }
          totalCompletedLessons += Number(item.completed_lessons_count || 0);
          totalRemainingLessons += Number(item.remaining_lessons_count || 0);
        }
      }

      return {
        items: data || [],
        total: count ?? (data?.length || 0),
        stats: {
          totalActive,
          activeSubscriptions,
          totalCompletedLessons,
          totalRemainingLessons,
          unpaidAnnualFeeCount,
        },
      };
    } catch (err: any) {
      this.logger.error('Active services retrieval error:', err);
      throw new BadRequestException(err.message || 'Failed to retrieve active services');
    }
  }
}
