

import React from 'react';
import { MedicalRecordsView } from './MedicalRecordsView';

// The component to render for the top-level /medical-records route
const MedicalRecordsMFE: React.FC = () => {
    return (
        <div className="animate-fade-in h-full flex items-center justify-center">
            <div className="card-panel p-8 text-center">
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-4">Medical Records</h1>
                <p className="text-slate-600">
                    Please select a patient from the 'Patients' list to view their medical records.
                </p>
            </div>
        </div>
    );
};

// Export the view component for use in other MFEs (like PatientMFE)
export { MedicalRecordsView };

// Default export is for the shell router
export default MedicalRecordsMFE;