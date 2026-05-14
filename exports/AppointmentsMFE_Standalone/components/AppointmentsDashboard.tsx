

import React, { useState, useEffect, useMemo } from 'react';
import CalendarHeader from './CalendarHeader';
import AppointmentCalendar from './AppointmentCalendar';
import AppointmentDetailModal from './AppointmentDetailModal';
import AppointmentBookingModal from './AppointmentBookingModal';
import EditAppointmentModal from './EditAppointmentModal';
import RequestActionModal from './RequestActionModal';
import { appointmentService } from '../services/appointmentService';
import type { Appointment } from '../types';
import { authService, CurrentUser } from '../external/services/authService';
import { usePatients } from '../../PatientMFE/context/PatientContext';
import ConfirmationModal from '../external/components/ConfirmationModal';

interface AppointmentsDashboardProps {
    filterPatientId?: string;
}

const AppointmentsDashboard: React.FC<AppointmentsDashboardProps> = ({ filterPatientId }) => {
    const [currentDate, setCurrentDate] = useState(new Date(2024, 9, 1));
    const [allAppointments, setAllAppointments] = useState<Appointment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
    const [appointmentToEdit, setAppointmentToEdit] = useState<Appointment | null>(null);
    const [requestAction, setRequestAction] = useState<{ appointment: Appointment, type: 'change' | 'cancel' } | null>(null);
    const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
    const [appointmentToCancel, setAppointmentToCancel] = useState<Appointment | null>(null);
    const { getPatientById } = usePatients();


    const fetchAppointments = async () => {
        setIsLoading(true);
        const data = await appointmentService.fetchAppointments();
        setAllAppointments(data);
        setIsLoading(false);
    };

    useEffect(() => {
        // FIX: authService.getCurrentUser() is synchronous and does not return a Promise.
        setCurrentUser(authService.getCurrentUser());
        fetchAppointments();
    }, []);
    
    useEffect(() => {
        if (!filterPatientId && currentUser) {
             setCurrentDate(new Date());
        }
    }, [filterPatientId, currentUser]);

    const filteredAppointments = useMemo(() => {
        if (!filterPatientId) return allAppointments;
        return allAppointments.filter(appt => appt.patientId === filterPatientId);
    }, [allAppointments, filterPatientId]);
    
    const patientForCancellation = useMemo(() => {
        if (!appointmentToCancel) return null;
        return getPatientById(appointmentToCancel.patientId);
    }, [appointmentToCancel, getPatientById]);

    const handleSaveAppointment = async (appointmentData: Omit<Appointment, 'id' | 'createdAt' | 'createdBy' | 'status'>) => {
        if (!currentUser) return;
        await appointmentService.addAppointment({
            ...appointmentData,
            createdBy: currentUser.id,
            status: 'confirmed'
        });
        fetchAppointments();
        setIsBookingModalOpen(false);
    };
    
    const handleUpdateAppointment = async (appointmentData: Appointment) => {
        if (!currentUser) return;
        await appointmentService.updateAppointment(appointmentData, currentUser.id);
        fetchAppointments(); // Refresh list
        setAppointmentToEdit(null); // Close modal
    };

    const handleRequestAction = async (reason: string) => {
        if (!requestAction || !currentUser) return;
        const { appointment, type } = requestAction;
        const newStatus = type === 'change' ? 'change_requested' : 'cancel_requested';
        await appointmentService.updateAppointmentStatus(appointment.id, newStatus, currentUser.id, reason);
        fetchAppointments();
        setRequestAction(null);
        // Simulate sending a message
        alert(`Your request has been sent to the clinic for review. You will be contacted via the messaging portal.`);
    };
    
    const handleConfirmAdminCancel = async () => {
        if (!appointmentToCancel || !currentUser) return;
        await appointmentService.updateAppointmentStatus(appointmentToCancel.id, 'cancelled', currentUser.id, "Cancelled by administrator.");
        fetchAppointments();
        setSelectedAppointment(null);
        setAppointmentToCancel(null);
    };

    const handleOpenEditModal = (appointment: Appointment) => {
        setSelectedAppointment(null); // Close detail modal first
        setAppointmentToEdit(appointment);
    };

    // FIX: The roles 'Administrator' and 'Doctor' are not valid UserRole types. They have been changed to 'Practice Manager' and 'Clinician' respectively.
    const canCreateAppointments = currentUser?.role === 'Practice Manager' || currentUser?.role === 'Clinician' || currentUser?.role === 'Owner';
    const isPatientView = currentUser?.role === 'Patient';

    if (isLoading || !currentUser) {
        return <div className="flex justify-center items-center h-full"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500"></div></div>;
    }

    return (
        <>
            <div className="card-panel p-4 sm:p-6 h-full flex flex-col animate-fade-in">
                {!filterPatientId && <h1 className="text-3xl font-bold text-slate-900 mb-4">Appointment Scheduler</h1>}
                <CalendarHeader
                    currentDate={currentDate}
                    onPrevMonth={() => setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}
                    onNextMonth={() => setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}
                    onGoToToday={() => setCurrentDate(new Date())}
                    onDateChange={(date: Date) => setCurrentDate(new Date(date.getFullYear(), date.getMonth(), 1))}
                    onNewAppointmentClick={() => setIsBookingModalOpen(true)}
                    canCreateAppointments={canCreateAppointments && !filterPatientId}
                />
                <div className="flex-1 -m-px mt-0">
                    <AppointmentCalendar 
                        appointments={filteredAppointments}
                        currentDate={currentDate}
                        onSelectAppointment={setSelectedAppointment}
                    />
                </div>
            </div>

            <AppointmentDetailModal 
                isOpen={!!selectedAppointment}
                onClose={() => setSelectedAppointment(null)}
                appointment={selectedAppointment}
                currentUser={currentUser}
                onRequestAction={(appointment, type) => setRequestAction({ appointment, type })}
                onAdminCancel={(appointment) => setAppointmentToCancel(appointment)}
                onAdminEdit={handleOpenEditModal}
            />

            {canCreateAppointments && (
                <AppointmentBookingModal
                    isOpen={isBookingModalOpen}
                    onClose={() => setIsBookingModalOpen(false)}
                    onSave={handleSaveAppointment}
                />
            )}
            
            {canCreateAppointments && (
                <EditAppointmentModal 
                    isOpen={!!appointmentToEdit}
                    onClose={() => setAppointmentToEdit(null)}
                    onSave={handleUpdateAppointment}
                    appointment={appointmentToEdit}
                />
            )}

            {isPatientView && requestAction && (
                <RequestActionModal
                    isOpen={!!requestAction}
                    onClose={() => setRequestAction(null)}
                    onSubmit={handleRequestAction}
                    actionType={requestAction.type}
                />
            )}
            
            <ConfirmationModal
                isOpen={!!appointmentToCancel}
                onClose={() => setAppointmentToCancel(null)}
                onConfirm={handleConfirmAdminCancel}
                title="Confirm Appointment Cancellation"
            >
                <p>
                    Are you sure you want to cancel this appointment for{' '}
                    <span className="font-bold">{patientForCancellation?.name}</span>?
                </p>
                <p className="mt-2 text-sm text-slate-500">
                    This action cannot be undone. The patient may be notified.
                </p>
            </ConfirmationModal>
        </>
    );
};

export default AppointmentsDashboard;