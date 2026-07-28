// src/pages/PostForm.tsx
import { useState, useEffect } from 'react';
import {Navigate, useNavigate, useParams} from 'react-router-dom';
import { createPost, updateOwnPost, getPost } from '../api/post';
import { useAuth} from "../context/authcontext.tsx";
import { validatePost } from '../utils/validation';
import { PATHS } from '../router/path';
import type { Post, PostInput } from '../type/type';

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

    // 훅 호출 다 끝난 다음에 조건부 리턴
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
        <form onSubmit={handleSubmit}>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="제목"
            />
            <textarea
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                placeholder="내용"
            />
            <button type="submit">{isEdit ? '수정' : '작성'}</button>
        </form>
    );
}