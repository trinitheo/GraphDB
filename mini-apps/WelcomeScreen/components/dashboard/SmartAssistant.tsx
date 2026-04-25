
import React from 'react';
import { Sparkles, ArrowRightIcon, CheckCircle, AlertTriangle, FileText } from '../../../../components/icons';

interface Suggestion {
    id: string;
    text: string;
    type: 'urgent' | 'documentation' | 'info';
    actionLabel?: string;
}

interface SmartAssistantProps {
    suggestions: Suggestion[];
}

const SmartAssistant: React.FC<SmartAssistantProps> = ({ suggestions }) => {
    return (
        <div className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 shadow-sm">
            {/* Decorative background elements */}
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-blue-200/30 rounded-full blur-xl"></div>
            <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-32 h-32 bg-indigo-200/30 rounded-full blur-xl"></div>

            <div className="relative p-6">
                <div className="flex items-center gap-2 mb-5">
                    <Sparkles className="w-5 h-5 text-amber-500" />
                    <h2 className="text-lg font-bold tracking-tight text-slate-900">Smart Assistant</h2>
                    <span className="ml-auto text-[10px] font-bold uppercase tracking-widest bg-white px-2 py-1 rounded-md text-blue-600 shadow-sm border border-blue-100">
                        {suggestions.length} suggestions
                    </span>
                </div>

                <div className="space-y-3">
                    {suggestions.map(suggestion => (
                        <div 
                            key={suggestion.id} 
                            className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 shadow-sm hover:border-blue-200 hover:shadow-md transition-all cursor-pointer group"
                        >
                            <div className="flex items-center gap-3 min-w-0">
                                {suggestion.type === 'urgent' && <AlertTriangle className="w-5 h-5 text-rose-500 flex-shrink-0" />}
                                {suggestion.type === 'documentation' && <FileText className="w-5 h-5 text-blue-500 flex-shrink-0" />}
                                {suggestion.type === 'info' && <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />}
                                
                                <p className="text-sm font-medium text-slate-700 truncate pr-4">{suggestion.text}</p>
                            </div>
                            {suggestion.actionLabel && (
                                <button className="flex-shrink-0 text-xs font-bold bg-slate-50 text-slate-600 group-hover:bg-blue-50 group-hover:text-blue-600 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 border border-slate-100 group-hover:border-blue-100">
                                    {suggestion.actionLabel}
                                    <ArrowRightIcon className="w-3 h-3" />
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default SmartAssistant;
