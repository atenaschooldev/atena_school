import { IsString } from 'class-validator';

export class UpdateProfileDto {
  @IsString()
  profileName: string;

  @IsString()
  profilePhone: string;
}
