
import React, { useMemo } from 'react';
import { ChartBarIcon, ClockIcon, TrendIcon } from '../../../../components/icons';

interface WorkloadPulseProps {
    completed: number;
    total: number;
    notesCompleted: number;
    avgNoteTime?: number; // in minutes
    dailyGoalTarget?: number; // percentage (0-100)
}

const WorkloadPulse: React.FC<WorkloadPulseProps> = ({ 
    completed, 
    total, 
    notesCompleted,
    avgNoteTime = 6,
    dailyGoalTarget = 90
}) => {
    // Validation: Ensure notesCompleted does not exceed completed encounters
    const validNotesCompleted = Math.min(notesCompleted, completed);

    const encounterProgress = useMemo(() => total > 0 ? (completed / total) * 100 : 0, [total, completed]);
    
    // Notes progress is based on COMPLETED encounters, not total. 
    // If I have seen 5 patients, I should have 5 notes.
    const notesProgress = useMemo(() => completed > 0 ? (validNotesCompleted / completed) * 100 : 0, [completed, validNotesCompleted]);
    
    // Benchmarks
    const STANDARD_NOTE_TIME = 8; // minutes
    const AVG_ENCOUNTER_TIME = 20; // minutes

    // Calculations: Time saved based on notes actually written
    const totalTimeSaved = useMemo(() => {
        const timeSavedPerNote = Math.max(0, STANDARD_NOTE_TIME - avgNoteTime);
        return timeSavedPerNote * validNotesCompleted;
    }, [avgNoteTime, validNotesCompleted]);
    
    const projectedFinishTime = useMemo(() => {
        if (total === 0) return 'N/A';

        const remainingEncounters = Math.max(0, total - completed);
        
        // Notes needed for future encounters (1 per encounter)
        const futureNotesToCheck = remainingEncounters;
        
        // Notes pending for encounters already completed
        const pendingNotesCatchup = Math.max(0, completed - validNotesCompleted);
        
        // Total Minutes = (Future Appointments) + (Notes for Future Appts) + (Catch-up Notes)
        const minutesRemaining = 
            (remainingEncounters * AVG_ENCOUNTER_TIME) + 
            (futureNotesToCheck * avgNoteTime) + 
            (pendingNotesCatchup * avgNoteTime);

        const now = new Date();
        const finishTime = new Date(now.getTime() + minutesRemaining * 60000);
        
        return finishTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }, [total, completed, validNotesCompleted, avgNoteTime]);

    const overallEfficiency = useMemo(() => {
        if (total === 0) return 0;
        // Simple efficiency score based on progress vs goal
        // Memoized to prevent recalculation on every render
        return Math.round((encounterProgress + notesProgress) / 2);
    }, [encounterProgress, notesProgress, total]);

    return (
        <div className="card-panel p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <ChartBarIcon className="w-5 h-5 text-purple-600" />
                Workload Pulse
            </h3>

            <div className="space-y-6">
                {/* Predictive Analytics */}
                <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-100 flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold text-indigo-500 uppercase tracking-wider mb-1">
                            📈 Projected Finish
                        </p>
                        <p className="text-2xl font-bold text-slate-800">
                            {projectedFinishTime}
                        </p>
                        <p className="text-xs text-slate-600 mt-1">
                            Based on current pace
                        </p>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                        <ClockIcon className="w-5 h-5" />
                    </div>
                </div>

                {/* Encounters Progress */}
                <div className="group cursor-pointer">
                    <div className="flex justify-between text-sm mb-1 group-hover:text-blue-700 transition-colors">
                        <span className="font-medium text-slate-700">Encounters Completed</span>
                        <span className="font-bold text-slate-900">{completed} / {total}</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                        <div 
                            className="bg-blue-600 h-2.5 rounded-full transition-all duration-500 group-hover:bg-blue-500" 
                            style={{ width: `${encounterProgress}%` }}
                        ></div>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">You are {Math.round(encounterProgress)}% through your schedule.</p>
                </div>

                {/* Notes Progress */}
                <div className="group cursor-pointer">
                    <div className="flex justify-between text-sm mb-1 group-hover:text-orange-700 transition-colors">
                        <span className="font-medium text-slate-700">Note Documentation</span>
                        <span className={`font-bold ${notesProgress < 100 ? 'text-orange-600' : 'text-green-600'}`}>
                            {validNotesCompleted} / {completed}
                        </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                        <div 
                            className={`h-2.5 rounded-full transition-all duration-500 ${notesProgress < 100 ? 'bg-orange-500 group-hover:bg-orange-400' : 'bg-green-500 group-hover:bg-green-400'}`} 
                            style={{ width: `${notesProgress}%` }}
                        ></div>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                        {completed - validNotesCompleted > 0 ? `${completed - validNotesCompleted} notes pending completion.` : 'All caught up!'}
                    </p>
                </div>
                
                {/* Time Insights Grid */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                    <div className="text-center p-2 rounded-lg hover:bg-slate-50 transition-colors">
                        <p className="text-xs text-slate-500 mb-1">Peak Hours</p>
                        <p className="text-sm font-bold text-slate-800">10 AM - 12 PM</p>
                    </div>
                    <div className="text-center p-2 rounded-lg hover:bg-green-50 transition-colors">
                        <p className="text-xs text-slate-500 mb-1">Avg. Time Saved</p>
                        <p className="text-sm font-bold text-green-600 flex items-center justify-center gap-1">
                            <TrendIcon className="w-3 h-3" />
                            {totalTimeSaved} min
                        </p>
                    </div>
                </div>

                {/* Goal Setting & Gamification */}
                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-100/50">
                    <div>
                        <p className="text-sm font-semibold text-slate-700">Daily Efficiency</p>
                        <p className="text-xs text-slate-500">Target: {dailyGoalTarget}% completion</p>
                    </div>
                    <div className="text-right">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            overallEfficiency >= dailyGoalTarget 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-blue-100 text-blue-700'
                        }`}>
                            🎯 {overallEfficiency}%
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WorkloadPulse;
