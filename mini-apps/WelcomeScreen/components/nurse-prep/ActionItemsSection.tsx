import React, { useState } from 'react';
import type { Patient, Vitals } from '../../../PatientMFE/types';
import { HeartIcon, MedicationIcon, PlusIcon } from '../../../../components/icons';
import UpdateVitalsModal from '../../../MedicalRecordsMFE/components/modals/UpdateVitalsModal';
import { usePatients } from '../../../PatientMFE/context/PatientContext';

interface ActionItemsSectionProps {
    patient: Patient;
    onAddNoteClick: () => void;
}

const ActionButton: React.FC<{ icon: React.ReactNode, label: string, onClick: () => void }> = ({ icon, label, onClick }) => (
    <button onClick={onClick} className="flex flex-col items-center justify-center p-4 card-panel text-slate-700 transition-all duration-300 hover:shadow-md hover:-translate-y-1">
        {icon}
        <span className="font-semibold text-sm mt-2">{label}</span>
    </button>
);

const ActionItemsSection: React.FC<ActionItemsSectionProps> = ({ patient, onAddNoteClick }) => {
    const [isVitalsModalOpen, setIsVitalsModalOpen] = useState(false);
    const { addVitalsRecord } = usePatients();

    const handleSaveVitals = async (vitals: Vitals) => {
        await addVitalsRecord(patient.id, vitals);
        setIsVitalsModalOpen(false);
    };

    return (
        <>
            <div className="card-panel p-6">
                <h3 className="text-lg font-bold text-slate-800 mb-4">Action Items</h3>
                <div className="grid grid-cols-3 gap-4">
                    <ActionButton icon={<HeartIcon className="w-8 h-8 text-red-500" />} label="Update Vitals" onClick={() => setIsVitalsModalOpen(true)} />
                    <ActionButton icon={<MedicationIcon className="w-8 h-8 text-green-500" />} label="Review Meds" onClick={() => alert('Review Meds - Not Implemented')} />
                    <ActionButton icon={<PlusIcon className="w-8 h-8 text-sky-500" />} label="Add Note" onClick={onAddNoteClick} />
                </div>
            </div>

            {patient.latestVitals && (
                 <UpdateVitalsModal
                    isOpen={isVitalsModalOpen}
                    onClose={() => setIsVitalsModalOpen(false)}
                    onSave={handleSaveVitals}
                    initialVitals={patient.latestVitals}
                />
            )}
        </>
    );
};

export default ActionItemsSection;