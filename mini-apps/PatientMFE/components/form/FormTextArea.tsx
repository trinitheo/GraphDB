
import React from 'react';

interface FormTextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  labelAddon?: React.ReactNode;
}

const FormTextArea: React.FC<FormTextAreaProps> = ({ label, error, labelAddon, ...props }) => {
  const id = props.id || props.name || label;

  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <label htmlFor={id} className="block text-sm font-medium text-slate-700">
          {label} {props.required && <span className="text-red-500">*</span>}
        </label>
        {labelAddon}
      </div>
      <textarea
        id={id}
        {...props}
        className={`textarea-neu w-full resize-y ${props.className || ''}`}
        aria-invalid={!!error}
      />
    </div>
  );
};

export default FormTextArea;