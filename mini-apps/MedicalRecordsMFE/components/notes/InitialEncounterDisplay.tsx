
import React from 'react';
import type { MedicalRecordEntry, Patient } from '../../types';
import NoteDisplayShell from './NoteDisplayShell';
// FIX: Corrected icon import to use MedicalRecordsIcon from central library.
import { MedicalRecordsIcon } from '../../../../components/icons';

interface InitialEncounterDisplayProps {
  entry: MedicalRecordEntry;
  patient: Patient;
}

const InitialEncounterDisplay: React.FC<InitialEncounterDisplayProps> = ({ entry, patient }) => {
  return (
    <NoteDisplayShell
      icon={<MedicalRecordsIcon size={20} />}
      title="Initial Encounter (H&P)"
      entry={entry}
      patient={patient}
    >
      <p>{entry.content}</p>
    </NoteDisplayShell>
  );
};

export default InitialEncounterDisplay;