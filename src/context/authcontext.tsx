// src/contexts/AuthContext.tsx
import { createContext, useContext, useState, type ReactNode, useEffect } from 'react';
import * as authApi from '../api/auth';
import type { User } from '../type/type';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    signUp: (username: string, password: string) => Promise<void>;
    signIn: (username: string, password: string) => Promise<void>;
    signOut: () => void;
    updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function loadStoredUser(): User | null {
    const saved = localStorage.getItem('user');
    if (!saved) return null;

    try {
        const parsed = JSON.parse(saved);
        // 신규 인증 방식(JWT) 이전에 저장된 로그인 정보는 token이 없어 API 인증이 불가능하므로
        // 로그인 안 된 상태로 취급하고 저장된 값도 정리한다.
        if (!parsed.token) {
            localStorage.removeItem('user');
            return null;
        }
        return parsed;
    } catch {
        localStorage.removeItem('user');
        return null;
    }
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(loadStoredUser);

    const loading = false;

    useEffect(() => {
        if (user) localStorage.setItem('user', JSON.stringify(user));
        else localStorage.removeItem('user');
    }, [user]);

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

    const signOut = () => setUser(null);

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