import React from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { motion } from 'framer-motion';
import type { QuickAction } from '../../types/dashboard';

interface QuickActionsProps {
  actions: QuickAction[];
  className?: string;
}

const buttonColors = [
  { gradient: "from-blue-500/20 to-blue-600/20", icon: "text-blue-600", shadow: "hover:shadow-blue-200/50" },
  { gradient: "from-purple-500/20 to-purple-600/20", icon: "text-purple-600", shadow: "hover:shadow-purple-200/50" },
  { gradient: "from-emerald-500/20 to-emerald-600/20", icon: "text-emerald-600", shadow: "hover:shadow-emerald-200/50" },
  { gradient: "from-orange-500/20 to-orange-600/20", icon: "text-orange-600", shadow: "hover:shadow-orange-200/50" },
];

const QuickActions: React.FC<QuickActionsProps> = ({ actions, className = '' }) => {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ${className}`}>
      {actions.map((action, index) => {
        const Icon = action.icon;
        const colorIndex = index % buttonColors.length;
        const colors = buttonColors[colorIndex];

        return (
          <motion.div
            key={action.label}
            whileHover={{ scale: 1.02, translateY: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            <ReactRouterDOM.Link
              to={action.href}
              className={`group h-full p-5 flex items-center gap-4 justify-start rounded-2xl border border-slate-200 bg-white/70 backdrop-blur-sm shadow-sm transition-all hover:bg-white hover:border-slate-300 ${colors.shadow} relative overflow-hidden`}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${colors.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
              
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 relative z-10 bg-slate-50 ${colors.icon}`}>
                <Icon className="w-6 h-6" />
              </div>

              <div className="relative z-10 text-left">
                  <span className="block text-slate-900 font-bold tracking-tight">{action.label}</span>
                  <span className="block text-[11px] font-medium text-slate-500 mt-0.5 line-clamp-1">{action.description}</span>
              </div>
              
              <div className="ml-auto opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0 relative z-10">
                 <div className={`w-6 h-6 rounded-full flex items-center justify-center bg-white shadow-sm border border-slate-100 ${colors.icon}`}>
                    <span className="text-xs font-bold">→</span>
                 </div>
              </div>
            </ReactRouterDOM.Link>
          </motion.div>
        );
      })}
    </div>
  );
};

export default QuickActions;
