// src/imports/home.tsx
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getPosts, getTopViewedPosts } from '../api/post';
import { PATHS} from "../router/path.ts";
import type { Post } from '../type/type';

const CATEGORIES = ['일상잡담', '음식이야기', '랜덤에피소드', '회사생활', '소소한고민'];

export default function Home() {
    const [recentPosts, setRecentPosts] = useState<Post[]>([]);
    const [topPosts, setTopPosts] = useState<Post[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        getPosts(1, 8).then(({ posts }) => setRecentPosts(posts));
        getTopViewedPosts(5).then(setTopPosts);
    }, []);

    return (
        <div className="grid grid-cols-[180px_1fr_260px] gap-6">
            {/* 사이드바 */}
            <aside className="space-y-1">
                <Link to={PATHS.HOME} className="block px-3 py-2 rounded-lg text-sm font-medium text-[#1C1917] hover:bg-white">
                    홈
                </Link>
                <Link to={PATHS.POSTS} className="block px-3 py-2 rounded-lg text-sm font-medium text-[#1C1917] hover:bg-white">
                    게시글목록
                </Link>
                <div className="pt-3 pb-1 px-3 text-xs font-medium text-[#78716C]">카테고리</div>
                {CATEGORIES.map((cat) => (
                    <button
                        key={cat}
                        onClick={() => navigate(`${PATHS.POSTS}?category=${encodeURIComponent(cat)}`)}
                        className="block w-full text-left px-3 py-2 rounded-lg text-sm text-[#1C1917] hover:bg-white"
                    >
                        {cat}
                    </button>
                ))}
            </aside>

            {/* 중앙: 최근게시글 */}
            <section>
                <h2 className="text-lg font-bold text-[#1C1917] mb-3">최근게시글</h2>
                <div className="bg-white rounded-2xl border border-[#E7E5DF] shadow-sm divide-y divide-[#E7E5DF] overflow-hidden">
                    {recentPosts.map((post) => (
                        <Link
                            key={post.id}
                            to={PATHS.POST_DETAIL(post.id)}
                            className="flex items-center justify-between px-5 py-4 hover:bg-[#F6F4EF] transition-colors duration-150"
                        >
                            <span className="text-[#1C1917] font-medium truncate">{post.title}</span>
                            <span className="text-[#78716C] text-sm shrink-0 ml-4">
                {post.users?.username ?? '알수없음'}
              </span>
                        </Link>
                    ))}
                </div>
            </section>

            {/* 오른쪽: 조회수랭킹 */}
            <aside>
                <h2 className="text-lg font-bold text-[#1C1917] mb-3">조회수랭킹</h2>
                <div className="bg-white rounded-2xl border border-[#E7E5DF] shadow-sm p-3 space-y-1">
                    {topPosts.map((post, i) => (
                        <Link
                            key={post.id}
                            to={PATHS.POST_DETAIL(post.id)}
                            className="flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-[#F6F4EF] transition-colors duration-150"
                        >
                            <span className="text-sm font-bold text-[#5B5BD6] w-4 shrink-0">{i + 1}</span>
                            <span className="text-sm text-[#1C1917] truncate">{post.title}</span>
                        </Link>
                    ))}
                </div>
            </aside>
        </div>
    );
}