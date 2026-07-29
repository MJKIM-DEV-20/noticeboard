import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth} from "../context/authcontext.tsx";
import { validateAuth } from '../utils/validation';
import { PATHS} from "../router/path.ts";
import Button from "../components/button.tsx";
import Input from "../components/Input.tsx";
import toast from 'react-hot-toast';


export default function Login() {
    const [id, setId] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { signIn } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        const validationError = validateAuth(id, password);
        if (validationError) {
            setError(validationError);
            return;
        }

        try {
            await signIn(id, password);
            toast.success(`환영합니다!`);
            navigate(PATHS.POSTS);
        } catch (err) {
            console.error(err);
            setError('아이디 또는 비밀번호가 일치하지 않습니다.');
        }
    };

    return (
        <div className="max-w-md mx-auto mt-20 px-4">
            <div className="bg-white rounded-2xl shadow-sm border border-[#E7E5DF] p-9 md:p-10">
                <h2 className="text-2xl font-bold text-[#1C1917] mb-8 text-center tracking-[-0.01em]">로그인</h2>

                {error && (
                    <div className="mb-6 px-4 py-3.5 rounded-xl bg-red-50 border border-red-200 text-[#DC2626] text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-3.5">
                    <Input value={id} onChange={(e) => setId(e.target.value)} placeholder="아이디" />
                    <Input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="비밀번호"
                    />
                    <Button type="submit" variant="primary" className="w-full mt-2">로그인</Button>
                </form>

                <p className="text-center text-sm text-[#78716C] mt-7">
                    계정이 없으신가요?{' '}
                    <Link to={PATHS.SIGNUP} className="text-[#5B5BD6] font-medium hover:underline">
                        회원가입
                    </Link>
                </p>
            </div>
        </div>
    );
}