import React from 'react';

const DashboardIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
);

const ImagesIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
);

const navItems = [
    { name: 'Dashboard', icon: DashboardIcon },
    { name: 'Images', icon: ImagesIcon },
];

interface InvestigationsNavProps {
    activeView: string;
    onViewChange: (view: string) => void;
}

const InvestigationsNav: React.FC<InvestigationsNavProps> = ({ activeView, onViewChange }) => {
    return (
        <nav className={`
            // --- Mobile Styles (Bottom Nav Bar) ---
            fixed bottom-0 left-0 right-0 z-50
            flex flex-row justify-around items-stretch
            h-20 p-1
            bg-white
            border-t border-slate-200

            // --- Desktop Styles (Sidebar) ---
            lg:relative lg:flex-col lg:justify-start lg:items-stretch
            lg:w-48 lg:h-auto lg:p-4 lg:gap-2
            lg:card-panel
            lg:flex-shrink-0
        `}>
            {navItems.map(item => (
                <button
                    key={item.name}
                    onClick={() => onViewChange(item.name)}
                    className={`
                        flex flex-1 flex-col items-center justify-center p-1 rounded-lg
                        lg:w-full lg:flex-none lg:flex-row lg:justify-start lg:items-center lg:gap-3 lg:p-3
                        transition-all duration-200 group
                        ${activeView === item.name
                            ? 'bg-sky-100 text-sky-700 font-semibold'
                            : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
                        }
                    `}
                >
                    <item.icon className="w-6 h-6 lg:w-5 lg:h-5 flex-shrink-0" />
                    <span className="text-xs font-medium text-center lg:text-sm lg:text-left">{item.name}</span>
                </button>
            ))}
        </nav>
    );
};

export default InvestigationsNav;
