
import React, { useEffect, useState } from 'react';
import { UsersIcon, ClockIcon } from '../../../../components/icons';

interface TeamActivity {
  id: string;
  user: string;
  action: string;
  createdAt: Date;   // store actual timestamp
  avatar: string;
}

interface TeamSignalProps {
    injectedActivities?: TeamActivity[];
}

// Helper: format relative time
const formatRelativeTime = (date: Date): string => {
  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);

  if (diffMinutes < 1) return 'just now';
  if (diffMinutes === 1) return '1m ago';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours === 1) return '1h ago';
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.floor(diffHours / 24);
  return diffDays === 1 ? '1d ago' : `${diffDays}d ago`;
};

const initialActivities: TeamActivity[] = [
  { id: '1', user: 'Nurse Johnson', action: 'added vitals for Eleanor Vance', createdAt: new Date(Date.now() - 2 * 60000), avatar: 'https://images.unsplash.com/photo-1537368910025-7003507965b6?q=80&w=100&auto=format&fit=crop' },
  { id: '2', user: 'Dr. Patel', action: 'is covering Room 4', createdAt: new Date(Date.now() - 5 * 60000), avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=100&auto=format&fit=crop' },
  { id: '3', user: 'Lab Tech', action: 'uploaded results for Ben Carter', createdAt: new Date(Date.now() - 12 * 60000), avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=100&auto=format&fit=crop' },
  { id: '4', user: 'Front Desk', action: 'checked in Olivia Rodriguez', createdAt: new Date(Date.now() - 15 * 60000), avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=100&auto=format&fit=crop' },
];

const mockEventPool: Omit<TeamActivity, 'createdAt'>[] = [
  { id: '5', user: 'Nurse Lee', action: 'administered medication to John Smith', avatar: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?q=80&w=100&auto=format&fit=crop' },
  { id: '6', user: 'Dr. Kim', action: 'reviewed MRI results for Alice Chen', avatar: 'https://images.unsplash.com/photo-1607746882042-944635dfe10e?q=80&w=100&auto=format&fit=crop' },
  { id: '7', user: 'Reception', action: 'scheduled follow-up for Michael Brown', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=100&auto=format&fit=crop' },
];

const TeamSignal: React.FC<TeamSignalProps> = ({ injectedActivities = [] }) => {
  const [activities, setActivities] = useState<TeamActivity[]>(initialActivities);
  const [eventIndex, setEventIndex] = useState(0);
  const [, forceUpdate] = useState({}); // used to trigger re-render for time updates

  // Add new events every 5s
  useEffect(() => {
    const interval = setInterval(() => {
      if (eventIndex < mockEventPool.length) {
        const newEvent = { ...mockEventPool[eventIndex], createdAt: new Date() };
        setActivities(prev => [newEvent, ...prev]);
        setEventIndex(prev => prev + 1);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [eventIndex]);

  // Force re-render every 60s to update relative times
  useEffect(() => {
    const timer = setInterval(() => forceUpdate({}), 60000);
    return () => clearInterval(timer);
  }, []);

  const displayActivities = [...injectedActivities, ...activities].sort((a,b) => b.createdAt.getTime() - a.createdAt.getTime());

  return (
    <div className="card-panel p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <UsersIcon className="w-5 h-5 text-blue-600" />
          Team Signal
        </h3>
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
        </span>
      </div>

      {/* Activity Feed */}
      <div className="space-y-0 relative max-h-64 overflow-y-auto custom-scrollbar">
        <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-slate-100"></div>
        {displayActivities.map((activity) => (
          <div key={activity.id} className="relative flex gap-4 py-3 group">
            <img
              src={activity.avatar}
              alt={activity.user}
              className="w-8 h-8 rounded-full object-cover ring-2 ring-white z-10"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-slate-800">
                <span className="font-semibold">{activity.user}</span> {activity.action}
              </p>
              <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                <ClockIcon className="w-3 h-3" /> {formatRelativeTime(activity.createdAt)}
              </p>
            </div>
          </div>
        ))}
      </div>

      <button className="w-full mt-4 text-center text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors">
        View All Team Activity
      </button>
    </div>
  );
};

export default TeamSignal;
