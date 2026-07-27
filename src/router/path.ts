// src/routes/path.ts
export const PATHS = {
    HOME: '/',
    POSTS: '/posts',
    POST_DETAIL: (id: string | number = ':id') => `/posts/${id}`,
    POST_NEW: '/posts/new',
    POST_EDIT: (id: string | number = ':id') => `/posts/${id}/edit`,
    LOGIN: '/login',
    SIGNUP: '/signup',
} as const;