import React from 'react';
import type { MedicalRecordEntry } from '../../../PatientMFE/types';
import { NotesSummaryCard } from '../../../AIFeaturesMFE';

interface RecentClinicalSummaryProps {
    records: MedicalRecordEntry[];
    isLoading: boolean;
}

const RecentClinicalSummary: React.FC<RecentClinicalSummaryProps> = ({ records, isLoading }) => {
    const notesToSummarize = records.filter(r => r.type === 'Consultation');

    return (
        <>
            {isLoading 
                ? <div className="card-panel p-6 text-center text-slate-500">Loading clinical summary...</div>
                : <NotesSummaryCard notes={notesToSummarize} />
            }
        </>
    );
};

export default RecentClinicalSummary;