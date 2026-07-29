import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { stringifySetCookie } from "cookie";

const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function issueToken(userId: string, username: string, isAdmin: boolean) {
    return jwt.sign({ userId, username, isAdmin }, process.env.JWT_SECRET!, { expiresIn: "7d" });
}

function setTokenCookie(res: VercelResponse, token: string) {
    res.setHeader("Set-Cookie", stringifySetCookie({
        name: "token",
        value: token,
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
    }));
}

function clearTokenCookie(res: VercelResponse) {
    res.setHeader("Set-Cookie", stringifySetCookie({
        name: "token",
        value: "",
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        path: "/",
        maxAge: 0,
    }));
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
                .select("id, username, is_admin")
                .single();

            if (error) {
                console.error("회원가입 에러:", error);
                return res.status(409).json({ error: "이미 존재하는 아이디입니다." });
            }

            const token = issueToken(data.id, data.username, data.is_admin ?? false);
            setTokenCookie(res, token);
            return res.status(201).json({ id: data.id, username: data.username, is_admin: data.is_admin ?? false });
        }

        // ── 로그인 ──
        if (req.method === "POST" && action === "signin") {
            const { username, password } = req.body ?? {};

            if (!username?.trim() || !password?.trim()) {
                return res.status(400).json({ error: "아이디와 비밀번호를 입력해주세요." });
            }

            const { data, error } = await supabase
                .from("users")
                .select("id, username, password, is_admin")
                .eq("username", username)
                .single();

            if (error || !data) {
                return res.status(401).json({ error: "아이디 또는 비밀번호가 일치하지 않습니다." });
            }

            const isHashed = data.password.startsWith("$2a$") || data.password.startsWith("$2b$");

            let isValid = false;

            if (isHashed) {
                isValid = await bcrypt.compare(password, data.password);
            } else {
                isValid = password === data.password;
                if (isValid) {
                    const newHash = await bcrypt.hash(password, 10);
                    await supabase.from("users").update({ password: newHash }).eq("id", data.id);
                }
            }

            if (!isValid) {
                return res.status(401).json({ error: "아이디 또는 비밀번호가 일치하지 않습니다." });
            }

            const token = issueToken(data.id, data.username, data.is_admin ?? false);
            setTokenCookie(res, token);
            return res.status(200).json({ id: data.id, username: data.username, is_admin: data.is_admin ?? false });
        }

        // ── 로그인 상태 확인 ──
        if (req.method === "GET" && action === "me") {
            const token = req.cookies?.token;
            if (!token) {
                return res.status(200).json({ user: null });
            }

            try {
                const payload = jwt.verify(token, process.env.JWT_SECRET!) as {
                    userId: string; username: string; isAdmin: boolean;
                };
                return res.status(200).json({
                    user: { id: payload.userId, username: payload.username, is_admin: payload.isAdmin },
                });
            } catch {
                clearTokenCookie(res);
                return res.status(200).json({ user: null });
            }
        }

        // ── 로그아웃 ──
        if (req.method === "POST" && action === "logout") {
            clearTokenCookie(res);
            return res.status(200).json({ success: true });
        }

        // ── 닉네임 변경 ──
        if (req.method === "PATCH" && action === "update-username") {
            const { userId, password, newUsername } = req.body ?? {};

            if (!userId || !password || !newUsername?.trim()) {
                return res.status(400).json({ error: "잘못된 요청입니다." });
            }

            const { data: userData, error: fetchError } = await supabase
                .from("users")
                .select("password, is_admin")
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

            const newToken = issueToken(userId, newUsername, userData.is_admin ?? false);
            setTokenCookie(res, newToken);

            return res.status(200).json({ success: true });
        }

        return res.status(405).json({ error: "지원하지 않는 요청입니다." });
    } catch (err: any) {
        console.error("API 처리 중 예외 발생:", err);
        return res.status(500).json({ error: err?.message ?? "알 수 없는 서버 에러가 발생했습니다." });
    }
}