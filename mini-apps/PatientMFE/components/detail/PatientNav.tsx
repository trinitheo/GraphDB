
import React from 'react';

// Messaging removed from tabs to be integrated as a direct action in the header
const navItems: { name: string }[] = [
    { name: 'Patient' },
    { name: 'Medical Records' },
    { name: 'Medications' },
    { name: 'Tests' },
    { name: 'Procedures' },
    { name: 'Appointments' },
];

interface PatientNavProps {
    activeView: string;
    onViewChange: (view: string) => void;
}

const PatientNav: React.FC<PatientNavProps> = ({ activeView, onViewChange }) => {
    return (
        <nav className="border-b border-slate-200">
            <div className="-mb-px flex space-x-2 overflow-x-auto scrollbar-autohide">
                {navItems.map(item => (
                    <button
                        key={item.name}
                        onClick={() => onViewChange(item.name)}
                        className={`
                            whitespace-nowrap py-3 px-4 rounded-t-md
                            text-sm font-medium transition-colors duration-200
                            ${activeView === item.name
                                ? 'border-b-2 border-sky-600 text-sky-600 bg-slate-50'
                                : 'border-b-2 border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                            }
                        `}
                    >
                        {item.name}
                    </button>
                ))}
            </div>
        </nav>
    );
};

export default PatientNav;
