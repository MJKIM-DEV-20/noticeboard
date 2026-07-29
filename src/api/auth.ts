// src/api/auth.ts
import type { User } from '../type/type';

export async function signUp(username: string, password: string): Promise<User> {
    const res = await fetch('/api/auth?action=signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username, password }),
    });

    if (!res.ok) {
        const { error } = await res.json();
        throw new Error(error ?? '회원가입에 실패했습니다.');
    }
    return res.json();
}

export async function signIn(username: string, password: string): Promise<User> {
    const res = await fetch('/api/auth?action=signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username, password }),
    });

    if (!res.ok) {
        const { error } = await res.json();
        throw new Error(error ?? '아이디 또는 비밀번호가 일치하지 않습니다.');
    }
    return res.json();
}

export async function getMe(): Promise<User | null> {
    const res = await fetch('/api/auth?action=me', {
        method: 'GET',
        credentials: 'include',
    });
    if (!res.ok) return null;
    const { user } = await res.json();
    return user;
}

export async function logout(): Promise<void> {
    await fetch('/api/auth?action=logout', {
        method: 'POST',
        credentials: 'include',
    });
}

export async function updateUsername(userId: string, password: string, newUsername: string) {
    const res = await fetch('/api/auth?action=update-username', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ userId, password, newUsername }),
    });

    if (!res.ok) {
        const { error } = await res.json();
        throw new Error(error ?? '변경에 실패했습니다.');
    }
}