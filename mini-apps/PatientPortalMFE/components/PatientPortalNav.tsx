import React from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import {
  HomeIcon,
  // FIX: Correct icon imports
  CalendarIcon,
  MedicalRecordsIcon,
  MedicationIcon,
  MessagingIcon,
  ReceiptRefundIcon
} from '../../../components/icons';

const navItems = [
    { name: 'Dashboard', path: '/portal', icon: HomeIcon, exact: true },
    { name: 'Appointments', path: '/portal/appointments', icon: CalendarIcon },
    { name: 'Medical Records', path: '/portal/records', icon: MedicalRecordsIcon },
    { name: 'Medications', path: '/portal/medications', icon: MedicationIcon },
    { name: 'Messages', path: '/portal/messages', icon: MessagingIcon },
    { name: 'Billing', path: '/portal/billing', icon: ReceiptRefundIcon },
];

const PatientPortalNav: React.FC = () => {
    return (
        <aside className="w-full lg:w-64 flex-shrink-0">
            <div className="card-panel p-4 h-full">
                <h2 className="text-xl font-bold text-slate-900 mb-4 hidden lg:block">My Portal</h2>
                <nav className="flex flex-row lg:flex-col lg:space-y-2 justify-around lg:justify-start">
                    {navItems.map(item => (
                         <ReactRouterDOM.NavLink
                            key={item.name}
                            to={item.path}
                            end={item.exact}
                            className={({ isActive }) => `
                                flex flex-col items-center p-2 rounded-lg
                                lg:flex-row lg:items-center lg:gap-3 lg:p-3
                                transition-colors duration-200 group
                                ${isActive
                                    ? 'bg-sky-100 text-sky-700 font-semibold'
                                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                                }
                            `}
                        >
                            <item.icon className="w-6 h-6 lg:w-5 lg:h-5 flex-shrink-0" />
                            <span className="text-xs font-medium text-center lg:text-sm lg:text-left">{item.name}</span>
                        </ReactRouterDOM.NavLink>
                    ))}
                </nav>
            </div>
        </aside>
    );
};

export default PatientPortalNav;