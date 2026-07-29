import type { Post, PostInput } from '../type/type';

export async function getPost(id: string): Promise<Post> {
    const res = await fetch(`/api/post/${id}`);
    if (!res.ok) throw new Error('게시글을 찾을 수 없습니다.');
    return res.json();
}

export async function getPosts(
    page: number,
    pageSize: number,
    search?: string,
    category?: string,
): Promise<{ posts: Post[]; totalCount: number }> {
    const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
    });
    if (search?.trim()) params.set('search', search.trim());
    if (category) params.set('category', category);

    const res = await fetch(`/api/post?${params.toString()}`);
    if (!res.ok) throw new Error('목록 조회 실패');
    return res.json();
}

export async function getTopViewedPosts(limit = 5): Promise<Post[]> {
    const res = await fetch(`/api/post/top?limit=${limit}`);
    if (!res.ok) throw new Error('인기글 조회 실패');
    return res.json();
}

export async function getMyPosts(
    page: number,
    pageSize: number,
): Promise<{ posts: Post[]; totalCount: number }> {
    const res = await fetch(`/api/post/mine?page=${page}&pageSize=${pageSize}`, {
        credentials: 'include', // httpOnly 쿠키(token)를 요청에 실어 보냄
    });
    if (!res.ok) throw new Error('내 글 목록 조회 실패');
    return res.json();
}

export async function createPost(post: PostInput): Promise<Post> {
    const res = await fetch('/api/post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(post),
    });

    if (!res.ok) {
        const { error } = await res.json();
        throw new Error(error ?? '글 작성에 실패했습니다.');
    }
    return res.json();
}

export async function deleteOwnPost(postId: string, username: string, password: string) {
    const res = await fetch(`/api/post/${postId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
    });

    if (!res.ok) {
        const { error } = await res.json();
        throw new Error(error ?? '삭제에 실패했습니다.');
    }
}

export async function updateOwnPost(
    postId: string,
    username: string,
    password: string,
    newTitle: string,
    newContent: string,
    imageUrl?: string | null,
) {
    const res = await fetch(`/api/post/${postId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            username,
            password,
            title: newTitle,
            content: newContent,
            ...(imageUrl !== undefined ? { image_url: imageUrl } : {}),
        }),
    });

    if (!res.ok) {
        const { error } = await res.json();
        throw new Error(error ?? '수정에 실패했습니다.');
    }
}