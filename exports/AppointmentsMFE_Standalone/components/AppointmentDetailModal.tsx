
import React from 'react';
import { Link } from 'react-router-dom';
import Modal from '../../MedicalRecordsMFE/components/modals/Modal';
import type { Appointment, AppointmentStatus } from '../types';
import { usePatients } from '../../PatientMFE/context/PatientContext';
import { authService, CurrentUser } from '../external/services/authService';
import { appointmentService } from '../services/appointmentService';
import { 
    CalendarIcon, ClockIcon, User, Stethoscope, Pencil, 
    AlertTriangle, ChevronRight, CheckCircle, XCircleIcon, 
    ShieldCheckIcon 
} from '../../../components/icons';

interface AppointmentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: Appointment | null;
  currentUser: CurrentUser;
  onRequestAction: (appointment: Appointment, type: 'change' | 'cancel') => void;
  onAdminCancel: (appointment: Appointment) => void;
  onAdminEdit: (appointment: Appointment) => void;
  onCheckIn?: (patientName: string) => void;
  onStatusUpdate?: () => void;
  onStartVisit?: (appointment: Appointment) => void;
}

const MOCK_USERS: { [id: string]: string } = {
  'U001': 'Dr. Evelyn Chen',
  'U002': 'Robert Johnson',
  'U003': 'Alicia Rodriguez',
  'usr_ben_carter_123': 'Benjamin Carter',
};
const getUserNameById = (id: string | undefined) => id ? (MOCK_USERS[id] || id) : 'System';

const StatusBadge: React.FC<{ status: AppointmentStatus }> = ({ status }) => {
    const styles = {
        'scheduled': 'bg-blue-100 text-blue-800',
        'confirmed': 'bg-blue-100 text-blue-800',
        'checked_in': 'bg-green-100 text-green-800',
        'in_progress': 'bg-purple-100 text-purple-800',
        'completed': 'bg-slate-200 text-slate-800',
        'no_show': 'bg-red-100 text-red-800',
        'cancelled': 'bg-red-100 text-red-800',
        'change_requested': 'bg-amber-100 text-amber-800',
        'cancel_requested': 'bg-amber-100 text-amber-800'
    };
    
    return (
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide ${styles[status] || 'bg-gray-100'}`}>
            {status.replace('_', ' ')}
        </span>
    );
};

const DetailItem: React.FC<{ icon: React.ReactNode; label: string; value: React.ReactNode }> = ({ icon, label, value }) => (
    <div className="flex items-start gap-3">
        <div className="text-slate-500 mt-1">{icon}</div>
        <div>
            <p className="text-sm font-semibold text-slate-500">{label}</p>
            <p className="text-slate-800">{value}</p>
        </div>
    </div>
);

const AppointmentDetailModal: React.FC<AppointmentDetailModalProps> = ({ 
    isOpen, onClose, appointment, currentUser, onRequestAction, onAdminCancel, onAdminEdit, onCheckIn, onStatusUpdate, onStartVisit
}) => {
    const { getPatientById } = usePatients();
    const patient = appointment ? getPatientById(appointment.patientId) : null;

    // Refresh handle
    const handleStatusUpdate = async (newStatus: AppointmentStatus, closeModal: boolean = true) => {
        if (!appointment) return;
        await appointmentService.updateAppointmentStatus(appointment.id, newStatus, currentUser.id);
        
        if (newStatus === 'checked_in' && onCheckIn && patient) {
            onCheckIn(patient.name);
        }

        if (onStatusUpdate) {
            onStatusUpdate();
        }
        
        if (closeModal) {
            onClose();
        }
    };

    if (!isOpen || !appointment || !patient) return null;

    const formattedDate = new Date(appointment.startTime).toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const formattedTime = `${new Date(appointment.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${new Date(appointment.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

    const isPatientOwner = currentUser.role === 'Patient' && currentUser.patientId === appointment.patientId;
    const isAdmin = currentUser.role === 'Practice Manager' || currentUser.role === 'Clinician' || currentUser.role === 'Owner' || currentUser.role === 'Nurse';

    const renderActions = () => {
        if (isPatientOwner) {
            return (
                <div className="flex gap-2">
                    {(appointment.status === 'scheduled' || appointment.status === 'confirmed') && (
                        <>
                            <button onClick={() => onRequestAction(appointment, 'change')} className="btn-neu">Request Change</button>
                            <button onClick={() => onRequestAction(appointment, 'cancel')} className="btn-neu text-red-600">Cancel</button>
                        </>
                    )}
                </div>
            );
        }

        if (isAdmin) {
            return (
                <div className="flex flex-wrap gap-2 justify-end">
                    {appointment.status === 'scheduled' && (
                        <button onClick={() => handleStatusUpdate('confirmed', false)} className="btn-neu bg-blue-50 text-blue-700 hover:bg-blue-100">Confirm</button>
                    )}
                    
                    {(appointment.status === 'confirmed' || appointment.status === 'scheduled') && (
                        <button onClick={() => handleStatusUpdate('checked_in', false)} className="btn-neu bg-green-50 text-green-700 hover:bg-green-100 flex items-center gap-1">
                            <CheckCircle className="w-4 h-4" /> Check In
                        </button>
                    )}

                    {appointment.status === 'checked_in' && onStartVisit && (
                        <button onClick={() => onStartVisit(appointment)} className="btn-neu bg-purple-50 text-purple-700 hover:bg-purple-100 flex items-center gap-1">
                            <Stethoscope className="w-4 h-4" /> Start Visit
                        </button>
                    )}

                    {appointment.status === 'in_progress' && (
                        <button onClick={() => handleStatusUpdate('completed')} className="btn-neu bg-slate-800 text-white hover:bg-slate-700">
                            Complete Visit
                        </button>
                    )}

                    {(appointment.status !== 'cancelled' && appointment.status !== 'completed' && appointment.status !== 'no_show') && (
                        <>
                            <button onClick={() => onAdminEdit(appointment)} className="btn-neu flex items-center gap-1">
                                <Pencil className="w-4 h-4" /> Edit
                            </button>
                            <button onClick={() => onAdminCancel(appointment)} className="btn-neu text-red-600 flex items-center gap-1">
                                <XCircleIcon className="w-4 h-4" /> Cancel
                            </button>
                        </>
                    )}
                </div>
            );
        }
        return null;
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Appointment Details" size="lg">
            <div className="space-y-6">
                <div className="flex justify-between items-start border-b border-slate-100 pb-4">
                    <div>
                        <h3 className="text-xl font-bold text-slate-800">{appointment.reason}</h3>
                        <p className="text-slate-500 mt-1">ID: {appointment.id}</p>
                    </div>
                    <StatusBadge status={appointment.status} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <DetailItem icon={<User className="w-5 h-5" />} label="Patient" value={
                        <Link to={`/patients/${patient.id}`} className="text-sky-600 hover:underline flex items-center gap-1">
                            {patient.name} <ChevronRight className="w-3 h-3" />
                        </Link>
                    } />
                    <DetailItem icon={<Stethoscope className="w-5 h-5" />} label="Provider" value={getUserNameById(appointment.providerId)} />
                    <DetailItem icon={<CalendarIcon className="w-5 h-5" />} label="Date" value={formattedDate} />
                    <DetailItem icon={<ClockIcon className="w-5 h-5" />} label="Time" value={formattedTime} />
                    <DetailItem icon={<ShieldCheckIcon className="w-5 h-5" />} label="Location" value={appointment.location} />
                </div>

                {appointment.notes && (
                    <div className="bg-slate-50 p-4 rounded-lg">
                        <h4 className="text-sm font-semibold text-slate-700 mb-2">Notes</h4>
                        <p className="text-slate-600 text-sm">{appointment.notes}</p>
                    </div>
                )}

                {/* Audit / Tracking Info */}
                <div className="text-xs text-slate-400 pt-4 border-t border-slate-100 flex flex-col gap-1">
                    <p>Created by {getUserNameById(appointment.createdBy)} on {new Date(appointment.createdAt).toLocaleString()}</p>
                    {appointment.updatedBy && <p>Last updated by {getUserNameById(appointment.updatedBy)} on {new Date(appointment.updatedAt!).toLocaleString()}</p>}
                    {appointment.attendanceDetails?.checkInTime && <p>Checked in at {new Date(appointment.attendanceDetails.checkInTime).toLocaleTimeString()}</p>}
                </div>

                {/* Actions Footer */}
                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                    <button onClick={onClose} className="btn-neu">Close</button>
                    {renderActions()}
                </div>
            </div>
        </Modal>
    );
};

export default AppointmentDetailModal;
