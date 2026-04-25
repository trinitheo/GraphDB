
import React, { useState } from 'react';
import type { Api } from '../../api_contract/patient';
import MedicationList from './components/MedicationList';
import PrescriptionDetailModal from './components/PrescriptionDetailModal';
import { usePatients } from '../PatientMFE/context/PatientContext';
import ConfirmationModal from '../PatientMFE/components/modals/ConfirmationModal';
import { PrescriptionIcon, PlusIcon } from '../../components/icons';
import { useAuth } from '../PatientMFE/hooks/useAuth';

interface MedicationsViewProps {
    patient: Api.V1.Patient;
    onAddPrescriptionClick?: () => void;
}

export const MedicationsView: React.FC<MedicationsViewProps> = ({ patient, onAddPrescriptionClick }) => {
    const [selectedMedication, setSelectedMedication] = useState<Api.V1.Medication | null>(null);
    const [medicationToDiscontinue, setMedicationToDiscontinue] = useState<Api.V1.Medication | null>(null);
    const { discontinueMedication } = usePatients();
    const { user } = useAuth();

    const canPrescribe = user && user.role === 'Clinician';


    const handleViewDetails = (medication: Api.V1.Medication) => {
        setSelectedMedication(medication);
    };

    const handleCloseDetailModal = () => {
        setSelectedMedication(null);
    };

    const handleDiscontinue = (medication: Api.V1.Medication) => {
        setMedicationToDiscontinue(medication);
    };

    const handleConfirmDiscontinue = async () => {
        if (medicationToDiscontinue) {
            await discontinueMedication(patient.id, medicationToDiscontinue.id, medicationToDiscontinue.name);
            setMedicationToDiscontinue(null);
        }
    };
    
    const selectedPrescription = patient.prescriptions?.find(
        p => p.id === selectedMedication?.prescriptionId
    );


    return (
        <div className="card-panel p-6 sm:p-8">
            <header className="flex justify-between items-center mb-6 border-b border-[var(--neu-shadow-dark)]/20 pb-4">
                <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                    <PrescriptionIcon className="w-6 h-6 text-slate-500" />
                    <span>Medications & Prescriptions</span>
                </h2>
                {canPrescribe && (
                    <button
                        onClick={onAddPrescriptionClick}
                        className="btn-neu flex items-center space-x-2 text-sky-600"
                    >
                        <PlusIcon className="h-5 w-5" />
                        <span>Create New Prescription</span>
                    </button>
                )}
            </header>
            
            <MedicationList 
                patient={patient} 
                onViewDetails={handleViewDetails}
                onDiscontinue={handleDiscontinue}
            />

            {selectedPrescription && (
                <PrescriptionDetailModal 
                    isOpen={!!selectedPrescription}
                    onClose={handleCloseDetailModal}
                    prescription={selectedPrescription}
                    patient={patient}
                />
            )}

            <ConfirmationModal
                isOpen={!!medicationToDiscontinue}
                onClose={() => setMedicationToDiscontinue(null)}
                onConfirm={handleConfirmDiscontinue}
                title="Discontinue Medication"
            >
                <p>Are you sure you want to discontinue the medication <span className="font-bold">{medicationToDiscontinue?.name}</span>?</p>
                <p className="mt-2 text-sm text-slate-500">This action will be recorded in the patient's clinical log.</p>
            </ConfirmationModal>
        </div>
    );
};