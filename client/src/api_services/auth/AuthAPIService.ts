import { API } from '../../constants/api';
import type { AuthResponse } from '../../types/auth/AuthResponse';
import type { IAuthAPIService } from './IAuthAPIService';

export const authApiService: IAuthAPIService = {
    async login(username, password): Promise<AuthResponse> {
      try {
        const res = await fetch(`${API.BASE_URL}auth/login`, {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({username, password}),
        })
        return await res.json();
        } catch {
            return { success: false, message: 'Network error. Please try again.' };
        }
    },

    async register(username, email, firstName, lastName, password, bio, profileImage): Promise<AuthResponse> {
        try {
            const res = await fetch(`${API.BASE_URL}auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, firstName, lastName, password, bio, profileImage }),
            });
            return await res.json();
        } catch {
            return { success: false, message: 'Network error. Please try again.' };
        }
    },

    async logout(token): Promise<void> {
      try {
        await fetch(`"${API.BASE_URL}auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
        });
        } catch {
            // silent
        }
    },
};