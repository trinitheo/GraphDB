
import React from 'react';
import type { MedicalRecordEntry, Patient } from '../../types';
import NoteDisplayShell from './NoteDisplayShell';
// FIX: Corrected import path to central icons library.
import { Send } from '../../../../components/icons';

const DataPair: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div>
    <dt className="text-xs font-semibold text-slate-500 uppercase">{label}</dt>
    <dd className="text-sm text-slate-800">{value}</dd>
  </div>
);

interface ReferralNoteDisplayProps {
  entry: MedicalRecordEntry;
  patient: Patient;
}

const ReferralNoteDisplay: React.FC<ReferralNoteDisplayProps> = ({ entry, patient }) => {
  const { referralData: data } = entry;
  if (!data) return null;

  return (
    <NoteDisplayShell
      icon={<Send size={20} className="text-purple-600" />}
      title="Referral"
      entry={entry}
      patient={patient}
    >
      <dl className="space-y-2">
        <DataPair label="Referred To" value={<span className="font-bold">{data.referredTo} ({data.specialty})</span>} />
        <DataPair label="Reason for Referral" value={data.reason} />
      </dl>
      {entry.content && <p className="mt-2 text-xs italic text-slate-500">Note: {entry.content}</p>}
    </NoteDisplayShell>
  );
};

export default ReferralNoteDisplay;