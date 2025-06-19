import type { forwardRef as ForwardRef, InputHTMLAttributes } from 'react';
import { forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  function Input({ 
    label, 
    error, 
    className = '', 
    fullWidth = true,
    type = 'text',
    ...props 
  }, ref) {
    const inputClasses = `
      px-3 py-2 
      bg-background dark:bg-card 
      border rounded-md 
      focus:outline-none focus:ring-2 
      ${error 
        ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
        : 'border-border dark:border-border focus:border-blue-500 focus:ring-primary'
      }
      ${fullWidth ? 'w-full' : ''}
      ${className}
    `;

    return (
      <div className={`${fullWidth ? 'w-full' : ''} mb-4`}>
        {label && (
          <label className="block text-sm font-medium text-text-secondary dark:text-text-secondary mb-1">
            {label}
          </label>
        )}
        
        <input
          ref={ref}
          type={type}
          className={inputClasses}
          {...props}
        />
        
        {error && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-500">
            {error}
          </p>
        )}
      </div>
    );
  }
); 