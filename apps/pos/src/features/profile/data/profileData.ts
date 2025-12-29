import { User, CurrentUser, UserPermission } from '../types';

// Default permissions for different roles
export const defaultPermissions: Record<string, UserPermission> = {
  admin: {
    dashboard: true,
    reports: true,
    inventory: true,
    orders: true,
    customers: true,
    settings: true,
  },
  manager: {
    dashboard: true,
    reports: true,
    inventory: true,
    orders: true,
    customers: true,
    settings: false,
  },
  cashier: {
    dashboard: true,
    reports: false,
    inventory: false,
    orders: true,
    customers: true,
    settings: false,
  },
};

// Current logged-in user
export const currentUser: CurrentUser = {
  id: 'user-1',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@deepos.com',
  role: 'admin',
  avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
  address: '123 Restaurant Street, Food City, FC 12345',
  permissions: defaultPermissions.admin,
  createdAt: new Date().toISOString(),
  lastLogin: new Date().toISOString(),
};

// Mock users for manage access
export const mockUsers: User[] = [
  {
    id: 'user-1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@deepos.com',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    address: '123 Restaurant Street, Food City, FC 12345',
    permissions: defaultPermissions.admin,
    createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
    lastLogin: new Date().toISOString(),
  },
  {
    id: 'user-2',
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane.smith@deepos.com',
    role: 'manager',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150',
    permissions: defaultPermissions.manager,
    createdAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
    lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'user-3',
    firstName: 'Mike',
    lastName: 'Johnson',
    email: 'mike.johnson@deepos.com',
    role: 'manager',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    permissions: {
      ...defaultPermissions.manager,
      reports: false, // Custom permission
    },
    createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    lastLogin: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'user-4',
    firstName: 'Sarah',
    lastName: 'Wilson',
    email: 'sarah.wilson@deepos.com',
    role: 'cashier',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
    permissions: defaultPermissions.cashier,
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    lastLogin: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'user-5',
    firstName: 'David',
    lastName: 'Brown',
    email: 'david.brown@deepos.com',
    role: 'cashier',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    permissions: {
      ...defaultPermissions.cashier,
      inventory: true, // Custom permission
    },
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    lastLogin: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  },
];

// Helper functions
export const getRoleBadgeColor = (role: string) => {
  switch (role) {
    case 'admin':
      return 'bg-red-100 text-red-800';
    case 'manager':
      return 'bg-blue-100 text-blue-800';
    case 'cashier':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const getRoleLabel = (role: string) => {
  switch (role) {
    case 'admin':
      return 'Administrator';
    case 'manager':
      return 'Manager';
    case 'cashier':
      return 'Cashier';
    default:
      return role;
  }
};

export const getPermissionLabel = (permission: string) => {
  switch (permission) {
    case 'dashboard':
      return 'Dashboard';
    case 'reports':
      return 'Reports';
    case 'inventory':
      return 'Inventory';
    case 'orders':
      return 'Orders';
    case 'customers':
      return 'Customers';
    case 'settings':
      return 'Settings';
    default:
      return permission;
  }
};

export const formatLastLogin = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;
  
  return date.toLocaleDateString();
};