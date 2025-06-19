import { useRef, useEffect } from 'react';
import type { ReactNode } from 'react';

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
};

export function Modal({ isOpen, onClose, children, title }: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-modal-dark backdrop-blur-soft animate-fade-in" onClick={onClose}></div>
      <div 
        ref={modalRef}
        className="relative content-box rounded-xl shadow-xl w-full max-w-[95%] md:max-w-[500px] max-h-[95vh] sm:max-h-[90vh] overflow-auto animate-slide-up m-2 sm:m-4"
      >
        {title && (
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-border">
            <h3 className="text-base sm:text-lg font-medium text-text pr-8">{title}</h3>
          </div>
        )}
        <div className="relative">
          <button
            onClick={onClose}
            className="absolute top-3 sm:top-4 right-3 sm:right-4 text-text-secondary hover:opacity-100 z-10 p-1"
            aria-label="Fechar"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          {children}
        </div>
      </div>
    </div>
  );
} 