// src/type/type.ts
export interface User {
    id: string;
    username: string;
}

export interface Post {
    id: string;
    title: string;
    content: string;
    user_id: string;
    users: { username: string };
    created_at: string;
    updated_at: string;
}

export type PostInput = Pick<Post, 'title' | 'content'>;