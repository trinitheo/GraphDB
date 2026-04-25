
import React from 'react';
import { 
  UsersIcon, 
  CurrencyDollarIcon, 
  AppointmentsIcon,
  UserManagementIcon,
  FileText
} from '../../../../components/icons';
import StatCard from './StatCard';
import RecentActivity from './RecentActivity';
import QuickActions from './QuickActions';
import WelcomeCard from './WelcomeCard';
import { useAuth } from '../../../PatientMFE/hooks/useAuth';

const PracticeManagerDashboard: React.FC = () => {
  const { user: currentUser } = useAuth();
  
  const stats = [
    {
      title: 'Appointments Today',
      value: '32',
      description: '12 pending, 20 completed',
      icon: AppointmentsIcon,
      color: 'blue' as const
    },
    {
      title: 'Billed This Week',
      value: '$12,340',
      description: 'Across all services',
      icon: CurrencyDollarIcon,
      color: 'green' as const
    },
    {
      title: 'Active Staff',
      value: '15',
      description: 'Clinicians & Nurses',
      icon: UsersIcon,
      color: 'purple' as const
    },
    {
      title: 'Open Tasks',
      value: '8',
      description: 'Pending administrative tasks',
      icon: FileText,
      color: 'yellow' as const
    }
  ];

  const activities = [
    {
      id: '1',
      type: 'appointment' as const,
      description: 'Appointment cancelled by patient',
      patientName: 'John Smith',
      timestamp: new Date('2024-10-20T14:30:00'),
      status: 'cancelled' as const
    },
    {
      id: '2',
      type: 'system' as const,
      description: 'New user "Dr. Jane Doe" added',
      timestamp: new Date('2024-10-20T13:15:00'),
      status: 'completed' as const
    },
    {
      id: '3',
      type: 'payment' as const,
      description: 'Invoice #5829 paid',
      patientName: 'Maria Garcia',
      timestamp: new Date('2024-10-20T11:45:00'),
      status: 'completed' as const
    }
  ];

  const quickActions = [
    {
      label: 'Manage Appointments',
      icon: AppointmentsIcon,
      href: '/appointments',
      description: 'View and edit schedule'
    },
    {
      label: 'Manage Users',
      icon: UserManagementIcon,
      href: '/users',
      description: 'Staff roles and access'
    },
    {
      label: 'Billing & Invoicing',
      icon: CurrencyDollarIcon,
      href: '#',
      description: 'View financial records'
    }
  ];

  return (
    <div className="space-y-6">
      <WelcomeCard name={currentUser?.name || 'Manager'} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <QuickActions actions={quickActions} />
        </div>
        <div className="lg:col-span-1">
          <RecentActivity activities={activities} />
        </div>
      </div>
    </div>
  );
};

export default PracticeManagerDashboard;
