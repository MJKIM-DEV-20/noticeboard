// src/pages/PostList.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPosts } from '../api/post';
import type { Post } from '../type/type';

export default function PostList() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        getPosts()
            .then(setPosts)
            .catch((err) => console.error('getPosts error:', err))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div>로딩중...</div>;

    return (
        <div>
            <h2>게시글 목록</h2>
            <ul>
                {posts.map((post) => (
                    <li key={post.id} onClick={() => navigate(`/posts/${post.id}`)}>
                        {post.title} - {post.users?.username ?? '알수없음'}
                    </li>
                ))}
            </ul>
        </div>
    );
}