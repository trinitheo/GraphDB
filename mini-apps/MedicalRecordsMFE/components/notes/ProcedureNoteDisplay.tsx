
import React from 'react';
import type { MedicalRecordEntry, Patient } from '../../types';
import NoteDisplayShell from './NoteDisplayShell';
// FIX: Replaced missing ProceduresIcon with the correct Stethoscope icon.
import { Stethoscope as ProceduresIcon } from '../../../../components/icons';

interface ProcedureNoteDisplayProps {
  entry: MedicalRecordEntry;
  patient: Patient;
}

const ProcedureNoteDisplay: React.FC<ProcedureNoteDisplayProps> = ({ entry, patient }) => {
  const { procedureData: data } = entry;
  if (!data) return null;

  return (
    <NoteDisplayShell
      icon={<ProceduresIcon size={20} className="text-orange-600" />}
      title="Procedure"
      entry={entry}
      patient={patient}
    >
        <h5 className="font-bold text-slate-800">{data.name}</h5>
        {data.cptCode && <p className="text-xs font-mono text-slate-500">CPT: {data.cptCode}</p>}
        {data.notes && <p className="mt-2">{data.notes}</p>}
        {entry.content && <p className="mt-2 text-xs italic text-slate-500">Result: {entry.content}</p>}
    </NoteDisplayShell>
  );
};

export default ProcedureNoteDisplay;