import type {ButtonHTMLAttributes} from 'react';
//
// interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
//     variant?: 'primary' | 'danger' | 'default';
// }
//
// export default function Button({ variant = 'default', children, ...rest }: Props) {
//     const base = 'px-4 py-2 rounded text-sm';
//     const styles = {
//         primary: `${base} bg-blue-600 text-white`,
//         danger: `${base} bg-red-500 text-white`,
//         default: `${base} bg-gray-200 text-gray-800`,
//     };
//     return (
//         <button className={styles[variant]} {...rest}>
//             {children}
//         </button>
//     );
// }


interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'danger' | 'default';
}

export default function Button({ variant = 'default', className = '', children, ...rest }: Props) {
    const base = 'px-4 py-2.5 rounded-xl text-sm font-medium transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed';

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