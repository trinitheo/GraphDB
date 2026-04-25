import React from 'react';

interface StatCardProps {
  icon: React.ReactNode | React.ElementType;
  title?: string; // Legacy support
  label?: string; // New design prop
  value: string;
  subtext?: string; // New design prop
  description?: string; // Legacy support
  subtitle?: string; // Legacy support
  gradient?: string;
  bgColor?: string;
  color?: 'blue' | 'green' | 'purple' | 'yellow' | 'red' | 'orange'; // Legacy support
  onClick?: () => void;
}

const colorMap: Record<string, { gradient: string; bgColor: string }> = {
  blue: { gradient: 'from-blue-500 to-cyan-500', bgColor: 'bg-blue-50' },
  green: { gradient: 'from-emerald-500 to-teal-500', bgColor: 'bg-emerald-50' },
  purple: { gradient: 'from-purple-500 to-pink-500', bgColor: 'bg-purple-50' },
  yellow: { gradient: 'from-yellow-500 to-amber-500', bgColor: 'bg-yellow-50' },
  orange: { gradient: 'from-orange-500 to-amber-500', bgColor: 'bg-orange-50' },
  red: { gradient: 'from-red-500 to-rose-500', bgColor: 'bg-red-50' },
  default: { gradient: 'from-slate-500 to-slate-600', bgColor: 'bg-slate-50' }
};

const StatCard: React.FC<StatCardProps> = ({
  icon,
  title,
  label,
  value,
  subtext,
  description,
  subtitle,
  gradient,
  bgColor,
  color,
  onClick
}) => {
  const displayLabel = label || title || '';
  const displaySubtext = subtext || description || subtitle || '';
  
  let appliedGradient = gradient;
  let appliedBgColor = bgColor;

  if (!appliedGradient || !appliedBgColor) {
    const mapped = colorMap[color || 'default'] || colorMap['default'];
    appliedGradient = appliedGradient || mapped.gradient;
    appliedBgColor = appliedBgColor || mapped.bgColor;
  }

  const renderIcon = () => {
    if (React.isValidElement(icon)) {
      return React.cloneElement(icon as React.ReactElement<any>, { className: `w-7 h-7` });
    }
    if (typeof icon === 'function') {
      const IconComponent = icon as React.ElementType;
      return <IconComponent className="w-7 h-7" />;
    }
    return icon;
  };

  return (
    <button
      onClick={onClick}
      className="bg-white rounded-xl border border-gray-200 p-6 text-left transition-all duration-300 hover:shadow-xl hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-offset-2 group relative overflow-hidden w-full"
      aria-label={`${displayLabel}: ${value}, ${displaySubtext}`}
      style={{ borderColor: 'transparent' }}
    >
      {/* Gradient border effect on hover */}
      <div className={`absolute inset-0 bg-gradient-to-br ${appliedGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl`} style={{ padding: '2px' }}>
        <div className="bg-white rounded-xl w-full h-full"></div>
      </div>
      
      <div className="relative z-10 flex items-start gap-4">
        <div className={`flex-shrink-0 p-3 ${appliedBgColor} rounded-xl group-hover:scale-110 transition-transform duration-300`}>
          {renderIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-600 mb-1">{displayLabel}</p>
          <p className={`text-3xl font-bold text-transparent bg-gradient-to-br ${appliedGradient} bg-clip-text mb-1`}>{value}</p>
          <p className="text-sm text-gray-500">{displaySubtext}</p>
        </div>
      </div>
    </button>
  );
};

export default StatCard;