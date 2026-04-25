
import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { XIcon, ExpandMediumIcon, ExpandLargeIcon } from '../../../../components/icons';

type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl' | 'full';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    footer?: React.ReactNode;
    size?: ModalSize;
}

const sizeClasses: Record<string, string> = {
    sm: 'max-w-sm', 
    md: 'max-w-md', 
    lg: 'max-w-lg', 
    xl: 'max-w-xl', 
    '2xl': 'max-w-2xl', 
    '3xl': 'max-w-3xl', 
    '4xl': 'max-w-4xl', 
    '5xl': 'max-w-5xl', 
    '6xl': 'max-w-6xl', 
    '7xl': 'max-w-7xl',
    'full': 'max-w-[96vw] h-[96vh]'
};

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, footer, size = '2xl' }) => {
    const [userSelectedSize, setUserSelectedSize] = useState<ModalSize | null>(null);
    
    useEffect(() => {
        const handleEscape = (event: KeyboardEvent) => event.key === 'Escape' && onClose();
        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            setUserSelectedSize(null);
            // Prevent body scroll when modal is open
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const displaySize = userSelectedSize || size;

    return createPortal(
        <div 
            className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4 animate-fade-in-fast"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
        >
            <div 
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" 
                onClick={onClose}
            />
            
            <div 
                className={`relative bg-white rounded-[32px] shadow-2xl w-full flex flex-col max-h-[95vh] transition-all duration-300 overflow-hidden border border-white/20 ${sizeClasses[displaySize]}`}
                onClick={e => e.stopPropagation()}
            >
                <header className="px-8 py-6 border-b border-slate-100 flex justify-between items-center flex-shrink-0 bg-white/80 backdrop-blur-md sticky top-0 z-10">
                    <h2 id="modal-title" className="text-xl font-black text-slate-900 tracking-tight">{title}</h2>
                    <div className="flex items-center space-x-2">
                        <button 
                            onClick={() => setUserSelectedSize('3xl')} 
                            className={`w-10 h-10 flex items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-800 transition-colors ${displaySize === '3xl' ? 'bg-slate-100 text-sky-600' : ''}`}
                            aria-label="Set modal to medium size"
                            title="Medium size"
                        >
                            <ExpandMediumIcon size={20} />
                        </button>
                        <button 
                            onClick={() => setUserSelectedSize('7xl')} 
                            className={`w-10 h-10 flex items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-800 transition-colors ${displaySize === '7xl' ? 'bg-slate-100 text-sky-600' : ''}`}
                            aria-label="Set modal to large size"
                            title="Large size"
                        >
                            <ExpandLargeIcon size={20} />
                        </button>
                        <div className="w-px h-6 bg-slate-200 mx-2" />
                        <button 
                            onClick={onClose} 
                            className="w-10 h-10 flex items-center justify-center rounded-xl text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                            aria-label="Close modal"
                        >
                            <XIcon size={24} />
                        </button>
                    </div>
                </header>
                
                <main className="overflow-y-auto p-8 flex-1 scrollbar-autohide">
                    {children}
                </main>
                
                {footer && (
                    <footer className="px-8 py-6 bg-slate-50/50 border-t border-slate-100 flex-shrink-0">
                        {footer}
                    </footer>
                )}
            </div>
        </div>,
        document.body
    );
};

export default Modal;
