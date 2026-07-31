export interface UserEntity {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  createdAt: Date;
}

export abstract class UsersRepository {
  abstract findAll(role?: string): Promise<UserEntity[]>;
  abstract findById(id: string): Promise<UserEntity | null>;
  abstract findByEmail(email: string): Promise<UserEntity | null>;
  abstract create(data: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role?: string;
    isActive?: boolean;
  }): Promise<UserEntity>;
  abstract update(
    id: string,
    data: Partial<{
      firstName: string;
      lastName: string;
      role: string;
      isActive: boolean;
    }>,
  ): Promise<UserEntity>;
  abstract delete(id: string): Promise<void>;
}
