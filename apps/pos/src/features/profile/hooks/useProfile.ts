import { useState, useEffect } from 'react';
import { User, CurrentUser, ProfileFormData, NewUserFormData, ProfileView } from '../types';
import { mockUsers, defaultPermissions } from '../data/profileData';
import { auth } from '@/lib/api';

export function useProfile() {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [currentUserData, setCurrentUserData] = useState<CurrentUser | null>(null);
  const [activeView, setActiveView] = useState<ProfileView>('profile');
  const [isLoading, setIsLoading] = useState(true);

  // Load current user from localStorage on mount
  useEffect(() => {
    const loadUser = () => {
      const storedUser = auth.getUser();
      
      if (storedUser) {
        // Map API user to CurrentUser format
        const nameParts = storedUser.username.split('_');
        const firstName = nameParts[0] ? nameParts[0].charAt(0).toUpperCase() + nameParts[0].slice(1) : 'User';
        const lastName = nameParts.slice(1).map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ') || '';
        
        setCurrentUserData({
          id: storedUser.id,
          firstName,
          lastName,
          email: storedUser.email,
          role: storedUser.role,
          avatar: undefined,
          address: '',
          permissions: {
            dashboard: true,
            reports: storedUser.permissions?.can_see_report ?? false,
            inventory: storedUser.permissions?.can_manage_inventory ?? false,
            orders: true,
            customers: true,
            settings: storedUser.role === 'admin',
          },
          createdAt: new Date().toISOString(),
          lastLogin: storedUser.lastLogin || new Date().toISOString(),
        });
      }
      setIsLoading(false);
    };

    loadUser();
  }, []);

  // Profile management
  const updateProfile = async (data: ProfileFormData) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setCurrentUserData(prev => prev ? {
        ...prev,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        address: data.address,
      } : null);
      
      // Update in users list if exists
      if (currentUserData) {
        setUsers(prev => prev.map(user => 
          user.id === currentUserData.id 
            ? { ...user, ...data }
            : user
        ));
      }
      
      return { success: true, message: 'Profile updated successfully' };
    } catch (error) {
      return { success: false, message: 'Failed to update profile' };
    } finally {
      setIsLoading(false);
    }
  };

  // User management
  const addUser = async (data: NewUserFormData) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newUser: User = {
        id: `user-${Date.now()}`,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        role: data.role,
        permissions: defaultPermissions[data.role],
        createdAt: new Date().toISOString(),
      };
      
      setUsers(prev => [...prev, newUser]);
      return { success: true, message: 'User added successfully' };
    } catch (error) {
      return { success: false, message: 'Failed to add user' };
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = async (userId: string, updates: Partial<User>) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setUsers(prev => prev.map(user => 
        user.id === userId 
          ? { ...user, ...updates }
          : user
      ));
      
      return { success: true, message: 'User updated successfully' };
    } catch (error) {
      return { success: false, message: 'Failed to update user' };
    } finally {
      setIsLoading(false);
    }
  };

  const deleteUser = async (userId: string) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setUsers(prev => prev.filter(user => user.id !== userId));
      return { success: true, message: 'User deleted successfully' };
    } catch (error) {
      return { success: false, message: 'Failed to delete user' };
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserPermissions = async (userId: string, permissions: Partial<User['permissions']>) => {
    const existingUser = users.find(u => u.id === userId);
    const mergedPermissions = {
      dashboard: permissions.dashboard ?? existingUser?.permissions?.dashboard ?? false,
      reports: permissions.reports ?? existingUser?.permissions?.reports ?? false,
      inventory: permissions.inventory ?? existingUser?.permissions?.inventory ?? false,
      orders: permissions.orders ?? existingUser?.permissions?.orders ?? false,
      customers: permissions.customers ?? existingUser?.permissions?.customers ?? false,
      settings: permissions.settings ?? existingUser?.permissions?.settings ?? false,
    };
    return updateUser(userId, { permissions: mergedPermissions });
  };

  // Default user if not loaded yet
  const defaultUser: CurrentUser = {
    id: '',
    firstName: 'User',
    lastName: '',
    email: '',
    role: 'cashier',
    permissions: defaultPermissions.cashier,
    createdAt: new Date().toISOString(),
    lastLogin: new Date().toISOString(),
  };

  return {
    // State
    users,
    currentUser: currentUserData || defaultUser,
    activeView,
    isLoading,
    
    // Actions
    setActiveView,
    updateProfile,
    addUser,
    updateUser,
    deleteUser,
    updateUserPermissions,
  };
}
