
import React, { useEffect, useRef } from 'react';
import { XCircleIcon } from '../constants'; // Assuming you might want to use an icon

interface ImageModalProps {
  imageUrl: string;
  onClose: () => void;
}

export const ImageModal: React.FC<ImageModalProps> = ({ imageUrl, onClose }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  // Close modal on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  // Accessibility: Trap focus within the modal (basic example)
  useEffect(() => {
    const focusableElements = modalRef.current?.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements?.[0] as HTMLElement | undefined;
    const lastElement = focusableElements?.[focusableElements.length - 1] as HTMLElement | undefined;

    const handleTabKey = (event: KeyboardEvent) => {
      if (event.key === 'Tab') {
        if (event.shiftKey && document.activeElement === firstElement) {
          lastElement?.focus();
          event.preventDefault();
        } else if (!event.shiftKey && document.activeElement === lastElement) {
          firstElement?.focus();
          event.preventDefault();
        }
      }
    };

    firstElement?.focus();
    document.addEventListener('keydown', handleTabKey);
    return () => {
      document.removeEventListener('keydown', handleTabKey);
    };
  }, []);


  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-[100] p-4 animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="image-modal-title"
      onClick={onClose} // Close on backdrop click (delegated)
    >
      <div 
        ref={modalRef}
        className="bg-slate-800 p-4 rounded-lg shadow-2xl max-w-3xl max-h-[90vh] flex flex-col relative"
        onClick={(e) => e.stopPropagation()} // Prevent click inside modal from closing it
      >
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-slate-400 hover:text-white transition-colors z-10 p-2 bg-slate-700/50 hover:bg-slate-600 rounded-full"
          aria-label="이미지 확대 팝업 닫기"
        >
          <XCircleIcon className="w-6 h-6" />
        </button>
        {/* Optional: Add a title if needed for accessibility or context */}
        {/* <h2 id="image-modal-title" className="sr-only">확대된 이미지</h2> */}
        <img 
          src={imageUrl} 
          alt="Enlarged conversation" 
          className="object-contain w-full h-full max-h-[calc(90vh-4rem)] rounded" // Adjusted max-height for padding
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.alt = "이미지를 불러올 수 없습니다";
            target.style.background = "#374151";
            target.style.display = "flex";
            target.style.alignItems = "center";
            target.style.justifyContent = "center";
            console.error('Modal image failed to load:', imageUrl);
          }}
        />
      </div>
    </div>
  );
};
