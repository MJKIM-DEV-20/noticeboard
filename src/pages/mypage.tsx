// src/imports/mypage.tsx
import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth} from "../context/authcontext.tsx";
import { getMyPosts } from '../api/post';
import { updateUsername } from '../api/auth';
import { PATHS} from "../router/path.ts";
import type { Post } from '../type/type';

export default function MyPage() {
    const { user, updateUser } = useAuth();
    const [myPosts, setMyPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);

    const [editing, setEditing] = useState(false);
    const [newUsername, setNewUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (user) {
            getMyPosts(user.id)
                .then(setMyPosts)
                .finally(() => setLoading(false));
        }
    }, [user]);

    if (!user) return <Navigate to={PATHS.LOGIN} replace />;

    const handleUpdateUsername = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!newUsername.trim()) {
            setError('새 아이디를 입력해주세요.');
            return;
        }

        try {
            await updateUsername(user.id, password, newUsername);
            updateUser({ ...user, username: newUsername });
            setEditing(false);
            setPassword('');
            setNewUsername('');
        } catch (err: any) {
            setError(err.message ?? '변경에 실패했습니다.');
        }
    };

    return (
        <div className="space-y-8">
            <section className="bg-white rounded-2xl shadow-sm border border-[#E7E5DF] p-6">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-[#5B5BD6] text-white flex items-center justify-center text-xl font-bold shrink-0">
                        {user.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <p className="font-bold text-[#1C1917] text-lg">{user.username}</p>
                        <p className="text-sm text-[#78716C]">내 계정</p>
                    </div>
                </div>

                {editing ? (
                    <form onSubmit={handleUpdateUsername} className="mt-4 pt-4 border-t border-[#E7E5DF] space-y-2">
                        {error && <p className="text-xs text-[#DC2626]">{error}</p>}
                        <input
                            value={newUsername}
                            onChange={(e) => setNewUsername(e.target.value)}
                            placeholder="새 아이디"
                            className="w-full px-3 py-2 rounded-lg border border-[#E7E5DF] text-sm outline-none focus:ring-2 focus:ring-[#5B5BD6]"
                        />
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="현재 비밀번호 확인"
                            className="w-full px-3 py-2 rounded-lg border border-[#E7E5DF] text-sm outline-none focus:ring-2 focus:ring-[#5B5BD6]"
                        />
                        <div className="flex gap-3">
                            <button type="submit" className="text-sm text-[#5B5BD6] font-medium">저장</button>
                            <button
                                type="button"
                                onClick={() => { setEditing(false); setError(''); }}
                                className="text-sm text-[#78716C]"
                            >
                                취소
                            </button>
                        </div>
                    </form>
                ) : (
                    <button
                        onClick={() => setEditing(true)}
                        className="text-xs text-[#5B5BD6] mt-3 pt-3 border-t border-[#E7E5DF] w-full text-left"
                    >
                        닉네임 변경
                    </button>
                )}
            </section>

            <section>
                <h2 className="text-lg font-bold text-[#1C1917] mb-3">
                    내가 쓴 게시글 {!loading && `(${myPosts.length})`}
                </h2>
                {loading ? (
                    <p className="text-[#78716C] text-sm">로딩중...</p>
                ) : myPosts.length === 0 ? (
                    <p className="text-[#78716C] text-sm py-8 text-center bg-white rounded-2xl border border-[#E7E5DF]">
                        작성한 게시글이 없습니다.
                    </p>
                ) : (
                    <div className="bg-white rounded-2xl border border-[#E7E5DF] shadow-sm divide-y divide-[#E7E5DF] overflow-hidden">
                        {myPosts.map((post) => (
                            <Link
                                key={post.id}
                                to={PATHS.POST_DETAIL(post.id)}
                                className="flex items-center justify-between px-5 py-4 hover:bg-[#F6F4EF] transition-colors duration-150"
                            >
                                <span className="text-[#1C1917] font-medium truncate">{post.title}</span>
                                <span className="text-[#78716C] text-sm shrink-0 ml-4">
                  {new Date(post.created_at).toLocaleDateString()}
                </span>
                            </Link>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}