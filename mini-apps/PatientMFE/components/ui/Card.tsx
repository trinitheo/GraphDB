import React from 'react';

const Card: React.FC<{className?: string, children: React.ReactNode}> = ({className, children}) => (
    <div className={`bg-white rounded-2xl shadow-sm p-6 sm:p-8 ${className || ''}`}>
        {children}
    </div>
);

export default Card;
