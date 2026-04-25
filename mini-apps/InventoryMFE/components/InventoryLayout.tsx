
import React from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { 
    BoxIcon, 
    ClockIcon, 
    TrendIcon, 
    ClipboardIcon, 
    ChartBarIcon, 
    ShieldCheckIcon,
    InventoryIcon 
} from '../../../components/icons';

interface InventoryLayoutProps {
    children: React.ReactNode;
}

const navItems = [
    { name: 'Dashboard', path: '/inventory', icon: ChartBarIcon, exact: true },
    { name: 'Inventory', path: '/inventory/list', icon: InventoryIcon },
    { name: 'Expiry Management', path: '/inventory/expiry', icon: ClockIcon },
    { name: 'Usage Logs', path: '/inventory/usage', icon: TrendIcon },
    { name: 'Kits & Bundles', path: '/inventory/kits', icon: BoxIcon },
    { name: 'Reports', path: '/inventory/reports', icon: ClipboardIcon },
    { name: 'Audit Log', path: '/inventory/audit', icon: ShieldCheckIcon },
];

const InventoryLayout: React.FC<InventoryLayoutProps> = ({ children }) => {
    return (
        <div className="flex h-full bg-white">
            <aside className="w-64 flex-shrink-0 border-r border-slate-200 py-6 px-4 hidden lg:block">
                <div className="mb-8 px-2">
                    <h2 className="text-xl font-bold text-slate-900">Medical Inventory</h2>
                    <p className="text-xs text-slate-500 mt-1">Concierge Practice System</p>
                </div>
                <nav className="space-y-1">
                    {navItems.map(item => (
                        <ReactRouterDOM.NavLink
                            key={item.name}
                            to={item.path}
                            end={item.exact}
                            className={({ isActive }) => `
                                flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors
                                ${isActive 
                                    ? 'bg-sky-50 text-sky-700' 
                                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}
                            `}
                        >
                            <item.icon className="w-5 h-5" />
                            {item.name}
                        </ReactRouterDOM.NavLink>
                    ))}
                </nav>
            </aside>
            <main className="flex-1 overflow-auto bg-white">
                {children}
            </main>
        </div>
    );
};

export default InventoryLayout;
