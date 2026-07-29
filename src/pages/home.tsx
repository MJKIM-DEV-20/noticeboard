// src/imports/home.tsx
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getPosts, getTopViewedPosts } from '../api/post';
import { PATHS } from "../router/path.ts";
import type { Post } from '../type/type';
import { getRankStyle } from '../utils/style';

const CATEGORIES = ['일상잡담', '음식이야기', '랜덤에피소드', '회사생활', '소소한고민'];

export default function Home() {
    const [recentPosts, setRecentPosts] = useState<Post[]>([]);
    const [topPosts, setTopPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        setLoading(true);
        Promise.all([
            getPosts(1, 8),
            getTopViewedPosts(5),
        ])
            .then(([{ posts }, top]) => {
                setRecentPosts(posts);
                setTopPosts(top);
            })
            .catch((err) => console.error('home data error:', err))
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="max-w-[1120px] mx-auto px-4 md:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr_280px] gap-8">
                {/* 사이드바 */}
                <aside className="space-y-1">
                    <Link to={PATHS.HOME} className="block px-4 py-2.5 rounded-xl text-[15px] font-semibold text-[#1C1917] hover:bg-white transition-colors duration-150">
                        홈
                    </Link>
                    <Link to={PATHS.POSTS} className="block px-4 py-2.5 rounded-xl text-[15px] font-semibold text-[#1C1917] hover:bg-white transition-colors duration-150">
                        게시글목록
                    </Link>
                    <div className="pt-5 pb-2 px-4 text-xs font-semibold tracking-wide text-[#78716C] uppercase">카테고리</div>
                    {CATEGORIES.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => navigate(`${PATHS.POSTS}?category=${encodeURIComponent(cat)}`)}
                            className="block w-full text-left px-4 py-2.5 rounded-xl text-[15px] text-[#1C1917] hover:bg-white transition-colors duration-150"
                        >
                            {cat}
                        </button>
                    ))}
                </aside>

                {/* 중앙: 최근게시글 */}
                <section>
                    <h2 className="text-xl md:text-2xl font-bold text-[#1C1917] mb-4 tracking-[-0.01em]">최근게시글</h2>
                    {loading ? (
                        <div className="bg-white rounded-2xl border border-[#E7E5DF] shadow-sm overflow-hidden divide-y divide-[#E7E5DF]">
                            {[...Array(8)].map((_, i) => (
                                <div key={i} className="px-6 py-5 flex items-center justify-between">
                                    <div className="h-4 w-2/3 rounded bg-[#E7E5DF] animate-pulse" />
                                    <div className="h-4 w-12 rounded bg-[#E7E5DF] animate-pulse shrink-0 ml-4" />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl border border-[#E7E5DF] shadow-sm divide-y divide-[#E7E5DF] overflow-hidden">
                            {recentPosts.map((post) => (
                                <Link
                                    key={post.id}
                                    to={PATHS.POST_DETAIL(post.id)}
                                    className="flex items-center justify-between px-6 py-5 hover:bg-[#F6F4EF] transition-colors duration-150"
                                >
                                    <span className="text-[16px] text-[#1C1917] font-semibold truncate">{post.title}</span>
                                    <span className="text-[#78716C] text-sm shrink-0 ml-4">
                                        {post.users?.username ?? '알수없음'}
                                    </span>
                                </Link>
                            ))}
                        </div>
                    )}
                </section>

                {/* 오른쪽: 조회수랭킹 */}
                <aside>
                    <h2 className="text-xl md:text-2xl font-bold text-[#1C1917] mb-4 tracking-[-0.01em]">조회수랭킹</h2>
                    {loading ? (
                        <div className="bg-white rounded-2xl border border-[#E7E5DF] shadow-sm p-4 space-y-3">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="flex items-center gap-3 px-3">
                                    <div className="w-7 h-7 rounded-full bg-[#E7E5DF] animate-pulse shrink-0" />
                                    <div className="h-4 w-3/4 rounded bg-[#E7E5DF] animate-pulse" />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl border border-[#E7E5DF] shadow-sm p-4 space-y-1">
                            {topPosts.map((post, i) => {
                                const rank = i + 1;
                                const rankStyle = getRankStyle(rank);
                                return (
                                    <Link
                                        key={post.id}
                                        to={PATHS.POST_DETAIL(post.id)}
                                        className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-[#F6F4EF] transition-colors duration-150"
                                    >
                                        <span className={`flex items-center justify-center w-7 h-7 rounded-full text-sm font-bold shrink-0 ${rankStyle.bg} ${rankStyle.text}`}>
                                            {rank}
                                        </span>
                                        <span className="text-[15px] text-[#1C1917] font-medium truncate">{post.title}</span>
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </aside>
            </div>
        </div>
    );
}