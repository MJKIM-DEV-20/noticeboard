export interface Post {
    id: string;
    title: string;
    content: string;
    user_id: string;
    users?: { username: string };
    created_at: string;
    updated_at: string;
    author?:string;
}

export type PostInput = Pick<Post, 'title' | 'content'>;