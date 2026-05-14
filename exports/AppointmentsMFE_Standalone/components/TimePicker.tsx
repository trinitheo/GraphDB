import React, { useState, useRef, useEffect } from 'react';
import { ClockIcon } from '../../../components/icons';

interface TimePickerProps {
  label: string;
  value: string; // HH:mm format
  onChange: (value: string) => void;
  required?: boolean;
}

const TimePicker: React.FC<TimePickerProps> = ({ label, value, onChange, required }) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const hoursRef = useRef<HTMLDivElement>(null);
    const minutesRef = useRef<HTMLDivElement>(null);

    const [hourStr, minuteStr] = value ? value.split(':') : ['09', '00'];
    const hour = parseInt(hourStr, 10);
    const minute = parseInt(minuteStr, 10);

    const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
    const minutes = ['00', '15', '30', '45'];

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
        if (isOpen) {
            if (hoursRef.current) {
                const selectedHourEl = hoursRef.current.querySelector(`[data-hour="${String(hour).padStart(2, '0')}"]`);
                if (selectedHourEl) {
                    selectedHourEl.scrollIntoView({ block: 'center' });
                }
            }
            if (minutesRef.current) {
                const selectedMinuteValue = String(Math.floor(minute / 15) * 15).padStart(2, '0');
                const selectedMinuteEl = minutesRef.current.querySelector(`[data-minute="${selectedMinuteValue}"]`);
                 if (selectedMinuteEl) {
                    selectedMinuteEl.scrollIntoView({ block: 'center' });
                }
            }
        }
    }, [isOpen, hour, minute]);

    const handleHourChange = (newHour: string) => {
        onChange(`${newHour}:${String(minute).padStart(2, '0')}`);
    };

    const handleMinuteChange = (newMinute: string) => {
        onChange(`${String(hour).padStart(2, '0')}:${newMinute}`);
    };
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange(e.target.value);
    };

    return (
        <div ref={containerRef} className="relative">
            <label className="block text-sm font-medium text-slate-700 mb-1">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <div className="relative">
                <input
                    type="time"
                    value={value}
                    onChange={handleInputChange}
                    onClick={() => setIsOpen(!isOpen)}
                    className="input-neu w-full pr-10 cursor-pointer"
                    aria-haspopup="true"
                    aria-expanded={isOpen}
                    step="900" // 15 minutes
                />
                 <div 
                    className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer" 
                    onClick={() => setIsOpen(!isOpen)}
                >
                    <ClockIcon className="h-5 w-5 text-slate-400" />
                </div>
            </div>

            {isOpen && (
                <div className="absolute z-40 mt-1 w-48 bg-white card-panel p-2 flex gap-2 animate-fade-in-fast hidden sm:flex">
                    <div ref={hoursRef} className="h-48 w-1/2 overflow-y-auto scrollbar-autohide border-r border-slate-200">
                        {hours.map(h => (
                            <button
                                key={h}
                                type="button"
                                data-hour={h}
                                onClick={() => handleHourChange(h)}
                                className={`w-full text-center p-1.5 rounded-md text-sm ${
                                    parseInt(h, 10) === hour ? 'bg-sky-600 text-white' : 'hover:bg-slate-100'
                                }`}
                            >
                                {h}
                            </button>
                        ))}
                    </div>
                    <div ref={minutesRef} className="h-48 w-1/2 overflow-y-auto scrollbar-autohide">
                        {minutes.map(m => (
                            <button
                                key={m}
                                type="button"
                                data-minute={m}
                                onClick={() => handleMinuteChange(m)}
                                className={`w-full text-center p-1.5 rounded-md text-sm ${
                                    Math.floor(minute / 15) * 15 === parseInt(m, 10) ? 'bg-sky-600 text-white' : 'hover:bg-slate-100'
                                }`}
                            >
                                {m}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default TimePicker;
