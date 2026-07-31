export class CreateUserDto {
  email: string;
  firstName: string;
  lastName: string;
  role?: string;
  password?: string;
}

export class UpdateUserDto {
  firstName?: string;
  lastName?: string;
  role?: string;
  isActive?: boolean;
}
