import React, { useState, useMemo } from 'react';
import type { Patient, ImagingStudy } from '../types';
import { SearchIcon } from '../../../components/icons';

interface ImagesViewProps {
    patient: Patient | null | undefined;
}

const ImageCard: React.FC<{ study: ImagingStudy }> = ({ study }) => (
    <div className="card-panel overflow-hidden">
        {study.imageUrl && <img src={study.imageUrl} alt={`${study.modality} of ${study.bodyPart}`} className="w-full h-48 object-cover bg-slate-200" />}
        <div className="p-4">
            <p className="font-bold text-slate-800">{study.modality} - {study.bodyPart}</p>
            <p className="text-sm text-slate-500">{new Date(study.date).toLocaleDateString()}</p>
        </div>
        <div className="p-4 border-t border-slate-200">
            <h5 className="font-semibold text-sm text-slate-700">Report</h5>
            <p className="text-sm text-slate-600 mt-1 whitespace-pre-wrap">{study.report}</p>
        </div>
    </div>
);

const ImagesView: React.FC<ImagesViewProps> = ({ patient }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredStudies = useMemo(() => {
        const studies = patient?.imagingStudies || [];
        if (!searchTerm) return studies;
        const lowercasedFilter = searchTerm.toLowerCase();
        return studies.filter(study =>
            study.modality.toLowerCase().includes(lowercasedFilter) ||
            study.bodyPart.toLowerCase().includes(lowercasedFilter) ||
            study.report.toLowerCase().includes(lowercasedFilter)
        );
    }, [patient, searchTerm]);

    return (
        <div className="space-y-6">
            <div className="relative max-w-sm">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-slate-500">
                    <SearchIcon className="w-5 h-5" />
                </div>
                <input
                    type="text"
                    placeholder="Search by modality, body part, or report..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input-neu w-full pl-11 text-slate-900 placeholder-slate-500"
                />
            </div>
            
            {filteredStudies.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredStudies.map(study => (
                        <ImageCard key={study.id} study={study} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 text-slate-500 card-panel">
                    <p className="font-semibold text-lg">No Imaging Studies Found</p>
                    <p className="mt-1">{searchTerm ? "No studies match your search." : "This patient does not have any imaging studies on record."}</p>
                </div>
            )}
        </div>
    );
};

export default ImagesView;
