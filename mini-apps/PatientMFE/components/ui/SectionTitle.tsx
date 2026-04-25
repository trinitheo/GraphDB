import React from 'react';

const SectionTitle: React.FC<{icon: React.ComponentType<{size: number; className?: string}>, children: React.ReactNode}> = ({ icon: Icon, children }) => (
    <div className="flex items-center gap-3 text-slate-800">
        <Icon size={24} className="text-slate-500" />
        <h3 className="text-xl font-bold">{children}</h3>
    </div>
);

export default SectionTitle;
