import { Navigate } from 'react-router-dom';
import { useAuth} from "../context/authcontext.tsx";
import type {ReactNode} from 'react';

export default function ProtectedRoute({ children }: { children: ReactNode }) {
    const { user, loading } = useAuth();
    if (loading) return <div>로딩중...</div>;
    if (!user) return <Navigate to="/login" replace />;
    return <>{children}</>;
}