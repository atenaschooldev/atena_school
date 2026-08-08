import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateStudentRequestDto {
  @IsOptional()
  @IsString()
  fullName?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  taxCode?: string;

  @IsOptional()
  @IsString()
  birthDate?: string;

  @IsOptional()
  @IsBoolean()
  annualFeePaid?: boolean;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  sdiCode?: string;

  @IsOptional()
  @IsString()
  pecEmail?: string;
}
