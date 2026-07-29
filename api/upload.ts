import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";
import jwt from "jsonwebtoken";
import formidable from "formidable";
import fs from "fs";

// Vercel의 기본 body 파싱을 꺼야 formidable이 원본 요청 스트림을 읽을 수 있음
export const config = {
    api: {
        bodyParser: false,
    },
};

const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

function getUserFromCookie(req: VercelRequest): { userId: string; username: string } | null {
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
        if (req.method !== "POST") {
            return res.status(405).json({ error: "지원하지 않는 요청입니다." });
        }

        const user = getUserFromCookie(req);
        if (!user) {
            return res.status(401).json({ error: "로그인이 필요합니다." });
        }

        const form = formidable({ maxFileSize: MAX_FILE_SIZE });
        const [, files] = await form.parse(req);

        const fileField = files.image;
        const file = Array.isArray(fileField) ? fileField[0] : fileField;

        if (!file) {
            return res.status(400).json({ error: "이미지 파일이 없습니다." });
        }

        if (!ALLOWED_TYPES.includes(file.mimetype ?? "")) {
            return res.status(400).json({ error: "지원하지 않는 이미지 형식입니다. (jpg, png, webp, gif만 가능)" });
        }

        const fileBuffer = fs.readFileSync(file.filepath);
        const ext = file.originalFilename?.split(".").pop() ?? "jpg";
        const fileName = `${user.userId}/${Date.now()}.${ext}`;

        const { error: uploadError } = await supabase.storage
            .from("post-images")
            .upload(fileName, fileBuffer, {
                contentType: file.mimetype ?? "image/jpeg",
                upsert: false,
            });

        // 임시로 저장된 파일 정리
        fs.unlink(file.filepath, () => {});

        if (uploadError) {
            console.error("이미지 업로드 에러:", uploadError);
            return res.status(500).json({ error: uploadError.message });
        }

        const { data: publicUrlData } = supabase.storage
            .from("post-images")
            .getPublicUrl(fileName);

        return res.status(200).json({ url: publicUrlData.publicUrl });
    } catch (err: any) {
        console.error("업로드 처리 중 예외 발생:", err);
        return res.status(500).json({ error: err?.message ?? "알 수 없는 서버 에러가 발생했습니다." });
    }
}