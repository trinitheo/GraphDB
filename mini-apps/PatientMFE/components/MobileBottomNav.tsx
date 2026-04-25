import React, { useMemo, useState, useRef, useEffect } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import type { MiniApp } from '../mini-apps/types';
import { useAuth } from '../mini-apps/PatientMFE/hooks/useAuth';
import { MoreHorizontalIcon, LogOut, User } from '../../../components/icons';

interface MobileBottomNavProps {
  miniApps: MiniApp[];
}

const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ miniApps }) => {
    const { user: currentUser, logout } = useAuth();
    const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    const accessibleApps = useMemo(() => {
        if (!currentUser) return [];
        return miniApps.filter(app => app.roles?.includes(currentUser.role));
    }, [currentUser, miniApps]);

    const primaryNavApps = useMemo(() => accessibleApps.filter(app => app.mobileConfig?.enabled).slice(0, 4), [accessibleApps]);
    const moreMenuApps = useMemo(() => accessibleApps.filter(app => !app.mobileConfig?.enabled), [accessibleApps]);
    
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMoreMenuOpen(false);
            }
        };
        if (isMoreMenuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isMoreMenuOpen]);
    
    const NavItem: React.FC<{ app: MiniApp }> = ({ app }) => (
        <ReactRouterDOM.NavLink
            to={app.path}
            end={app.path === '/'}
            className={({ isActive }) => `
                flex flex-col items-center justify-center flex-1 p-1
                transition-colors duration-200 group
                ${isActive ? 'text-sky-600' : 'text-slate-500 hover:text-sky-600'}
            `}
        >
            {/* FIX: Cast icon to a ReactElement that accepts className to satisfy TypeScript's type checking for cloneElement. */}
            {app.icon && React.isValidElement(app.icon) ? React.cloneElement(app.icon as React.ReactElement<{ className?: string }>, { className: 'w-6 h-6' }) : app.icon}
            <span className="text-xs font-medium mt-1">{app.name}</span>
        </ReactRouterDOM.NavLink>
    );

    return (
        <>
            {/* More Menu Sheet */}
            {isMoreMenuOpen && (
                <>
                    <div onClick={() => setIsMoreMenuOpen(false)} className="fixed inset-0 bg-black/60 z-40 lg:hidden animate-fade-in-fast" aria-hidden="true"></div>
                    <div ref={menuRef} className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-white rounded-t-2xl p-4 shadow-lg animate-slide-up">
                        <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-4"></div>
                        <nav className="space-y-2">
                           {moreMenuApps.map(app => (
                               <ReactRouterDOM.NavLink
                                  key={app.path}
                                  to={app.path}
                                  onClick={() => setIsMoreMenuOpen(false)}
                                  className={({ isActive }) => `flex items-center gap-4 p-3 rounded-lg text-slate-700 font-medium ${isActive ? 'bg-slate-100' : 'hover:bg-slate-50'}`}
                                >
                                  {/* FIX: Cast icon to a ReactElement that accepts className to satisfy TypeScript's type checking for cloneElement. */}
                                  {app.icon && React.isValidElement(app.icon) ? React.cloneElement(app.icon as React.ReactElement<{ className?: string }>, { className: 'w-6 h-6' }) : app.icon}
                                  {app.name}
                                </ReactRouterDOM.NavLink>
                           ))}
                        </nav>
                         <div className="border-t border-slate-200 mt-4 pt-4 space-y-2">
                            <ReactRouterDOM.Link to="/users/profile" onClick={() => setIsMoreMenuOpen(false)} className="flex items-center gap-4 p-3 rounded-lg text-slate-700 font-medium hover:bg-slate-50">
                                <User size={24} /> My Profile
                            </ReactRouterDOM.Link>
                             <button onClick={logout} className="flex items-center gap-4 w-full p-3 rounded-lg text-red-600 font-medium hover:bg-red-50">
                                <LogOut size={24} /> Logout
                            </button>
                        </div>
                    </div>
                </>
            )}

            {/* Bottom Nav Bar */}
            <div className="fixed bottom-0 left-0 right-0 h-20 bg-white/80 backdrop-blur-sm border-t border-slate-200/80
                            flex items-stretch justify-around
                            lg:hidden z-30">
                {primaryNavApps.map(app => <NavItem key={app.path} app={app} />)}
                <button
                    onClick={() => setIsMoreMenuOpen(true)}
                    className="flex flex-col items-center justify-center flex-1 p-1 text-slate-500 hover:text-sky-600"
                >
                    <MoreHorizontalIcon className="w-6 h-6" />
                    <span className="text-xs font-medium mt-1">More</span>
                </button>
            </div>
        </>
    );
};

export default MobileBottomNav;