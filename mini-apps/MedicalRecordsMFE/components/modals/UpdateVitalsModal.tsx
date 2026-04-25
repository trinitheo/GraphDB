import React, { useState, useEffect } from 'react';
import type { Vitals } from '../../types';
import Modal from './Modal';
import VitalsCard from '../../../PatientMFE/components/dashboard/VitalsCard';

interface UpdateVitalsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (vitals: Vitals) => void;
    initialVitals: Vitals;
}

const UpdateVitalsModal: React.FC<UpdateVitalsModalProps> = ({ isOpen, onClose, onSave, initialVitals }) => {
    const [vitals, setVitals] = useState<Vitals>(initialVitals);

    useEffect(() => {
        if (isOpen) {
            setVitals(initialVitals);
        }
    }, [isOpen, initialVitals]);

    const handleSave = () => {
        onSave(vitals);
    };

    const footer = (
        <div className="flex justify-end gap-4">
            <button type="button" onClick={onClose} className="btn-neu">
                Cancel
            </button>
            <button type="button" onClick={handleSave} className="btn-neu text-sky-600">
                Save Vitals
            </button>
        </div>
    );

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Update Patient Vitals" footer={footer}>
            <VitalsCard
                vitals={vitals}
                isEditable={true}
                onSave={(updatedVitals) => setVitals(prev => ({ ...prev, ...updatedVitals }))}
            />
        </Modal>
    );
};

export default UpdateVitalsModal;