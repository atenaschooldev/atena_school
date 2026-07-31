import { Injectable, NotFoundException } from '@nestjs/common';
import { MembershipsRepository } from './domain/memberships.repository.interface';

@Injectable()
export class MembershipsService {
  constructor(private readonly membershipsRepository: MembershipsRepository) {}

  findAll(status?: string, academicYear?: string) {
    return this.membershipsRepository.findAll({ status, academicYear });
  }

  async findOne(id: string) {
    const membership = await this.membershipsRepository.findById(id);
    if (!membership) throw new NotFoundException(`Membership ${id} not found`);
    return membership;
  }

  async updateStatus(id: string, status: string) {
    await this.findOne(id);
    return this.membershipsRepository.updateStatus(id, status);
  }
}
