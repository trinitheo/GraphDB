
import React from 'react';
import type { MedicalRecordEntry, Patient } from '../../types';
import NoteDisplayShell from './NoteDisplayShell';
// FIX: Corrected icon import to use MedicalRecordsIcon from central library.
import { MedicalRecordsIcon } from '../../../../components/icons';

const renderSoapContent = (content: string) => {
    const sections = content.split('\n\n');
    return (
        <div className="space-y-3">
            {sections.map((section, index) => {
                const lines = section.split('\n');
                const header = lines[0];
                const body = lines.slice(1).join('\n');
                return (
                    <div key={index}>
                        <p className="font-bold text-slate-800">{header}</p>
                        <p className="text-slate-700 whitespace-pre-line">{body}</p>
                    </div>
                );
            })}
        </div>
    );
};

interface FollowUpNoteDisplayProps {
  entry: MedicalRecordEntry;
  patient: Patient;
}

const FollowUpNoteDisplay: React.FC<FollowUpNoteDisplayProps> = ({ entry, patient }) => {
  return (
    <NoteDisplayShell
      icon={<MedicalRecordsIcon size={20} className="text-sky-600"/>}
      title="Follow-up Note"
      entry={entry}
      patient={patient}
    >
      {renderSoapContent(entry.content)}
    </NoteDisplayShell>
  );
};

export default FollowUpNoteDisplay;