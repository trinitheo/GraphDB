import React, { useState, useEffect } from 'react';
import Modal from '../../MedicalRecordsMFE/components/modals/Modal';
import { usePatients } from '../../PatientMFE/context/PatientContext';
import FormInput from '../../PatientMFE/components/form/FormInput';
import FormTextArea from '../../PatientMFE/components/form/FormTextArea';
import CustomDatePicker from '../../PatientMFE/components/form/CustomDatePicker';
import type { Appointment } from '../types';
import TimePicker from './TimePicker';

interface EditAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (appointmentData: Appointment) => void;
  appointment: Appointment | null;
}

const EditAppointmentModal: React.FC<EditAppointmentModalProps> = ({ isOpen, onClose, onSave, appointment }) => {
    const { getPatientById } = usePatients();
    
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [duration, setDuration] = useState('45');
    const [reason, setReason] = useState('');
    const [notes, setNotes] = useState('');
    const [error, setError] = useState('');
    
    const patient = appointment ? getPatientById(appointment.patientId) : null;

    useEffect(() => {
        if (appointment && isOpen) {
            const startDate = new Date(appointment.startTime);
            setDate(startDate.toISOString().split('T')[0]);
            setTime(startDate.toTimeString().substring(0, 5));
            
            const endDate = new Date(appointment.endTime);
            const durationInMinutes = (endDate.getTime() - startDate.getTime()) / 60000;
            setDuration(String(durationInMinutes));

            setReason(appointment.reason);
            setNotes(appointment.notes || '');
            setError('');
        }
    }, [appointment, isOpen]);

    const handleSave = () => {
        if (!appointment || !date || !time || !reason) {
            setError('Please fill out all required fields.');
            return;
        }
        
        const startTime = new Date(`${date}T${time}`);
        const endTime = new Date(startTime.getTime() + Number(duration) * 60000);

        const updatedAppointment: Appointment = {
            ...appointment,
            startTime: startTime.toISOString(),
            endTime: endTime.toISOString(),
            reason,
            notes,
        };

        onSave(updatedAppointment);
    };
    
    const footer = (
         <div className="flex justify-end gap-2">
            <button onClick={onClose} className="btn-neu">Cancel</button>
            <button onClick={handleSave} className="btn-neu text-sky-600">Save Changes</button>
        </div>
    );

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Edit Appointment" footer={footer}>
            <div className="space-y-4">
                <FormInput label="Patient" value={patient?.name || ''} disabled className="neu-sunken-sm" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <CustomDatePicker label="Date" value={date} onChange={setDate} required/>
                    <TimePicker label="Time" value={time} onChange={setTime} required />
                </div>
                <FormInput label="Duration (minutes)" type="number" value={duration} onChange={e => setDuration(e.target.value)} />
                <FormInput label="Reason for Visit" value={reason} onChange={e => setReason(e.target.value)} required />
                <FormTextArea label="Notes (optional)" value={notes} onChange={e => setNotes(e.target.value)} rows={3} />
                {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            </div>
        </Modal>
    );
};

export default EditAppointmentModal;
