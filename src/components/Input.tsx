import type { InputHTMLAttributes } from 'react';

// export default function Input(props: InputHTMLAttributes<HTMLInputElement>) {
//     return <input className="border rounded px-3 py-2 w-full" {...props} />;
// }


export default function Input({ className = '', ...rest }: InputHTMLAttributes<HTMLInputElement>) {
    return (
        <input
            className={`w-full px-4 py-2.5 rounded-xl border border-[#E7E5DF] bg-white text-[#1C1917] placeholder:text-[#78716C] outline-none transition-shadow duration-150 focus:ring-2 focus:ring-[#5B5BD6] focus:border-[#5B5BD6] ${className}`}
            {...rest}
        />
    );
}