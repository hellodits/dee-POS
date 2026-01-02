import { useState, useEffect, useCallback, useRef } from 'react';
import { User, CurrentUser, ProfileFormData, NewUserFormData, ProfileView } from '../types';
import { defaultPermissions } from '../data/profileData';
import { auth, usersApi } from '@/lib/api';

export function useProfile() {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUserData, setCurrentUserData] = useState<CurrentUser | null>(null);
  const [activeView, setActiveView] = useState<ProfileView>('profile');
  const [isLoading, setIsLoading] = useState(true);
  const hasFetched = useRef(false);

  // Map API user to local User type
  const mapApiUserToLocal = (apiUser: any): User => ({
    id: apiUser._id || apiUser.id,
    firstName: apiUser.firstName || apiUser.username?.split('_')[0] || 'User',
    lastName: apiUser.lastName || '',
    email: apiUser.email,
    role: apiUser.role,
    avatar: apiUser.avatar,
    permissions: {
      dashboard: true,
      reports: apiUser.permissions?.can_see_report ?? false,
      inventory: apiUser.permissions?.can_manage_inventory ?? false,
      orders: true,
      customers: true,
      settings: apiUser.role === 'admin',
    },
    createdAt: apiUser.createdAt,
    lastLogin: apiUser.lastLogin,
  });

  // Fetch all users from API
  const fetchUsers = useCallback(async () => {
    try {
      const response = await usersApi.getAll();
      if (response.data?.success && response.data?.data) {
        const mappedUsers = (response.data.data as any[]).map(mapApiUserToLocal);
        setUsers(mappedUsers);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  }, []);

  // Load current user and users list on mount
  useEffect(() => {
    // Prevent multiple fetches in Strict Mode
    if (hasFetched.current) return;
    hasFetched.current = true;

    const loadData = async () => {
      setIsLoading(true);
      try {
        // First try to get user from localStorage to avoid unnecessary API call
        const storedUser = auth.getUser();
        
        if (storedUser) {
          setCurrentUserData({
            id: storedUser.id,
            firstName: storedUser.firstName || storedUser.username?.split('_')[0] || 'User',
            lastName: storedUser.lastName || '',
            email: storedUser.email,
            role: storedUser.role,
            avatar: storedUser.avatar,
            address: storedUser.address || '',
            permissions: {
              dashboard: true,
              reports: storedUser.permissions?.can_see_report ?? false,
              inventory: storedUser.permissions?.can_manage_inventory ?? false,
              orders: true,
              customers: true,
              settings: storedUser.role === 'admin',
            },
            createdAt: storedUser.createdAt || new Date().toISOString(),
            lastLogin: storedUser.lastLogin || new Date().toISOString(),
          });
        }

        // Fetch fresh data from API (but don't block UI)
        const userData = await auth.getMe();
        
        if (userData) {
          setCurrentUserData({
            id: userData.id,
            firstName: userData.firstName || userData.username?.split('_')[0] || 'User',
            lastName: userData.lastName || '',
            email: userData.email,
            role: userData.role,
            avatar: userData.avatar,
            address: userData.address || '',
            permissions: {
              dashboard: true,
              reports: userData.permissions?.can_see_report ?? false,
              inventory: userData.permissions?.can_manage_inventory ?? false,
              orders: true,
              customers: true,
              settings: userData.role === 'admin',
            },
            createdAt: userData.createdAt || new Date().toISOString(),
            lastLogin: userData.lastLogin || new Date().toISOString(),
          });
        }

        // Fetch users list (only for admin/manager)
        await fetchUsers();
      } catch (error) {
        console.error('Failed to load data:', error);
      }
      setIsLoading(false);
    };

    loadData();
  }, []); // Remove fetchUsers from dependencies

  // Profile management - uses real API
  const updateProfile = async (data: ProfileFormData, avatarFile?: File) => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('firstName', data.firstName);
      formData.append('lastName', data.lastName);
      formData.append('email', data.email);
      formData.append('address', data.address || '');
      
      if (data.newPassword) {
        formData.append('newPassword', data.newPassword);
      }
      
      if (avatarFile) {
        formData.append('avatar', avatarFile);
      }

      const result = await auth.updateProfile(formData);
      
      if (result.success && result.data) {
        setCurrentUserData(prev => prev ? {
          ...prev,
          firstName: result.data!.firstName || prev.firstName,
          lastName: result.data!.lastName || prev.lastName,
          email: result.data!.email,
          address: result.data!.address || '',
          avatar: result.data!.avatar,
        } : null);
        
        return { success: true, message: 'Profile berhasil diperbarui' };
      }
      
      return { success: false, message: result.error || 'Gagal memperbarui profile' };
    } catch (error: any) {
      console.error('Update profile error:', error);
      return { success: false, message: error.response?.data?.error || 'Gagal memperbarui profile' };
    } finally {
      setIsLoading(false);
    }
  };

  // User management - uses real API
  const addUser = async (data: NewUserFormData) => {
    setIsLoading(true);
    try {
      // Generate username from email
      const username = data.email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '_');
      
      const response = await usersApi.create({
        username,
        email: data.email,
        password: data.password,
        role: data.role,
        firstName: data.firstName,
        lastName: data.lastName,
      });

      if (response.data?.success) {
        // Refresh users list
        await fetchUsers();
        return { success: true, message: 'User berhasil ditambahkan' };
      }
      
      return { success: false, message: response.data?.error || 'Gagal menambahkan user' };
    } catch (error: any) {
      console.error('Add user error:', error);
      return { success: false, message: error.response?.data?.error || 'Gagal menambahkan user' };
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = async (userId: string, updates: Partial<User>) => {
    setIsLoading(true);
    try {
      const response = await usersApi.update(userId, {
        firstName: updates.firstName,
        lastName: updates.lastName,
        email: updates.email,
        role: updates.role,
      });

      if (response.data?.success) {
        // Refresh users list
        await fetchUsers();
        return { success: true, message: 'User berhasil diperbarui' };
      }
      
      return { success: false, message: response.data?.error || 'Gagal memperbarui user' };
    } catch (error: any) {
      console.error('Update user error:', error);
      return { success: false, message: error.response?.data?.error || 'Gagal memperbarui user' };
    } finally {
      setIsLoading(false);
    }
  };

  const deleteUser = async (userId: string) => {
    setIsLoading(true);
    try {
      const response = await usersApi.delete(userId);

      if (response.data?.success) {
        // Remove from local state
        setUsers(prev => prev.filter(user => user.id !== userId));
        return { success: true, message: 'User berhasil dihapus' };
      }
      
      return { success: false, message: response.data?.error || 'Gagal menghapus user' };
    } catch (error: any) {
      console.error('Delete user error:', error);
      return { success: false, message: error.response?.data?.error || 'Gagal menghapus user' };
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserPermissions = async (userId: string, permissions: Partial<User['permissions']>) => {
    setIsLoading(true);
    try {
      // Map frontend permissions to backend format
      const backendPermissions: Record<string, boolean> = {};
      if (permissions.reports !== undefined) backendPermissions.can_see_report = permissions.reports;
      if (permissions.inventory !== undefined) backendPermissions.can_manage_inventory = permissions.inventory;
      if (permissions.settings !== undefined) backendPermissions.can_manage_users = permissions.settings;
      
      const response = await usersApi.updatePermissions(userId, backendPermissions);

      if (response.data?.success) {
        // Update local state
        setUsers(prev => prev.map(user => 
          user.id === userId 
            ? { ...user, permissions: { ...user.permissions, ...permissions } }
            : user
        ));
        return { success: true, message: 'Permissions berhasil diperbarui' };
      }
      
      return { success: false, message: response.data?.error || 'Gagal memperbarui permissions' };
    } catch (error: any) {
      console.error('Update permissions error:', error);
      return { success: false, message: error.response?.data?.error || 'Gagal memperbarui permissions' };
    } finally {
      setIsLoading(false);
    }
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
    fetchUsers,
  };
}
