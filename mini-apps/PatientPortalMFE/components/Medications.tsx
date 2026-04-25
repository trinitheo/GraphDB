import React from 'react';
import { useAuth } from '../../PatientMFE/hooks/useAuth';
import { usePatients } from '../../PatientMFE/context/PatientContext';
// FIX: Add missing icon import
import { ClockIcon, AlertTriangle as ExclamationTriangleIcon, MedicationIcon } from '../../../components/icons';
import type { Medication as MedicationType } from '../../PatientMFE/types';

const Medications: React.FC = () => {
    const { user } = useAuth();
    const { getPatientById } = usePatients();

    const patient = user?.patientId ? getPatientById(user.patientId) : null;
    const medications = patient?.medications || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-900">My Medications</h2>
        <button className="btn-neu text-sky-600">
          Request Refill
        </button>
      </div>

      <div className="space-y-4">
        {medications.map((med: MedicationType) => {
            const prescription = patient?.prescriptions?.find(p => p.id === med.prescriptionId);
            const refillsRemaining = prescription?.refills ?? 0;

            return (
                <div key={med.id} className="card-panel p-6">
                    <div className="flex justify-between items-start">
                    <div>
                        <h3 className="font-semibold text-slate-900 text-lg">{med.name}</h3>
                        <p className="text-slate-600">{med.dose} • {med.frequency}</p>
                        <p className="text-sm text-slate-500">Prescribed by {med.prescriber}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        med.status === 'Active' 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-slate-100 text-slate-800'
                    }`}>
                        {med.status}
                    </span>
                    </div>
                    
                    <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm">
                        <div className="flex items-center text-slate-600">
                        <ClockIcon className="w-4 h-4 mr-1" />
                        Started: {new Date(med.startDate).toLocaleDateString()}
                        </div>
                        <div className={`flex items-center ${
                        refillsRemaining === 0 ? 'text-amber-600' : 'text-slate-600'
                        }`}>
                        {refillsRemaining === 0 && med.status === 'Active' && (
                            <ExclamationTriangleIcon className="w-4 h-4 mr-1" />
                        )}
                        Refills: {refillsRemaining}
                        </div>
                    </div>
                    
                    {refillsRemaining === 0 && med.status === 'Active' && (
                        <button className="btn-neu bg-amber-500 text-white text-sm">
                        Request Refill
                        </button>
                    )}
                    </div>
                </div>
            )
        })}
        {medications.length === 0 && (
             <div className="text-center py-16 text-slate-500 card-panel">
                <MedicationIcon className="w-12 h-12 mx-auto text-slate-400" />
                <p className="font-semibold text-lg mt-2">No Medications Found</p>
                <p className="mt-1">You do not have any medications on record.</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default Medications;