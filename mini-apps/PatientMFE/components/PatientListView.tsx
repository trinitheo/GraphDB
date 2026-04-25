import React from 'react';
import { Link } from 'react-router-dom';
import type { Patient } from '../types';
import { ChevronRight } from '../../../components/icons';

interface PatientListViewProps {
    patients: Patient[];
}

const PatientListView: React.FC<PatientListViewProps> = ({ patients }) => {
    return (
        <div className="space-y-3">
            {patients.map(patient => (
                <Link 
                    to={`/patients/${patient.id}`} 
                    key={patient.id} 
                    className="group card-panel p-4 hover:border-sky-500/50 hover:shadow-sm transition-all duration-300 flex items-center justify-between"
                >
                    <div className="flex items-center space-x-4">
                        <img className="h-12 w-12 rounded-full object-cover" src={patient.avatar} alt={patient.name} />
                        <div>
                            <p className="text-base font-bold text-slate-800">{patient.name}</p>
                            <p className="text-sm text-slate-500">ID: {patient.id} &bull; {patient.age} yrs &bull; {patient.gender}</p>
                        </div>
                    </div>
                    <ChevronRight className="h-6 w-6 text-slate-300 group-hover:text-sky-500 group-hover:translate-x-1 transition-all" />
                </Link>
            ))}
        </div>
    );
}

export default PatientListView;