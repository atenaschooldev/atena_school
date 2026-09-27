export interface User {
  id: string;
  email: string;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  role: string | number;
  isActive?: boolean;
  phone?: string | null;
  taxCode?: string | null;
  avatarUrl?: string | null;
  createdAt: string;
  created_at?: string;
}

export interface UserFormValues {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  password?: string;
}
