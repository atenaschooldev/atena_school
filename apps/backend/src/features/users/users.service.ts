import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { UsersRepository, UserEntity } from './domain/users.repository.interface';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);
  private supabaseAdmin: SupabaseClient;

  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly configService: ConfigService,
  ) {
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

  async findAll(role?: string): Promise<UserEntity[]> {
    return this.usersRepository.findAll(role);
  }

  async findOne(id: string): Promise<UserEntity> {
    const user = await this.usersRepository.findById(id);
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return user;
  }

  async create(dto: CreateUserDto): Promise<UserEntity> {
    const userEmail = (dto.email || (dto as any).email || '').trim();
    if (!userEmail) {
      throw new ConflictException(`Email is required`);
    }

    const existing = await this.usersRepository.findByEmail(userEmail);
    if (existing) {
      throw new ConflictException(`User with email ${userEmail} already exists`);
    }

    let userId: string;

    // Check if user exists in Supabase Auth or create one
    const { data: authUsers } = await this.supabaseAdmin.auth.admin.listUsers();
    const foundAuth = authUsers?.users?.find(
      (u) => u.email?.toLowerCase() === userEmail.toLowerCase(),
    );

    if (foundAuth) {
      userId = foundAuth.id;
    } else {
      const password = dto.password || Math.random().toString(36).slice(-10) + 'A1!';
      const { data: createdAuth, error: authError } =
        await this.supabaseAdmin.auth.admin.createUser({
          email: dto.email,
          password,
          email_confirm: true,
          user_metadata: {
            first_name: dto.firstName,
            last_name: dto.lastName,
          },
        });

      if (authError || !createdAuth.user) {
        this.logger.error(`Supabase auth user creation error: ${authError?.message}`);
        // Fallback to generating UUID if auth admin fails
        userId = crypto.randomUUID();
      } else {
        userId = createdAuth.user.id;
      }
    }

    return this.usersRepository.create({
      id: userId,
      email: dto.email,
      firstName: dto.firstName,
      lastName: dto.lastName,
      role: dto.role ?? 'student',
    });
  }

  async update(id: string, dto: UpdateUserDto): Promise<UserEntity> {
    await this.findOne(id);
    return this.usersRepository.update(id, dto);
  }

  async remove(id: string): Promise<{ success: boolean }> {
    await this.findOne(id);
    await this.usersRepository.delete(id);
    try {
      await this.supabaseAdmin.auth.admin.deleteUser(id);
    } catch (e) {
      this.logger.warn(`Could not delete auth user ${id}: ${e}`);
    }
    return { success: true };
  }
}
