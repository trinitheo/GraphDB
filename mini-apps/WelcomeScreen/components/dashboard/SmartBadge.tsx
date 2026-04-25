
import React, { useState } from 'react';
import Modal from '../../../MedicalRecordsMFE/components/modals/Modal';
import { 
    ClockIcon, 
    FileText, 
    ChartBarIcon, 
    TrendIcon,
    AlertCircleIcon,
    TargetIcon,
    ChevronRight,
    UsersIcon,
    CheckCircle
} from '../../../../components/icons';

interface SmartBadgeProps {
    completed: number;
    total: number;
    pendingNotes: number;
}

const MetricCard: React.FC<{ icon: any, label: string, value: string, subvalue?: string, colorClass: string }> = ({ icon: Icon, label, value, subvalue, colorClass }) => (
    <div className="bg-slate-50 border border-slate-100 rounded-3xl p-8 flex flex-col justify-between hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500 group">
        <div className={`w-14 h-14 rounded-2xl ${colorClass} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500`}>
            <Icon size={28} />
        </div>
        <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-2">{label}</p>
            <p className="text-4xl font-black text-slate-900 tracking-tight">{value}</p>
            {subvalue && <p className="text-sm text-slate-500 mt-2 font-medium">{subvalue}</p>}
        </div>
    </div>
);

const SmartBadge: React.FC<SmartBadgeProps> = ({ completed, total, pendingNotes }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const percentage = total > 0 ? (completed / total) * 100 : 0;
    
    // Circular Ring Config
    const radius = 16;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;

    return (
        <>
            {/* --- COMPACT STATE: The Pill Badge --- */}
            <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-4 p-2 pr-5 bg-white/95 backdrop-blur-xl border border-slate-100 rounded-[22px] shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all duration-300 hover:shadow-[0_15px_40px_rgb(0,0,0,0.1)] hover:-translate-y-0.5 active:scale-95 group"
            >
                {/* Progress Ring */}
                <div className="relative flex items-center justify-center w-12 h-12">
                    <svg className="w-12 h-12 transform -rotate-90">
                        <circle
                            cx="24"
                            cy="24"
                            r={radius}
                            stroke="currentColor"
                            strokeWidth="3.5"
                            fill="transparent"
                            className="text-slate-100"
                        />
                        <circle
                            cx="24"
                            cy="24"
                            r={radius}
                            stroke="currentColor"
                            strokeWidth="3.5"
                            fill="transparent"
                            strokeDasharray={circumference}
                            style={{ strokeDashoffset: offset }}
                            className="text-sky-500 transition-all duration-1000 ease-out"
                        />
                    </svg>
                    <span className="absolute text-[10px] font-black text-slate-800">
                        {completed}/{total}
                    </span>
                </div>

                {/* Note Icon with Notification Badge */}
                <div className="relative flex items-center justify-center bg-slate-50 p-2.5 rounded-xl text-slate-400 group-hover:bg-sky-50 group-hover:text-sky-600 transition-colors">
                    <FileText size={22} />
                    {pendingNotes > 0 && (
                        <div className="absolute -top-2 -right-2 flex items-center justify-center min-w-[20px] h-[20px] px-1 bg-red-500 text-white text-[10px] font-black rounded-full border-2 border-white shadow-sm animate-bounce">
                            {pendingNotes}
                        </div>
                    )}
                </div>
            </button>

            {/* --- EXPANDED STATE: Full Tablet Takeover Modal --- */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Workload Pulse"
                size="7xl" // Using largest size for takeover feel
            >
                <div className="py-4 space-y-10">
                    {/* Hero Grid: Major Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <MetricCard 
                            icon={ClockIcon} 
                            label="Projected Finish" 
                            value="09:30 a.m." 
                            subvalue="Tracking 12% ahead of today's pace"
                            colorClass="bg-indigo-600 text-white"
                        />
                        <MetricCard 
                            icon={UsersIcon} 
                            label="Today's Caseload" 
                            value={`${completed} / ${total}`} 
                            subvalue={`${Math.round(percentage)}% of scheduled visits complete`}
                            colorClass="bg-sky-500 text-white"
                        />
                        <MetricCard 
                            icon={FileText} 
                            label="Documentation" 
                            value={`${pendingNotes} Pending`} 
                            subvalue="Est. 18 mins to finalize all notes"
                            colorClass="bg-red-500 text-white"
                        />
                    </div>

                    {/* Secondary Insights & Efficiency */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
                        {/* Progress Detail Panel */}
                        <div className="card-panel p-8 bg-white border-slate-200">
                            <h4 className="text-xl font-bold text-slate-900 mb-8">Performance Insights</h4>
                            
                            <div className="space-y-10">
                                <div>
                                    <div className="flex justify-between items-end mb-3">
                                        <span className="text-sm font-bold text-slate-600 uppercase tracking-widest">Encounter Completion</span>
                                        <span className="text-lg font-black text-slate-900">{Math.round(percentage)}%</span>
                                    </div>
                                    <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden shadow-inner">
                                        <div 
                                            className="bg-gradient-to-r from-sky-500 to-blue-600 h-full rounded-full transition-all duration-1000 shadow-sm" 
                                            style={{ width: `${percentage}%` }}
                                        ></div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6 pt-4 border-t border-slate-100">
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Peak Throughput</p>
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                                                <TrendIcon size={18} />
                                            </div>
                                            <p className="text-lg font-bold text-slate-800">10 AM - 12 PM</p>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Avg. Note Speed</p>
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                                                <ClockIcon size={18} />
                                            </div>
                                            <p className="text-lg font-bold text-slate-800">4.2 min</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* High Impact Efficiency Footer */}
                        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-[32px] p-10 text-white flex flex-col justify-between shadow-2xl shadow-indigo-200">
                            <div>
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="h-10 w-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center">
                                        <TargetIcon size={24} className="text-sky-400" />
                                    </div>
                                    <h4 className="text-xl font-bold tracking-tight">Daily Efficiency Score</h4>
                                </div>
                                <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
                                    Your efficiency is calculated based on encounter pacing, documentation latency, and lab review times.
                                </p>
                            </div>

                            <div className="flex items-end justify-between mt-10">
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-1">Current Rating</p>
                                    <p className="text-6xl font-black text-white">92<span className="text-2xl text-slate-500 font-bold ml-1">%</span></p>
                                </div>
                                <div className="text-right">
                                    <span className="px-4 py-2 bg-emerald-500/20 text-emerald-400 rounded-full text-sm font-bold border border-emerald-500/30 flex items-center gap-2">
                                        <CheckCircle size={16} /> Exceeding Target
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Global Actions */}
                    <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-slate-100">
                        <button 
                            onClick={() => setIsModalOpen(false)}
                            className="flex-1 py-5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl transition-all flex items-center justify-center gap-2"
                        >
                            Return to Workspace
                        </button>
                        <button 
                            onClick={() => setIsModalOpen(false)}
                            className="flex-1 py-5 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-2xl shadow-lg shadow-sky-200 transition-all flex items-center justify-center gap-2"
                        >
                            Review Documentation Queue <ChevronRight size={20} />
                        </button>
                    </div>
                </div>
            </Modal>
        </>
    );
};

export default SmartBadge;
