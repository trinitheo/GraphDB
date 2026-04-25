
import React from 'react';
import { AppointmentsIcon, FileText } from '../../../../components/icons';
import StatCard from './StatCard';
import WelcomeCard from './WelcomeCard';
import { useAuth } from '../../../PatientMFE/hooks/useAuth';

const AlliedHealthDashboard: React.FC = () => {
    const { user: currentUser } = useAuth();
    const stats = [
    {
      title: 'Today\'s Caseload',
      value: '6',
      description: 'Scheduled therapy sessions',
      icon: AppointmentsIcon,
      color: 'green' as const
    },
    {
      title: 'Reports Due',
      value: '2',
      description: 'Progress notes to finalize',
      icon: FileText,
      color: 'yellow' as const
    }
  ];
  return (
     <div className="space-y-6">
        <WelcomeCard name={currentUser?.name || 'Therapist'} />
        
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {stats.map((stat, index) => (
              <StatCard key={index} {...stat} />
            ))}
        </div>
        <div className="card-panel p-6">
            <h2 className="text-lg font-bold">Upcoming Sessions:</h2>
            <ul className="list-disc list-inside mt-2 text-slate-700">
                <li>10:00 AM: Eleanor Vance (Post-op Knee Rehab)</li>
                <li>11:00 AM: Benjamin Carter (Strength Training)</li>
            </ul>
        </div>
    </div>
  );
};
export default AlliedHealthDashboard;
