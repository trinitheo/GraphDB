

import React from 'react';
import type { Api } from '../../../api_contract/patient';

type Procedure = Api.V1.Procedure;

interface ProcedureListProps {
    procedures: Procedure[];
    onViewDetails: (procedure: Procedure) => void;
}

const EyeIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
);


const ProcedureList: React.FC<ProcedureListProps> = ({ procedures, onViewDetails }) => {
    const sortedProcedures = [...procedures].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return (
        <div>
            {sortedProcedures.length > 0 ? (
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-500/10">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Procedure</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Practitioner</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-500/10">
                            {sortedProcedures.map(proc => (
                                <tr key={proc.id} className="hover:bg-slate-500/5 transition-colors">
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        <p className="text-sm font-medium text-slate-900">{proc.name}</p>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-slate-600">
                                        {new Date(proc.date).toLocaleDateString()}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-slate-600">{proc.practitioner}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <button 
                                                onClick={() => onViewDetails(proc)}
                                                className="btn-icon-neu w-9 h-9"
                                                title="View Procedure Details"
                                            >
                                                <EyeIcon className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                 <div className="text-center py-8">
                    <p className="text-slate-500">No procedures found for this patient.</p>
                </div>
            )}
        </div>
    );
};

export default ProcedureList;