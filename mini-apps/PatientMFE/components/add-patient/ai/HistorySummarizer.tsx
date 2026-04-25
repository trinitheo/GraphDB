import React, { useState } from 'react';
import { geminiService } from '../../../../AIFeaturesMFE/services/geminiService';
import type { MedicalHistoryForm } from '../../../types';

const SparklesIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
       <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
   </svg>
);

interface HistorySummarizerProps {
    historyData: MedicalHistoryForm['history'];
    complaintData: MedicalHistoryForm['complaint'];
    onSummaryGenerated: (summary: string) => void;
}

const HistorySummarizer: React.FC<HistorySummarizerProps> = ({
    historyData,
    complaintData,
    onSummaryGenerated,
}) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGenerate = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const summary = await geminiService.summarizePatientHistory(historyData, complaintData);
            onSummaryGenerated(summary);
        } catch (err) {
            setError('Failed to generate summary. Please try again.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-slate-50 p-4 rounded-lg">
            <div className="flex flex-col items-center">
                 <button
                    onClick={handleGenerate}
                    disabled={isLoading}
                    className="ai-button w-full"
                >
                    {isLoading ? (
                        'Generating...'
                    ) : (
                        <>
                            <SparklesIcon className="w-5 h-5" />
                            Generate History Summary
                        </>
                    )}
                </button>
                <p className="text-xs text-slate-500 mt-2 text-center">Use AI to generate a narrative summary of the patient's history based on the data provided.</p>
                {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
            </div>
        </div>
    );
};

export default HistorySummarizer;