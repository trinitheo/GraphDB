
import React from 'react';
import { CurrencyDollarIcon, ReceiptRefundIcon } from '../../../../components/icons';
import StatCard from './StatCard';
import WelcomeCard from './WelcomeCard';
import { useAuth } from '../../../PatientMFE/hooks/useAuth';

const BillingSpecialistDashboard: React.FC = () => {
    const { user: currentUser } = useAuth();
    const stats = [
    {
      title: 'Invoices Sent',
      value: '45',
      description: 'This week',
      icon: ReceiptRefundIcon,
      color: 'blue' as const
    },
    {
      title: 'Revenue Collected',
      value: '$25,670',
      description: 'This week',
      icon: CurrencyDollarIcon,
      color: 'green' as const
    },
    {
      title: 'Overdue Invoices',
      value: '5',
      description: 'Requiring follow-up',
      icon: ReceiptRefundIcon,
      color: 'red' as const
    }
  ];
  return (
    <div className="space-y-6">
        <WelcomeCard name={currentUser?.name || 'Billing Specialist'} />
        
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stats.map((stat, index) => (
              <StatCard key={index} {...stat} />
            ))}
        </div>
    </div>
  );
};
export default BillingSpecialistDashboard;
