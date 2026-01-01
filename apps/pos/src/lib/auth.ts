/**
 * Authentication utility functions for DEEPOS
 */

// Use same keys as api.ts
const TOKEN_KEY = 'access_token';
const USER_KEY = 'user';

export const auth = {
  /**
   * Get the current authentication token
   */
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  /**
   * Set the authentication token
   */
  setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  },

  /**
   * Get the current user data
   */
  getUser(): any | null {
    const userData = localStorage.getItem(USER_KEY);
    return userData ? JSON.parse(userData) : null;
  },

  /**
   * Set the current user data
   */
  setUser(user: any): void {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.getToken();
  },

  /**
   * Logout user by clearing all auth data
   */
  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    // Also clear any legacy keys
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
  },

  /**
   * Redirect to login page
   */
  redirectToLogin(): void {
    window.location.href = '/auth/login';
  },

  /**
   * Complete logout process with redirect
   */
  performLogout(): void {
    this.logout();
    this.redirectToLogin();
  }
};

export default auth;