import React from 'react';
import { useLocation, useNavigate, Routes, Route, Navigate, HashRouter } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import MobileBottomNav from './components/MobileBottomNav';
import { MINI_APPS } from './constants';
import WelcomeScreen from './mini-apps/WelcomeScreen/components/nurse-prep/WelcomeScreen';
import { PatientProvider } from './mini-apps/PatientMFE/context/PatientContext';
import { AuthProvider, useAuth } from './mini-apps/PatientMFE/hooks/useAuth';
import LoginScreen from './components/LoginScreen';
import NursePrepView from './mini-apps/WelcomeScreen/components/nurse-prep/NursePrepView';
import { ChevronLeft } from './components/icons';

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-sky-500"></div>
      </div>
    );
  }

  if (!user) {
    return <LoginScreen />;
  }

  const isDashboard = location.pathname === '/';

  return (
    <div className="h-screen flex p-3 md:p-4 gap-3 md:gap-4 font-sans text-slate-800 relative">
      <Sidebar miniApps={MINI_APPS} />
      
      <div className="flex-1 flex flex-col gap-3 md:gap-4 min-w-0">
        {/* Mobile Back Button */}
        {!isDashboard && (
            <div className="lg:hidden">
                <button 
                    onClick={() => navigate(-1)} 
                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 bg-white/80 backdrop-blur-sm rounded-lg shadow-sm border border-slate-200 active:bg-slate-100 transition-colors"
                >
                    <ChevronLeft className="w-4 h-4" />
                    Back
                </button>
            </div>
        )}

        <main className={`relative z-10 flex-1 overflow-y-auto p-4 md:p-6 scrollbar-autohide lg:pb-6 pb-24 ${isDashboard ? '' : 'card-panel'}`}>
          <Routes>
            <Route path="/" element={<WelcomeScreen />} />
            {MINI_APPS.filter(app => app.path !== '/').map((app) => (
              <Route key={app.path} path={`${app.path}/*`} element={<app.component />} />
            ))}
            <Route path="/prep/:appointmentId" element={<NursePrepView />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>

      <MobileBottomNav miniApps={MINI_APPS} />
    </div>
  );
};

const App = () => {
  return (
    <HashRouter>
      <AuthProvider>
        <PatientProvider>
          <AppContent />
        </PatientProvider>
      </AuthProvider>
    </HashRouter>
  );
};

export default App;