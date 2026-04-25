
import React from 'react';
import { DataStandardsIcon, CheckCircle } from '../../components/icons';

const standards = [
    { name: 'ICD-10', version: '2024 Release', description: 'International Classification of Diseases, 10th Revision', status: 'Active' },
    { name: 'SNOMED CT', version: 'March 2024 US Edition', description: 'Systematized Nomenclature of Medicine -- Clinical Terms', status: 'Active' },
    { name: 'LOINC', version: '2.76', description: 'Logical Observation Identifiers Names and Codes', status: 'Active' },
    { name: 'RxNorm', version: 'Monthly Release', description: 'Standardized nomenclature for clinical drugs', status: 'Active' },
    { name: 'FHIR', version: 'R4', description: 'Fast Healthcare Interoperability Resources', status: 'Active' },
    { name: 'CPT', version: '2024', description: 'Current Procedural Terminology', status: 'Active' }
];

const DataStandardsMFE: React.FC = () => {
    return (
        <div className="animate-fade-in p-6 h-full flex flex-col">
            <header className="flex-shrink-0 mb-6 flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                    <DataStandardsIcon className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Data Standards</h1>
                    <p className="text-slate-600 text-sm">Managing clinical terminology and interoperability standards.</p>
                </div>
            </header>
            
            <div className="card-panel overflow-hidden flex-1">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-3 font-semibold text-slate-700 text-sm">Standard</th>
                            <th className="px-6 py-3 font-semibold text-slate-700 text-sm">Version</th>
                            <th className="px-6 py-3 font-semibold text-slate-700 text-sm">Description</th>
                            <th className="px-6 py-3 font-semibold text-slate-700 text-sm">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {standards.map((std) => (
                            <tr key={std.name} className="hover:bg-slate-50/50 transition-colors">
                                <td className="px-6 py-4 font-medium text-slate-900">{std.name}</td>
                                <td className="px-6 py-4 text-slate-600 font-mono text-xs">{std.version}</td>
                                <td className="px-6 py-4 text-slate-600 text-sm">{std.description}</td>
                                <td className="px-6 py-4">
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                        <CheckCircle className="w-3 h-3" />
                                        {std.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default DataStandardsMFE;
