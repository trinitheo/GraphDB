
import React, { useRef } from 'react';
import type { MedicalRecordEntry, Patient } from '../../types';
// FIX: Corrected icon imports and path. Aliased Share2 to ShareIcon.
import { CalendarIcon as Calendar, PrintIcon, Share2 as ShareIcon } from '../../../../components/icons';
import { formatNoteForShare } from '../../utils/formatters';

interface NoteDisplayShellProps {
  icon: React.ReactNode;
  title: string;
  entry: MedicalRecordEntry;
  patient: Patient;
  children: React.ReactNode;
}

const NoteDisplayShell: React.FC<NoteDisplayShellProps> = ({ icon, title, entry, patient, children }) => {
  const shellRef = useRef<HTMLDivElement>(null);
  const showShare = 'share' in navigator;
  const { timestamp, authorName } = entry;

  const formattedDate = new Date(timestamp).toLocaleString([], {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
  });

  const handlePrint = () => {
    if (!shellRef.current) return;
    const elementToPrint = shellRef.current;
    elementToPrint.classList.add('printable-section');
    const onAfterPrint = () => {
        elementToPrint.classList.remove('printable-section');
        window.removeEventListener('afterprint', onAfterPrint);
    };
    window.addEventListener('afterprint', onAfterPrint);
    window.print();
  };
  
  const handleShare = async () => {
    const shareText = formatNoteForShare(entry, patient, title);
    if (navigator.share) {
        try {
            await navigator.share({
                title: `Clinical Note for ${patient.name}`,
                text: shareText,
            });
        } catch (error) {
            console.error('Error sharing note:', error);
        }
    }
  };


  return (
    <div ref={shellRef} className="group card-panel p-5 print-avoid-break transition-shadow hover:shadow-md">
        <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
                {icon}
                <h4 className="font-bold text-lg text-slate-800">{title}</h4>
            </div>
            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                {showShare && (
                    <button onClick={handleShare} className="p-2 text-slate-500 hover:bg-slate-200 hover:text-sky-600 rounded-full transition-colors" title="Share Note">
                        <ShareIcon size={18} />
                    </button>
                )}
                 <button onClick={handlePrint} className="p-2 text-slate-500 hover:bg-slate-200 hover:text-sky-600 rounded-full transition-colors" title="Print Note">
                    <PrintIcon size={18} />
                </button>
            </div>
        </div>
        <div className="prose prose-sm max-w-none text-slate-700 prose-strong:text-slate-900 prose-headings:text-slate-800">
          {children}
        </div>
        <div className="border-t border-slate-200 mt-4 pt-4 flex justify-between items-center">
            <div>
                <p className="text-xs text-slate-500">Author</p>
                <p className="text-sm font-medium text-slate-800">{authorName}</p>
            </div>
            <p className="text-xs text-slate-500 flex items-center gap-2">
                <Calendar size={14} />
                <span>{formattedDate}</span>
            </p>
        </div>
      </div>
  );
};

export default NoteDisplayShell;