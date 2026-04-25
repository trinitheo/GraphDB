import React from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import type { QuickAction } from '../../types/dashboard';

interface QuickActionsProps {
  actions: QuickAction[];
  className?: string;
}

const buttonColors = [
  { gradient: "from-blue-500 to-cyan-500", hoverBg: "hover:bg-blue-50", iconColor: "group-hover:text-blue-600" },
  { gradient: "from-purple-500 to-pink-500", hoverBg: "hover:bg-purple-50", iconColor: "group-hover:text-purple-600" },
  { gradient: "from-emerald-500 to-teal-500", hoverBg: "hover:bg-emerald-50", iconColor: "group-hover:text-emerald-600" },
  { gradient: "from-orange-500 to-amber-500", hoverBg: "hover:bg-orange-50", iconColor: "group-hover:text-orange-600" },
];

const QuickActions: React.FC<QuickActionsProps> = ({ actions, className = '' }) => {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
      {actions.map((action, index) => {
        const Icon = action.icon;
        const colorIndex = action.label.length % buttonColors.length;
        const colors = buttonColors[colorIndex];

        return (
          <ReactRouterDOM.Link
            key={action.label}
            to={action.href}
            className={`h-auto py-4 px-6 flex items-center gap-3 justify-start rounded-xl border border-gray-200 bg-white ${colors.hoverBg} hover:border-transparent hover:shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 group relative overflow-hidden`}
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${colors.gradient} opacity-0 group-hover:opacity-5 transition-opacity`}></div>
            
            <div className={`text-gray-500 ${colors.iconColor} transition-colors relative z-10`}>
              <Icon className="w-6 h-6" />
            </div>
            <div className="relative z-10 text-left">
                <span className="block text-gray-900 font-semibold">{action.label}</span>
                <span className="block text-xs text-gray-500 mt-0.5">{action.description}</span>
            </div>
          </ReactRouterDOM.Link>
        );
      })}
    </div>
  );
};

export default QuickActions;