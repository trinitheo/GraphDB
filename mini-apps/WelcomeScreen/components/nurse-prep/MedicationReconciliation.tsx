import React, { useState } from 'react';
import type { Patient } from '../../../PatientMFE/types';
import FormCheckbox from '../../../PatientMFE/components/form/FormCheckbox';
import { useAuth } from '../../../PatientMFE/hooks/useAuth';
import { medicalRecordService } from '../../../PatientMFE/services/medicalRecordService';

interface MedicationReconciliationProps {
    patient: Patient;
    onReconciled: () => void;
}

const MedicationReconciliation: React.FC<MedicationReconciliationProps> = ({ patient, onReconciled }) => {
    const activeMedications = patient.medications?.filter(m => m.status === 'Active') || [];
    const [reconciledMeds, setReconciledMeds] = useState<Set<string>>(new Set());
    const [isConfirmed, setIsConfirmed] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const { user } = useAuth();
    
    const handleToggle = (medId: string) => {
        if (isConfirmed || isSaving) return;
        setReconciledMeds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(medId)) {
                newSet.delete(medId);
            } else {
                newSet.add(medId);
            }
            return newSet;
        });
    };
    
    const handleConfirm = async () => {
        if (!user) return;
        setIsSaving(true);
        try {
            const confirmedMeds = activeMedications.filter(med => reconciledMeds.has(med.id));
            const notConfirmedMeds = activeMedications.filter(med => !reconciledMeds.has(med.id));
            
            let content = `Medication reconciliation performed by ${user.name}.
Patient's active medication list was reviewed.

Confirmed Taking:
${confirmedMeds.length > 0 ? confirmedMeds.map(m => `- ${m.name} (${m.dose})`).join('\n') : '- None'}

Not Confirmed / Discrepancy Noted:
${notConfirmedMeds.length > 0 ? notConfirmedMeds.map(m => `- ${m.name} (${m.dose})`).join('\n') : '- None'}
`;

            await medicalRecordService.addMedicalRecordEntry({
                patientId: patient.id,
                content: content,
                type: 'Consultation',
            });
            
            setIsConfirmed(true);
            onReconciled();
        } catch (error) {
            console.error("Failed to save reconciliation note:", error);
            // In a real app, a toast notification would be shown here.
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="card-panel p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Medication Reconciliation</h3>
            <p className="text-sm text-slate-500 mb-4">Confirm with the patient that they are still taking these medications as prescribed.</p>
            <div className="space-y-3">
                {activeMedications.length > 0 ? activeMedications.map(med => (
                    <div key={med.id} className={`p-3 rounded-lg transition-colors ${isConfirmed ? 'bg-slate-100' : 'bg-slate-50'}`}>
                        <FormCheckbox 
                            id={`med-${med.id}`}
                            label={
                                <div className="ml-2">
                                    <p className="font-semibold text-slate-800">{med.name}</p>
                                    <p className="text-sm text-slate-600">{med.dose}, {med.frequency}</p>
                                </div>
                            }
                            checked={reconciledMeds.has(med.id)}
                            onChange={() => handleToggle(med.id)}
                            disabled={isConfirmed || isSaving}
                        />
                    </div>
                )) : <p className="text-sm text-slate-500 italic">No active medications on record.</p>}
            </div>
             <button 
                className={`w-full mt-4 btn-neu transition-colors disabled:opacity-70 disabled:cursor-not-allowed ${
                    isConfirmed 
                    ? 'bg-green-500 text-white font-bold hover:bg-green-600'
                    : 'text-sky-600'
                }`}
                onClick={handleConfirm}
                disabled={isConfirmed || isSaving}
             >
                {isSaving ? 'Saving...' : isConfirmed ? 'Reconciliation Confirmed' : 'Confirm Reconciled'}
             </button>
        </div>
    );
};

export default MedicationReconciliation;