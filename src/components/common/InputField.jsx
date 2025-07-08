// src/components/common/InputField.jsx
import React from 'react';

const InputField = React.forwardRef(
  ({ className, type = 'text', label, id, error, ...props }, ref) => {
    return (
      <div className="mb-4">
        {label && (
          <label htmlFor={id} className="block text-sm font-medium text-foreground/80 mb-1">
            {label}
          </label>
        )}
        <input
          type={type}
          id={id}
          className={`flex h-10 w-full rounded-md border border-stone-400/50 bg-white/20 px-3 py-2 text-sm text-stone-800 placeholder:text-stone-600/80 backdrop-blur-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-700 focus-visible:bg-white/40 disabled:cursor-not-allowed disabled:opacity-50 ${className || ''} ${error ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
          ref={ref}
          {...props}
        />
        {error && <p className="mt-1 text-xs text-red-500">{error.message || 'Invalid input'}</p>}
      </div>
    );
  }
);
InputField.displayName = "InputField";
export default InputField;