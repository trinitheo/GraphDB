import React from 'react';
import {
  // FIX: Correct icon imports
  CalendarIcon,
  FileText,
  BeakerIcon,
  ReceiptRefundIcon,
  MessagingIcon,
  MedicationIcon
} from '../../../components/icons';
import StatCard from '../../WelcomeScreen/components/dashboard/StatCard';
import RecentActivity from '../../WelcomeScreen/components/dashboard/RecentActivity';
import QuickActions from '../../WelcomeScreen/components/dashboard/QuickActions';
import { useAuth } from '../../PatientMFE/hooks/useAuth';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const stats = [
    {
      title: 'Next Appointment',
      value: 'Tomorrow, 2:00 PM',
      description: 'Dr. Smith - Annual Checkup',
      icon: CalendarIcon,
      color: 'blue' as const
    },
    {
      title: 'Pending Results',
      value: '2',
      description: 'Lab tests awaiting results',
      icon: BeakerIcon,
      color: 'yellow' as const
    },
    {
      title: 'Recent Visits',
      value: '3',
      description: 'Last 30 days',
      icon: FileText,
      color: 'green' as const
    },
    {
      title: 'Outstanding Balance',
      value: '$45.00',
      description: 'Due next week',
      icon: ReceiptRefundIcon,
      color: 'red' as const
    }
  ];

  const activities = [
    {
      id: '1',
      type: 'appointment' as const,
      description: 'Appointment scheduled',
      timestamp: new Date('2024-10-25T14:00:00'),
      status: 'pending' as const
    },
    {
      id: '2',
      type: 'lab' as const,
      description: 'Blood work completed',
      timestamp: new Date('2024-10-18T10:30:00'),
      status: 'completed' as const
    },
    {
      id: '3',
      type: 'prescription' as const,
      description: 'Prescription refilled',
      timestamp: new Date('2024-10-15T16:20:00'),
      status: 'completed' as const
    }
  ];

  const quickActions = [
    {
      label: 'Schedule Appointment',
      icon: CalendarIcon,
      href: '/portal/appointments',
      description: 'Book a new visit'
    },
    {
      label: 'View Medical Records',
      icon: FileText,
      href: '/portal/records',
      description: 'Access your health history'
    },
    {
      label: 'Message Care Team',
      icon: MessagingIcon,
      href: '/portal/messages',
      description: 'Contact your providers'
    },
    {
      label: 'Pay Bill',
      icon: ReceiptRefundIcon,
      href: '/portal/billing',
      description: 'Make a payment'
    },
    {
      label: 'Request Refill',
      icon: MedicationIcon,
      href: '/portal/medications',
      description: 'Medication renewal'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">My Health Portal</h1>
        <p className="text-slate-600">Welcome back, {user?.name}!</p>
      </div>

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
export default Dashboard;