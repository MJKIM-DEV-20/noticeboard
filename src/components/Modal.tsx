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
                className="w-full max-w-[600px] max-h-[90vh] overflow-y-auto rounded-[14px] bg-white"
                role="dialog"
                aria-modal="true"
                aria-labelledby="modal-title"
            >
                {/* Modal Head */}
                <div className="flex items-center justify-between border-b px-6 py-5">
                    <h3
                        id="modal-title"
                        className="text-[17px] font-extrabold tracking-[-0.01em]"
                    >
                        {title}
                    </h3>

                    <button
                        onClick={onClose}
                        aria-label="닫기"
                        className="bg-transparent px-2 py-1 text-[22px] leading-none text-gray-400 hover:text-gray-600"
                    >
                        ×
                    </button>
                </div>

                {/* Modal Body */}
                <div className="px-6 py-[22px]">{children}</div>

                {/* Modal Footer */}
                {footer && (
                    <div className="flex justify-end gap-2 border-t px-6 py-[18px]">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
};