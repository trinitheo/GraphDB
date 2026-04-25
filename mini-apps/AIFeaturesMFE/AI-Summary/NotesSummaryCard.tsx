

import React from 'react';
import type { MedicalRecordEntry } from '../types';
import { SummaryContent } from './components/SummaryContent';

interface NotesSummaryCardProps {
    notes: MedicalRecordEntry[];
}

export const NotesSummaryCard: React.FC<NotesSummaryCardProps> = ({ notes }) => {
    return (
        <div className="card-panel p-6 sm:p-8">
            <SummaryContent notes={notes} />
        </div>
    );
};