
import React, { useState, useRef, useEffect } from 'react';

// Icons
const CalendarIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
);
const ChevronLeftIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
);
const ChevronRightIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
);

const MONTHS = Array.from({ length: 12 }, (_, i) => new Date(0, i).toLocaleString('default', { month: 'long' }));
const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 121 }, (_, i) => currentYear - i); // From current year to 120 years ago

interface CustomDatePickerProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  label: string;
  value: string; // YYYY-MM-DD
  onChange: (value: string) => void;
  error?: string;
}

const CustomDatePicker: React.FC<CustomDatePickerProps> = ({ label, value, onChange, error, ...props }) => {
    const [isOpen, setIsOpen] = useState(false);
    
    const initialDate = value ? new Date(value + 'T00:00:00') : new Date();
    const [viewDate, setViewDate] = useState(initialDate);
    const containerRef = useRef<HTMLDivElement>(null);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const selectedDate = value ? new Date(value + 'T00:00:00') : null;

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
    
    useEffect(() => {
        if (value) {
            setViewDate(new Date(value + 'T00:00:00'));
        }
    }, [value]);

    const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

    const calendarGridYear = viewDate.getFullYear();
    const calendarGridMonth = viewDate.getMonth();

    const calendarDays = () => {
        const days = [];
        const numDays = daysInMonth(calendarGridYear, calendarGridMonth);
        const startDay = firstDayOfMonth(calendarGridYear, calendarGridMonth);

        for (let i = 0; i < startDay; i++) {
            days.push(<div key={`empty-start-${i}`} className="h-9 w-9"></div>);
        }

        for (let day = 1; day <= numDays; day++) {
            const date = new Date(calendarGridYear, calendarGridMonth, day);
            const isSelected = selectedDate && date.getTime() === selectedDate.getTime();
            const isToday = date.getTime() === today.getTime();

            days.push(
                <button
                    key={day}
                    type="button"
                    onClick={() => handleDateSelect(date)}
                    className={`h-9 w-9 flex items-center justify-center rounded-full text-sm transition-colors
                        ${isSelected ? 'bg-sky-600 text-white font-bold' : ''}
                        ${!isSelected && isToday ? 'bg-sky-100 text-sky-700 font-bold' : ''}
                        ${!isSelected && !isToday ? 'hover:bg-slate-100 text-slate-800' : ''}
                    `}
                >
                    {day}
                </button>
            );
        }
        return days;
    };

    const handleDateSelect = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        onChange(`${year}-${month}-${day}`);
        setIsOpen(false);
    };

    const changeMonth = (amount: number) => {
        setViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() + amount, 1));
    };

    const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setViewDate(new Date(viewDate.getFullYear(), parseInt(e.target.value), 1));
    };

    const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setViewDate(new Date(parseInt(e.target.value), viewDate.getMonth(), 1));
    };

    const id = props.id || props.name || label;

    return (
        <div ref={containerRef} className="relative">
            <label htmlFor={id} className="block text-sm font-medium text-slate-700 mb-1">
                {label} {props.required && <span className="text-red-500">*</span>}
            </label>
            <div className="relative">
                <input
                    id={id}
                    type="text"
                    {...props}
                    value={value}
                    onClick={() => setIsOpen(!isOpen)}
                    readOnly
                    className="input-neu w-full pr-10 cursor-pointer"
                    placeholder="YYYY-MM-DD"
                    aria-invalid={!!error}
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <CalendarIcon />
                </div>
            </div>
            {error && <p className="mt-1 text-xs text-red-600">{error}</p>}

            {isOpen && (
                <div className="absolute z-40 mt-1 w-72 bg-white card-panel p-4 animate-fade-in-fast">
                    <div className="flex items-center justify-between mb-2">
                        <button type="button" onClick={() => changeMonth(-1)} className="p-1 rounded-full hover:bg-slate-100"><ChevronLeftIcon /></button>
                        <div className="flex gap-2">
                            <select
                                value={viewDate.getMonth()}
                                onChange={handleMonthChange}
                                className="p-1 text-sm font-semibold border-none rounded bg-slate-100 focus:ring-sky-500 focus:ring-1"
                                aria-label="Select month"
                            >
                                {MONTHS.map((month, index) => (
                                    <option key={month} value={index}>{month}</option>
                                ))}
                            </select>
                            <select
                                value={viewDate.getFullYear()}
                                onChange={handleYearChange}
                                className="p-1 text-sm font-semibold border-none rounded bg-slate-100 focus:ring-sky-500 focus:ring-1"
                                aria-label="Select year"
                            >
                                {YEARS.map((year) => (
                                    <option key={year} value={year}>{year}</option>
                                ))}
                            </select>
                        </div>
                        <button type="button" onClick={() => changeMonth(1)} className="p-1 rounded-full hover:bg-slate-100"><ChevronRightIcon /></button>
                    </div>
                    
                    <div className="grid grid-cols-7 gap-1 text-center text-xs text-slate-500 mb-2">
                        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => <div key={day}>{day}</div>)}
                    </div>

                    <div className="grid grid-cols-7 gap-1">
                        {calendarDays()}
                    </div>
                    
                    <div className="mt-2 pt-2 border-t border-slate-200">
                        <button
                            type="button"
                            onClick={() => handleDateSelect(new Date())}
                            className="w-full text-center text-sm font-semibold text-sky-600 hover:bg-sky-50 rounded-md py-1.5 transition-colors"
                        >
                            Today
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomDatePicker;
