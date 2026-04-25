
import React, { useState, useEffect } from 'react';
import { authService } from '../mini-apps/PatientMFE/services/authService';
import { useAuth } from '../mini-apps/PatientMFE/hooks/useAuth';
import { AlertTriangle, LockClosedIcon, User } from './icons';
import type { Api } from '../api_contract/user';

const LoginScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [demoUsers, setDemoUsers] = useState<Api.V1.User[]>([]);
  
  const { login } = useAuth();

  useEffect(() => {
    authService.getUsers().then(users => {
        const activeUsers = users.filter(u => u.status === 'Active');
        setDemoUsers(activeUsers);
        // Pre-select a default user (Practice Manager) if available
        const defaultUser = activeUsers.find(u => u.role === 'Practice Manager') || activeUsers[0];
        if (defaultUser) {
            setEmail(defaultUser.email);
        }
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
        setError("Please select a user to log in.");
        return;
    }
    // Mock password validation
    if (password.length > 0 && password.length < 4) {
        setError("Password must be at least 4 characters.");
        return;
    }

    setIsLoading(true);
    setError('');
    try {
      await login(email);
      // No reload needed; the AuthProvider will update the state
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUserSelection = (e: React.ChangeEvent<HTMLSelectElement>) => {
      setEmail(e.target.value);
      setPassword(''); // Reset password on user change
  };

  return (
    <div className="h-screen w-screen flex items-center justify-center p-4 bg-slate-50/50">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-900 tracking-wider">
            CarePlus <span className="text-sky-600">PRM</span>
          </h1>
          <p className="text-slate-500 mt-2">Medical Practice Management System</p>
        </div>
        
        <div className="card-panel p-8 shadow-xl border-slate-200">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
                <div>
                    <label htmlFor="user-select" className="block text-sm font-medium text-slate-700 mb-1">
                        Username (Demo Selection)
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                            <User size={18} />
                        </div>
                        <select
                            id="user-select"
                            value={email}
                            onChange={handleUserSelection}
                            className="input-neu w-full pl-10"
                            aria-label="Select a demo user to log in"
                        >
                            {demoUsers.length === 0 ? (
                                <option>Loading users...</option>
                            ) : (
                                demoUsers.map(user => (
                                    <option key={user.id} value={user.email}>
                                        {user.name} ({user.role})
                                    </option>
                                ))
                            )}
                        </select>
                    </div>
                </div>

                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
                        Password
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                            <LockClosedIcon size={18} />
                        </div>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="input-neu w-full pl-10"
                            placeholder="Enter password..."
                        />
                    </div>
                    <div className="flex justify-end mt-1">
                        <button type="button" className="text-xs font-medium text-sky-600 hover:text-sky-700 hover:underline">
                            Forgot Password?
                        </button>
                    </div>
                </div>
            </div>
            
            {error && (
              <div className="flex items-start gap-2 p-3 bg-red-50 text-red-700 border-l-4 border-red-400 text-sm rounded-r">
                 <AlertTriangle size={20} className="flex-shrink-0" />
                 <div>{error}</div>
              </div>
            )}

            <button
                type="submit"
                disabled={isLoading || !email}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
            >
                {isLoading ? 'Authenticating...' : 'Log In'}
            </button>

            <div className="pt-4 border-t border-slate-100 text-center">
                <button type="button" className="text-sm text-slate-500 hover:text-slate-800 transition-colors">
                    Need account help?
                </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
