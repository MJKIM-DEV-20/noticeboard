// src/api/post.ts
import { supabase } from '../lib/supabaseClient.ts';
import type { PostInput, Post } from '../type/type.ts';

// export async function getPosts(page: number, pageSize = 10) {
//     const from = (page - 1) * pageSize;
//     const to = from + pageSize - 1;
//
//     const { data, error, count } = await supabase
//         .from('posts')
//         .select('*', { count: 'exact' })
//         .order('created_at', { ascending: false })
//         .range(from, to);
//
//     if (error) throw error;
//     return { posts: data as Post[], totalCount: count ?? 0 };
// }




export async function getPosts(): Promise<Post[]> {
    const { data, error } = await supabase
        .from('posts')
        .select('*, users(username)')
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
}

export async function getOnePost(id: string): Promise<Post> {
    const { data, error } = await supabase
        .from('posts')
        .select('*, users(username)')
        .eq('id', id)
        .single();

    if (error) throw error;
    return data;
}

export async function createPost(post: PostInput): Promise<Post> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('로그인이 필요합니다.');

    const { data, error } = await supabase
        .from('posts')
        .insert({ ...post, user_id: user.id })
        .select()
        .single();
    if (error) throw error;
    return data;
}

export async function updatePost(id: string, post: Partial<PostInput>): Promise<Post> {
    const { data, error } = await supabase
        .from('posts')
        .update({ ...post, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
    if (error) throw error;
    return data;
}

export async function deletePost(id: string): Promise<void> {
    const { error } = await supabase.from('posts').delete().eq('id', id);
    if (error) throw error;
}

export async function verifyPassword(id: string, password: string): Promise<boolean> {
    const { data, error } = await supabase
        .from('posts')
        .select('password')
        .eq('id', id)
        .single();
    if (error) throw error;
    return data.password === password;
}