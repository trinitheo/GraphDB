
import React, { forwardRef } from 'react';
import type { Patient, MedicalRecordEntry } from '../../types';
import { useUnifiedDocumentStream, UnifiedDocument } from '../../hooks/useUnifiedDocumentStream';
import InitialEncounterDisplay from '../notes/InitialEncounterDisplay';
import FollowUpNoteDisplay from '../notes/FollowUpNoteDisplay';
import PrescriptionNoteDisplay from '../notes/PrescriptionNoteDisplay';
import ReferralNoteDisplay from '../notes/ReferralNoteDisplay';
import ProcedureNoteDisplay from '../notes/ProcedureNoteDisplay';
import AISummaryNoteDisplay from '../notes/AISummaryNoteDisplay';
import LabResultNoteDisplay from '../notes/LabResultNoteDisplay';

// A generic display for types that don't have a custom component yet
const GenericNoteDisplay: React.FC<{ entry: MedicalRecordEntry; patient: Patient }> = ({ entry, patient }) => (
    <div className="p-4 bg-slate-100 rounded-lg">
        <p className="font-semibold">{entry.type}</p>
        <p className="text-sm">{entry.content}</p>
        <p className="text-xs text-slate-500 mt-2">{new Date(entry.timestamp).toLocaleString()}</p>
    </div>
);

const renderDocument = (doc: UnifiedDocument, patient: Patient) => {
    switch (doc.type) {
        case 'InitialEncounter':
            return <InitialEncounterDisplay entry={doc.data} patient={patient} />;
        case 'FollowUp':
            return <FollowUpNoteDisplay entry={doc.data} patient={patient} />;
        case 'Prescription':
            return <PrescriptionNoteDisplay entry={doc.data} patient={patient} />;
        case 'Referral':
            return <ReferralNoteDisplay entry={doc.data} patient={patient} />;
        case 'Procedure':
            return <ProcedureNoteDisplay entry={doc.data} patient={patient} />;
        case 'AISummary':
            return <AISummaryNoteDisplay entry={doc.data} patient={patient} />;
        case 'LabResult':
            return <LabResultNoteDisplay entry={doc.data} patient={patient} />;
        default:
            return <GenericNoteDisplay entry={doc.data} patient={patient} />;
    }
};

interface PatientNoteColumnProps {
    patient: Patient;
    records: MedicalRecordEntry[];
}

const PatientNoteColumn = forwardRef<HTMLDivElement, PatientNoteColumnProps>(({ patient, records }, ref) => {
    const documentStream = useUnifiedDocumentStream(records);

    return (
        <div ref={ref} className="space-y-6">
            {documentStream.length > 0 ? (
                documentStream.map((doc) => (
                    <div key={doc.id}>
                        {renderDocument(doc, patient)}
                    </div>
                ))
            ) : (
                <div className="text-center text-slate-500 py-8">
                    No clinical documents found for this patient.
                </div>
            )}
        </div>
    );
});

export default PatientNoteColumn;
