
import React from 'react';
import type { Appointment } from '../../../AppointmentsMFE/types';
import { usePatients } from '../../../PatientMFE/context/PatientContext';
import { CheckCircle, ClockIcon, AlertTriangle, FileText, XCircleIcon, User, VideoCameraIcon, ArrowRightIcon } from '../../../../components/icons';

interface TodaysAppointmentsListProps {
  appointments: Appointment[];
  onSelectAppointment: (appointment: Appointment) => void;
  isLoading: boolean;
  variant: 'upcoming' | 'completed';
}

const TodaysAppointmentsList: React.FC<TodaysAppointmentsListProps> = ({ appointments, onSelectAppointment, isLoading, variant }) => {
  const { getPatientById } = usePatients();

  if (isLoading) {
    return (
      <div className="space-y-4">
         {Array.from({ length: 3 }).map((_, i) => (
             <div key={i} className="flex items-start gap-4 p-4 rounded-2xl border border-slate-100 bg-white animate-pulse">
                 <div className="w-16 h-16 bg-slate-100 rounded-xl"></div>
                 <div className="flex-1 space-y-3 py-1">
                     <div className="w-32 h-4 bg-slate-100 rounded"></div>
                     <div className="w-48 h-3 bg-slate-100 rounded"></div>
                 </div>
             </div>
         ))}
      </div>
    );
  }

  if (appointments.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center h-32 text-center text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50">
        <p className="text-sm font-medium">No {variant} appointments.</p>
      </div>
    );
  }

  const getTriageColor = (reason: string) => {
    const lowerReason = reason.toLowerCase();
    if (lowerReason.includes('pain') || lowerReason.includes('emergency') || lowerReason.includes('chest')) return 'bg-rose-500'; // Immediate
    if (lowerReason.includes('fever') || lowerReason.includes('urgent')) return 'bg-amber-500'; // Urgent
    return 'bg-emerald-500'; // Delayed/Routine
  };

  const getTriageLabel = (reason: string) => {
    const lowerReason = reason.toLowerCase();
    if (lowerReason.includes('pain') || lowerReason.includes('emergency') || lowerReason.includes('chest')) return 'Immediate';
    if (lowerReason.includes('fever') || lowerReason.includes('urgent')) return 'Urgent';
    return 'Routine';
  };

  return (
    <div className="space-y-3">
      {appointments.map((appt) => {
        const patient = getPatientById(appt.patientId);
        const date = new Date(appt.startTime);
        const timeString = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        
        const isTelehealth = appt.location?.toLowerCase().includes('telehealth') || appt.location?.toLowerCase().includes('video');
        const triageColor = getTriageColor(appt.reason);
        const triageLabel = getTriageLabel(appt.reason);
        
        // Mock RHA Code based on patient ID
        const rhaCode = `NWRHA-${patient?.id.substring(0, 4).toUpperCase() || '0000'}`;

        return (
          <button
            key={appt.id}
            onClick={() => onSelectAppointment(appt)}
            className="group w-full flex items-stretch gap-4 p-4 rounded-2xl transition-all border border-slate-200 bg-white hover:border-blue-300 hover:shadow-md text-left relative overflow-hidden"
          >
            {/* Triage Indicator Line */}
            <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${triageColor}`}></div>

            {/* Time & Type */}
            <div className="flex-shrink-0 w-20 flex flex-col items-center justify-center text-center border-r border-slate-100 pr-4">
                <p className="text-sm font-bold text-slate-800">{timeString}</p>
                {isTelehealth ? (
                    <span className="mt-2 flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-600 text-[10px] font-bold uppercase tracking-wider rounded-md">
                        <VideoCameraIcon className="w-3 h-3" />
                        Video
                    </span>
                ) : (
                    <span className="mt-2 inline-block px-2 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-wider rounded-md">
                        Clinic
                    </span>
                )}
            </div>

            {/* Main Info */}
            <div className="flex-1 min-w-0 py-1">
                <div className="flex items-center gap-2 mb-1">
                    <p className="text-slate-900 font-bold truncate text-base">
                        {patient?.name || 'Unknown Patient'}
                    </p>
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[10px] font-semibold rounded-full">
                        {rhaCode}
                    </span>
                </div>
                <p className="text-sm text-slate-500 truncate mb-2">
                    {appt.reason}
                </p>
                <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                        triageLabel === 'Immediate' ? 'bg-rose-50 text-rose-600' :
                        triageLabel === 'Urgent' ? 'bg-amber-50 text-amber-600' :
                        'bg-emerald-50 text-emerald-600'
                    }`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${triageColor}`}></div>
                        {triageLabel}
                    </span>
                </div>
            </div>

            {/* Action/Status */}
            <div className="flex-shrink-0 flex flex-col justify-center items-end pl-4">
                {appt.status === 'checked_in' ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-50 text-blue-700">
                        Ready
                    </span>
                ) : appt.status === 'in_progress' ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-purple-50 text-purple-700">
                        In Visit
                    </span>
                ) : (
                    <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                        <ArrowRightIcon className="w-4 h-4" />
                    </div>
                )}
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default TodaysAppointmentsList;
