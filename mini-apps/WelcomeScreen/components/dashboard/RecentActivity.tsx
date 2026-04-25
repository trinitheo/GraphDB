import React from 'react';
import type { RecentActivity as RecentActivityType } from '../../types/dashboard';
import { 
  // FIX: Replace Calendar with CalendarIcon
  CalendarIcon, 
  FileText, 
  // FIX: Add missing icons
  ReceiptRefundIcon,
  BeakerIcon,
  ClockIcon,
  CheckCircle,
  XCircleIcon
} from '../../../../components/icons';

interface RecentActivityProps {
  activities: RecentActivityType[];
  limit?: number;
  className?: string;
}

const activityIcons: { [key in RecentActivityType['type']]: React.FC<any> } = {
  appointment: CalendarIcon,
  note: FileText,
  prescription: ReceiptRefundIcon,
  lab: BeakerIcon,
  payment: ReceiptRefundIcon,
  system: BeakerIcon, // Placeholder
};

const statusColors = {
  completed: 'text-green-600 bg-green-50',
  pending: 'text-yellow-600 bg-yellow-50',
  cancelled: 'text-red-600 bg-red-50'
};

const statusIcons = {
  completed: CheckCircle,
  pending: ClockIcon,
  cancelled: XCircleIcon
};

const RecentActivity: React.FC<RecentActivityProps> = ({ activities, limit = 5, className }) => {
  const displayedActivities = activities.slice(0, limit);

  return (
    <div className={className || "card-panel p-6"}>
      <h3 className="text-lg font-semibold text-slate-900 mb-4">Recent Activity</h3>
      <div className="space-y-4">
        {displayedActivities.map((activity) => {
          const ActivityIcon = activityIcons[activity.type];
          const StatusIcon = statusIcons[activity.status];
          
          return (
            <div key={activity.id} className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="p-2 bg-slate-100 rounded-lg">
                  <ActivityIcon className="w-4 h-4 text-slate-600" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-900 truncate">
                  {activity.description}
                </p>
                {activity.patientName && (
                  <p className="text-sm text-slate-500">Patient: {activity.patientName}</p>
                )}
                <p className="text-xs text-slate-400 mt-1">
                  {activity.timestamp.toLocaleDateString()} at {activity.timestamp.toLocaleTimeString()}
                </p>
              </div>
              <div className="flex-shrink-0">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusColors[activity.status]}`}>
                  <StatusIcon className="w-3 h-3 mr-1" />
                  {activity.status}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
export default RecentActivity;