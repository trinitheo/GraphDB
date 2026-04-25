import React from 'react';
import { DashboardRouter } from '../DashboardRouter';

const WelcomeScreen: React.FC = () => {
  return (
    <div className="w-full h-full animate-fade-in">
      <DashboardRouter />
    </div>
  );
};

export default WelcomeScreen;