import { useState, useEffect } from 'react';
import { useNavigate, useParams, Navigate } from 'react-router-dom';
import { createPost, updateOwnPost, deleteOwnPost, getPost } from '../api/post';
import { useAuth } from "../context/authcontext.tsx";
import { validatePost } from '../utils/validation';
import { PATHS } from "../router/path.ts";
import type { Post, PostInput } from '../type/type';
import Button from './button';
import Input from './Input';
import { Modal } from './Modal';
import { CATEGORIES } from '../type/type';

type ModalMode = 'edit' | 'delete' | null;

export default function PostForm() {
    const { user } = useAuth();
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = Boolean(id);

    const [form, setForm] = useState<PostInput>({ title: '', content: '', category: '일상잡담' });
    const [error, setError] = useState('');

    // 모달 관련 상태
    const [modalMode, setModalMode] = useState<ModalMode>(null);
    const [password, setPassword] = useState('');
    const [modalError, setModalError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (id) {
            getPost(id).then((post: Post) => {
                setForm({ title: post.title, content: post.content, category: post.category });
            });
        }
    }, [id]);

    if (!user) return <Navigate to={PATHS.LOGIN} replace />;

    const closeModal = () => {
        setModalMode(null);
        setPassword('');
        setModalError('');
        setSubmitting(false);
    };

    // 글쓰기/수정 폼 제출 -> 수정이면 모달 오픈, 아니면 바로 생성
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        const validationError = validatePost(form.title, form.content);
        if (validationError) {
            setError(validationError);
            return;
        }

        if (isEdit) {
            setModalMode('edit');
        } else {
            handleCreate();
        }
    };

    const handleCreate = async () => {
        try {
            const newPost = await createPost(form);
            navigate(PATHS.POST_DETAIL(newPost.id));
        } catch (err) {
            console.error(err);
            setError('작성에 실패했습니다.');
        }
    };

    // 모달 안에서 비밀번호 확인 후 실제 수정 요청
    const handleConfirmEdit = async () => {
        if (!id) return;
        if (!password) {
            setModalError('비밀번호를 입력하세요.');
            return;
        }
        setSubmitting(true);
        setModalError('');
        try {
            await updateOwnPost(id, user.username, password, form.title, form.content);
            closeModal();
            navigate(PATHS.POST_DETAIL(id));
        } catch (err) {
            console.error(err);
            setModalError('비밀번호가 일치하지 않거나 수정에 실패했습니다.');
            setSubmitting(false);
        }
    };

    // 삭제 확인 모달 안에서 실제 삭제 요청
    const handleConfirmDelete = async () => {
        if (!id) return;
        if (!password) {
            setModalError('비밀번호를 입력하세요.');
            return;
        }
        setSubmitting(true);
        setModalError('');
        try {
            await deleteOwnPost(id, user.username, password);
            closeModal();
            navigate(PATHS.HOME ?? '/');
        } catch (err) {
            console.error(err);
            setModalError('비밀번호가 일치하지 않거나 삭제에 실패했습니다.');
            setSubmitting(false);
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-[#E7E5DF] p-8">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-[#1C1917]">{isEdit ? '글 수정' : '글쓰기'}</h2>

                {isEdit && (
                    <button
                        type="button"
                        onClick={() => setModalMode('delete')}
                        className="text-sm text-[#DC2626] hover:underline"
                    >
                        삭제
                    </button>
                )}
            </div>

            {error && (
                <div className="mb-5 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-[#DC2626] text-sm">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="제목"
                />

                <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value as any })}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#E7E5DF] bg-white text-[#1C1917] outline-none focus:ring-2 focus:ring-[#5B5BD6]"
                >
                    {CATEGORIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                    ))}
                </select>

                <textarea
                    value={form.content}
                    onChange={(e) => setForm({ ...form, content: e.target.value })}
                    placeholder="내용을 입력하세요"
                    rows={10}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#E7E5DF] bg-white text-[#1C1917] placeholder:text-[#78716C] outline-none resize-none transition-shadow duration-150 focus:ring-2 focus:ring-[#5B5BD6] focus:border-[#5B5BD6]"
                />
                <div className="flex justify-end">
                    <Button type="submit" variant="primary">{isEdit ? '수정' : '작성'}</Button>
                </div>
            </form>

            {/* 수정 확인 모달 */}
            <Modal
                open={modalMode === 'edit'}
                title="비밀번호 확인"
                onClose={closeModal}
                footer={
                    <>
                        <Button variant="default" onClick={closeModal}>취소</Button>
                        <Button variant="primary" onClick={handleConfirmEdit} disabled={submitting}>
                            {submitting ? '처리 중...' : '확인'}
                        </Button>
                    </>
                }
            >
                <p className="text-sm text-[#78716C] mb-3">글을 수정하려면 비밀번호를 입력하세요.</p>
                <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="비밀번호"
                    autoFocus
                />
                {modalError && <p className="mt-2 text-sm text-[#DC2626]">{modalError}</p>}
            </Modal>

            {/* 삭제 확인 모달 */}
            <Modal
                open={modalMode === 'delete'}
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
                <p className="text-sm text-[#78716C] mb-3">
                    정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
                </p>
                <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="비밀번호"
                    autoFocus
                />
                {modalError && <p className="mt-2 text-sm text-[#DC2626]">{modalError}</p>}
            </Modal>
        </div>
    );
}