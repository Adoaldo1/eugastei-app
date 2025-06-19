import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  title?: string;
  className?: string;
}

export function Card({ children, title, className = '' }: CardProps) {
  return (
    <div className={`content-box rounded-lg shadow-md overflow-hidden ${className}`}>
      {title && (
        <div className="p-4 border-b border-border dark:border-border">
          <h3 className="text-lg font-medium text-gray-900 dark:text-text">
            {title}
          </h3>
        </div>
      )}
      <div className="p-4">{children}</div>
    </div>
  );
} 