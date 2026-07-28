// src/utils/validation.ts
export function validatePost(title: string, content: string): string | null {
    if (!title.trim()) return '제목을 입력해주세요.';
    if (title.trim().length > 100) return '제목은 100자 이내로 입력해주세요.';
    if (!content.trim()) return '내용을 입력해주세요.';
    if (content.trim().length > 5000) return '내용은 5000자 이내로 입력해주세요.';
    return null;
}

export function validateAuth(username: string, password: string): string | null {
    if (!username.trim()) return '아이디를 입력해주세요.';
    if (username.trim().length < 3) return '아이디는 3자 이상이어야 합니다.';
    if (!/^[a-zA-Z0-9_]+$/.test(username)) return '아이디는 영문, 숫자, 언더스코어만 가능합니다.';
    if (isAdminLikeUsername(username)) return '사용할 수 없는 아이디입니다.';
    if (!password) return '비밀번호를 입력해주세요.';
    if (password.length < 4) return '비밀번호는 4자 이상이어야 합니다.';
    return null;
}


const ADMIN_LIKE_PATTERN = /^(admin|관리자)\s*\d*$/i;

export function isAdminLikeUsername(username: string): boolean {
    const normalized = username.trim().replace(/\s+/g, '');
    return ADMIN_LIKE_PATTERN.test(normalized);
}