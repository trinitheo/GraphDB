
import React from 'react';

// Export the shared components for other MFEs to use
export { NotesSummaryCard } from './AI-Summary/NotesSummaryCard';
export { AISummaryGenerator } from './AI-Summary/AISummaryGenerator';
export { geminiService } from './services/geminiService';


// The component to render for the top-level /ai-features route
const AIFeaturesMFE: React.FC = () => {
    return (
        <div className="p-6 md:p-8 bg-white rounded-xl shadow-lg animate-fade-in">
             <h2 className="text-3xl font-bold text-slate-800 mb-4">AI Features</h2>
             <div className="border-t border-slate-200 my-6"></div>
             <p className="text-slate-600">
                This module hosts various AI-powered tools. Select a patient to see features like note summarization in action.
            </p>
        </div>
    );
};

export default AIFeaturesMFE;