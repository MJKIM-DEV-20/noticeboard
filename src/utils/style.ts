// src/utils/style.ts

// 카테고리별 컬러 토큰 (배지, 태그 등에서 공통으로 사용)
export const CATEGORY_STYLES: Record<string, { bg: string; text: string }> = {
    '일상잡담': { bg: 'bg-[#EEF2FF]', text: 'text-[#4F46E5]' },
    '음식이야기': { bg: 'bg-[#FFF7ED]', text: 'text-[#EA580C]' },
    '랜덤에피소드': { bg: 'bg-[#ECFEFF]', text: 'text-[#0E7490]' },
    '회사생활': { bg: 'bg-[#F0FDF4]', text: 'text-[#16A34A]' },
    '소소한고민': { bg: 'bg-[#FDF2F8]', text: 'text-[#DB2777]' },
};

const DEFAULT_CATEGORY_STYLE = { bg: 'bg-[#F6F4EF]', text: 'text-[#78716C]' };

export function getCategoryStyle(category?: string) {
    if (!category) return DEFAULT_CATEGORY_STYLE;
    return CATEGORY_STYLES[category] ?? DEFAULT_CATEGORY_STYLE;
}

// 유저네임 기반 고정 아바타 컬러 (같은 유저는 항상 같은 색)
const AVATAR_COLORS = [
    '#5B5BD6', '#EA580C', '#0E7490', '#16A34A',
    '#DB2777', '#CA8A04', '#7C3AED', '#0891B2',
];

export function getAvatarColor(name?: string) {
    if (!name) return AVATAR_COLORS[0];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % AVATAR_COLORS.length;
    return AVATAR_COLORS[index];
}

// 조회수 랭킹 배지 컬러 (1~3위는 메달 컬러, 그 외는 기본 톤)
export function getRankStyle(rank: number) {
    if (rank === 1) return { bg: 'bg-[#FEF3C7]', text: 'text-[#B45309]' }; // gold
    if (rank === 2) return { bg: 'bg-[#F1F5F9]', text: 'text-[#475569]' }; // silver
    if (rank === 3) return { bg: 'bg-[#FFEDD5]', text: 'text-[#9A3412]' }; // bronze
    return { bg: 'bg-[#5B5BD6]/10', text: 'text-[#5B5BD6]' };
}