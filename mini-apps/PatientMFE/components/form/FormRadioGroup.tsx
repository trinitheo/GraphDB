
import React from 'react';

interface FormRadioGroupProps<T extends string> {
  label: string;
  name: string;
  options: readonly T[];
  value: T;
  onChange: (value: T) => void;
  inline?: boolean;
}

const FormRadioGroup = <T extends string>({
  label,
  name,
  options,
  value,
  onChange,
  inline = false,
}: FormRadioGroupProps<T>) => {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700">{label}</label>
      <div className={`mt-2 flex ${inline ? 'flex-row gap-4' : 'flex-col gap-2'}`}>
        {options.map((option) => (
          <label key={option} className="inline-flex items-center">
            <input
              type="radio"
              name={name}
              value={option}
              checked={value === option}
              onChange={(e) => onChange(e.target.value as T)}
              className="h-4 w-4 text-sky-600 border-slate-300 focus:ring-sky-500"
            />
            <span className="ml-2 text-sm text-slate-700">{option}</span>
          </label>
        ))}
      </div>
    </div>
  );
};

export default FormRadioGroup;
