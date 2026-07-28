import { useState, useEffect } from 'react';
import { useNavigate, useParams, Navigate } from 'react-router-dom';
import { createPost, updateOwnPost, getPost } from '../api/post';
import { useAuth} from "../context/authcontext.tsx";
import { validatePost } from '../utils/validation';
import { PATHS} from "../router/path.ts";
import type { Post, PostInput } from '../type/type';
import Button from './button';
import Input from './Input';

export default function PostForm() {
    const { user } = useAuth();
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = Boolean(id);

    const [form, setForm] = useState<PostInput>({ title: '', content: '' });
    const [error, setError] = useState('');

    useEffect(() => {
        if (id) {
            getPost(id).then((post: Post) => {
                setForm({ title: post.title, content: post.content });
            });
        }
    }, [id]);

    if (!user) return <Navigate to={PATHS.LOGIN} replace />;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        const validationError = validatePost(form.title, form.content);
        if (validationError) {
            setError(validationError);
            return;
        }

        try {
            if (isEdit && id) {
                const pw = prompt('비밀번호를 입력하세요');
                if (!pw) return;
                await updateOwnPost(id, user.username, pw, form.title, form.content);
                navigate(PATHS.POST_DETAIL(id));
            } else {
                const newPost = await createPost(form, user.id);
                navigate(PATHS.POST_DETAIL(newPost.id));
            }
        } catch (err) {
            console.error(err);
            setError('저장에 실패했습니다. (수정 시 비밀번호를 확인해주세요)');
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-[#E7E5DF] p-8">
            <h2 className="text-xl font-bold text-[#1C1917] mb-6">{isEdit ? '글 수정' : '글쓰기'}</h2>

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
        </div>
    );
}