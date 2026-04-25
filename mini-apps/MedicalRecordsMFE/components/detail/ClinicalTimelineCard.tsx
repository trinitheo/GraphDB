

import React from 'react';
import type { MedicalRecordEntry } from '../../types';
import { useUnifiedDocumentStream } from '../../hooks/useUnifiedDocumentStream';
// FIX: Replaced missing ProceduresIcon with the correct Stethoscope icon.
import { MedicalRecordsIcon, MedicationIcon, Send, Stethoscope as ProceduresIcon, Sparkles } from '../../../../components/icons';

const getIconForType = (type: string) => {
    switch (type) {
        case 'InitialEncounter':
        case 'FollowUp':
            return <MedicalRecordsIcon size={18} className="text-sky-500 dark:text-sky-400" />;
        case 'Prescription':
            return <MedicationIcon size={18} className="text-green-500 dark:text-green-400" />;
        case 'Referral':
            return <Send size={18} className="text-purple-500 dark:text-purple-400" />;
        case 'Procedure':
            return <ProceduresIcon size={18} className="text-orange-500 dark:text-orange-400" />;
        case 'AISummary':
            return <Sparkles size={18} className="text-indigo-500 dark:text-indigo-400" />;
        default:
            return <MedicalRecordsIcon size={18} className="text-slate-500 dark:text-slate-400" />;
    }
};

const getTitleForType = (type: string) => {
    switch (type) {
        case 'InitialEncounter': return 'Initial Encounter';
        case 'FollowUp': return 'Follow-up Note';
        case 'AISummary': return 'AI Summary';
        default: return type;
    }
};

interface ClinicalTimelineCardProps {
    records: MedicalRecordEntry[];
}

const ClinicalTimelineCard: React.FC<ClinicalTimelineCardProps> = ({ records }) => {
    const documentStream = useUnifiedDocumentStream(records);

    return (
        <div className="animate-fade-in">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6">Clinical Timeline</h2>
            <div className="relative pl-6">
                {/* Vertical line */}
                <div className="absolute left-9 top-0 bottom-0 w-0.5 bg-slate-200 dark:bg-slate-700"></div>

                <ul className="space-y-8">
                    {documentStream.map((doc) => (
                        <li key={doc.id} className="relative">
                            <div className="absolute -left-3.5 top-1 h-8 w-8 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
                                <div className="h-7 w-7 bg-white dark:bg-slate-900/80 rounded-full flex items-center justify-center ring-4 ring-slate-100 dark:ring-slate-800">
                                    {getIconForType(doc.type)}
                                </div>
                            </div>
                            <div className="ml-10">
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    {new Date(doc.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </p>
                                <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-100 mt-1">{getTitleForType(doc.type)}</h4>
                                <p className="text-xs text-slate-600 dark:text-slate-300">by {doc.data.authorName}</p>
                            </div>
                        </li>
                    ))}
                    {documentStream.length === 0 && (
                        <p className="text-sm text-slate-500 dark:text-slate-400">No events in timeline.</p>
                    )}
                </ul>
            </div>
        </div>
    );
};

export default ClinicalTimelineCard;