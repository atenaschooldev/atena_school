export interface UserEntity {
  id: string;
  email: string;
  fullName: string;
  firstName?: string;
  lastName?: string;
  role: string;
  isActive: boolean;
  phone?: string | null;
  taxCode?: string | null;
  avatarUrl?: string | null;
  createdAt: Date;
  updatedAt?: Date;
}

export abstract class UsersRepository {
  abstract findAll(role?: string): Promise<UserEntity[]>;
  abstract findById(id: string): Promise<UserEntity | null>;
  abstract findByEmail(email: string): Promise<UserEntity | null>;
  abstract create(data: {
    id: string;
    email: string;
    fullName?: string;
    firstName?: string;
    lastName?: string;
    role?: string;
    isActive?: boolean;
  }): Promise<UserEntity>;
  abstract update(
    id: string,
    data: Partial<{
      fullName: string;
      firstName: string;
      lastName: string;
      role: string;
      isActive: boolean;
      phone: string;
      taxCode: string;
    }>,
  ): Promise<UserEntity>;
  abstract delete(id: string): Promise<void>;
}
