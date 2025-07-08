// src/components/common/Button.jsx
import React from 'react';

const Button = React.forwardRef(
  ({ className, variant = 'primary', size = 'default', children, ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-700 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background transform active:scale-95";

    const variants = {
      primary: "bg-stone-800 text-white hover:bg-stone-700 shadow-lg",
      destructive: "bg-red-600 text-white hover:bg-red-700 shadow-lg",
      outline: "border border-stone-400/80 bg-white/20 hover:bg-white/40 backdrop-blur-sm text-stone-800 shadow-md",
      secondary: "bg-stone-200 text-stone-800 hover:bg-stone-300 shadow-md",
      ghost: "hover:bg-stone-100/80 hover:text-stone-900",
      link: "underline-offset-4 hover:underline text-stone-800",
    };

    const sizes = {
      default: "h-10 py-2 px-4",
      sm: "h-9 px-3 rounded-md",
      lg: "h-11 px-8 rounded-md",
      icon: "h-10 w-10"
    };

    return (
      <button
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className || ''}`}
        ref={ref}
        {...props}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
export default Button;