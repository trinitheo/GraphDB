
import React, { useState } from 'react';
import type { Api } from '../../api_contract/patient';
import ProcedureList from './components/ProcedureList';
import ProcedureDetailModal from './components/ProcedureDetailModal';
import ProcedureModal from '../MedicalRecordsMFE/components/modals/ProcedureModal';
import { usePatients } from '../PatientMFE/context/PatientContext';
import { Stethoscope, PlusIcon } from '../../components/icons';

interface ProceduresViewProps {
    patient: Api.V1.Patient;
}

export const ProceduresView: React.FC<ProceduresViewProps> = ({ patient }) => {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [selectedProcedure, setSelectedProcedure] = useState<Api.V1.Procedure | null>(null);
    const { addProcedure } = usePatients();

    const handleSaveProcedure = async (procedureData: Omit<Api.V1.Procedure, 'id'>) => {
        await addProcedure(patient.id, procedureData);
        setIsAddModalOpen(false);
    };

    const handleViewDetails = (procedure: Api.V1.Procedure) => {
        setSelectedProcedure(procedure);
    };

    const handleCloseDetailModal = () => {
        setSelectedProcedure(null);
    };

    return (
        <div className="card-panel p-6 sm:p-8">
            <header className="flex justify-between items-center mb-6 border-b border-[var(--neu-shadow-dark)]/20 pb-4">
                <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                    <Stethoscope className="w-7 h-7 text-slate-500" />
                    <span>Procedures</span>
                </h2>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="btn-neu flex items-center space-x-2 text-sky-600"
                >
                    <PlusIcon className="h-5 w-5" />
                    <span>Log New Procedure</span>
                </button>
            </header>

            <ProcedureList 
                procedures={patient.procedures || []}
                onViewDetails={handleViewDetails}
            />
            
            <ProcedureModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSave={handleSaveProcedure}
            />

            {selectedProcedure && (
                <ProcedureDetailModal
                    isOpen={!!selectedProcedure}
                    onClose={handleCloseDetailModal}
                    procedure={selectedProcedure}
                />
            )}
        </div>
    );
};