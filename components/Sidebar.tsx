import React, { useMemo } from 'react';
import { useLocation, useNavigate, NavLink, Link } from 'react-router-dom';
import type { MiniApp } from '../mini-apps/types';
import { useAuth } from '../mini-apps/PatientMFE/hooks/useAuth';
import { LogOut, User, ChevronLeft } from './icons';
import { WORKFLOW_GROUPS } from '../constants';

interface SidebarProps {
  miniApps: MiniApp[];
}

const Sidebar: React.FC<SidebarProps> = ({ miniApps }) => {
  const { user: currentUser, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const accessibleApps = useMemo(() => {
    if (!currentUser) return [];
    return miniApps.filter(app => {
      if (!app.roles) return true;
      return app.roles.includes(currentUser.role);
    });
  }, [currentUser, miniApps]);

  const appDisplayStructure = useMemo(() => {
    if (!currentUser) return { workflows: [], categories: {} };

    const workflowAppNames = new Set<string>();

    // 1. Process workflows
    const workflows = Object.values(WORKFLOW_GROUPS)
      .filter(group => group.roles.includes(currentUser.role))
      .map(group => {
        const appsInWorkflow = accessibleApps.filter(app => group.apps.includes(app.name));
        appsInWorkflow.forEach(app => workflowAppNames.add(app.name));
        return { ...group, apps: appsInWorkflow };
      })
      .filter(group => group.apps.length > 0);

    // 2. Process remaining apps by category
    const remainingApps = accessibleApps.filter(app => !workflowAppNames.has(app.name));
    const categories = remainingApps.reduce<Record<string, MiniApp[]>>((acc, app) => {
      const category = app.category || 'General';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(app);
      return acc;
    }, {});

    return { workflows, categories };
  }, [accessibleApps, currentUser]);


  const activeLinkClass = 'bg-sky-100 text-sky-700 font-semibold';
  const inactiveLinkClass = 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 font-medium';
  
  const SidebarNavLink: React.FC<{app: MiniApp}> = ({ app }) => (
     <NavLink
        to={app.path}
        end={app.path === '/'}
        className={({ isActive }) => `flex items-center gap-3 px-4 py-2.5 text-sm rounded-lg transition-all duration-200 ${isActive ? activeLinkClass : inactiveLinkClass}`}
      >
        {app.icon && React.isValidElement(app.icon) ? React.cloneElement(app.icon as React.ReactElement<{ className?: string }>, { className: 'w-5 h-5' }) : app.icon}
        {app.name}
      </NavLink>
  );

  return (
    <aside className="card-panel hidden lg:flex flex-col p-4 w-60 flex-shrink-0">
      <div className="h-20 flex items-center justify-center">
        <Link to="/" className="text-2xl font-bold text-slate-900 tracking-wider">
          CarePlus <span className="text-sky-600">PRM</span>
        </Link>
      </div>
      <nav className="flex-1 space-y-4 overflow-y-auto scrollbar-autohide">
        {/* Back Button */}
        {location.pathname !== '/' && (
            <button 
                onClick={() => navigate(-1)} 
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 rounded-lg transition-colors group"
            >
                <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                Back
            </button>
        )}

        {/* Render Workflows */}
        {appDisplayStructure.workflows.map((workflow) => (
          <div key={workflow.name}>
            <h3 className="px-4 text-xs font-bold uppercase text-slate-400 mb-2 flex items-center gap-2">
              {workflow.icon}
              <span>{workflow.name}</span>
            </h3>
            <div className="space-y-1">
              {workflow.apps.map((app) => <SidebarNavLink key={app.path} app={app} />)}
            </div>
          </div>
        ))}
        
        {/* Render Categories */}
        {Object.entries(appDisplayStructure.categories)
          .sort(([aKey], [bKey]) => {
             const order = ['General', 'Clinical', 'Admin'];
             const idxA = order.indexOf(aKey);
             const idxB = order.indexOf(bKey);
             if (idxA !== -1 && idxB !== -1) return idxA - idxB;
             if (idxA !== -1) return -1;
             if (idxB !== -1) return 1;
             return aKey.localeCompare(bKey);
          })
          .map(([category, apps]: [string, MiniApp[]]) => (
          <div key={category}>
            <h3 className="px-4 text-xs font-bold uppercase text-slate-400 mb-2">{category}</h3>
            <div className="space-y-1">
              {apps.map((app) => <SidebarNavLink key={app.path} app={app} />)}
            </div>
          </div>
        ))}
      </nav>
      <div className="pt-4 border-t border-slate-200">
        {currentUser && (
            <div className="flex items-center w-full p-2 rounded-lg">
                <img 
                    className="h-10 w-10 rounded-full object-cover" 
                    src={currentUser.avatar} 
                    alt={currentUser.name} 
                />
                <div className="ml-3 text-left flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 text-sm truncate">{currentUser.name}</p>
                    <p className="text-xs text-slate-500 truncate">{currentUser.role}</p>
                </div>
            </div>
        )}
        <div className="mt-2 space-y-1">
            <Link to="/users/profile" className="flex items-center gap-3 w-full px-3 py-2 text-sm text-slate-700 rounded-md hover:bg-slate-100 transition-colors">
                <User size={16} /> My Profile
            </Link>
            <button onClick={logout} className="flex items-center gap-3 w-full px-3 py-2 text-sm text-red-600 rounded-md hover:bg-red-50 transition-colors">
                <LogOut size={16} /> Logout
            </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;