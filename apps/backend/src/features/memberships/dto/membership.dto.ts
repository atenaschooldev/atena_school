import { IsIn, IsString } from 'class-validator';

export class UpdateMembershipStatusDto {
  @IsString()
  @IsIn(['active', 'revoked', 'expired'])
  status: string;
}
