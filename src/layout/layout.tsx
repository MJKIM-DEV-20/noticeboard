// src/imports/layout.tsx
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth} from "../context/authcontext.tsx";
import { PATHS} from "../router/path.ts";

export default function Layout() {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();
    const [search, setSearch] = useState('');

    const handleLogout = async () => {
        await signOut();
        navigate(PATHS.HOME);
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        navigate(`${PATHS.POSTS}?q=${encodeURIComponent(search)}`);
    };

    return (
        <div className="min-h-screen flex flex-col bg-[#F6F4EF]">
            <nav className="sticky top-0 z-10 bg-white border-b border-[#E7E5DF]">
                <div className="max-w-5xl mx-auto px-[50px] h-16 flex items-center justify-between gap-4">
                    <Link to={PATHS.HOME} className="font-bold text-lg text-[#5B5BD6] shrink-0">
                        게시판
                    </Link>

                    <form onSubmit={handleSearch} className="flex-1 max-w-md">
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="검색"
                            className="w-full px-4 py-2 rounded-xl border border-[#E7E5DF] text-sm outline-none focus:ring-2 focus:ring-[#5B5BD6]"
                        />
                    </form>

                    <div className="flex items-center gap-4 text-sm shrink-0">
                        {user ? (
                            <>
                                <Link
                                    to={PATHS.MYPAGE}
                                    className="w-8 h-8 rounded-full bg-[#5B5BD6] text-white flex items-center justify-center text-xs font-bold"
                                >
                                    {user.username.charAt(0).toUpperCase()}
                                </Link>
                                <Link to={PATHS.MYPAGE} className="text-[#1C1917] hover:text-[#5B5BD6]">
                                    {user.username}
                                </Link>
                                <button onClick={handleLogout} className="text-[#78716C] hover:text-[#1C1917]">
                                    로그아웃
                                </button>
                            </>
                        ) : (
                            <Link to={PATHS.LOGIN}>
                                <button className="px-4 py-2 rounded-xl bg-[#5B5BD6] text-white font-medium">
                                    로그인
                                </button>
                            </Link>
                        )}
                    </div>
                </div>
            </nav>
            <main className="flex-1 max-w-5xl mx-auto w-full py-8 px-[50px]">
                <Outlet />
            </main>
            <footer className="text-center text-xs text-[#78716C] py-6 border-t border-[#E7E5DF] mt-12">
                Created by MJKim
            </footer>
        </div>
    );
}