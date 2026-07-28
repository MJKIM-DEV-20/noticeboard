// src/api/auth.ts
import { supabase } from '../lib/supabaseClient';
import type { User } from '../type/type';

export async function signUp(username: string, password: string): Promise<User> {
    const { data, error } = await supabase
        .from('users')
        .insert({ username, password })
        .select('id, username')
        .single();
    if (error) throw error;
    return data;
}

export async function signIn(username: string, password: string): Promise<User> {
    const { data, error } = await supabase
        .from('users')
        .select('id, username')
        .eq('username', username)
        .eq('password', password)
        .single();
    if (error) throw new Error('아이디 또는 비밀번호가 일치하지 않습니다.');
    return data;
}