import React from 'react';

interface FormFieldProps {
    label: string;
    help?: string;
    required?: boolean;
    children: React.ReactNode;
    htmlFor?: string;
    error?: string;
}

const FormField: React.FC<FormFieldProps> = ({ label, help, required, children, htmlFor, error }) => {
    const helpId = help ? `${htmlFor}-help` : undefined;
    const errorId = error ? `${htmlFor}-error` : undefined;
    const describedBy = [helpId, errorId].filter(Boolean).join(' ');

    const childWithAria = React.isValidElement(children) 
        ? React.cloneElement(children as React.ReactElement<any>, { 'aria-describedby': describedBy, 'error': error })
        : children;

    return (
        <div>
            <label htmlFor={htmlFor} className="block text-sm font-medium text-slate-700">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            {help && <p id={helpId} className="mt-1 text-xs text-slate-500">{help}</p>}
            <div className="mt-2">
                {childWithAria}
            </div>
            {error && <p id={errorId} className="mt-1 text-xs text-red-600" role="alert">{error}</p>}
        </div>
    );
};

export default FormField;
