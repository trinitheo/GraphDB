import React, { useRef, useEffect } from 'react';

interface FormCheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  // FIX: Changed label from string to React.ReactNode to allow complex label content.
  label: React.ReactNode;
  isIndeterminate?: boolean;
}

const FormCheckbox: React.FC<FormCheckboxProps> = ({ label, isIndeterminate, ...props }) => {
  // When label is a ReactNode, an id or name must be provided in props for the label's htmlFor to work.
  // We check if label is a string before using it as a fallback for the id.
  const id = props.id || props.name || (typeof label === 'string' ? label : undefined);
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (ref.current) {
        ref.current.indeterminate = isIndeterminate || false;
    }
  }, [ref, isIndeterminate]);

  return (
    <div className="flex items-center">
      <input
        ref={ref}
        id={id}
        type="checkbox"
        {...props}
        className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
      />
      {/* For the label to work correctly, an `id` must be provided to the input when `label` is a ReactNode. */}
      <label htmlFor={id} className="ml-2 block text-sm text-slate-700">
        {label}
      </label>
    </div>
  );
};

export default FormCheckbox;
