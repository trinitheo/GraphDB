import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../PatientMFE/hooks/useAuth';
import { medicalRecordService } from '../../PatientMFE/services/medicalRecordService';
import type { MedicalRecordEntry } from '../../PatientMFE/types';
// FIX: Replaced missing DocumentTextIcon with FileText and ensured DownloadIcon is available.
import { FileText as DocumentTextIcon, EyeIcon, DownloadIcon } from '../../../components/icons';

const MedicalRecords: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<'All' | 'Consultation' | 'LabResult' | 'ImagingResult'>('All');
  const [records, setRecords] = useState<MedicalRecordEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchRecords = async () => {
        if (user?.patientId) {
            setIsLoading(true);
            const response = await medicalRecordService.getMedicalRecord(user.patientId);
            if (response.data) {
                setRecords(response.data.entries);
            }
            setIsLoading(false);
        }
    };
    fetchRecords();
  }, [user]);

  const filteredRecords = useMemo(() => {
    return records
        .filter(record => selectedCategory === 'All' || record.type === selectedCategory)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [records, selectedCategory]);

  const recordTypeMap: Record<MedicalRecordEntry['type'], string> = {
    Consultation: 'Clinical Note',
    Prescription: 'Prescription',
    Referral: 'Referral',
    Procedure: 'Procedure',
    LabResult: 'Lab Results',
    ImagingResult: 'Imaging Report',
    AISummary: 'AI Summary',
    Other: 'Other Record'
  };
  
  const getRecordDescription = (record: MedicalRecordEntry) => {
    switch(record.type) {
        case 'LabResult': return 'Results from lab tests';
        case 'ImagingResult': return 'Report from imaging study';
        default: return record.content.substring(0, 50) + '...';
    }
  }


  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-900">Medical Records</h2>
        <button className="btn-neu text-sky-600">
          Request Records
        </button>
      </div>

      <div className="border-b border-slate-200">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          {(['All', 'Consultation', 'LabResult', 'ImagingResult'] as const).map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`py-2 px-1 border-b-2 font-medium text-sm capitalize whitespace-nowrap ${
                selectedCategory === category
                  ? 'border-sky-500 text-sky-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              {recordTypeMap[category as MedicalRecordEntry['type']] || 'All Records'}
            </button>
          ))}
        </nav>
      </div>

      {isLoading ? (
         <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500"></div>
        </div>
      ) : (
        <div className="space-y-4">
            {filteredRecords.map(record => (
                <div key={record.id} className="card-panel p-4 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <div className="p-2 bg-blue-50 rounded-lg">
                    <DocumentTextIcon className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                    <h3 className="font-semibold text-slate-900">{recordTypeMap[record.type]}</h3>
                    <p className="text-sm text-slate-600">{getRecordDescription(record)}</p>
                    <p className="text-xs text-slate-500">
                        {new Date(record.timestamp).toLocaleDateString()} • {record.authorName}
                    </p>
                    </div>
                </div>
                <div className="flex space-x-2">
                    <button className="btn-icon-neu text-slate-600" title="View">
                    <EyeIcon className="w-4 h-4" />
                    </button>
                    <button className="btn-icon-neu text-slate-600" title="Download">
                    <DownloadIcon className="w-4 h-4" />
                    </button>
                </div>
                </div>
            ))}
            {filteredRecords.length === 0 && <p className="text-center text-slate-500 p-8">No records found for this category.</p>}
        </div>
      )}
    </div>
  );
};

export default MedicalRecords;