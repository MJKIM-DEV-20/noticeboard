// src/pages/Login.tsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth} from "../context/authcontext.tsx";
// import { validateAuth } from '../utils/validation';
import { PATHS } from '../router/path';

export default function Login() {
    const [id, setId] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { signIn } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // const validationError = validateAuth(id, password);
        // if (validationError) {
        //     setError(validationError);
        //     return;
        // }

        try {
            await signIn(id, password);
            navigate(PATHS.POSTS);
        } catch (err) {
            console.error(err);
            setError('아이디 또는 비밀번호가 일치하지 않습니다.');
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <h2>로그인</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <input
                value={id}
                onChange={(e) => setId(e.target.value)}
                placeholder="아이디"
            />
            <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호"
            />
            <button type="submit">로그인</button>
            <p>
                계정이 없으신가요? <Link to={PATHS.SIGNUP}>회원가입</Link>
            </p>
        </form>
    );
}