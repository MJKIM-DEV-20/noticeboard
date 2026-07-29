import { useEffect, useRef } from "react";

interface Props {
    open: boolean;
    title: string;
    children: React.ReactNode;
    footer?: React.ReactNode;
    onClose: () => void;
    closeOnOverlayClick?: boolean;
}

export const Modal = ({
                          open,
                          title,
                          children,
                          footer,
                          onClose,
                          closeOnOverlayClick = true,
                      }: Props) => {
    const contentRef = useRef<HTMLDivElement>(null);

    // ESC 키 닫기
    useEffect(() => {
        if (!open) return;
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [open, onClose]);

    // 바디 스크롤 락
    useEffect(() => {
        if (!open) return;
        const original = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = original;
        };
    }, [open]);

    if (!open) return null;

    const handleOverlayClick = (e: React.MouseEvent) => {
        if (closeOnOverlayClick && e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-[rgba(11,17,21,.55)] p-6"
            onClick={handleOverlayClick}
            role="presentation"
        >
            <div
                ref={contentRef}
                className="w-full max-w-[560px] max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-xl"
                role="dialog"
                aria-modal="true"
                aria-labelledby="modal-title"
            >
                {/* Modal Head */}
                <div className="flex items-center justify-between border-b border-[#E7E5DF] px-7 py-6">
                    <h3
                        id="modal-title"
                        className="text-[19px] font-bold tracking-[-0.01em] text-[#1C1917]"
                    >
                        {title}
                    </h3>

                    <button
                        onClick={onClose}
                        aria-label="닫기"
                        className="bg-transparent px-2 py-1 text-[24px] leading-none text-[#78716C] hover:text-[#1C1917] transition-colors duration-150"
                    >
                        ×
                    </button>
                </div>

                {/* Modal Body */}
                <div className="px-7 py-6">{children}</div>

                {/* Modal Footer */}
                {footer && (
                    <div className="flex justify-end gap-2.5 border-t border-[#E7E5DF] px-7 py-5">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
};