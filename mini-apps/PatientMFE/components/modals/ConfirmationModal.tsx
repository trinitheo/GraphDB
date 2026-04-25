
import React from 'react';
import Modal from './Modal'; // Import the shared modal component

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    children: React.ReactNode;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, onClose, onConfirm, title, children }) => {
    const footer = (
        <div className="flex justify-end space-x-4">
            <button 
                onClick={onClose}
                className="px-4 py-2 rounded-lg bg-slate-200 text-slate-800 font-semibold hover:bg-slate-300 transition-colors"
            >
                Cancel
            </button>
            <button 
                onClick={onConfirm}
                className="px-4 py-2 rounded-lg bg-sky-600 text-white font-semibold hover:bg-sky-700 transition-colors"
            >
                Confirm
            </button>
        </div>
    );

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={title}
            footer={footer}
            size="md"
        >
            <div className="text-sm text-slate-600">
                {children}
            </div>
        </Modal>
    );
};

export default ConfirmationModal;
