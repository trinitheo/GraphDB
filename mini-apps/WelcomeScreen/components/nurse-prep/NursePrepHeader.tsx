import React from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import type { Patient, Appointment } from '../../../PatientMFE/types';
import { ChevronLeft } from '../../../../components/icons';

interface NursePrepHeaderProps {
  patient: Patient;
  appointment: Appointment;
}

const NursePrepHeader: React.FC<NursePrepHeaderProps> = ({ patient, appointment }) => {
    const appointmentTime = new Date(appointment.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return (
        <div className="card-panel p-6">
            <ReactRouterDOM.Link to="/" className="inline-flex items-center text-sm text-sky-600 font-semibold mb-4">
                <ChevronLeft className="w-4 h-4 mr-1" />
                Back to Dashboard
            </ReactRouterDOM.Link>
            <div className="flex flex-col sm:flex-row items-center gap-4">
                <img src={patient.avatar} alt={patient.name} className="w-20 h-20 rounded-full object-cover" />
                <div className="text-center sm:text-left">
                    <h1 className="text-3xl font-bold text-slate-900">{patient.name}</h1>
                    <p className="text-slate-500">{patient.age} years old, {patient.gender}</p>
                </div>
            </div>
            <div className="mt-4 border-t border-slate-200 pt-4 text-center sm:text-left">
                <h2 className="text-lg font-semibold text-slate-800">Preparing for appointment at {appointmentTime}</h2>
                <p className="text-slate-600">Reason: {appointment.reason}</p>
            </div>
        </div>
    );
};

export default NursePrepHeader;
