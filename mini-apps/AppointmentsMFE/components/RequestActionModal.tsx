import React, { useState } from 'react';
import Modal from '../../MedicalRecordsMFE/components/modals/Modal';
import FormTextArea from '../../PatientMFE/components/form/FormTextArea';

interface RequestActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reason: string) => void;
  actionType: 'change' | 'cancel';
}

const RequestActionModal: React.FC<RequestActionModalProps> = ({ isOpen, onClose, onSubmit, actionType }) => {
    const [reason, setReason] = useState('');
    
    const handleSubmit = () => {
        onSubmit(reason);
        setReason('');
    };

    const title = actionType === 'change' ? "Request Time/Date Change" : "Request Cancellation";
    const buttonText = actionType === 'change' ? "Submit Request" : "Request Cancellation";

    const footer = (
         <div className="flex justify-end gap-2">
            <button onClick={onClose} className="btn-neu">Back</button>
            <button onClick={handleSubmit} className="btn-neu text-sky-600">{buttonText}</button>
        </div>
    );

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title} footer={footer} size="md">
            <p className="text-sm text-slate-600 mb-4">
                Your request will be sent to the clinic for review. Please provide a brief reason for your request.
                A staff member will contact you via the messaging portal to confirm.
            </p>
            <FormTextArea
                label="Reason for Request"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={4}
                placeholder="e.g., I have a work conflict, I am feeling unwell..."
            />
        </Modal>
    );
};

export default RequestActionModal;
