'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '@/lib/api/client';
import type { User } from '@/types';
import type { UserLogin, UserRegistration } from '@/lib/validation/schemas';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  otpSent: boolean;
  otpEmail: string | null;
  login: (credentials: UserLogin) => Promise<void>;
  register: (userData: UserRegistration) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  requestOtp: (email: string) => Promise<void>;
  verifyOtp: (email: string, code: string) => Promise<void>;
  clearOtpState: () => void;
  clearError: () => void;
}

/**
 * Authentication store using Zustand
 */
export const useAuth = create<AuthState>()(
  persist(
    (set, _get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      otpSent: false,
      otpEmail: null,

      login: async (credentials: UserLogin) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.post<{
            success: boolean;
            data: { user: User; accessToken: string };
          }>('/auth/login', credentials);

          // Token is already stored in httpOnly cookie by the server
          // No need to store in localStorage (security risk)

          set({
            user: response.data.user,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Login failed',
            isLoading: false,
          });
          throw error;
        }
      },

      register: async (userData: UserRegistration) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.post<{
            success: boolean;
            data: { user: User; verificationUrl?: string };
          }>('/auth/register', userData);

          // Note: User is NOT authenticated yet - needs email verification
          // No token is returned from registration

          set({
            user: response.data.user,
            isAuthenticated: false, // Not authenticated until email verified
            isLoading: false,
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Registration failed',
            isLoading: false,
          });
          throw error;
        }
      },

      logout: async () => {
        set({ isLoading: true });
        try {
          await api.post('/auth/logout');
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          // Server clears httpOnly cookies
          // Just clear local state
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      },

      updateProfile: async (data: Partial<User>) => {
        set({ isLoading: true, error: null });
        try {
          const updatedUser = await api.put<User>('/auth/profile', data);
          set({
            user: updatedUser,
            isLoading: false,
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Profile update failed',
            isLoading: false,
          });
          throw error;
        }
      },

      requestOtp: async (email: string) => {
        set({ isLoading: true, error: null, otpSent: false });
        try {
          await api.post<{
            success: boolean;
            message: string;
          }>('/auth/otp/request', { email });

          set({
            otpSent: true,
            otpEmail: email,
            isLoading: false,
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to send OTP',
            isLoading: false,
            otpSent: false,
          });
          throw error;
        }
      },

      verifyOtp: async (email: string, code: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.post<{
            success: boolean;
            data: { user: User; accessToken: string };
          }>('/auth/otp/verify', { email, code });

          set({
            user: response.data.user,
            isAuthenticated: true,
            isLoading: false,
            otpSent: false,
            otpEmail: null,
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Invalid OTP',
            isLoading: false,
          });
          throw error;
        }
      },

      clearOtpState: () => set({ otpSent: false, otpEmail: null, error: null }),

      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);
