import React from 'react';

const NurseWorkflowMFE: React.FC = () => {
    return (
        <div className="animate-fade-in h-full flex flex-col">
            <header className="flex-shrink-0 mb-6">
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Patient Prep Workflow</h1>
                <p className="text-slate-600 mt-1">Streamlined workflow for preparing patients for their appointments.</p>
            </header>
            <div className="flex-1 card-panel p-6">
                <div className="flex items-center justify-center h-full text-center text-slate-500">
                    <p>The patient preparation checklist and workflow will be displayed here.</p>
                </div>
            </div>
        </div>
    );
};

export default NurseWorkflowMFE;
