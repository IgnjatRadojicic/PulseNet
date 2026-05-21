import type { AuthUser } from './AuthUser';

export type AuthContextType = {
    user: AuthUser | null;
    token: string | null;
    login: (token: string) => Promise<void>;
    logout: () => void;
    isAuthenticated: boolean;
    isLoading: boolean;
};