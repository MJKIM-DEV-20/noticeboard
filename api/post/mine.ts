import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";
import jwt from "jsonwebtoken";

const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function getUserFromRequest(req: VercelRequest): { userId: string; username: string } | null {
    const token = req.cookies?.token;
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
        if (req.method !== "GET") {
            return res.status(405).json({ error: "지원하지 않는 요청입니다." });
        }

        const user = getUserFromRequest(req);
        if (!user) {
            return res.status(401).json({ error: "로그인이 필요합니다." });
        }

        const page = Number(req.query.page ?? 1);
        const pageSize = Number(req.query.pageSize ?? 10);
        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;

        const { data, error, count } = await supabase
            .from("posts")
            .select("id, title, category, is_notice, created_at, views, users(username)", {
                count: "exact",
            })
            .eq("user_id", user.userId) // 쿠키에서 검증된 본인 글만
            .order("created_at", { ascending: false })
            .range(from, to);

        if (error) {
            console.error("GET /api/post/mine 에러:", error);
            return res.status(500).json({ error: error.message });
        }

        return res.status(200).json({ posts: data, totalCount: count ?? 0 });
    } catch (err: any) {
        console.error("API 처리 중 예외 발생:", err);
        return res.status(500).json({ error: err?.message ?? "알 수 없는 서버 에러가 발생했습니다." });
    }
}