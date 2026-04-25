

import React from 'react';
import type { MedicalRecordEntry, Patient } from '../../types';
import NoteDisplayShell from './NoteDisplayShell';
// FIX: Corrected icon import to use MedicationIcon from central library.
import { MedicationIcon } from '../../../../components/icons';

const DataPair: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div>
    <dt className="text-xs font-semibold text-slate-500 uppercase">{label}</dt>
    <dd className="text-sm text-slate-800">{value}</dd>
  </div>
);

interface PrescriptionNoteDisplayProps {
  entry: MedicalRecordEntry;
  patient: Patient;
}

const PrescriptionNoteDisplay: React.FC<PrescriptionNoteDisplayProps> = ({ entry, patient }) => {
  const { prescriptionData: data } = entry;
  if (!data) return null;

  return (
    <NoteDisplayShell
      icon={<MedicationIcon size={20} className="text-green-600"/>}
      title="Prescription"
      entry={entry}
      patient={patient}
    >
      <dl className="grid grid-cols-2 gap-x-4 gap-y-2">
        <div className="col-span-2">
            <DataPair label="Medication" value={<span className="font-bold">{data.medication}</span>} />
        </div>
        <DataPair label="Dose" value={data.dose} />
        <DataPair label="Frequency" value={data.frequency} />
        {data.duration && <DataPair label="Duration" value={data.duration} />}
        <DataPair label="Refills" value={data.refills} />
      </dl>
      {entry.content && <p className="mt-2 text-xs italic text-slate-500">Note: {entry.content}</p>}
    </NoteDisplayShell>
  );
};

export default PrescriptionNoteDisplay;