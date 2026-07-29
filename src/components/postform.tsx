import { useState, useEffect } from 'react';
import { useNavigate, useParams, Navigate } from 'react-router-dom';
import { createPost, updateOwnPost, getPost } from '../api/post';
import { uploadImage } from '../api/upload';
import { useAuth} from "../context/authcontext.tsx";
import { validatePost } from '../utils/validation';
import { PATHS} from "../router/path.ts";
import type { Post, PostInput, } from '../type/type';
import Button from './button';
import Input from './Input';
import { CATEGORIES } from '../type/type';

export default function PostForm() {
    const { user } = useAuth();
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = Boolean(id);

    const [form, setForm] = useState<PostInput>({ title: '', content: '', category: '일상잡담', image_url: null });
    const [error, setError] = useState('');

    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        if (id) {
            getPost(id).then((post: Post) => {
                setForm({ title: post.title, content: post.content, category: post.category, image_url: post.image_url });
                if (post.image_url) setImagePreview(post.image_url);
            });
        }
    }, [id]);

    if (!user) return <Navigate to={PATHS.LOGIN} replace />;

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            setError('이미지 파일만 업로드할 수 있습니다.');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            setError('이미지 크기는 5MB 이하만 가능합니다.');
            return;
        }

        setError('');
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
    };

    const handleRemoveImage = () => {
        setImageFile(null);
        setImagePreview(null);
        setForm({ ...form, image_url: null });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        const validationError = validatePost(form.title, form.content);
        if (validationError) {
            setError(validationError);
            return;
        }

        try {
            let imageUrl = form.image_url ?? null;

            // 새로 선택한 이미지가 있으면 먼저 업로드
            if (imageFile) {
                setUploading(true);
                imageUrl = await uploadImage(imageFile);
                setUploading(false);
            }

            if (isEdit && id) {
                const pw = prompt('비밀번호를 입력하세요');
                if (!pw) return;
                await updateOwnPost(id, user.username, pw, form.title, form.content, imageUrl);
                navigate(PATHS.POST_DETAIL(id));
            } else {
                const newPost = await createPost({ ...form, image_url: imageUrl });
                navigate(PATHS.POST_DETAIL(newPost.id));
            }
        } catch (err) {
            setUploading(false);
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

                {/* 이미지 업로드 */}
                <div>
                    <p className="text-xs text-[#78716C] mb-2">이미지 (선택, 최대 5MB)</p>
                    {imagePreview ? (
                        <div className="relative inline-block">
                            <img
                                src={imagePreview}
                                alt="미리보기"
                                className="max-h-56 rounded-xl border border-[#E7E5DF] object-cover"
                            />
                            <button
                                type="button"
                                onClick={handleRemoveImage}
                                className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-[#1C1917] text-white text-sm flex items-center justify-center"
                            >
                                ✕
                            </button>
                        </div>
                    ) : (
                        <label className="flex items-center justify-center h-32 rounded-xl border-2 border-dashed border-[#E7E5DF] text-sm text-[#78716C] cursor-pointer hover:bg-[#F6F4EF] transition-colors duration-150">
                            이미지를 선택하세요
                            <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                        </label>
                    )}
                </div>

                <div className="flex justify-end">
                    <Button type="submit" variant="primary" disabled={uploading}>
                        {uploading ? '업로드 중...' : isEdit ? '수정' : '작성'}
                    </Button>
                </div>
            </form>
        </div>
    );
}