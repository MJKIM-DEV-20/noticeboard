import type {ButtonHTMLAttributes} from 'react';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'danger' | 'default';
}

export default function Button({ variant = 'default', className = '', children, ...rest }: Props) {
    const base = 'px-5 py-3 rounded-xl text-[15px] font-semibold transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed';

    const styles = {
        primary: 'bg-[#5B5BD6] text-white hover:bg-[#4A4AC0]',
        danger: 'bg-[#DC2626] text-white hover:bg-[#B91C1C]',
        default: 'bg-white text-[#1C1917] border border-[#E7E5DF] hover:bg-[#F6F4EF]',
    };

    return (
        <button className={`${base} ${styles[variant]} ${className}`} {...rest}>
            {children}
        </button>
    );
}