import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth} from "../context/authcontext.tsx";
import { PATHS} from "../router/path.ts";

export default function Login() {
    const [id, setId] = useState('');
    const [password, setPassword] = useState('');
    const { signIn } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await signIn(id, password);
            navigate(PATHS.POSTS);
        } catch {
            alert('로그인 실패');
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <input value={id} onChange={(e) => setId(e.target.value)} placeholder="아이디" />
            <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호"
            />
            <button type="submit">로그인</button>
        </form>
    );
}