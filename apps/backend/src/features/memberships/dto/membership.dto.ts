import { IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { MembershipStatus } from '@atena/api-types';

export class UpdateMembershipStatusDto {
  @ApiProperty({
    enum: MembershipStatus,
    description: 'Числовой статус членства (1=ACTIVE, 2=PENDING, 3=EXPIRED, 4=REVOKED)',
    example: 1,
  })
  @IsInt()
  status: MembershipStatus;
}
