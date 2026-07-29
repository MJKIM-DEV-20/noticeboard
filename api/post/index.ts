import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";
import jwt from "jsonwebtoken";

const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Authorization: Bearer <JWT> 헤더를 자체 발급 토큰으로 검증
function getUserFromRequest(req: VercelRequest): { userId: string; username: string } | null {
    const authHeader = req.headers.authorization;
    const token = authHeader?.replace("Bearer ", "");
    if (!token) return null;

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
            userId: string;
            username: string;
        };
        return decoded;
    } catch {
        return null;
    }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    try {
        // ── 목록 조회 (공개) ──
        if (req.method === "GET") {
            const page = Number(req.query.page ?? 1);
            const pageSize = Number(req.query.pageSize ?? 10);
            const search = typeof req.query.search === "string" ? req.query.search : "";
            const category = typeof req.query.category === "string" ? req.query.category : "";

            let query = supabase
                .from("posts")
                .select(
                    "id, title, category, is_notice, created_at, views, users(username)",
                    { count: "exact" }
                )
                .order("created_at", { ascending: false });

            if (search.trim()) {
                query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`);
            }
            if (category) {
                query = query.eq("category", category);
            }

            const from = (page - 1) * pageSize;
            const to = from + pageSize - 1;

            const { data, error, count } = await query.range(from, to);

            if (error) {
                console.error("GET /api/post 에러:", error);
                return res.status(500).json({ error: error.message });
            }

            return res.status(200).json({ posts: data, totalCount: count ?? 0 });
        }

        // ── 글쓰기 (로그인 필요, 자체 JWT로 검증) ──
        if (req.method === "POST") {
            const user = getUserFromRequest(req);

            if (!user) {
                return res.status(401).json({ error: "로그인이 필요합니다." });
            }

            const { title, content, category, is_notice } = req.body ?? {};

            if (!title?.trim() || !content?.trim()) {
                return res.status(400).json({ error: "제목과 내용을 입력해주세요." });
            }

            const { data, error } = await supabase
                .from("posts")
                .insert({
                    title,
                    content,
                    category,
                    is_notice: is_notice ?? false,
                    user_id: user.userId, // 토큰에서 검증된 실제 사용자 id
                })
                .select()
                .single();

            if (error) {
                console.error("POST /api/post 에러:", error);
                return res.status(500).json({ error: error.message });
            }

            return res.status(201).json(data);
        }

        return res.status(405).json({ error: "지원하지 않는 요청입니다." });
    } catch (err: any) {
        console.error("API 처리 중 예외 발생:", err);
        return res.status(500).json({ error: err?.message ?? "알 수 없는 서버 에러가 발생했습니다." });
    }
}