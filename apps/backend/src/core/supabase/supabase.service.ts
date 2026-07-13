import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService implements OnModuleInit {
  private client: SupabaseClient | null = null;

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    const url = this.configService.get<string>('SUPABASE_URL');
    const key = this.configService.get<string>('SUPABASE_KEY') || this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY');

    if (url && key) {
      this.client = createClient(url, key, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      });
      console.log('[SUPABASE]: Клиент успешно инициализирован.');
    } else {
      console.warn('[SUPABASE WARNING]: Переменные окружения SUPABASE_URL и SUPABASE_KEY не заданы. Клиент работает в MOCK-режиме.');
    }
  }

  get clientInstance(): SupabaseClient {
    if (!this.client) {
      throw new Error('Supabase client is not initialized because credentials were not provided.');
    }
    return this.client;
  }

  get isInitialized(): boolean {
    return this.client !== null;
  }
}
