export interface UserPermission {
  dashboard: boolean;
  reports: boolean;
  inventory: boolean;
  orders: boolean;
  customers: boolean;
  settings: boolean;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'admin' | 'manager' | 'cashier';
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
  role: 'admin' | 'manager' | 'cashier';
  password: string;
  confirmPassword: string;
}

export type ProfileView = 'profile' | 'access' | 'logout';