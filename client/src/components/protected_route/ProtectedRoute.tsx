import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/auth/useAuthHook';

interface Props {
    children: React.ReactNode;
    requiredRole: string;
    redirectTo?: string;
}

export function ProtectedRoute({ children, requiredRole, redirectTo = '/login' }: Props) {
    const { isAuthenticated, user, isLoading } = useAuth();
    const location = useLocation();

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: '#050508' }}>
                <div className="w-1 h-1 rounded-full" style={{ background: '#6c63ff', boxShadow: '0 0 8px #6c63ff', animation: 'pulse 1s infinite' }} />
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to={redirectTo} state={{ from: location }} replace />;
    }

    if (user?.role !== requiredRole) {
        return <Navigate to="/404" replace />;
    }

    return <>{children}</>;
}