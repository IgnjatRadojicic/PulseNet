import React, { createContext, useState, type ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';
import { storage } from '../../helpers/localStorage';
import type { AuthContextType } from '../../types/auth/AuthContextType';
import type { AuthUser } from '../../types/auth/AuthUser';
import type { JwtTokenClaims } from '../../types/auth/JwtTokenClaims';
import { AUTH } from '../../constants/auth';


const AuthContext = createContext<AuthContextType | undefined>(undefined);

function decodeToken(token: string): JwtTokenClaims | null {
    try {
        const decoded = jwtDecode<JwtTokenClaims>(token);
        if (decoded.id && decoded.username && decoded.role) return decoded;
        return null;
    } catch {
        return null;
    }
}

function isTokenExpired(token: string): boolean {
    try {
        const decoded = jwtDecode(token);
        if (!decoded.exp) return false;
        return decoded.exp < Date.now() / AUTH.JWT_TIMESTAMP_DIVISOR ;
    }
    catch {
        return true;
    }
}

function tokenToUser(token: string): AuthUser | null {
    if (isTokenExpired(token)) return null;
    const claims = decodeToken(token);
    
    if (!claims) return null;

    return{ id: claims.id, username: claims.username, role: claims.role };
}

function resolveInitialAuth() : {user: AuthUser | null; token: string | null} {
    const saved = storage.get(AUTH.TOKEN_KEY);
    if (!saved) return {user: null, token: null};

    const user = tokenToUser(saved);

    if (!user) {
        storage.remove(AUTH.TOKEN_KEY);
        return {user : null, token: null};
    }

    return {user, token: saved};
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const initial = resolveInitialAuth();
    const [user, setUser] = useState<AuthUser | null>(initial.user);
    const [token, setToken] = useState<string | null>(initial.token);
    

    function login(newToken: string): void {
        const resolved = tokenToUser(newToken);
        if (!resolved) return;
        setToken(newToken);
        setUser(resolved);
        storage.set(AUTH.TOKEN_KEY, newToken);
    }

    function logout(): void {
        setToken(null);
        setUser(null);
        storage.remove(AUTH.TOKEN_KEY);
    }

    const value: AuthContextType = {
        user,
        token,
        login,
        logout,
        isAuthenticated: !!user && !!token,
        isLoading: false,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export default AuthContext;