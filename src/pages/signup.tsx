// src/pages/SignUp.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth} from "../context/authcontext.tsx";
import { validateAuth } from '../utils/validation';
import { PATHS } from '../router/path';

export default function SignUp() {
    const [id, setId] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { signUp } = useAuth();
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
            await signUp(id, password);
            navigate(PATHS.POSTS);
        } catch (err) {
            console.error(err);
            setError('이미 존재하는 아이디입니다.');
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <h2>회원가입</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <input value={id} onChange={(e) => setId(e.target.value)} placeholder="아이디" />
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="비밀번호" />
            <button type="submit">가입하기</button>
        </form>
    );
}