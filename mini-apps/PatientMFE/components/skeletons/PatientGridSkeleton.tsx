import React from 'react';

const PatientGridSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="card-panel p-6 flex items-center justify-between animate-pulse">
            <div className="flex items-center space-x-4 w-full">
                <div className="w-16 h-16 rounded-full bg-slate-200 flex-shrink-0"></div>
                <div className="w-full space-y-2">
                    <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                    <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                    <div className="h-3 bg-slate-200 rounded w-5/6"></div>
                </div>
            </div>
        </div>
      ))}
    </div>
  );
};

export default PatientGridSkeleton;
