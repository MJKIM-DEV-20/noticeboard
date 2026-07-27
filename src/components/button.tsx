import type {ButtonHTMLAttributes} from 'react';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'danger' | 'default';
}

export default function Button({ variant = 'default', children, ...rest }: Props) {
    const base = 'px-4 py-2 rounded text-sm';
    const styles = {
        primary: `${base} bg-blue-600 text-white`,
        danger: `${base} bg-red-500 text-white`,
        default: `${base} bg-gray-200 text-gray-800`,
    };
    return (
        <button className={styles[variant]} {...rest}>
            {children}
        </button>
    );
}