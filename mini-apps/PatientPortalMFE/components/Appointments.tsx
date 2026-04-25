
import React, { useState, useEffect } from 'react';
import { AppointmentsDashboard } from '../../AppointmentsMFE';
import { useAuth } from '../../PatientMFE/hooks/useAuth';
import { appointmentService } from '../../AppointmentsMFE/services/appointmentService';
import { CheckCircle, MapPin } from '../../../components/icons';
import type { Appointment } from '../../AppointmentsMFE/types';

const Appointments: React.FC = () => {
    const { user } = useAuth();
    const [upcomingAppointment, setUpcomingAppointment] = useState<Appointment | null>(null);
    const [isCheckedIn, setIsCheckedIn] = useState(false);

    useEffect(() => {
        const fetchUpcoming = async () => {
            if (user?.patientId) {
                const appointments = await appointmentService.fetchAppointments();
                const now = new Date();
                
                // Find next scheduled appointment within check-in window (e.g., 30 mins before)
                const next = appointments.find(a => {
                    const start = new Date(a.startTime);
                    const diffMins = (start.getTime() - now.getTime()) / 60000;
                    return (
                        a.patientId === user.patientId && 
                        (a.status === 'scheduled' || a.status === 'confirmed') &&
                        diffMins <= 30 && diffMins > -15 // Window: 30 mins before to 15 mins after start
                    );
                });
                setUpcomingAppointment(next || null);
            }
        };
        fetchUpcoming();
    }, [user]);

    const handleSelfCheckIn = async () => {
        if (!upcomingAppointment || !user) return;
        await appointmentService.updateAppointmentStatus(upcomingAppointment.id, 'checked_in', user.id, undefined, 'portal');
        setIsCheckedIn(true);
        setUpcomingAppointment(null);
    };

    if (!user || !user.patientId) {
        return <div className="card-panel p-6">Loading patient information...</div>
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-slate-900">My Appointments</h1>
            </div>

            {isCheckedIn && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3 animate-fade-in">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                    <div>
                        <h3 className="font-bold text-green-900">You are checked in!</h3>
                        <p className="text-green-800 text-sm">Please take a seat in the waiting area. The clinician will be with you shortly.</p>
                    </div>
                </div>
            )}

            {upcomingAppointment && !isCheckedIn && (
                <div className="mb-6 p-6 bg-indigo-600 rounded-xl text-white shadow-lg flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div>
                        <h3 className="text-xl font-bold">Appointment Starting Soon</h3>
                        <p className="opacity-90 flex items-center gap-2 mt-1">
                            <MapPin className="w-4 h-4" /> 
                            {upcomingAppointment.location} • {new Date(upcomingAppointment.startTime).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}
                        </p>
                    </div>
                    <button 
                        onClick={handleSelfCheckIn}
                        className="px-6 py-3 bg-white text-indigo-700 font-bold rounded-lg shadow-sm hover:bg-indigo-50 transition-colors animate-pulse"
                    >
                        I'm Here - Check In
                    </button>
                </div>
            )}

            <div className="h-[calc(100vh-12rem)]">
                <AppointmentsDashboard filterPatientId={user.patientId} />
            </div>
        </div>
    );
};

export default Appointments;
