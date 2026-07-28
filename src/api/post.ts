// src/api/post.ts
import { supabase } from '../lib/supabaseClient';
import type { Post, PostInput } from '../type/type';
export async function getPosts(): Promise<Post[]> {
    const { data, error } = await supabase
        .from('posts')
        .select('*, users(username)')
        .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
}

export async function getPost(id: string): Promise<Post> {
    const { data, error } = await supabase
        .from('posts')
        .select('*, users(username)')
        .eq('id', id)
        .single();
    if (error) throw error;
    return data;
}

export async function createPost(post: PostInput, userId: string | undefined): Promise<Post> {
    if (!userId) throw new Error('로그인이 필요합니다.');

    const { data, error } = await supabase
        .from('posts')
        .insert({ ...post, user_id: userId })
        .select()
        .single();
    if (error) throw error;
    return data;

}

export async function deleteOwnPost(postId: string, username: string, password: string) {
    const { error } = await supabase.rpc('delete_own_post', {
        post_id: postId,
        req_username: username,
        req_password: password,
    });
    if (error) throw error;
}

export async function updateOwnPost(
    postId: string,
    username: string,
    password: string,
    newTitle: string,
    newContent: string
) {
    const { error } = await supabase.rpc('update_own_post', {
        post_id: postId,
        req_username: username,
        req_password: password,
        new_title: newTitle,
        new_content: newContent,
    });
    if (error) throw error;
}