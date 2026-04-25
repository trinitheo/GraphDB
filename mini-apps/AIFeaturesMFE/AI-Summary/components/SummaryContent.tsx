
import React, { useState, useCallback } from 'react';
import { geminiService } from '../../services/geminiService';
import { medicalRecordService } from '../../../PatientMFE/services/medicalRecordService';
import type { MedicalRecordEntry } from '../../types';
import { Sparkles, Copy, AlertTriangle, PlusCircle } from '../../../../components/icons';

interface SummaryContentProps {
    notes: MedicalRecordEntry[];
    onSummaryAdded?: () => void;
}

export const SummaryContent: React.FC<SummaryContentProps> = ({ notes, onSummaryAdded }) => {
    const [summary, setSummary] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isAddingToLog, setIsAddingToLog] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    const handleGenerateSummary = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        setSummary(null);
        
        if (notes.length === 0) {
            setError("No consultation notes available to summarize.");
            return;
        }

        try {
            const result = await geminiService.summarizeMedicalNotes(notes);
            setSummary(result);
        } catch (err) {
            setError('Failed to generate summary. Please try again.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [notes]);

    const handleCopy = () => {
        if (summary) {
            navigator.clipboard.writeText(summary);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };
    
    const handleAddToLog = async () => {
        if (!summary || notes.length === 0) return;

        setIsAddingToLog(true);
        setError(null);
        
        try {
            const patientId = notes[0].patientId;
            
            await medicalRecordService.addMedicalRecordEntry({
                patientId,
                content: summary,
                type: 'AISummary',
            });

            if (onSummaryAdded) {
                onSummaryAdded();
            }

        } catch (err) {
            setError('Failed to add summary to log. Please try again.');
            console.error(err);
        } finally {
            setIsAddingToLog(false);
        }
    };

    return (
        <>
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                    <Sparkles size={20} className="text-indigo-500 dark:text-indigo-400" />
                    AI-Powered Summary
                </h3>
                <div className="ai-button-container">
                    <div className="glow"></div>
                    <div className="darkBorderBg"></div>
                    <div className="border"></div>
                    <div className="white"></div>
                    <button
                        onClick={handleGenerateSummary}
                        disabled={isLoading || notes.length === 0}
                        className="ai-button"
                    >
                        {isLoading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Generating...
                            </>
                        ) : (
                            'Generate Summary'
                        )}
                    </button>
                </div>
            </div>

            {error && (
                <div className="mt-4 p-3 bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-200 border border-red-200 dark:border-red-500/30 rounded-lg text-sm">
                    {error}
                </div>
            )}

            {summary && (
                <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-md border border-slate-200 dark:border-slate-700 relative">
                    {onSummaryAdded ? (
                        <button
                            onClick={handleAddToLog}
                            disabled={isAddingToLog}
                            className="absolute top-2 right-2 px-3 py-1 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 rounded-md disabled:bg-slate-600 disabled:text-slate-400 flex items-center gap-1.5"
                        >
                            <PlusCircle size={14} />
                            {isAddingToLog ? 'Adding...' : 'Add to Clinical Log'}
                        </button>
                    ) : (
                        <button
                            onClick={handleCopy}
                            className="absolute top-2 right-2 px-3 py-1 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 rounded-md flex items-center gap-1.5"
                        >
                            <Copy size={14} />
                            {copied ? 'Copied!' : 'Copy'}
                        </button>
                    )}
                    <div className="prose prose-sm max-w-none text-slate-800 dark:text-slate-300 prose-strong:text-slate-900 dark:prose-strong:text-slate-100 prose-headings:text-slate-800 dark:prose-headings:text-white whitespace-pre-wrap pt-4">
                        {summary}
                    </div>
                </div>
            )}

            {!isLoading && !error && !summary && (
                 <div className="text-center py-8">
                    {notes.length > 0 ? (
                        <>
                            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mb-1">
                                Ready to summarize {notes.length} consultation note{notes.length !== 1 ? 's' : ''}.
                            </p>
                            <p className="text-xs text-slate-400 dark:text-slate-500">
                                Click "Generate Summary" to process with AI.
                            </p>
                        </>
                    ) : (
                        <p className="text-sm text-slate-500 dark:text-slate-400 italic">
                            No consultation notes available to summarize.
                        </p>
                    )}
                </div>
            )}
            
            <div className="mt-4 flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-500/10 text-amber-800 dark:text-amber-200 border-l-4 border-amber-400 dark:border-amber-400 text-xs">
                 <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" />
                 <div>
                    <strong>Disclaimer:</strong> This summary is generated by an AI and may contain inaccuracies. Always verify critical information with the original source documents.
                 </div>
            </div>
        </>
    );
};
