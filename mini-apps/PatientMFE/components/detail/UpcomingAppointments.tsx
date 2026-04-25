import React from 'react';
import { Link } from 'react-router-dom';
import type { Appointment } from '../../../AppointmentsMFE/types';
import { CalendarIcon as Calendar } from '../../../../components/icons';

interface UpcomingAppointmentsProps {
    appointments: Appointment[];
    patientId: string;
}

const formatAppointmentDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
        day: date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase(),
        date: date.toLocaleDateString('en-US', { day: '2-digit' }),
        month: date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase(),
    }
}

const UpcomingAppointments: React.FC<UpcomingAppointmentsProps> = ({ appointments, patientId }) => {
    return (
        <div>
            <div className="flex justify-between items-center mb-2">
                <h4 className="font-semibold text-slate-800 flex items-center gap-2">
                    <Calendar size={18} />
                    Upcoming Appointments
                </h4>
                 <Link 
                    to={`/appointments/patient/${patientId}`}
                    className="text-xs font-semibold text-sky-600 hover:underline"
                >
                    Manage Appointments
                </Link>
            </div>
            {appointments.length > 0 ? (
                <div className="space-y-3">
                    {appointments.slice(0, 3).map(appt => {
                        const { day, date, month } = formatAppointmentDate(appt.startTime);
                        return (
                            <div key={appt.id} className="flex items-center gap-4 p-3 bg-slate-100 rounded-lg transition-shadow hover:bg-slate-200/60">
                                <div className="flex-shrink-0 text-center w-16 p-2 bg-slate-200 rounded-lg shadow-sm">
                                    <p className="text-xs font-bold text-red-600">{month}</p>
                                    <p className="text-2xl font-bold text-slate-800">{date}</p>
                                    <p className="text-xs text-slate-500">{day}</p>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-slate-800 truncate">{appt.reason}</p>
                                    <p className="text-sm text-slate-600">Dr. Evelyn Chen</p>
                                    <p className="text-sm text-slate-500 font-mono">{new Date(appt.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                                </div>
                            </div>
                        )
                    })}
                </div>
            ) : (
                <p className="text-sm text-slate-500 italic px-3 py-4 bg-slate-100 rounded-lg">No upcoming appointments.</p>
            )}
        </div>
    );
};

export default UpcomingAppointments;