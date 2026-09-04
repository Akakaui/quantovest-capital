import type { ButtonHTMLAttributes } from 'react';
import { Icon } from '@iconify/react';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'danger';
  icon?: string;
};

const styles: Record<NonNullable<Props['variant']>, string> = {
  primary:
    'bg-[#22C55E] text-[#07110B] hover:bg-[#86EFAC] shadow-[0_4px_16px_rgba(34,197,94,0.2)]',
  secondary:
    'border border-[#2B393F] text-[#93A09A] hover:text-[#E8EFEB] hover:border-[#93A09A]/50 bg-transparent',
  danger: 'border border-rose-400/40 text-rose-300 hover:bg-rose-500/10 hover:border-rose-400/60',
};

export function AdminButton({ variant = 'primary', icon, className = '', children, ...rest }: Props) {
  return (
    <button
      {...rest}
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${styles[variant]} ${className}`}
    >
      {icon && <Icon icon={icon} className="w-4 h-4" />}
      {children}
    </button>
  );
}