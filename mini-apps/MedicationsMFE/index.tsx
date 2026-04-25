

import React from 'react';

// Export the shared component for other MFEs to use
export { MedicationsView } from './MedicationsView';
export { default as PrescriptionPadModal } from './components/PrescriptionPadModal';

const MedicationsMFE: React.FC = () => {
    return (
        <div className="p-6 md:p-10 animate-fade-in h-full">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Medications</h1>
                <p className="text-slate-500 mt-1">Create, manage, and track patient medications and prescriptions.</p>
            </header>
            <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
                <p className="text-slate-600">
                    Select a patient to view their medication records and create new prescriptions.
                </p>
            </div>
        </div>
    );
};

export default MedicationsMFE;
