import { cn } from '../../utils/cn';
import LoadingSpinner from './LoadingSpinner';

const VARIANTS = {
  primary: 'bg-[#01516A] hover:bg-[#0E465E] text-white border border-transparent',
  secondary: 'bg-white hover:bg-[#F5F5F5] text-[#01516A] border border-[#01516A]',
  ghost: 'bg-transparent hover:bg-[#EBEBEB] text-[#5C5C5C] border border-transparent',
  danger: 'bg-[#FDE8E8] hover:bg-[#fad0d0] text-[#C81E1E] border border-transparent',
  'danger-filled': 'bg-[#C81E1E] hover:bg-[#a81a1a] text-white border border-transparent',
  accent: 'bg-[#F9A41E] hover:bg-[#DC9117] text-white border border-transparent',
};

const SIZES = {
  xs: 'px-2.5 py-1 text-xs rounded-md gap-1',
  sm: 'px-3.5 py-1.5 text-sm rounded-lg gap-1.5',
  md: 'px-4 py-2 text-sm rounded-lg gap-2',
  lg: 'px-5 py-2.5 text-base rounded-xl gap-2',
};

export default function Button({ children, variant = 'primary', size = 'md', loading, disabled, icon: Icon, className, ...props }) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#01516A]/40 disabled:opacity-50 disabled:cursor-not-allowed select-none',
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
    >
      {loading ? <LoadingSpinner size="sm" label={null} /> : Icon && <Icon className={`shrink-0 ${size === 'xs' ? 'w-3 h-3' : size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'}`} />}
      {children}
    </button>
  );
}
