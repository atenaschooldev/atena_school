import { UserEntity } from './user.entity';

export abstract class UsersRepository {
  abstract findById(id: string): Promise<UserEntity | null>;
  abstract findByEmail(email: string): Promise<UserEntity | null>;
  abstract create(data: {
    id: string;
    email: string;
    fullName?: string;
    firstName?: string;
    lastName?: string;
    role: string;
  }): Promise<UserEntity>;
  abstract update(id: string, data: Partial<UserEntity>): Promise<UserEntity>;
}
