

import React from 'react';
// FIX: Added missing CoffeeIcon import
import { ClockIcon, FileText, CoffeeIcon } from '../../../../components/icons';

interface ScheduleItem {
  time: string;
  title: string;
  type: 'shift' | 'task' | 'break';
  status: 'upcoming' | 'active' | 'completed';
}

const scheduleData: ScheduleItem[] = [
  { time: '07:00', title: 'Morning Shift Begins', type: 'shift', status: 'completed' },
  { time: '09:00', title: 'Patient Rounds - Ward 3A', type: 'task', status: 'active' },
  { time: '11:30', title: 'Medication Administration', type: 'task', status: 'upcoming' },
  { time: '13:00', title: 'Lunch Break', type: 'break', status: 'upcoming' },
  { time: '15:00', title: 'Team Meeting', type: 'task', status: 'upcoming' },
];

const ScheduleCard: React.FC = () => {
  const getStatusClasses = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-slate-100 text-slate-500 line-through';
      case 'active': return 'bg-sky-100 text-sky-700';
      case 'upcoming': return 'bg-slate-50 text-slate-600';
      default: return '';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'shift': return <ClockIcon className="w-5 h-5 text-slate-500" />;
      case 'task': return <FileText className="w-5 h-5 text-slate-500" />;
      case 'break': return <CoffeeIcon className="w-5 h-5 text-slate-500" />;
      default: return null;
    }
  };

  return (
    <div className="card-panel p-6">
      <h2 className="text-xl font-bold text-slate-800 mb-4">
        Today's Schedule
      </h2>
      
      <div className="space-y-4">
        {scheduleData.map((item, index) => (
          <div key={index} className={`flex items-start gap-4 p-3 rounded-lg ${getStatusClasses(item.status)}`}>
            <div className="flex flex-col items-center">
              <span className="font-semibold text-sm">{item.time}</span>
            </div>
            <div className="flex-1 min-w-0 flex items-start gap-3">
              <div className="mt-0.5">{getTypeIcon(item.type)}</div>
              <div>
                <p className="font-medium text-sm md:text-base">
                  {item.title}
                </p>
                <span className="text-xs font-semibold uppercase tracking-wider">{item.status}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ScheduleCard;