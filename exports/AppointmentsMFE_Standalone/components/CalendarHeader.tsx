
import React from 'react';
import { ChevronLeft, ChevronRight } from '../../../components/icons';

interface CalendarHeaderProps {
  currentDate: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onGoToToday: () => void;
  onDateChange: (date: Date) => void;
  onNewAppointmentClick: () => void;
  canCreateAppointments: boolean;
}

const CalendarHeader: React.FC<CalendarHeaderProps> = ({ 
    currentDate, onPrevMonth, onNextMonth, onGoToToday, onDateChange, onNewAppointmentClick, canCreateAppointments 
}) => {
    const month = currentDate.toLocaleString('default', { month: 'long' });
    const year = currentDate.getFullYear();
    
    const months = Array.from({ length: 12 }, (_, i) => ({ value: i, name: new Date(0, i).toLocaleString('default', { month: 'long' }) }));
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 10 }, (_, i) => currentYear - 5 + i);

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
            <div className="flex items-center gap-4">
                <h2 className="text-2xl font-bold text-slate-800 w-32">{month} <span className="text-slate-400">{year}</span></h2>
                <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
                    <button onClick={onPrevMonth} className="p-2 rounded-md hover:bg-slate-200 transition-colors"><ChevronLeft className="w-5 h-5" /></button>
                    <button onClick={onGoToToday} className="px-3 py-1.5 text-sm font-semibold hover:bg-slate-200 rounded-md transition-colors">Today</button>
                    <button onClick={onNextMonth} className="p-2 rounded-md hover:bg-slate-200 transition-colors"><ChevronRight className="w-5 h-5" /></button>
                </div>
            </div>
            <div className="flex items-center gap-2">
                 <select
                    value={currentDate.getMonth()}
                    onChange={(e) => onDateChange(new Date(currentDate.getFullYear(), parseInt(e.target.value)))}
                    className="select-neu"
                    aria-label="Select month"
                >
                    {months.map(m => <option key={m.value} value={m.value}>{m.name}</option>)}
                </select>
                <select
                    value={currentDate.getFullYear()}
                    onChange={(e) => onDateChange(new Date(parseInt(e.target.value), currentDate.getMonth()))}
                    className="select-neu"
                    aria-label="Select year"
                >
                    {years.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
                {canCreateAppointments && (
                    <button onClick={onNewAppointmentClick} className="btn-neu text-sky-600 flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                        <span className="hidden md:inline">New</span>
                    </button>
                )}
            </div>
        </div>
    );
};
export default CalendarHeader;
