

import React, { useState, useEffect } from 'react';
import type { Api } from '../../../../api_contract/patient';
import Modal from './Modal';
import FormInput from '../../../PatientMFE/components/form/FormInput';
import FormTextArea from '../../../PatientMFE/components/form/FormTextArea';
import CustomDatePicker from '../../../PatientMFE/components/form/CustomDatePicker';
import { authService } from '../../../PatientMFE/services/authService';

interface ProcedureModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (procedureData: Omit<Api.V1.Procedure, 'id'>) => void;
}

const ProcedureModal: React.FC<ProcedureModalProps> = ({ isOpen, onClose, onSave }) => {
    const [name, setName] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [practitioner, setPractitioner] = useState('');
    const [notes, setNotes] = useState('');
    const [error, setError] = useState('');
    const formId = 'procedure-form';

    useEffect(() => {
        if (isOpen) {
            // FIX: authService.getCurrentUser() is synchronous and does not return a promise.
            const user = authService.getCurrentUser();
            if (user) {
                setPractitioner(user.name);
            }
            setDate(new Date().toISOString().split('T')[0]); // Reset date on open
        }
    }, [isOpen]);

    const resetForm = () => {
        setName('');
        setDate(new Date().toISOString().split('T')[0]);
        setPractitioner('');
        setNotes('');
        setError('');
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !date) {
            setError('Procedure name and date are required.');
            return;
        }
        onSave({
            name,
            date,
            practitioner,
            notes,
        });
        handleClose();
    };

    const footer = (
         <div className="flex justify-end gap-4">
            <button type="button" onClick={handleClose} className="px-4 py-2 rounded-lg bg-slate-200 text-slate-800 font-semibold hover:bg-slate-300 transition-colors">
                Cancel
            </button>
            <button type="submit" form={formId} className="px-4 py-2 rounded-lg bg-sky-600 text-white font-semibold hover:bg-sky-700 transition-colors">
                Save Procedure
            </button>
        </div>
    );

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Add New Procedure" footer={footer}>
            <form id={formId} onSubmit={handleSave} className="space-y-4">
                <FormInput
                    label="Procedure Name"
                    name="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Cardiac Catheterization, Colonoscopy"
                    required
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <CustomDatePicker
                        label="Date of Procedure"
                        name="date"
                        value={date}
                        onChange={(value) => setDate(value)}
                        required
                    />
                    <FormInput
                        label="Physician / Practitioner"
                        name="practitioner"
                        value={practitioner}
                        readOnly
                        className="bg-slate-100 cursor-not-allowed"
                    />
                </div>
                <FormTextArea
                    label="Notes (optional)"
                    name="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Enter any relevant details, findings, or outcomes..."
                    rows={4}
                />
                
                {error && <p className="text-sm text-center text-red-600">{error}</p>}
            </form>
        </Modal>
    );
};

export default ProcedureModal;