// src/pages/PostDetail.tsx
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getOnePost} from "../api/post.ts";
import type { Post } from '../type/type';

export default function PostDetail() {
    const { id } = useParams();
    const [post, setPost] = useState<Post | null>(null);

    useEffect(() => {
        if (id) {
            getOnePost(id)
                .then(setPost)
                .catch((err) => console.error('getPost error:', err));
        }
    }, [id]);

    if (!post) return <div>로딩중...</div>;

    return (
        <div>
            <h2>{post.title}</h2>
            <p>작성자: {post.users?.username}</p>
            <p>{post.content}</p>
        </div>
    );
}