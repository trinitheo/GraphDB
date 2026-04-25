import React, { useState } from 'react';

const ChevronDown: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
);

interface CollapsibleSectionProps {
    title: string;
    children: React.ReactNode;
    defaultOpen?: boolean;
    zIndex?: string;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({ title, children, defaultOpen = true, zIndex }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className={`relative border-t border-slate-200 pt-6 mt-6 first:border-t-0 first:mt-0 first:pt-0 ${zIndex || ''}`}>
             <button
                className="w-full flex justify-between items-center"
                onClick={() => setIsOpen(!isOpen)}
                aria-expanded={isOpen}
            >
                <h3 className="text-lg font-bold text-slate-800">{title}</h3>
                <ChevronDown className={`w-5 h-5 text-slate-500 transition-transform duration-300 ${isOpen ? '' : '-rotate-90'}`} />
            </button>
            {isOpen && (
                <div className="mt-4 animate-fade-in-fast">
                    {children}
                </div>
            )}
        </div>
    );
};

export default CollapsibleSection;