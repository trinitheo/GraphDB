

import React from 'react';
import type { Api } from '../../../api_contract/patient';

type Medication = Api.V1.Medication;

interface MedicationListProps {
    patient: Api.V1.Patient;
    onViewDetails: (medication: Medication) => void;
    onDiscontinue: (medication: Medication) => void;
}

const EyeIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
);

const TrashIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
);

const MedicationList: React.FC<MedicationListProps> = ({ patient, onViewDetails, onDiscontinue }) => {
    const sortedMedications = [...(patient.medications || [])].sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());

    return (
        <div>
            {sortedMedications.length > 0 ? (
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Medication</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Directions (SIG)</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Prescriber</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {sortedMedications.map(med => (
                                <tr key={med.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        <p className="text-sm font-medium text-slate-900">{med.name}</p>
                                        <p className="text-xs text-slate-500">{med.dose}</p>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-slate-600 max-w-xs truncate">{med.notes || 'N/A'}</td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                            med.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-800'
                                        }`}>
                                            {med.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-slate-600">{med.prescriber || 'Unknown'}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            {med.prescriptionId && (
                                                <button 
                                                    onClick={() => onViewDetails(med)}
                                                    className="p-2 text-slate-400 hover:text-sky-600 hover:bg-slate-100 rounded-full transition-colors"
                                                    title="View Prescription Details"
                                                >
                                                    <EyeIcon className="w-5 h-5" />
                                                </button>
                                            )}
                                            {med.status === 'Active' && (
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); onDiscontinue(med); }}
                                                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-slate-100 rounded-full transition-colors"
                                                    title="Discontinue Medication"
                                                >
                                                    <TrashIcon className="w-5 h-5" />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                 <div className="text-center py-8">
                    <p className="text-slate-500">No medications found for this patient.</p>
                </div>
            )}
        </div>
    );
};

export default MedicationList;