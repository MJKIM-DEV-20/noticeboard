// src/type/type.ts
export interface User {
    id: string;
    username: string;
}

export const CATEGORIES = ['일상잡담', '음식이야기', '랜덤에피소드', '회사생활', '소소한고민'] as const;
export type Category = typeof CATEGORIES[number];

export interface Post {
    id: string;
    title: string;
    content: string;
    category: Category;
    user_id: string;
    users?: { username: string };
    created_at: string;
    updated_at: string;
    views: number;
}

export type PostInput = Pick<Post, 'title' | 'content' | 'category'>;