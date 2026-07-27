import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth} from "../context/authcontext.tsx";
import { PATHS} from "../router/path.ts";

export default function Signup() {
    const [id, setId] = useState('');
    const [password, setPassword] = useState('');
    const { signIn } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            await signIn(id, password);
            navigate(PATHS.POSTS);
        } catch {
            alert('회원가입 실패');
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
            <button type="submit">회원가입</button>
        </form>
    );
}