// src/imports/layout.tsx
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from "../context/authcontext.tsx";
import { PATHS } from "../router/path.ts";

export default function Layout() {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        signOut();
        navigate(PATHS.HOME);
    };

    return (
        <div className="min-h-screen bg-[#F6F4EF]">
            <nav className="sticky top-0 z-10 bg-white border-b border-[#E7E5DF]">
                <div className="max-w-[1120px] mx-auto px-4 md:px-6 h-16 flex items-center justify-between gap-4">
                    <Link to={PATHS.HOME} className="font-bold text-lg text-[#5B5BD6] shrink-0 tracking-[-0.01em]">
                        게시판
                    </Link>

                    <div className="flex items-center gap-1 text-[15px]">
                        <Link
                            to={PATHS.POSTS}
                            className="px-3 py-2 rounded-lg font-medium text-[#1C1917] hover:bg-[#F6F4EF] transition-colors duration-150"
                        >
                            게시글
                        </Link>

                        {user ? (
                            <>
                                <Link
                                    to={PATHS.MYPAGE}
                                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[#F6F4EF] transition-colors duration-150"
                                >
                                    <span className="w-7 h-7 rounded-full bg-[#5B5BD6] text-white flex items-center justify-center text-xs font-bold shrink-0">
                                        {user.username.charAt(0).toUpperCase()}
                                    </span>
                                    <span className="font-medium text-[#1C1917]">{user.username}</span>
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="px-3 py-2 rounded-lg font-medium text-[#78716C] hover:bg-[#F6F4EF] hover:text-[#1C1917] transition-colors duration-150"
                                >
                                    로그아웃
                                </button>
                            </>
                        ) : (
                            <>
                                <Link
                                    to={PATHS.LOGIN}
                                    className="px-3 py-2 rounded-lg font-medium text-[#1C1917] hover:bg-[#F6F4EF] transition-colors duration-150"
                                >
                                    로그인
                                </Link>
                                <Link to={PATHS.SIGNUP}>
                                    <button className="px-4 py-2 rounded-xl bg-[#5B5BD6] text-white text-[15px] font-semibold hover:bg-[#4A4AC0] transition-colors duration-150">
                                        회원가입
                                    </button>
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </nav>

            <main className="py-8 md:py-10">
                <Outlet />
            </main>

            <footer className="text-center text-xs text-[#78716C] py-8 border-t border-[#E7E5DF] mt-4">
                Created by MJKim
            </footer>
        </div>
    );
}