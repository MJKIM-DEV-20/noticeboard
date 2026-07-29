// src/imports/mypage.tsx
import { useEffect, useState } from 'react';
import { Link, Navigate, useSearchParams } from 'react-router-dom';
import { useAuth } from "../context/authcontext.tsx";
import { getMyPosts } from '../api/post';
import { updateUsername } from '../api/auth';
import { isAdminLikeUsername } from '../utils/validation';
import { PATHS } from "../router/path.ts";
import type { Post } from '../type/type';
import Input from "../components/Input.tsx";
import Button from "../components/button.tsx";
import { Modal } from "../components/Modal.tsx";
import toast from 'react-hot-toast';

const PAGE_SIZE = 8;
const GROUP_SIZE = 5;

export default function MyPage() {
    const { user, updateUser } = useAuth();
    const [myPosts, setMyPosts] = useState<Post[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [searchParams, setSearchParams] = useSearchParams();

    const [editModalOpen, setEditModalOpen] = useState(false);
    const [newUsername, setNewUsername] = useState('');
    const [password, setPassword] = useState('');
    const [modalError, setModalError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const page = Number(searchParams.get('page') ?? '1');

    useEffect(() => {
        if (user) {
            setLoading(true);
            getMyPosts(page, PAGE_SIZE)
                .then(({ posts, totalCount }) => {
                    setMyPosts(posts);
                    setTotalCount(totalCount);
                })
                .finally(() => setLoading(false));
        }
    }, [user, page]);

    if (!user) return <Navigate to={PATHS.LOGIN} replace />;

    const setPage = (p: number) => {
        setSearchParams((prev) => {
            const next = new URLSearchParams(prev);
            next.set('page', String(p));
            return next;
        });
    };

    function truncateText(text: string, maxLength: number) {
        if (text.length <= maxLength) return text;
        return text.slice(0, maxLength) + '...';
    }

    const closeModal = () => {
        setEditModalOpen(false);
        setNewUsername('');
        setPassword('');
        setModalError('');
        setSubmitting(false);
    };

    const handleUpdateUsername = async () => {
        setModalError('');

        if (!newUsername.trim()) {
            setModalError('새 아이디를 입력해주세요.');
            return;
        }
        if (isAdminLikeUsername(newUsername)) {
            setModalError('사용할 수 없는 아이디입니다.');
            return;
        }
        if (!password) {
            setModalError('비밀번호를 입력해주세요.');
            return;
        }

        setSubmitting(true);
        try {
            await updateUsername(user.id, password, newUsername);
            updateUser({ ...user, username: newUsername });
            closeModal();
            toast.success('닉네임이 변경되었습니다.');
        } catch (err: any) {
            setModalError(err.message ?? '변경에 실패했습니다.');
            setSubmitting(false);
        }
    };

    const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
    const groupStart = Math.floor((page - 1) / GROUP_SIZE) * GROUP_SIZE + 1;
    const groupEnd = Math.min(groupStart + GROUP_SIZE - 1, totalPages);
    const pageNumbers = Array.from(
        { length: groupEnd - groupStart + 1 },
        (_, i) => groupStart + i
    );

    return (
        <div className="max-w-[720px] mx-auto px-4 space-y-10">
            <section className="bg-white rounded-2xl shadow-sm border border-[#E7E5DF] p-7 md:p-8">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-5">
                        <div className="w-20 h-20 rounded-full bg-[#5B5BD6] text-white flex items-center justify-center text-2xl font-bold shrink-0">
                            {user.username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <p className="font-bold text-[#1C1917] text-xl tracking-[-0.01em]">{user.username}</p>
                            <p className="text-sm text-[#78716C] mt-0.5">내 계정</p>
                        </div>
                    </div>
                    <Button variant="default" onClick={() => setEditModalOpen(true)}>
                        닉네임 변경
                    </Button>
                </div>
            </section>

            <section>
                <h2 className="text-xl font-bold text-[#1C1917] mb-4 tracking-[-0.01em]">
                    내가 쓴 게시글 {!loading && `(${totalCount})`}
                </h2>
                {loading ? (
                    <div className="bg-white rounded-2xl border border-[#E7E5DF] shadow-sm overflow-hidden divide-y divide-[#E7E5DF]">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="px-6 py-5 flex items-center justify-between">
                                <div className="h-4 w-2/3 rounded bg-[#E7E5DF] animate-pulse" />
                                <div className="h-4 w-16 rounded bg-[#E7E5DF] animate-pulse shrink-0 ml-4" />
                            </div>
                        ))}
                    </div>
                ) : myPosts.length === 0 ? (
                    <p className="text-[#78716C] text-sm py-10 text-center bg-white rounded-2xl border border-[#E7E5DF]">
                        작성한 게시글이 없습니다.
                    </p>
                ) : (
                    <>
                        <div className="bg-white rounded-2xl border border-[#E7E5DF] shadow-sm divide-y divide-[#E7E5DF] overflow-hidden">
                            {myPosts.map((post) => (
                                <Link
                                    key={post.id}
                                    to={PATHS.POST_DETAIL(post.id)}
                                    className="flex items-center justify-between px-6 py-5 hover:bg-[#F6F4EF] transition-colors duration-150"
                                >
                                    <span className="text-[16px] text-[#1C1917] font-semibold truncate">{truncateText(post.title, 30)}</span>
                                    <span className="text-[#78716C] text-sm shrink-0 ml-4">
                                        {new Date(post.created_at).toLocaleDateString()}
                                    </span>
                                </Link>
                            ))}
                        </div>
                        {totalPages > 1 && (
                            <div className="flex justify-center gap-1.5 mt-8">
                                <button
                                    onClick={() => setPage(groupStart - 1)}
                                    disabled={groupStart === 1}
                                    className="w-10 h-10 rounded-lg border border-[#E7E5DF] bg-white text-[#1C1917] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#F6F4EF] transition-colors duration-150"
                                >
                                    ‹
                                </button>
                                {pageNumbers.map((p) => (
                                    <button
                                        key={p}
                                        onClick={() => setPage(p)}
                                        className={`w-10 h-10 rounded-lg text-sm font-semibold transition-colors duration-150 ${
                                            p === page
                                                ? 'bg-[#5B5BD6] text-white'
                                                : 'bg-white border border-[#E7E5DF] text-[#1C1917] hover:bg-[#F6F4EF]'
                                        }`}
                                    >
                                        {p}
                                    </button>
                                ))}
                                <button
                                    onClick={() => setPage(groupEnd + 1)}
                                    disabled={groupEnd === totalPages}
                                    className="w-10 h-10 rounded-lg border border-[#E7E5DF] bg-white text-[#1C1917] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#F6F4EF] transition-colors duration-150"
                                >
                                    ›
                                </button>
                            </div>
                        )}
                    </>
                )}
            </section>

            <Modal
                open={editModalOpen}
                title="닉네임 변경"
                onClose={closeModal}
                footer={
                    <>
                        <Button variant="default" onClick={closeModal}>취소</Button>
                        <Button variant="primary" onClick={handleUpdateUsername} disabled={submitting}>
                            {submitting ? '처리 중...' : '저장'}
                        </Button>
                    </>
                }
            >
                <div className="space-y-4">
                    <div>
                        <p className="text-sm text-[#78716C] mb-1.5">수정할 닉네임을 입력하시오</p>
                        <Input
                            value={newUsername}
                            onChange={(e) => setNewUsername(e.target.value)}
                            placeholder="새 닉네임"
                            autoFocus
                        />
                    </div>
                    <div>
                        <p className="text-sm text-[#78716C] mb-1.5">현재 비밀번호를 입력하시오</p>
                        <Input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="비밀번호"
                        />
                    </div>
                    {modalError && <p className="text-sm text-[#DC2626]">{modalError}</p>}
                </div>
            </Modal>
        </div>
    );
}