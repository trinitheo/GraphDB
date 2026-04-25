
import React from 'react';

interface FormSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
}

const FormSelect: React.FC<FormSelectProps> = ({ label, error, children, ...props }) => {
  const id = props.id || props.name || label;
  
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-slate-700 mb-1">
        {label}
      </label>
      <select
        id={id}
        {...props}
        className={`select-neu w-full ${props.className || ''}`}
        aria-invalid={!!error}
      >
        {children}
      </select>
    </div>
  );
};

export default FormSelect;