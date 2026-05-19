import React, { createContext, useCallback, useEffect, useState } from 'react';
import {
  AuthUser,
  AuthContextType,
  LoginCredentials,
  SignupCredentials,
} from '../types';
import { ClientAuthService, AuthService } from '../services/auth/AuthService';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

/**
 * Auth Context Provider
 * Manages global authentication state and operations
 * Replaces AWS Amplify withAuthenticator HOC
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Initialize auth state on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        setIsLoading(true);
        const token = await ClientAuthService.getToken();
        const userData = await ClientAuthService.getUser();

        if (token && userData) {
          // Verify token is still valid
          const decoded = AuthService.verifyToken(token);
          if (decoded) {
            setUser(userData);
            setIsAuthenticated(true);
          } else {
            // Token expired, clear auth
            await ClientAuthService.clearAuth();
            setIsAuthenticated(false);
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    try {
      setIsLoading(true);

      // Validate input
      if (!AuthService.isValidEmail(credentials.email)) {
        throw new Error('Invalid email format');
      }

      // Call backend login endpoint
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const { user: userData, token } = await response.json();

      // Save auth data
      await ClientAuthService.saveToken(token.accessToken);
      await ClientAuthService.saveUser(userData);

      setUser(userData);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signup = useCallback(async (credentials: SignupCredentials) => {
    try {
      setIsLoading(true);

      // Validate input
      if (!AuthService.isValidEmail(credentials.email)) {
        throw new Error('Invalid email format');
      }

      const passwordValidation = AuthService.validatePassword(credentials.password);
      if (!passwordValidation.isValid) {
        throw new Error(passwordValidation.errors.join(', '));
      }

      // Call backend signup endpoint
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        throw new Error('Signup failed');
      }

      const { user: userData, token } = await response.json();

      // Save auth data
      await ClientAuthService.saveToken(token.accessToken);
      await ClientAuthService.saveUser(userData);

      setUser(userData);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      setIsLoading(true);

      // Call backend logout endpoint
      const token = await ClientAuthService.getToken();
      if (token) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
      }

      // Clear auth data
      await ClientAuthService.clearAuth();
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout error:', error);
      // Clear auth data even if API call fails
      await ClientAuthService.clearAuth();
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshToken = useCallback(async () => {
    try {
      const token = await ClientAuthService.getToken();
      if (!token) {
        throw new Error('No token to refresh');
      }

      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Token refresh failed');
      }

      const { token: newToken } = await response.json();
      await ClientAuthService.saveToken(newToken.accessToken);
    } catch (error) {
      console.error('Token refresh error:', error);
      // If refresh fails, log out user
      await logout();
    }
  }, [logout]);

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    signup,
    logout,
    refreshToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
