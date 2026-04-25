

import React, { useState, useEffect } from 'react';
import type { Api } from '../../../../api_contract/patient';
import Modal from './Modal';
import FormInput from '../../../PatientMFE/components/form/FormInput';
import FormSelect from '../../../PatientMFE/components/form/FormSelect';
import FormTextArea from '../../../PatientMFE/components/form/FormTextArea';
import { authService } from '../../../PatientMFE/services/authService';

interface ReferralModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (referralData: Omit<Api.V1.Referral, 'id' | 'patientId' | 'date' | 'status'>) => void;
    patient: Api.V1.Patient;
}

const ReferralModal: React.FC<ReferralModalProps> = ({ isOpen, onClose, onSave, patient }) => {
    const [fromProvider, setFromProvider] = useState('');
    const [toProvider, setToProvider] = useState('');
    const [specialty, setSpecialty] = useState('');
    const [reason, setReason] = useState('');
    const [urgency, setUrgency] = useState<Api.V1.Referral['urgency']>('Routine');
    const [notes, setNotes] = useState('');
    const [error, setError] = useState('');
    const formId = 'referral-form';

    useEffect(() => {
        if (isOpen) {
            // FIX: authService.getCurrentUser() is synchronous and does not return a promise.
            const user = authService.getCurrentUser();
            if (user) {
                setFromProvider(user.name);
            }
        }
    }, [isOpen]);

    const resetForm = () => {
        setToProvider('');
        setSpecialty('');
        setReason('');
        setUrgency('Routine');
        setNotes('');
        setError('');
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (!specialty.trim() || !reason.trim()) {
            setError('Specialty and Reason for Referral are required fields.');
            return;
        }
        onSave({
            fromProvider,
            toProvider,
            specialty,
            reason,
            urgency,
            notes,
        });
        handleClose();
    };

    const footer = (
        <div className="flex justify-end gap-4">
            <button type="button" onClick={handleClose} className="btn-neu">
                Cancel
            </button>
            <button type="submit" form={formId} className="btn-neu text-sky-600">
                Save Referral
            </button>
        </div>
    );

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title={`New Referral for ${patient.name}`} footer={footer}>
            <form id={formId} onSubmit={handleSave} className="space-y-4">
                <FormInput label="From" value={fromProvider} disabled className="neu-sunken-sm" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormInput
                        label="To (Provider / Clinic)"
                        value={toProvider}
                        onChange={e => setToProvider(e.target.value)}
                        placeholder="e.g., Dr. Alan Grant"
                    />
                    <FormInput
                        label="Specialty"
                        value={specialty}
                        onChange={e => setSpecialty(e.target.value)}
                        placeholder="e.g., Gastroenterology"
                        required
                    />
                </div>
                <FormTextArea
                    label="Reason for Referral"
                    value={reason}
                    onChange={e => setReason(e.target.value)}
                    placeholder="Briefly describe the reason for this referral..."
                    rows={3}
                    required
                />
                <FormSelect label="Urgency" value={urgency} onChange={e => setUrgency(e.target.value as Api.V1.Referral['urgency'])}>
                    <option value="Routine">Routine</option>
                    <option value="Urgent">Urgent</option>
                    <option value="STAT">STAT</option>
                </FormSelect>
                <FormTextArea
                    label="Additional Notes (Optional)"
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="Include any relevant history, findings, or specific questions for the consultant..."
                    rows={4}
                />
                
                {error && <p className="text-sm text-center text-red-600">{error}</p>}
            </form>
        </Modal>
    );
};

export default ReferralModal;