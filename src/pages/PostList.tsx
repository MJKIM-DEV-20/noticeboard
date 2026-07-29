// src/imports/PostList.tsx
import { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getPosts } from '../api/post';
import { PATHS } from "../router/path.ts";
import { CATEGORIES, type Post } from '../type/type';
import Input from "../components/Input.tsx";
import Button from "../components/button.tsx";
import { getCategoryStyle, getAvatarColor } from '../utils/style';
const PAGE_SIZE = 8;
const DEBOUNCE_MS = 400;

export default function PostList() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [searchParams, setSearchParams] = useSearchParams();
    const [searchInput, setSearchInput] = useState(searchParams.get('q') ?? '');
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const page = Number(searchParams.get('page') ?? '1');
    const search = searchParams.get('q') ?? '';
    const category = searchParams.get('category') ?? undefined;

    useEffect(() => {
        setLoading(true);
        getPosts(page, PAGE_SIZE, search, category)
            .then(({ posts, totalCount }) => {
                setPosts(posts);
                setTotalCount(totalCount);
            })
            .catch((err) => console.error('getPosts error:', err))
            .finally(() => setLoading(false));
    }, [page, search, category]);

    // 입력값이 바뀔 때마다 디바운스 걸어서 자동 검색
    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);

        debounceRef.current = setTimeout(() => {
            setSearchParams((prev) => {
                const next = new URLSearchParams(prev);
                if (searchInput.trim()) next.set('q', searchInput);
                else next.delete('q');
                next.set('page', '1');
                return next;
            });
        }, DEBOUNCE_MS);

        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchInput]);

    const setPage = (p: number) => {
        setSearchParams((prev) => {
            const next = new URLSearchParams(prev);
            next.set('page', String(p));
            return next;
        });
    };

    // 버튼 클릭 시 디바운스 기다리지 않고 즉시 실행
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (debounceRef.current) clearTimeout(debounceRef.current);
        setSearchParams((prev) => {
            const next = new URLSearchParams(prev);
            if (searchInput.trim()) next.set('q', searchInput);
            else next.delete('q');
            next.set('page', '1');
            return next;
        });
    };

    const handleResetSearch = () => {
        setSearchInput('');
        setSearchParams((prev) => {
            const next = new URLSearchParams(prev);
            next.delete('q');
            next.set('page', '1');
            return next;
        });
    };

    const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

    const GROUP_SIZE = 5;
    const groupStart = Math.floor((page - 1) / GROUP_SIZE) * GROUP_SIZE + 1;
    const groupEnd = Math.min(groupStart + GROUP_SIZE - 1, totalPages);
    const pageNumbers = Array.from(
        { length: groupEnd - groupStart + 1 },
        (_, i) => groupStart + i
    );

    function truncateText(text: string, maxLength: number) {
        if (text.length <= maxLength) return text;
        return text.slice(0, maxLength) + '...';
    }

    return (
        <div className="max-w-[860px] mx-auto px-4">
            {/* 헤더 */}
            <div className="flex items-center justify-between mb-7 gap-4">
                <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-[#1C1917] tracking-[-0.01em]">게시글 피드</h2>
                    {!loading && <p className="text-[15px] text-[#78716C] mt-1.5">전체 {totalCount}개의 글</p>}
                </div>
                <Button variant="primary" onClick={() => navigate(PATHS.POST_NEW)}>
                    글쓰기
                </Button>
            </div>
            <div className="flex gap-2 mb-5 flex-wrap">
                {CATEGORIES.map((cat) => (
                    <button
                        key={cat}
                        onClick={() => setSearchParams((prev) => {
                            const next = new URLSearchParams(prev);
                            if (category === cat) next.delete('category');
                            else next.set('category', cat);
                            next.set('page', '1');
                            return next;
                        })}
                        className={`px-4 py-2 rounded-full text-[13px] font-semibold transition-colors duration-150 ${
                            category === cat
                                ? 'bg-[#5B5BD6] text-white'
                                : 'bg-white border border-[#E7E5DF] text-[#78716C] hover:bg-[#F6F4EF]'
                        }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* 검색 */}
            <form onSubmit={handleSearch} className="flex gap-2 mb-7">
                <div className="relative flex-1">
                    <svg
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#78716C]"
                        width="18" height="18" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                    >
                        <circle cx="11" cy="11" r="8" />
                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    <Input
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        placeholder="제목이나 내용으로 검색"
                        className="pl-10"
                    />
                </div>
                <Button type="submit" variant="default">검색</Button>
                {search && (
                    <Button type="button" variant="default" onClick={handleResetSearch}>
                        초기화
                    </Button>
                )}
            </form>

            {/* 피드 */}
            {loading ? (
                <div className="space-y-4">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-36 rounded-2xl bg-[#E7E5DF] animate-pulse" />
                    ))}
                </div>
            ) : posts.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl border border-[#E7E5DF]">
                    <div className="w-14 h-14 rounded-full bg-[#F6F4EF] flex items-center justify-center mx-auto mb-4 text-2xl">
                        {search ? '🔍' : '📝'}
                    </div>
                    <p className="text-[15px] text-[#1C1917] font-semibold mb-1.5">
                        {search ? `"${search}"에 대한 검색 결과가 없습니다` : '아직 작성된 글이 없어요'}
                    </p>
                    <p className="text-sm text-[#78716C] mb-6">
                        {search ? '다른 키워드로 다시 검색해보세요.' : '이 카테고리의 첫 번째 글을 남겨보세요.'}
                    </p>
                    {!search && (
                        <Button variant="primary" onClick={() => navigate(PATHS.POST_NEW)}>
                            글쓰기
                        </Button>
                    )}
                </div>
            ) : (
                <div className="space-y-4">
                    {posts.map((post) => {
                        const username = post.users?.username ?? '알수없음';
                        const categoryStyle = getCategoryStyle(post.category);
                        const avatarColor = getAvatarColor(username);
                        return (
                            <article
                                key={post.id}
                                onClick={() => navigate(PATHS.POST_DETAIL(post.id))}
                                className="bg-white rounded-2xl border border-[#E7E5DF] shadow-sm p-6 md:p-7 cursor-pointer hover:shadow-md hover:border-[#5B5BD6]/30 transition-all duration-150"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3.5">
                                        <div
                                            className="w-11 h-11 rounded-full text-white flex items-center justify-center font-bold text-[15px] shrink-0"
                                            style={{ backgroundColor: avatarColor }}
                                        >
                                            {username.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="text-[15px] font-semibold text-[#1C1917]">
                                                {username}
                                            </p>
                                            <p className="text-xs text-[#78716C] mt-0.5">
                                                {new Date(post.created_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    {post.category && (
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold shrink-0 ${categoryStyle.bg} ${categoryStyle.text}`}>
                                            {post.category}
                                        </span>
                                    )}
                                </div>
                                <h3 className="text-xl font-bold text-[#1C1917] mb-2 tracking-[-0.01em]">{truncateText(post.title, 30)}</h3>
                                <p className="text-[#78716C] text-[15px] leading-relaxed line-clamp-2 mb-3">{post.content}</p>
                                <p className="text-xs text-[#78716C] flex items-center gap-1">
                                    <i className="ti ti-eye" style={{ fontSize: 14 }}></i>
                                    조회 {post.views}
                                </p>
                            </article>
                        );
                    })}
                </div>
            )}

            {/* 페이지네이션 */}
            {!loading && totalPages > 1 && (
                <div className="flex justify-center gap-1.5 mt-9">
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
        </div>
    );
}