import React from 'react';

interface StatsCardProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  value: string | number;
  subtitle: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ 
  icon: Icon, 
  title, 
  value, 
  subtitle, 
}) => {
  return (
    <div className="card-panel p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">{title}</p>
          <p className="text-4xl font-bold text-slate-800 mt-2">{value}</p>
          <p className="text-sm text-slate-500 mt-1">{subtitle}</p>
        </div>
        <div className="p-3 rounded-xl bg-slate-100">
            <Icon className="w-6 h-6 text-sky-600" />
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
