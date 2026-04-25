
import React, { useState, useMemo } from 'react';
import { geminiService } from '../../../AIFeaturesMFE';
// FIX: Corrected import path to central icons library.
import { Sparkles, AlertTriangle } from '../../../../components/icons';
import type { Api } from '../../../../api_contract/patient';

// --- Icons ---
const ArrowUpIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 15l7-7 7 7" />
  </svg>
);
const ArrowDownIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
  </svg>
);
const SearchIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

// --- Interfaces & Parsers ---
interface LabResultDisplayProps {
    results: Api.V1.LabResultValue[];
}

// --- Main Component ---
const LabResultDisplay: React.FC<LabResultDisplayProps> = ({ results: parsedResults }) => {
    const [showAbnormalOnly, setShowAbnormalOnly] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [summary, setSummary] = useState<string | null>(null);
    const [isSummarizing, setIsSummarizing] = useState(false);
    const [summaryError, setSummaryError] = useState<string | null>(null);

    const filteredResults = useMemo(() => {
        return parsedResults.filter(r => {
            const matchesSearch = r.testName.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesFilter = !showAbnormalOnly || r.flag !== '';
            return matchesSearch && matchesFilter;
        });
    }, [parsedResults, searchTerm, showAbnormalOnly]);

    const handleSummarize = async () => {
        setIsSummarizing(true);
        setSummary(null);
        setSummaryError(null);
        try {
            const resultsString = parsedResults.map(r => 
                `${r.testName}|${r.value}|${r.unit}|${r.referenceRange}|${r.flag}`
            ).join('\n');
            const resultSummary = await geminiService.summarizeLabResults(resultsString);
            setSummary(resultSummary);
        } catch (error) {
            setSummaryError("Could not generate summary. Please try again.");
            console.error(error);
        } finally {
            setIsSummarizing(false);
        }
    };

    if (parsedResults.length === 0) {
        return <p className="text-sm text-slate-600">No structured results available.</p>;
    }

    return (
        <div className="space-y-4">
            {/* AI Summary Section */}
            {isSummarizing && (
                <div className="flex items-center justify-center p-4 bg-slate-50 rounded-lg">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-500"></div>
                    <p className="ml-3 text-sm text-slate-600">Generating summary...</p>
                </div>
            )}
            {summaryError && <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm">{summaryError}</div>}
            {summary && (
                <div className="p-4 bg-indigo-50 border-l-4 border-indigo-400 rounded-r-lg animate-fade-in">
                    <h4 className="font-bold text-indigo-800 flex items-center gap-2"><Sparkles size={16}/> AI Summary</h4>
                    <p className="mt-2 text-sm text-slate-800 whitespace-pre-wrap">{summary}</p>
                    <div className="mt-3 flex items-start gap-2 p-2 bg-amber-50 text-amber-800 border-l-4 border-amber-400 text-xs">
                        <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" />
                        <div>This summary is AI-generated and for informational purposes only. Verify with original data.</div>
                    </div>
                </div>
            )}

            {/* Controls */}
            <div className="flex flex-col sm:flex-row gap-4 items-center p-3 bg-slate-50 rounded-lg">
                <div className="relative w-full sm:w-auto flex-grow">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                        <SearchIcon />
                    </div>
                    <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search tests..." className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-md" />
                </div>
                <div className="flex items-center gap-4">
                     <label className="flex items-center cursor-pointer">
                        <input type="checkbox" checked={showAbnormalOnly} onChange={e => setShowAbnormalOnly(e.target.checked)} className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500" />
                        <span className="ml-2 text-sm font-medium text-slate-700">Show abnormal only</span>
                    </label>
                    <div className="ai-button-container">
                        <div className="glow"></div>
                        <div className="darkBorderBg"></div>
                        <div className="border"></div>
                        <div className="white"></div>
                        <button onClick={handleSummarize} disabled={isSummarizing} className="ai-button">
                            <Sparkles size={16} /> Summarize
                        </button>
                    </div>
                </div>
            </div>

            {/* Results Table */}
            <div className="overflow-x-auto border border-slate-200 rounded-lg">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-100">
                        <tr>
                            <th className="px-4 py-2 font-semibold text-slate-700">Test Name</th>
                            <th className="px-4 py-2 font-semibold text-slate-700 text-center">Flag</th>
                            <th className="px-4 py-2 font-semibold text-slate-700 text-right">Value</th>
                            <th className="px-4 py-2 font-semibold text-slate-700">Units</th>
                            <th className="px-4 py-2 font-semibold text-slate-700">Reference Range</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredResults.map((result, index) => {
                            const isAbnormal = result.flag !== '';
                            return (
                                <tr key={index} className={`border-t border-slate-100 ${isAbnormal ? 'bg-red-50/50' : ''}`}>
                                    <td className={`px-4 py-1.5 font-medium ${isAbnormal ? 'text-red-800' : 'text-slate-800'}`}>{result.testName}</td>
                                    <td className="px-4 py-1.5 text-center">
                                        {result.flag === 'H' && <span className="flex items-center justify-center gap-1 font-bold text-red-600"><ArrowUpIcon/> H</span>}
                                        {result.flag === 'L' && <span className="flex items-center justify-center gap-1 font-bold text-red-600"><ArrowDownIcon/> L</span>}
                                    </td>
                                    <td className={`px-4 py-1.5 text-right font-mono font-bold ${isAbnormal ? 'text-red-800' : 'text-slate-800'}`}>{result.value}</td>
                                    <td className="px-4 py-1.5 text-slate-600">{result.unit}</td>
                                    <td className="px-4 py-1.5 text-slate-600 font-mono">{result.referenceRange}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                 {filteredResults.length === 0 && (
                    <div className="text-center p-6 text-slate-500">
                        No results match your search criteria.
                    </div>
                )}
            </div>
        </div>
    );
};

export default LabResultDisplay;