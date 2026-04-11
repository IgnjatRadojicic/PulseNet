import { useContext } from 'react';
import AuthContext from '../../contexts/auth/AuthContext';
import type { AuthContextType } from '../../types/auth/AuthContextType';

export function useAuth(): AuthContextType {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
}