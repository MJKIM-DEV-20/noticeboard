import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPost, deleteOwnPost } from '../api/post';
import { useAuth} from "../context/authcontext.tsx";
import { PATHS} from "../router/path.ts";
import type { Post } from '../type/type';
import Button from "../components/button.tsx";
export default function PostDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [post, setPost] = useState<Post | null>(null);

    useEffect(() => {
        if (id) getPost(id).then(setPost);
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
        navigate(PATHS.POST_EDIT(id));
    };

    if (!post) {
        return <div className="text-center text-[#78716C] py-20">로딩중...</div>;
    }

    const isOwner = user?.id === post.user_id;

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-[#E7E5DF] p-8">
            <h2 className="text-2xl font-bold text-[#1C1917]">{post.title}</h2>
            <div className="flex items-center gap-2 text-sm text-[#78716C] mt-2 pb-4 border-b border-[#E7E5DF]">
                <span>{post.users?.username ?? '알수없음'}</span>
                <span>·</span>
                <span>{new Date(post.created_at).toLocaleDateString()}</span>
            </div>
            <p className="text-[#1C1917] leading-relaxed whitespace-pre-wrap mt-6 mb-8">
                {post.content}
            </p>
            {isOwner && (
                <div className="flex gap-2 justify-end">
                    <Button variant="default" onClick={handleEdit}>수정</Button>
                    <Button variant="danger" onClick={handleDelete}>삭제</Button>
                </div>
            )}
        </div>
    );
}