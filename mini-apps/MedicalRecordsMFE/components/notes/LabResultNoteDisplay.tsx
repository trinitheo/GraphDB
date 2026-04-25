import React, { useMemo } from 'react';
import type { MedicalRecordEntry, Patient } from '../../types';
import NoteDisplayShell from './NoteDisplayShell';
import LabResultDisplay from './LabResultDisplay';
import { TestsIcon as LabIcon } from '../../../../components/icons';
import { parseResultsString } from '../../../TestOrderingMFE/utils';


interface LabResultNoteDisplayProps {
  entry: MedicalRecordEntry;
  patient: Patient;
}

const LabResultNoteDisplay: React.FC<LabResultNoteDisplayProps> = ({ entry, patient }) => {
  const parsedResults = useMemo(() => {
    // Extract results from the content, which might have a header.
    const resultsContent = entry.content.split(':\n')[1] || entry.content;
    return parseResultsString(resultsContent);
  }, [entry.content]);

  return (
    <NoteDisplayShell
      icon={<LabIcon className="w-5 h-5 text-red-600"/>}
      title="Lab Results"
      entry={entry}
      patient={patient}
    >
      <LabResultDisplay results={parsedResults} />
    </NoteDisplayShell>
  );
};

export default LabResultNoteDisplay;
