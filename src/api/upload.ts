export async function uploadImage(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('image', file);

    const res = await fetch('/api/upload', {
        method: 'POST',
        credentials: 'include', // httpOnly 쿠키(token)를 요청에 실어 보내기 위해 필수
        body: formData,
        // Content-Type은 지정하지 않음 — 브라우저가 boundary 포함해서 자동 설정함
    });

    if (!res.ok) {
        const { error } = await res.json();
        throw new Error(error ?? '이미지 업로드에 실패했습니다.');
    }

    const { url } = await res.json();
    return url;
}