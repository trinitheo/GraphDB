
import React from 'react';
import { 
  UsersIcon, 
  CurrencyDollarIcon, 
  ChartBarIcon,
  BuildingStorefrontIcon,
  ShieldCheckIcon
} from '../../../../components/icons';
import StatCard from './StatCard';
import RecentActivity from './RecentActivity';
import QuickActions from './QuickActions';
import WelcomeCard from './WelcomeCard';
import { useAuth } from '../../../PatientMFE/hooks/useAuth';

const OwnerDashboard: React.FC = () => {
  const { user: currentUser } = useAuth();

  const stats = [
    {
      title: 'Total Revenue',
      value: '$124,580',
      change: 12,
      description: 'This month',
      icon: CurrencyDollarIcon,
      color: 'green' as const
    },
    {
      title: 'Active Patients',
      value: '1,247',
      change: 8,
      description: 'Across all clinics',
      icon: UsersIcon,
      color: 'blue' as const
    },
    {
      title: 'Staff Members',
      value: '42',
      change: 2,
      description: 'Active users',
      icon: UsersIcon,
      color: 'purple' as const
    },
    {
      title: 'System Uptime',
      value: '99.9%',
      description: 'Last 30 days',
      icon: ShieldCheckIcon,
      color: 'green' as const
    }
  ];

  const activities = [
    {
      id: '1',
      type: 'system' as const,
      description: 'New clinic location added',
      timestamp: new Date('2024-10-20T10:30:00'),
      status: 'completed' as const
    },
    {
      id: '2',
      type: 'payment' as const,
      description: 'Monthly subscription processed',
      timestamp: new Date('2024-10-20T09:15:00'),
      status: 'completed' as const
    },
    {
      id: '3',
      type: 'system' as const,
      description: 'System maintenance scheduled',
      timestamp: new Date('2024-10-19T16:45:00'),
      status: 'pending' as const
    }
  ];

  const quickActions = [
    {
      label: 'Manage Users',
      icon: UsersIcon,
      href: '/users',
      description: 'Add or modify staff accounts'
    },
    {
      label: 'Financial Reports',
      icon: ChartBarIcon,
      href: '#',
      description: 'View revenue and analytics'
    },
    {
      label: 'System Settings',
      icon: ShieldCheckIcon,
      href: '#',
      description: 'Configure application settings'
    },
    {
      label: 'Clinic Management',
      icon: BuildingStorefrontIcon,
      href: '#',
      description: 'Manage clinic locations'
    },
    {
      label: 'Audit Logs',
      icon: ShieldCheckIcon,
      href: '#',
      description: 'Review system activity'
    }
  ];

  return (
    <div className="space-y-6">
      <WelcomeCard name={currentUser?.name || 'Owner'} />

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

export default OwnerDashboard;
