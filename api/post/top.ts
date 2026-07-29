import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: VercelRequest, res: VercelResponse) {
    try {
        if (req.method !== "GET") {
            return res.status(405).json({ error: "지원하지 않는 요청입니다." });
        }

        const limit = Number(req.query.limit ?? 5);

        const { data, error } = await supabase
            .from("posts")
            .select("id, title, category, views, users(username)")
            .order("views", { ascending: false })
            .limit(limit);

        if (error) {
            console.error("GET /api/post/top 에러:", error);
            return res.status(500).json({ error: error.message });
        }

        return res.status(200).json(data);
    } catch (err: any) {
        console.error("API 처리 중 예외 발생:", err);
        return res.status(500).json({ error: err?.message ?? "알 수 없는 서버 에러가 발생했습니다." });
    }
}