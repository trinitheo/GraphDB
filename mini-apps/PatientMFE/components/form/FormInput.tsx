import React from 'react';

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  containerClassName?: string;
}

const FormInput: React.FC<FormInputProps> = ({ label, error, containerClassName, ...props }) => {
  const id = props.id || props.name || label;

  return (
    <div className={containerClassName}>
      <label htmlFor={id} className="block text-sm font-medium text-slate-700 mb-1">
        {label} {props.required && <span className="text-red-500">*</span>}
      </label>
      <input
        id={id}
        {...props}
        className={`input-neu w-full ${props.className || ''}`}
        aria-invalid={!!error}
      />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
};

export default FormInput;
