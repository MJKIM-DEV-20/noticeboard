// src/api/post.ts
import { supabase } from '../lib/supabaseClient';
import type { Post, PostInput } from '../type/type';
// export async function getPosts(): Promise<Post[]> {
//     const { data, error } = await supabase
//         .from('posts')
//         .select('*, users(username)')
//         .order('created_at', { ascending: false });
//     if (error) throw error;
//     return data;
// }
//

export async function incrementViews(id: string) {
    const { error } = await supabase.rpc('increment_views', { post_id: id });
    if (error) console.error('조회수 증가 실패:', error);
}

export async function getTopViewedPosts(limit = 5): Promise<Post[]> {
    const { data, error } = await supabase
        .from('posts')
        .select('*, users(username)')
        .order('views', { ascending: false })
        .limit(limit);
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

    incrementViews(id); // 조회 후 비동기로 조회수 증가 (기다릴 필요 없음)
    return data;
}



export async function getPosts(page: number, pageSize: number, search?: string, category?: string) {
    let query = supabase
        .from('posts')
        .select('*, users(username)', { count: 'exact' })
        .order('created_at', { ascending: false });

    if (search?.trim()) {
        query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`);
    }
    if (category) {
        query = query.eq('category', category);
    }

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await query.range(from, to);
    if (error) throw error;
    return { posts: data as Post[], totalCount: count ?? 0 };
}

export async function getMyPosts(userId: string, page: number, pageSize: number) {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await supabase
        .from('posts')
        .select('*, users(username)', { count: 'exact' })
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(from, to);

    if (error) throw error;
    return { posts: data as Post[], totalCount: count ?? 0 };
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