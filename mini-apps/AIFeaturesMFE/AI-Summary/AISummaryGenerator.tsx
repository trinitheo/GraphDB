
import React from 'react';
import type { MedicalRecordEntry } from '../types';
import { SummaryContent } from './components/SummaryContent';

interface AISummaryGeneratorProps {
    notes: MedicalRecordEntry[];
    onSummaryAdded?: () => void;
}

export const AISummaryGenerator: React.FC<AISummaryGeneratorProps> = ({ notes, onSummaryAdded }) => {
    // This wrapper is used to provide the specific styling needed inside the modal.
    return (
        <div className="p-4">
           <SummaryContent notes={notes} onSummaryAdded={onSummaryAdded} />
        </div>
    );
};