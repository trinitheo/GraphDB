import React, { useState, useRef, useEffect } from 'react';
import Modal from '../../MedicalRecordsMFE/components/modals/Modal';
import { usePatients } from '../../PatientMFE/context/PatientContext';
import FormSelect from '../../PatientMFE/components/form/FormSelect';
import FormInput from '../../PatientMFE/components/form/FormInput';
import FormTextArea from '../../PatientMFE/components/form/FormTextArea';
import CustomDatePicker from '../../PatientMFE/components/form/CustomDatePicker';
import type { Appointment } from '../types';
import { ChevronDown } from '../../../components/icons';
import TimePicker from './TimePicker';

interface AppointmentBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (appointmentData: Omit<Appointment, 'id' | 'createdAt' | 'createdBy' | 'status'>) => void;
}

const AppointmentBookingModal: React.FC<AppointmentBookingModalProps> = ({ isOpen, onClose, onSave }) => {
    const { state: { list: patients } } = usePatients();
    const [patientId, setPatientId] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [time, setTime] = useState('09:00');
    const [duration, setDuration] = useState('45');
    const [reason, setReason] = useState('');
    const [notes, setNotes] = useState('');
    const [error, setError] = useState('');
    const [isReasonDropdownOpen, setIsReasonDropdownOpen] = useState(false);
    
    const reasonOptions = ["Initial Consultation", "Follow-up", "Assessment"];
    const reasonRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (reasonRef.current && !reasonRef.current.contains(event.target as Node)) {
                setIsReasonDropdownOpen(false);
            }
        };
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    useEffect(() => {
        if (error) {
            setError('');
        }
    }, [patientId, date, time, reason]);


    const resetForm = () => {
        setPatientId('');
        setDate(new Date().toISOString().split('T')[0]);
        setTime('09:00');
        setDuration('45');
        setReason('');
        setNotes('');
        setError('');
        setIsReasonDropdownOpen(false);
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };
    
    const handleSave = () => {
        if (!patientId || !date || !time || !reason) {
            setError('Please fill out all required fields.');
            return;
        }
        
        const startTime = new Date(`${date}T${time}`);

        if (startTime < new Date()) {
            setError('Cannot book appointments in the past.');
            return;
        }

        const endTime = new Date(startTime.getTime() + Number(duration) * 60000);

        onSave({
            patientId,
            startTime: startTime.toISOString(),
            endTime: endTime.toISOString(),
            reason,
            notes,
            providerId: 'U001', // Default provider
            location: 'Physiotherapy Suite B',
        });
        resetForm();
    };
    
    const footer = (
         <div className="flex justify-end gap-2">
            <button onClick={handleClose} className="btn-neu">Cancel</button>
            <button onClick={handleSave} className="btn-neu text-sky-600">Save Appointment</button>
        </div>
    );

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="New Appointment" footer={footer}>
            <div className="space-y-4">
                <FormSelect label="Patient" value={patientId} onChange={e => setPatientId(e.target.value)} required>
                    <option value="">Select a patient...</option>
                    {patients.filter(p => !p.archived).map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                </FormSelect>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <CustomDatePicker label="Date" value={date} onChange={setDate} required/>
                    <TimePicker label="Time" value={time} onChange={setTime} required />
                </div>
                <FormInput label="Duration (minutes)" type="number" value={duration} onChange={e => setDuration(e.target.value)} />
                
                <div ref={reasonRef} className="relative">
                    <label htmlFor="reason-for-visit" className="block text-sm font-medium text-slate-700 mb-1">
                        Reason for Visit <span className="text-red-500">*</span>
                    </label>
                    <button
                        type="button"
                        id="reason-for-visit"
                        onClick={() => setIsReasonDropdownOpen(!isReasonDropdownOpen)}
                        className="input-neu w-full flex justify-between items-center text-left"
                        aria-haspopup="listbox"
                        aria-expanded={isReasonDropdownOpen}
                    >
                        <span className={reason ? 'text-slate-900' : 'text-slate-500'}>
                            {reason || 'Select a reason...'}
                        </span>
                        <ChevronDown className={`w-5 h-5 text-slate-500 transition-transform duration-200 ${isReasonDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {isReasonDropdownOpen && (
                        <div className="absolute z-10 mt-1 w-full bg-white card-panel animate-fade-in-fast" role="listbox">
                            <ul className="py-1">
                                {reasonOptions.map((option) => (
                                    <li
                                        key={option}
                                        onClick={() => {
                                            setReason(option);
                                            setIsReasonDropdownOpen(false);
                                        }}
                                        className="px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 cursor-pointer"
                                        role="option"
                                        aria-selected={reason === option}
                                    >
                                        {option}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>

                <FormTextArea label="Notes (optional)" value={notes} onChange={e => setNotes(e.target.value)} rows={3} />
                {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            </div>
        </Modal>
    );
};

export default AppointmentBookingModal;
