import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPost, deleteOwnPost} from "../api/post.ts";
import { useAuth} from "../context/authcontext.tsx";
import { PATHS } from '../router/path';
import type { Post } from '../type/type';


export default function PostDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [post, setPost] = useState<Post | null>(null);

    // useEffect(() => {
    //     if (id) getPost(id).then(setPost);
    // }, [id]);

    useEffect(() => {
        if (id) {
            getPost(id)
                .then(setPost)
                .catch((err) => {
                    console.error('getPost error:', err);
                    setPost(null);
                });
        }
    }, [id]);


    const handleDelete = async () => {
        if (!id || !user) return;
        const pw = prompt('비밀번호를 입력하세요');
        if (!pw) return;
        try {
            await deleteOwnPost(id, user.username, pw);
            navigate(PATHS.POSTS);
        } catch {
            alert('삭제 실패 (비밀번호 확인)');
        }
    };

    const handleEdit = () => {
        if (!id) return;
        navigate(`/posts/${id}/edit`);
    };

    if (!post) return <div>로딩중...</div>;
    const isOwner = user?.id === post.user_id;

    return (
        <div>
            <h2>{post.title}</h2>
            <p>작성자: {post.users?.username}</p>
            <p>{post.content}</p>
            {isOwner && (
                <>
                    <button onClick={handleEdit}>수정</button>
                    <button onClick={handleDelete}>삭제</button>
                </>
            )}
        </div>
    );
}