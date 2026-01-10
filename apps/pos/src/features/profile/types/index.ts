export interface UserPermission {
  dashboard: boolean;
  reports: boolean;
  inventory: boolean;
  orders: boolean;
  customers: boolean;
  settings: boolean;
}

export type UserRole = 'owner' | 'admin' | 'manager' | 'cashier' | 'kitchen';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  avatar?: string;
  address?: string;
  permissions: UserPermission;
  createdAt: string;
  lastLogin?: string;
}

export interface CurrentUser extends User {
  // Additional fields for current user profile
}

export interface ProfileFormData {
  firstName: string;
  lastName: string;
  email: string;
  address: string;
  newPassword?: string;
  confirmPassword?: string;
}

export interface NewUserFormData {
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  password: string;
  confirmPassword: string;
}

export type ProfileView = 'profile' | 'access' | 'logout';