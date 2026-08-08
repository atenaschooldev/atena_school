import { IsOptional, IsString } from 'class-validator';

export class CreateTeacherDto {
  @IsString()
  fullName: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  photoUrl?: string;

  @IsOptional()
  @IsString()
  experience?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  telefono?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateTeacherDto extends CreateTeacherDto {}
