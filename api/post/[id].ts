import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";

const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// username/password로 실제 작성자가 맞는지 확인하고, 맞으면 해당 게시글 정보를 반환
async function verifyOwner(postId: string, username: string, password: string) {
    // 1. 게시글 작성자(user_id) 확인
    const { data: post, error: postError } = await supabase
        .from("posts")
        .select("id, user_id")
        .eq("id", postId)
        .single();

    if (postError || !post) {
        return { ok: false as const, reason: "게시글을 찾을 수 없습니다." };
    }

    // 2. 입력한 username에 해당하는 유저 확인
    const { data: user, error: userError } = await supabase
        .from("users")
        .select("id, password")
        .eq("username", username)
        .single();

    if (userError || !user) {
        return { ok: false as const, reason: "권한이 없습니다." };
    }

    // 3. 비밀번호 검증 (해시 / 구버전 평문 둘 다 대응)
    const isHashed = user.password.startsWith("$2a$") || user.password.startsWith("$2b$");
    const isValid = isHashed
        ? await bcrypt.compare(password, user.password)
        : password === user.password;

    if (!isValid) {
        return { ok: false as const, reason: "권한이 없습니다." };
    }

    // 4. 이 게시글의 실제 작성자가 맞는지 확인
    if (post.user_id !== user.id) {
        return { ok: false as const, reason: "권한이 없습니다." };
    }

    return { ok: true as const };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    try {
        const { id } = req.query;

        if (typeof id !== "string") {
            return res.status(400).json({ error: "잘못된 요청입니다." });
        }

        // ── 게시글 단건 조회 + 조회수 증가 ──
        if (req.method === "GET") {
            const { data, error } = await supabase
                .from("posts")
                .select(
                    "id, title, content, category, is_notice, created_at, updated_at, views, user_id, image_url, users(username)"
                )
                .eq("id", id)
                .single();

            if (error) {
                console.error("GET /api/post/[id] 에러:", error);
                return res.status(404).json({ error: "게시글을 찾을 수 없습니다." });
            }

            supabase.rpc("increment_views", { post_id: id }).then(({ error: rpcError }) => {
                if (rpcError) console.error("조회수 증가 실패:", rpcError);
            });

            return res.status(200).json(data);
        }

        // ── 비회원 글 삭제 (아이디/비밀번호로 검증) ──
        if (req.method === "DELETE") {
            const { username, password } = req.body ?? {};

            if (!username || !password) {
                return res.status(400).json({ error: "아이디와 비밀번호를 입력해주세요." });
            }

            const check = await verifyOwner(id, username, password);
            if (!check.ok) {
                return res.status(403).json({ error: check.reason });
            }

            const { error } = await supabase.from("posts").delete().eq("id", id);

            if (error) {
                console.error("DELETE /api/post/[id] 에러:", error);
                return res.status(500).json({ error: error.message });
            }

            return res.status(200).json({ success: true });
        }

        // ── 비회원 글 수정 (아이디/비밀번호로 검증) ──
        if (req.method === "PATCH") {
            const { username, password, title, content, image_url } = req.body ?? {};

            if (!username || !password) {
                return res.status(400).json({ error: "아이디와 비밀번호를 입력해주세요." });
            }
            if (!title?.trim() || !content?.trim()) {
                return res.status(400).json({ error: "제목과 내용을 입력해주세요." });
            }

            const check = await verifyOwner(id, username, password);
            if (!check.ok) {
                return res.status(403).json({ error: check.reason });
            }

            const { error } = await supabase
                .from("posts")
                .update({
                    title,
                    content,
                    ...(image_url !== undefined ? { image_url } : {}),
                    updated_at: new Date().toISOString(),
                })
                .eq("id", id);

            if (error) {
                console.error("PATCH /api/post/[id] 에러:", error);
                return res.status(500).json({ error: error.message });
            }

            return res.status(200).json({ success: true });
        }

        return res.status(405).json({ error: "지원하지 않는 요청입니다." });
    } catch (err: any) {
        console.error("API 처리 중 예외 발생:", err);
        return res.status(500).json({ error: err?.message ?? "알 수 없는 서버 에러가 발생했습니다." });
    }
}