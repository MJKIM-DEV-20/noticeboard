import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function issueToken(userId: string, username: string) {
    return jwt.sign({ userId, username }, process.env.JWT_SECRET!, { expiresIn: "7d" });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    try {
        const action = req.query.action;

        // ── 회원가입 ──
        if (req.method === "POST" && action === "signup") {
            const { username, password } = req.body ?? {};

            if (!username?.trim() || !password?.trim()) {
                return res.status(400).json({ error: "아이디와 비밀번호를 입력해주세요." });
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            const { data, error } = await supabase
                .from("users")
                .insert({ username, password: hashedPassword })
                .select("id, username")
                .single();

            if (error) {
                console.error("회원가입 에러:", error);
                return res.status(409).json({ error: "이미 존재하는 아이디입니다." });
            }

            const token = issueToken(data.id, data.username);
            return res.status(201).json({ ...data, token });
        }

        // ── 로그인 ──
        if (req.method === "POST" && action === "signin") {
            const { username, password } = req.body ?? {};

            if (!username?.trim() || !password?.trim()) {
                return res.status(400).json({ error: "아이디와 비밀번호를 입력해주세요." });
            }

            const { data, error } = await supabase
                .from("users")
                .select("id, username, password")
                .eq("username", username)
                .single();

            if (error || !data) {
                return res.status(401).json({ error: "아이디 또는 비밀번호가 일치하지 않습니다." });
            }

            const isHashed = data.password.startsWith("$2a$") || data.password.startsWith("$2b$");

            let isValid = false;

            if (isHashed) {
                // 이미 해시로 저장된 비밀번호 → 정상 비교
                isValid = await bcrypt.compare(password, data.password);
            } else {
                // 기존 평문 비밀번호(더미 데이터 등) → 평문 비교 후, 맞으면 해시로 자동 전환
                isValid = password === data.password;
                if (isValid) {
                    const newHash = await bcrypt.hash(password, 10);
                    await supabase.from("users").update({ password: newHash }).eq("id", data.id);
                }
            }

            if (!isValid) {
                return res.status(401).json({ error: "아이디 또는 비밀번호가 일치하지 않습니다." });
            }

            // 비밀번호(해시)는 절대 클라이언트로 내려보내지 않음
            const token = issueToken(data.id, data.username);
            return res.status(200).json({ id: data.id, username: data.username, token });
        }

        // ── 닉네임 변경 (본인 확인 후 변경) ──
        if (req.method === "PATCH" && action === "update-username") {
            const { userId, password, newUsername } = req.body ?? {};

            if (!userId || !password || !newUsername?.trim()) {
                return res.status(400).json({ error: "잘못된 요청입니다." });
            }

            const { data: userData, error: fetchError } = await supabase
                .from("users")
                .select("password")
                .eq("id", userId)
                .single();

            if (fetchError || !userData) {
                return res.status(404).json({ error: "사용자를 찾을 수 없습니다." });
            }

            const isValid = await bcrypt.compare(password, userData.password);
            if (!isValid) {
                return res.status(403).json({ error: "비밀번호가 일치하지 않습니다." });
            }

            const { error: updateError } = await supabase
                .from("users")
                .update({ username: newUsername })
                .eq("id", userId);

            if (updateError) {
                console.error("닉네임 변경 에러:", updateError);
                return res.status(500).json({ error: updateError.message });
            }

            return res.status(200).json({ success: true });
        }

        return res.status(405).json({ error: "지원하지 않는 요청입니다." });
    } catch (err: any) {
        console.error("API 처리 중 예외 발생:", err);
        return res.status(500).json({ error: err?.message ?? "알 수 없는 서버 에러가 발생했습니다." });
    }
}