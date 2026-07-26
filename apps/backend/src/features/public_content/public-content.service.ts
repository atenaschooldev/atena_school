import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class PublicContentService {
  private supabaseAdmin: SupabaseClient;

  constructor(private configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL') || this.configService.get<string>('NEXT_PUBLIC_SUPABASE_URL') || process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const serviceKey = this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY') || process.env.SUPABASE_SERVICE_ROLE_KEY || '';
    this.supabaseAdmin = createClient(supabaseUrl, serviceKey);
  }

  async getSiteContent() {
    const { data: hero } = await this.supabaseAdmin.from('hero').select('*').maybeSingle();
    const { data: about } = await this.supabaseAdmin.from('about').select('*').maybeSingle();
    const { data: testimonials } = await this.supabaseAdmin.from('testimonials').select('*').eq('is_active', true);
    const { data: contact } = await this.supabaseAdmin.from('site_contact').select('*').maybeSingle();

    return { success: true, hero, about, testimonials: testimonials || [], contact };
  }

  async getPublicTeachers() {
    const { data } = await this.supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('role', 'teacher')
      .order('full_name');

    return { success: true, teachers: data || [] };
  }

  async getPublicBlogPosts() {
    const { data } = await this.supabaseAdmin
      .from('blog_posts')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    return { success: true, posts: data || [] };
  }

  async getPublicBlogPostBySlug(slug: string) {
    const { data } = await this.supabaseAdmin
      .from('blog_posts')
      .select('*')
      .eq('slug', slug)
      .maybeSingle();

    return { success: true, post: data };
  }
}
