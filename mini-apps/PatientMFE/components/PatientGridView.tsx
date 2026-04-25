import React from 'react';
import { Link } from 'react-router-dom';
import type { Patient } from '../types';

interface PatientGridViewProps {
    patients: Patient[];
}

const PatientGridView: React.FC<PatientGridViewProps> = ({ patients }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {patients.map(patient => (
                <Link to={`/patients/${patient.id}`} key={patient.id} className="group card-panel p-6 hover:border-sky-500/50 hover:shadow-md transition-all duration-300 flex flex-col justify-between h-full">
                    <div className="flex items-center space-x-4">
                        <img src={patient.avatar} alt={patient.name} className="w-16 h-16 rounded-full object-cover flex-shrink-0" />
                        <div className="min-w-0">
                            <p className="font-bold text-lg text-slate-800 truncate">{patient.name}</p>
                            <p className="text-sm text-slate-500 mt-1 truncate">ID: {patient.id}</p>
                            <p className="text-sm text-slate-500">{patient.age} years old &bull; {patient.gender}</p>
                        </div>
                    </div>
                     <div className="mt-4 flex justify-end items-center">
                        <span className="text-sm font-semibold text-sky-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform group-hover:translate-x-0 -translate-x-2">
                            View Profile &rarr;
                        </span>
                    </div>
                </Link>
            ))}
        </div>
    );
}

export default PatientGridView;