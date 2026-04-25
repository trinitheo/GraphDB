import React, { useState, useEffect, useMemo } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import {
  Users, Calendar, FileText, CheckCircle, Clock
} from 'lucide-react';
import type { Appointment } from '../../../AppointmentsMFE/types';
import { appointmentService } from '../../../AppointmentsMFE/services/appointmentService';
import { useAuth } from '../../../PatientMFE/hooks/useAuth';
import { usePatients } from '../../../PatientMFE/context/PatientContext';
import AIAssistant from './AIAssistant';

const ClinicianDashboard: React.FC = () => {
  const { user: currentUser } = useAuth();
  const { getPatientById } = usePatients();
  const navigate = ReactRouterDOM.useNavigate();
  
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoadingAppointments, setIsLoadingAppointments] = useState(true);

  const fetchAppointments = async () => {
    setIsLoadingAppointments(true);
    try {
      const data = await appointmentService.fetchAppointments();
      setAppointments(data);
    } catch (error) {
      console.error('Failed to fetch appointments:', error);
    } finally {
      setIsLoadingAppointments(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const allTodaysAppointments = useMemo(() => {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

    return appointments.filter(appt => {
      const apptDate = new Date(appt.startTime);
      return apptDate >= startOfDay && apptDate < endOfDay;
    });
  }, [appointments]);

  const upcomingTodaysAppointments = useMemo(() => {
    const now = new Date();
    return allTodaysAppointments
      .filter(appt => new Date(appt.startTime) >= now && appt.status !== 'cancelled' && appt.status !== 'completed')
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
  }, [allTodaysAppointments]);

  const completedTodaysAppointments = useMemo(() => {
    return allTodaysAppointments
      .filter(appt => appt.status === 'completed')
      .sort((a, b) => b.startTime.localeCompare(a.startTime));
  }, [allTodaysAppointments]);

  const activePatient = upcomingTodaysAppointments[0];
  const activePatientDetails = activePatient ? getPatientById(activePatient.patientId) : null;

  const formatTime = (dateString?: string) => {
    if (!dateString) return '--:--';
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (isLoadingAppointments) {
    return <div className="p-8 text-slate-500">Loading dashboard...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8">
        <h1 className="text-xl font-semibold text-slate-800">CarePlus PRM - Clinician Dashboard</h1>
        <button className="bg-blue-600 hover:bg-blue-700 transition-colors text-white px-4 py-2 rounded-lg text-sm font-medium">
          New Patient
        </button>
      </header>

      <div className="p-8 max-w-7xl mx-auto space-y-6">
        
        {/* Top Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
              <Users size={24} />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium">Remaining Today</p>
              <p className="text-2xl font-bold text-slate-800">{upcomingTodaysAppointments.length}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center">
              <CheckCircle size={24} />
            </div>
            <div>
               <p className="text-sm text-slate-500 font-medium">Completed</p>
               <p className="text-2xl font-bold text-slate-800">{completedTodaysAppointments.length}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Active Patient */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <Clock size={20} className="text-blue-500" /> Current Patient
              </h2>
              {activePatient && activePatientDetails ? (
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center text-xl font-bold text-slate-600">
                    {activePatientDetails.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-slate-900">{activePatientDetails.name}</h3>
                    <p className="text-slate-500">{activePatient.reason || 'General Consultation'}</p>
                    <p className="text-sm text-slate-400 mt-1">Scheduled for: {formatTime(activePatient.startTime)}</p>
                  </div>
                  <button className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg font-medium transition-colors">
                    Open Chart
                  </button>
                </div>
              ) : (
                <div className="text-slate-500 py-4 text-center">No active patient at the moment.</div>
              )}
            </div>

            {/* Upcoming Schedule */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <Calendar size={20} className="text-slate-500" /> Upcoming Schedule
              </h2>
              {upcomingTodaysAppointments.length > 1 ? (
                <div className="space-y-4">
                  {upcomingTodaysAppointments.slice(1, 4).map((appt) => {
                    const patientDetails = getPatientById(appt.patientId);
                    return (
                      <div key={appt.id} className="flex items-center justify-between p-4 border border-slate-100 rounded-lg hover:bg-slate-50 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="text-center w-16">
                            <p className="text-sm font-bold text-slate-700">{formatTime(appt.startTime)}</p>
                          </div>
                          <div>
                            <p className="font-medium text-slate-800">{patientDetails?.name || 'Unknown Patient'}</p>
                            <p className="text-sm text-slate-500">{appt.reason || 'N/A'}</p>
                          </div>
                        </div>
                        <button className="text-blue-600 text-sm font-medium hover:underline">
                          View
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-slate-500 py-4 text-center">No more appointments scheduled for today.</div>
              )}
            </div>
            
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <FileText size={20} className="text-slate-500" /> Smart Assistant
              </h2>
              {activePatientDetails ? (
                <div className="text-slate-600">
                  <AIAssistant patientDetails={activePatientDetails} />
                </div>
              ) : (
                <p className="text-slate-500 text-sm">Select a patient to see AI-generated insights.</p>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ClinicianDashboard;