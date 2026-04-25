import React from 'react';
import type { Api } from '../../../api_contract/patient';
import Modal from '../../MedicalRecordsMFE/components/modals/Modal';

interface ProcedureDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    procedure: Api.V1.Procedure;
}

const DataPair: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div>
    <dt className="text-sm font-medium text-slate-500">{label}</dt>
    <dd className="mt-1 text-base text-slate-900">{value}</dd>
  </div>
);

const ProcedureDetailModal: React.FC<ProcedureDetailModalProps> = ({ isOpen, onClose, procedure }) => {
    const footer = (
        <div className="flex justify-end">
            <button 
                onClick={onClose} 
                className="btn-neu"
            >
                Close
            </button>
        </div>
    );

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Procedure Details" footer={footer}>
            <div className="space-y-4">
                <DataPair label="Procedure Name" value={<span className="font-bold">{procedure.name}</span>} />
                <DataPair label="Date of Procedure" value={new Date(procedure.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} />
                <DataPair label="Physician / Practitioner" value={procedure.practitioner} />
                <DataPair 
                    label="Notes" 
                    value={
                        procedure.notes ? (
                             <p className="whitespace-pre-wrap neu-sunken-sm p-3 rounded-md">{procedure.notes}</p>
                        ) : (
                            <span className="italic text-slate-500">No notes provided.</span>
                        )
                    } 
                />
            </div>
        </Modal>
    );
};

export default ProcedureDetailModal;