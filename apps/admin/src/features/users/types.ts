export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

export interface UserFormValues {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  password?: string;
}
