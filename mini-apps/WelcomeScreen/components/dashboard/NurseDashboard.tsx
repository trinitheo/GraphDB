

import React, { useState, useEffect, useMemo } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { useAuth } from '../../../PatientMFE/hooks/useAuth';
import type { Appointment } from '../../../AppointmentsMFE/types';
import { appointmentService } from '../../../AppointmentsMFE/services/appointmentService';
import TodaysAppointmentsList from './TodaysAppointmentsList';
import WelcomeCard from './WelcomeCard';
import StatsCard from './StatsCard';
import ScheduleCard from './ScheduleCard';
// FIX: Corrected icon import
import { UsersIcon as UserGroupIcon, Stethoscope, MedicationIcon } from '../../../../components/icons';

const NurseDashboard: React.FC = () => {
  const { user: currentUser } = useAuth();
  const navigate = ReactRouterDOM.useNavigate();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAppointments = async () => {
      setIsLoading(true);
      const data = await appointmentService.fetchAppointments();
      setAppointments(data);
      setIsLoading(false);
    };
    fetchAppointments();
  }, []);

  const todaysAppointments = useMemo(() => {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

    return appointments
      .filter(appt => {
        const apptDate = new Date(appt.startTime);
        return apptDate >= startOfDay && apptDate < endOfDay && appt.status !== 'cancelled' && appt.status !== 'completed';
      })
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
  }, [appointments]);

  const handleSelectAppointment = (appointment: Appointment) => {
    navigate(`/prep/${appointment.id}`);
  };

  const stats = [
      {
          icon: UserGroupIcon,
          title: "Upcoming Patients",
          value: isLoading ? '...' : todaysAppointments.length,
          subtitle: "Scheduled for today"
      },
      {
          icon: Stethoscope,
          title: "Vitals to Record",
          value: "4",
          subtitle: "Pending vitals checks"
      },
      {
          icon: MedicationIcon,
          title: "Meds to Administer",
          value: "8",
          subtitle: "Scheduled medication rounds"
      }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <WelcomeCard name={currentUser?.name.split(' ')[0] || 'Nurse'} />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map(stat => <StatsCard key={stat.title} {...stat} />)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
            <ScheduleCard />
        </div>
        <div className="lg:col-span-2">
            <div className="card-panel p-6 h-full">
                <h2 className="text-xl font-bold text-slate-800 mb-4">
                  Today's Patient Queue
                </h2>
                <TodaysAppointmentsList 
                  appointments={todaysAppointments} 
                  onSelectAppointment={handleSelectAppointment}
                  isLoading={isLoading}
                  variant="upcoming"
                />
            </div>
        </div>
      </div>
    </div>
  );
};

export default NurseDashboard;