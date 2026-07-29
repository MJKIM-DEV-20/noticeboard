// src/imports/postdetail.tsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPost, deleteOwnPost } from '../api/post';
import { useAuth } from "../context/authcontext.tsx";
import { PATHS } from "../router/path.ts";
import type { Post } from '../type/type';
import Button from "../components/button.tsx";
import Input from "../components/Input.tsx";
import { Modal } from "../components/Modal.tsx";
import { getCategoryStyle, getAvatarColor } from '../utils/style';
import toast from 'react-hot-toast';

export default function PostDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [post, setPost] = useState<Post | null>(null);

    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [password, setPassword] = useState('');
    const [modalError, setModalError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (id) getPost(id).then(setPost);
    }, [id]);

    const closeModal = () => {
        setDeleteModalOpen(false);
        setPassword('');
        setModalError('');
        setSubmitting(false);
    };

    const handleConfirmDelete = async () => {
        if (!id || !user) return;
        if (!password) {
            setModalError('비밀번호를 입력하세요.');
            return;
        }
        setSubmitting(true);
        setModalError('');
        try {
            await deleteOwnPost(id, user.username, password);
            closeModal();
            toast.success('게시글이 삭제되었습니다.');
            navigate(PATHS.POSTS);
        } catch {
            setModalError('비밀번호가 일치하지 않거나 삭제에 실패했습니다.');
            setSubmitting(false);
        }
    };

    const handleEdit = () => {
        if (!id) return;
        navigate(PATHS.POST_EDIT(id));
    };

    if (!post) {
        return (
            <div className="max-w-[820px] mx-auto px-4">
                <div className="bg-white rounded-2xl shadow-sm border border-[#E7E5DF] p-9 md:p-14 space-y-4">
                    <div className="h-6 w-24 rounded-full bg-[#E7E5DF] animate-pulse" />
                    <div className="h-10 w-3/4 rounded bg-[#E7E5DF] animate-pulse" />
                    <div className="h-4 w-40 rounded bg-[#E7E5DF] animate-pulse" />
                    <div className="space-y-2 pt-6">
                        <div className="h-4 w-full rounded bg-[#E7E5DF] animate-pulse" />
                        <div className="h-4 w-full rounded bg-[#E7E5DF] animate-pulse" />
                        <div className="h-4 w-2/3 rounded bg-[#E7E5DF] animate-pulse" />
                    </div>
                </div>
            </div>
        );
    }

    const isOwner = user?.id === post.user_id;
    const username = post.users?.username ?? '알수없음';
    const categoryStyle = getCategoryStyle(post.category);
    const avatarColor = getAvatarColor(username);

    return (
        <div className="max-w-[820px] mx-auto px-4">
            <div className="bg-white rounded-2xl shadow-sm border border-[#E7E5DF] p-9 md:p-14">
                {post.category && (
                    <span className={`inline-block px-3 py-1.5 rounded-full text-[13px] font-semibold mb-5 ${categoryStyle.bg} ${categoryStyle.text}`}>
                        {post.category}
                    </span>
                )}

                <h2 className="text-[32px] md:text-[40px] leading-tight font-extrabold text-[#1C1917] break-words tracking-[-0.02em]">
                    {post.title}
                </h2>

                <div className="flex items-center gap-3 mt-6 pb-8 border-b border-[#E7E5DF]">
                    <div
                        className="w-10 h-10 rounded-full text-white flex items-center justify-center font-bold text-[15px] shrink-0"
                        style={{ backgroundColor: avatarColor }}
                    >
                        {username.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-[#78716C]">
                        <span className="font-semibold text-[#1C1917] text-[15px]">{username}</span>
                        <span>·</span>
                        <span>{new Date(post.created_at).toLocaleDateString()}</span>
                        <span>·</span>
                        <span>조회 {post.views}</span>
                    </div>
                </div>

                <p className="text-[18px] text-[#1C1917] leading-[1.9] whitespace-pre-wrap break-words mt-10 mb-12">
                    {post.content}
                </p>

                {isOwner && (
                    <div className="flex gap-2.5 justify-end pt-6 border-t border-[#E7E5DF]">
                        <Button variant="default" onClick={handleEdit}>수정</Button>
                        <Button variant="danger" onClick={() => setDeleteModalOpen(true)}>삭제</Button>
                    </div>
                )}
            </div>

            <Modal
                open={deleteModalOpen}
                title="게시글 삭제"
                onClose={closeModal}
                footer={
                    <>
                        <Button variant="default" onClick={closeModal}>취소</Button>
                        <Button variant="danger" onClick={handleConfirmDelete} disabled={submitting}>
                            {submitting ? '삭제 중...' : '삭제'}
                        </Button>
                    </>
                }
            >
                <p className="text-[15px] text-[#78716C] mb-4">
                    정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
                </p>
                <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="비밀번호"
                    autoFocus
                />
                {modalError && <p className="mt-2.5 text-sm text-[#DC2626]">{modalError}</p>}
            </Modal>
        </div>
    );
}