// src/contexts/AuthContext.tsx
import { createContext, useContext, useState, type ReactNode, useEffect } from 'react';
import * as authApi from '../api/auth';
import type { User } from '../type/type';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    signUp: (username: string, password: string) => Promise<void>;
    signIn: (username: string, password: string) => Promise<void>;
    signOut: () => Promise<void>;
    updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    // 앱 최초 로드 시, httpOnly 쿠키에 담긴 세션으로 로그인 상태를 서버에 확인
    useEffect(() => {
        authApi.getMe()
            .then(setUser)
            .finally(() => setLoading(false));
    }, []);

    const updateUser = (updatedUser: User) => {
        setUser(updatedUser);
    };

    const signUp = async (username: string, password: string) => {
        const newUser = await authApi.signUp(username, password);
        setUser(newUser);
    };

    const signIn = async (username: string, password: string) => {
        const loggedInUser = await authApi.signIn(username, password);
        setUser(loggedInUser);
    };

    const signOut = async () => {
        await authApi.logout();
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, signUp, signIn, signOut, loading, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}