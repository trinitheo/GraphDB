import React from 'react';
import { ProceduresView } from './ProceduresView';

const ProceduresMFE: React.FC = () => {
    return (
        <div className="p-6 md:p-10 animate-fade-in h-full">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Procedures</h1>
                <p className="text-slate-500 mt-1">Log, view, and manage patient procedures.</p>
            </header>
            <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
                <p className="text-slate-600">
                    Select a patient to view their procedure history.
                </p>
            </div>
        </div>
    );
};

// Export the view component for use in other MFEs (like PatientMFE)
export { ProceduresView };

export default ProceduresMFE;
