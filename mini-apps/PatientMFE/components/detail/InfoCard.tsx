import React from 'react';
import { MedicationIcon, AllergyIcon, ProblemIcon } from '../../../../components/icons';

const icons = {
  medication: <MedicationIcon className="h-6 w-6" />,
  allergy: <AllergyIcon className="h-6 w-6" />,
  problem: <ProblemIcon className="h-6 w-6" />,
};

interface InfoCardProps {
  title: string;
  items: string[];
  icon: keyof typeof icons;
}

const InfoCard: React.FC<InfoCardProps> = ({ title, items, icon }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 h-full">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-sky-500">{icons[icon]}</span>
        <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
      </div>
      {items.length > 0 ? (
        <ul className="space-y-2">
          {items.map((item, index) => (
            <li key={index} className="text-sm text-slate-600 pl-4 border-l-2 border-slate-200">
              {item}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-slate-400 italic">No information available.</p>
      )}
    </div>
  );
};

export default InfoCard;