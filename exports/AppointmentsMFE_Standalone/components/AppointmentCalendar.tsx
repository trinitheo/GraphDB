import React from 'react';
import type { Appointment } from '../types';
import type { Patient } from '../../PatientMFE/types';
import { getCalendarGrid } from '../utils/dateUtils';
import { usePatients } from '../../PatientMFE/context/PatientContext';
import { ClockIcon } from '../../../components/icons';

interface AppointmentCalendarProps {
  appointments: Appointment[];
  currentDate: Date;
  onSelectAppointment: (appointment: Appointment) => void;
}

const getAppointmentStyling = (reason: string, status: Appointment['status']): { type: string, colorClass: string, isPending: boolean } => {
    const lowerReason = reason.toLowerCase();
    
    if (status === 'change_requested' || status === 'cancel_requested') {
        return { type: 'Pending Request', colorClass: 'border-amber-500 bg-amber-50 text-amber-800 hover:bg-amber-100', isPending: true };
    }
    if (status === 'cancelled') {
         return { type: 'Cancelled', colorClass: 'border-slate-400 bg-slate-100 text-slate-500 opacity-60', isPending: false };
    }
    
    if (lowerReason.includes('consultation')) {
        return { type: 'Consultation', colorClass: 'border-teal-500 bg-teal-50 text-teal-800 hover:bg-teal-100', isPending: false };
    }
    if (lowerReason.includes('follow-up')) {
        return { type: 'Follow-up', colorClass: 'border-purple-500 bg-purple-50 text-purple-800 hover:bg-purple-100', isPending: false };
    }
    if (lowerReason.includes('assessment')) {
        return { type: 'Assessment', colorClass: 'border-green-500 bg-green-50 text-green-800 hover:bg-green-100', isPending: false };
    }
    return { type: 'Appointment', colorClass: 'border-sky-500 bg-sky-50 text-sky-800 hover:bg-sky-100', isPending: false };
};

const AppointmentCard: React.FC<{ appointment: Appointment; patient?: Patient; onSelect: () => void }> = ({ appointment, patient, onSelect }) => {
    const { type, colorClass, isPending } = getAppointmentStyling(appointment.reason, appointment.status);
    const time = new Date(appointment.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    
    return (
        <button onClick={onSelect} className={`w-full text-left p-1.5 rounded-md border-l-4 text-xs transition-all ${colorClass}`}>
            <div className="font-semibold truncate flex items-center gap-1">
                {isPending && <ClockIcon className="w-3 h-3 flex-shrink-0" />}
                {patient?.name || 'Loading...'}
            </div>
            <div className="flex justify-between items-center">
                <span className="text-slate-600 truncate">{type}</span>
                <span className="font-mono">{time}</span>
            </div>
        </button>
    );
};

const AppointmentCalendar: React.FC<AppointmentCalendarProps> = ({ appointments, currentDate, onSelectAppointment }) => {
    const grid = getCalendarGrid(currentDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { getPatientById } = usePatients();

    const appointmentsByDate = React.useMemo(() => {
        const map = new Map<string, Appointment[]>();
        appointments.forEach(appt => {
            const dateKey = new Date(appt.startTime).toDateString();
            if (!map.has(dateKey)) {
                map.set(dateKey, []);
            }
            map.get(dateKey)!.push(appt);
        });
        return map;
    }, [appointments]);

    return (
        <div className="flex-1 grid grid-cols-7 grid-rows-1 auto-rows-fr gap-px bg-slate-200 border border-slate-200">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center text-sm font-semibold py-2 bg-slate-50 text-slate-600">{day}</div>
            ))}
            {grid.map((date, index) => {
                const isCurrentMonth = date?.getMonth() === currentDate.getMonth();
                const isToday = date?.getTime() === today.getTime();
                const appointmentsForDay = date ? (appointmentsByDate.get(date.toDateString()) || []) : [];

                return (
                    <div key={index} className={`p-2 bg-white flex flex-col ${!isCurrentMonth ? 'bg-slate-50' : ''}`}>
                        <div className={`flex justify-center items-center h-7 w-7 text-sm font-semibold rounded-full ${isToday ? 'bg-sky-600 text-white' : isCurrentMonth ? 'text-slate-800' : 'text-slate-400'}`}>
                            {date?.getDate()}
                        </div>
                        <div className="flex-1 mt-2 space-y-1.5 overflow-y-auto scrollbar-autohide">
                           {appointmentsForDay
                                .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
                                .map(appt => (
                                    <AppointmentCard
                                        key={appt.id}
                                        appointment={appt}
                                        patient={getPatientById(appt.patientId)}
                                        onSelect={() => onSelectAppointment(appt)}
                                    />
                                ))
                            }
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default AppointmentCalendar;