import type { Post, PostInput } from '../type/type';

// 로그인 필요한 요청에 자체 발급 토큰(JWT)을 Authorization 헤더로 실어 보냄
function authHeader(): Record<string, string> {
    const saved = localStorage.getItem('user');
    if (!saved) return {};

    try {
        const user = JSON.parse(saved);
        return user.token ? { Authorization: `Bearer ${user.token}` } : {};
    } catch {
        return {};
    }
}

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
    const headers = authHeader();
    const res = await fetch(`/api/post/mine?page=${page}&pageSize=${pageSize}`, {
        headers,
    });
    if (!res.ok) throw new Error('내 글 목록 조회 실패');
    return res.json();
}

export async function createPost(post: PostInput): Promise<Post> {
    const headers = authHeader();
    if (!headers.Authorization) throw new Error('로그인이 필요합니다.');

    const res = await fetch('/api/post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...headers },
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
) {
    const res = await fetch(`/api/post/${postId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            username,
            password,
            title: newTitle,
            content: newContent,
        }),
    });

    if (!res.ok) {
        const { error } = await res.json();
        throw new Error(error ?? '수정에 실패했습니다.');
    }
}