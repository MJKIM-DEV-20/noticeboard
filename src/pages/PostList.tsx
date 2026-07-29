// src/imports/PostList.tsx
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getPosts } from '../api/post';
import { PATHS } from "../router/path.ts";
import {CATEGORIES, type Post} from '../type/type';
import Input from "../components/Input.tsx";
import Button from "../components/button.tsx";
const PAGE_SIZE = 8;

export default function PostList() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [searchParams, setSearchParams] = useSearchParams();
    const [searchInput, setSearchInput] = useState(searchParams.get('q') ?? '');
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

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


    const setPage = (p: number) => {
        setSearchParams((prev) => {
            const next = new URLSearchParams(prev);
            next.set('page', String(p));
            return next;
        });
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setSearchParams({ page: '1', q: searchInput });
    };

    const handleResetSearch = () => {
        setSearchInput('');
        setSearchParams({ page: '1' });
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
        <div>
            {/* 헤더 */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-[#1C1917]">게시글 피드</h2>
                    {!loading && <p className="text-sm text-[#78716C] mt-1">전체 {totalCount}개의 글</p>}
                </div>
                <Button variant="primary" onClick={() => navigate(PATHS.POST_NEW)}>
                    글쓰기
                </Button>
            </div>
            <div className="flex gap-2 mb-4 flex-wrap">
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
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors duration-150 ${
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
            <form onSubmit={handleSearch} className="flex gap-2 mb-6">
                <Input
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="제목이나 내용으로 검색"
                />
                <Button type="submit" variant="default">검색</Button>
                {search && (
                    <Button type="button" variant="default" onClick={handleResetSearch}>
                        초기화
                    </Button>
                )}
            </form>

            {/* 피드 */}
            {loading ? (
                <div className="space-y-3">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-32 rounded-2xl bg-[#E7E5DF] animate-pulse" />
                    ))}
                </div>
            ) : posts.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl border border-[#E7E5DF]">
                    <p className="text-[#78716C]">
                        {search ? `"${search}"에 대한 검색 결과가 없습니다.` : '아직 작성된 글이 없습니다.'}
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {posts.map((post) => (
                        <article
                            key={post.id}
                            onClick={() => navigate(PATHS.POST_DETAIL(post.id))}
                            className="bg-white rounded-2xl border border-[#E7E5DF] shadow-sm p-6 cursor-pointer hover:shadow-md hover:border-[#5B5BD6]/30 transition-all duration-150"
                        >
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-full bg-[#5B5BD6] text-white flex items-center justify-center font-bold shrink-0">
                                    {(post.users?.username ?? '?').charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-[#1C1917]">
                                        {post.users?.username ?? '알수없음'}
                                    </p>
                                    <p className="text-xs text-[#78716C]">
                                        {new Date(post.created_at).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                            <h3 className="text-lg font-bold text-[#1C1917] mb-1.5">{truncateText(post.title, 30)}</h3>
                            <p className="text-[#78716C] text-sm line-clamp-2 mb-2">{post.content}</p>
                            <p className="text-xs text-[#78716C] flex items-center gap-1">
                                <i className="ti ti-eye" style={{ fontSize: 14 }}></i>
                                조회 {post.views}
                            </p>
                        </article>
                    ))}
                </div>
            )}

            {/* 페이지네이션 */}
            {!loading && totalPages > 1 && (
                <div className="flex justify-center gap-1.5 mt-8">
                    <button
                        onClick={() => setPage(groupStart - 1)}
                        disabled={groupStart === 1}
                        className="w-9 h-9 rounded-lg border border-[#E7E5DF] bg-white text-[#1C1917] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#F6F4EF] transition-colors duration-150"
                    >
                        ‹
                    </button>
                    {pageNumbers.map((p) => (
                        <button
                            key={p}
                            onClick={() => setPage(p)}
                            className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors duration-150 ${
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
                        className="w-9 h-9 rounded-lg border border-[#E7E5DF] bg-white text-[#1C1917] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#F6F4EF] transition-colors duration-150"
                    >
                        ›
                    </button>
                </div>
            )}
        </div>
    );
}