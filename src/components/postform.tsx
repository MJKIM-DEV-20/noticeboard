// src/pages/PostForm.tsx
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createPost, updatePost, getOnePost } from '../api/post';
import { PATHS} from "../router/path.ts";
import type { Post, PostInput } from '../type/type';

export default function PostForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = Boolean(id);

    const [form, setForm] = useState<PostInput>({
        title: '',
        content: '',
        author: '',
    });

    useEffect(() => {
        if (id) {
            getOnePost(id).then((post: Post) => {
                setForm({ title: post.title, content: post.content, author: post.author ?? '' });
            });
        }
    }, [id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isEdit && id) {
            await updatePost(id, form);
            navigate(PATHS.POST_DETAIL(id));
        } else {
            const newPost = await createPost(form);
            navigate(PATHS.POST_DETAIL(newPost.id));
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="제목"
                required
            />
            <textarea
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                placeholder="내용"
                required
            />
            <input
                value={form.author}
                onChange={(e) => setForm({ ...form, author: e.target.value })}
                placeholder="작성자"
            />
            <button type="submit">{isEdit ? '수정' : '작성'}</button>
        </form>
    );
}