/**
 * Authentication utility functions for DEEPOS
 */

export const auth = {
  /**
   * Get the current authentication token
   */
  getToken(): string | null {
    return localStorage.getItem('token');
  },

  /**
   * Set the authentication token
   */
  setToken(token: string): void {
    localStorage.setItem('token', token);
  },

  /**
   * Get the current user data
   */
  getUser(): any | null {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  },

  /**
   * Set the current user data
   */
  setUser(user: any): void {
    localStorage.setItem('user', JSON.stringify(user));
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
    localStorage.removeItem('token');
    localStorage.removeItem('user');
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