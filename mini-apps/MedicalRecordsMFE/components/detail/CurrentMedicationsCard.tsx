

import React from 'react';
import type { Medication } from '../../types';
// FIX: Corrected icon import to use MedicationIcon from central library.
import { MedicationIcon } from '../../../../components/icons';

interface CurrentMedicationsCardProps {
    medications?: Medication[];
    onNavigateToMedications?: () => void;
}

const CurrentMedicationsCard: React.FC<CurrentMedicationsCardProps> = ({ medications, onNavigateToMedications }) => {
    const activeMedications = medications?.filter(med => med.status === 'Active');

    return (
        <div className="card-panel p-6">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <MedicationIcon size={20} className="text-green-500" />
                    Current Medications
                </h3>
            </div>
            <div className="space-y-4">
                {activeMedications && activeMedications.length > 0 ? (
                    activeMedications.map(med => (
                        <div key={med.id} className="border-b border-slate-200 pb-3 last:border-b-0">
                            <p className="font-semibold text-slate-800">{med.name}</p>
                            <p className="text-sm text-slate-500">{med.dose}, {med.frequency}</p>
                        </div>
                    ))
                ) : (
                    <p className="text-sm text-slate-500 italic">No active medications listed.</p>
                )}
            </div>
            <div className="mt-6">
                <button 
                    onClick={onNavigateToMedications}
                    className="w-full text-center px-4 py-2.5 bg-slate-100 text-slate-700 font-semibold text-sm rounded-lg hover:bg-slate-200 transition-colors"
                >
                    View Full Medication List &rarr;
                </button>
            </div>
        </div>
    );
};

export default CurrentMedicationsCard;