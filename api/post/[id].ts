import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: VercelRequest, res: VercelResponse) {
    const { id } = req.query;

    if (typeof id !== "string") {
        return res.status(400).json({ error: "잘못된 요청입니다." });
    }

    // ── 게시글 단건 조회 + 조회수 증가 ──
    if (req.method === "GET") {
        const { data, error } = await supabase
            .from("posts")
            .select(
                "id, title, content, category, is_notice, created_at, updated_at, views, users(username)"
            )
            .eq("id", id)
            .single();

        if (error) {
            return res.status(404).json({ error: "게시글을 찾을 수 없습니다." });
        }

        supabase.rpc("increment_views", { post_id: id }).then(({ error: rpcError }) => {
            if (rpcError) console.error("조회수 증가 실패:", rpcError);
        });

        return res.status(200).json(data);
    }

    // ── 비회원 글 삭제 (아이디/비밀번호로 RPC 검증) ──
    if (req.method === "DELETE") {
        const { username, password } = req.body ?? {};

        if (!username || !password) {
            return res.status(400).json({ error: "아이디와 비밀번호를 입력해주세요." });
        }

        const { error } = await supabase.rpc("delete_own_post", {
            post_id: id,
            req_username: username,
            req_password: password,
        });

        if (error) {
            return res.status(403).json({ error: "삭제 권한이 없습니다." });
        }

        return res.status(200).json({ success: true });
    }

    // ── 비회원 글 수정 (아이디/비밀번호로 RPC 검증) ──
    if (req.method === "PATCH") {
        const { username, password, title, content } = req.body ?? {};

        if (!username || !password) {
            return res.status(400).json({ error: "아이디와 비밀번호를 입력해주세요." });
        }
        if (!title?.trim() || !content?.trim()) {
            return res.status(400).json({ error: "제목과 내용을 입력해주세요." });
        }

        const { error } = await supabase.rpc("update_own_post", {
            post_id: id,
            req_username: username,
            req_password: password,
            new_title: title,
            new_content: content,
        });

        if (error) {
            return res.status(403).json({ error: "수정 권한이 없습니다." });
        }

        return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: "지원하지 않는 요청입니다." });
}