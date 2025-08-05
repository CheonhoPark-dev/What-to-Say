
import React from 'react';

interface ActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  icon?: React.ReactNode; // SVG element for icon
}

export const ActionButton: React.FC<ActionButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  icon,
  className,
  ...props
}) => {
  const baseStyle = "font-semibold rounded-xl focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all duration-300 ease-out disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg hover:shadow-2xl transform hover:scale-[1.02] active:scale-[0.98] backdrop-blur-sm relative overflow-hidden";

  const variantStyles = {
    primary: "bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white focus:ring-sky-400 shadow-sky-500/25 hover:shadow-sky-500/40",
    secondary: "bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-500 hover:to-slate-600 text-slate-100 focus:ring-slate-400 shadow-slate-500/25",
    danger: "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-400 hover:to-red-500 text-white focus:ring-red-400 shadow-red-500/25 hover:shadow-red-500/40",
  };

  const sizeStyles = {
    sm: "px-4 py-2 text-xs",
    md: "px-6 py-3 text-sm",
    lg: "px-8 py-4 text-base",
  };

  return (
    <button
      type="button"
      className={`${baseStyle} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {/* Shimmer effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"></div>
      
      {icon && <span className="mr-2 h-5 w-5 relative z-10">{icon}</span>}
      <span className="relative z-10">{children}</span>
    </button>
  );
};
