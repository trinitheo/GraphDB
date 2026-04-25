import React from 'react';

const PatientListSkeleton: React.FC = () => {
  return (
    <div className="space-y-4">
      {Array.from({ length: 8 }).map((_, index) => (
        <div key={index} className="card-panel p-4 flex items-center justify-between animate-pulse">
            <div className="flex items-center space-x-4 w-full">
                <div className="h-12 w-12 rounded-full bg-slate-200"></div>
                <div className="w-full space-y-2">
                    <div className="h-4 bg-slate-200 rounded w-1/4"></div>
                    <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                </div>
            </div>
        </div>
      ))}
    </div>
  );
};

export default PatientListSkeleton;
