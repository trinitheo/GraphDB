
import React from 'react';
import type { MedicalRecordEntry, Patient } from '../../types';
import NoteDisplayShell from './NoteDisplayShell';
// FIX: Corrected import path to central icons library.
import { Sparkles } from '../../../../components/icons';

interface AISummaryNoteDisplayProps {
  entry: MedicalRecordEntry;
  patient: Patient;
}

const AISummaryNoteDisplay: React.FC<AISummaryNoteDisplayProps> = ({ entry, patient }) => {
  return (
    <NoteDisplayShell
      icon={<Sparkles size={20} className="text-indigo-500"/>}
      title="AI Generated Summary"
      entry={entry}
      patient={patient}
    >
      <p className="whitespace-pre-wrap">{entry.content}</p>
    </NoteDisplayShell>
  );
};

export default AISummaryNoteDisplay;