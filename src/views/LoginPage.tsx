import React, { useState } from 'react';
import {
  Layers,
  Sun,
  Moon,
  Eye,
  EyeOff,
  LogIn,
  AlertCircle,
  KeyRound,
  CheckCircle2,
  X,
  UserPlus,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { useTheme } from '../context/ThemeContext.js';
import { useToast } from '../components/Toast.js';
import { UserRole } from '../types/index.js';

interface LoginPageProps {
  onLoginSuccess: (role: UserRole) => void;
  onNavigateToRegister?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const { login, register } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { success, error } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Forgot password & Register modals
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState<UserRole>('Student');
  const [regDept, setRegDept] = useState('Computer Science & Engineering');
  const [regLoading, setRegLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim() || !password.trim()) {
      setErrorMessage('Please provide both Email ID and Password.');
      return;
    }

    setLoading(true);
    try {
      const res = await login(email.trim(), password.trim());
      if (res.success && res.role) {
        success('Authentication Successful', `Welcome to SmartCampus (${res.role})`);
        onLoginSuccess(res.role);
      } else {
        const msg = res.message || 'Invalid Email ID or Password. Please check credentials.';
        setErrorMessage(msg);
        error('Authentication Failed', msg);
      }
    } catch (err: any) {
      const msg = err?.message || 'Server connection error';
      setErrorMessage(msg);
      error('Login Error', msg);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) return;
    setForgotSent(true);
    success('Password Reset Initiated', `Instructions sent to ${forgotEmail}`);
    setTimeout(() => {
      setIsForgotModalOpen(false);
      setForgotSent(false);
      setForgotEmail('');
    }, 2000);
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim() || !regEmail.trim() || !regPassword.trim()) {
      error('Registration Error', 'All fields are required');
      return;
    }

    setRegLoading(true);
    try {
      const res = await register({
        name: regName.trim(),
        email: regEmail.trim(),
        password: regPassword.trim(),
        role: regRole,
        department: regDept,
      });

      if (res.success && res.role) {
        success('Account Created', `Registered as ${res.role}`);
        setIsRegisterModalOpen(false);
        onLoginSuccess(res.role);
      } else {
        error('Registration Failed', res.message || 'Could not register user');
      }
    } catch (err: any) {
      error('Registration Error', err.message);
    } finally {
      setRegLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-between bg-[#f8fafc] dark:bg-[#040806] text-emerald-950 dark:text-[#f0fdf4] transition-colors duration-200">
      {/* Top Bar with Logo & Theme Toggle */}
      <header className="w-full px-6 py-4 flex items-center justify-between border-b border-emerald-100 dark:border-emerald-950 bg-white/80 dark:bg-[#051009]/80 backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-600 dark:bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-600/20">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-tight text-emerald-950 dark:text-[#f0fdf4]">
                SmartCampus
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                API Hub
              </span>
            </div>
            <p className="text-[10px] text-emerald-700 dark:text-emerald-400 font-mono">
              Institutional Operations Platform
            </p>
          </div>
        </div>

        {/* Clearly Visible Theme Toggle Button */}
        <button
          type="button"
          onClick={toggleTheme}
          id="login-theme-toggle-btn"
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-emerald-300 dark:border-emerald-800/80 bg-emerald-50 dark:bg-[#09150d] text-emerald-900 dark:text-emerald-200 hover:bg-emerald-100 dark:hover:bg-[#0e2215] transition-all font-semibold text-xs shadow-xs"
          aria-label="Toggle Light / Dark Mode"
        >
          {theme === 'light' ? (
            <>
              <Moon className="w-4 h-4 text-emerald-800" />
              <span className="font-bold">Dark Mode</span>
            </>
          ) : (
            <>
              <Sun className="w-4 h-4 text-emerald-400" />
              <span className="font-bold">Light Mode</span>
            </>
          )}
        </button>
      </header>

      {/* Main Login Form Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md bg-white dark:bg-[#08150d] rounded-2xl border border-emerald-200/90 dark:border-emerald-900/70 p-6 sm:p-8 shadow-xl shadow-emerald-950/5 transition-all">
          {/* Logo & Header */}
          <div className="text-center mb-6">
            <div className="inline-flex w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 items-center justify-center mb-3 ring-4 ring-emerald-50 dark:ring-emerald-950/50">
              <Layers className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-emerald-950 dark:text-[#f0fdf4]">
              SmartCampus Login
            </h1>
            <p className="text-xs text-emerald-700 dark:text-emerald-400/90 mt-1">
              Sign in with your institutional credentials
            </p>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="mb-5 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-start gap-2.5 text-xs text-rose-800 dark:text-rose-300 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email ID input */}
            <div>
              <label
                htmlFor="login-email"
                className="block text-xs font-bold text-emerald-900 dark:text-emerald-200 mb-1.5"
              >
                Email ID
              </label>
              <input
                id="login-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="e.g. student@smartcampus.edu"
                className="w-full px-3.5 py-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800/80 bg-emerald-50/40 dark:bg-[#050e08] text-sm text-emerald-950 dark:text-[#f0fdf4] placeholder:text-emerald-700/50 dark:placeholder:text-emerald-600/50 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
              />
            </div>

            {/* Password input with Show/Hide button */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="login-password"
                  className="block text-xs font-bold text-emerald-900 dark:text-emerald-200"
                >
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setIsForgotModalOpen(true)}
                  className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-3.5 py-2.5 pr-11 rounded-xl border border-emerald-200 dark:border-emerald-800/80 bg-emerald-50/40 dark:bg-[#050e08] text-sm text-emerald-950 dark:text-[#f0fdf4] placeholder:text-emerald-700/50 dark:placeholder:text-emerald-600/50 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-emerald-700 dark:text-emerald-400 hover:text-emerald-950 dark:hover:text-emerald-200"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Login Button (Dark green in Light Mode, Green in Dark Mode) */}
            <div className="pt-2">
              <button
                type="submit"
                id="login-submit-btn"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-emerald-800 hover:bg-emerald-900 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-bold text-sm shadow-md transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>Login</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Quick Demo Credentials for Convenience (NO Photos or Avatars) */}
          <div className="mt-6 pt-5 border-t border-emerald-100 dark:border-emerald-950/80">
            <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-800/80 dark:text-emerald-400/80 text-center mb-2.5">
              Institutional Demo Logins (Password: password123)
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  setEmail('student@smartcampus.edu');
                  setPassword('password123');
                }}
                className="p-2 rounded-xl border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/60 dark:bg-[#07130b] hover:border-emerald-400 dark:hover:border-emerald-600 text-center transition-all text-xs font-semibold text-emerald-900 dark:text-emerald-200"
              >
                <div className="font-bold">Student</div>
                <div className="text-[10px] text-emerald-700 dark:text-emerald-400 truncate">STU202401</div>
              </button>
              <button
                type="button"
                onClick={() => {
                  setEmail('faculty@smartcampus.edu');
                  setPassword('password123');
                }}
                className="p-2 rounded-xl border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/60 dark:bg-[#07130b] hover:border-emerald-400 dark:hover:border-emerald-600 text-center transition-all text-xs font-semibold text-emerald-900 dark:text-emerald-200"
              >
                <div className="font-bold">Faculty</div>
                <div className="text-[10px] text-emerald-700 dark:text-emerald-400 truncate">FAC101</div>
              </button>
              <button
                type="button"
                onClick={() => {
                  setEmail('admin@smartcampus.edu');
                  setPassword('password123');
                }}
                className="p-2 rounded-xl border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/60 dark:bg-[#07130b] hover:border-emerald-400 dark:hover:border-emerald-600 text-center transition-all text-xs font-semibold text-emerald-900 dark:text-emerald-200"
              >
                <div className="font-bold">Admin</div>
                <div className="text-[10px] text-emerald-700 dark:text-emerald-400 truncate">Registrar</div>
              </button>
            </div>
          </div>

          {/* Register Link */}
          <div className="mt-5 text-center text-xs text-emerald-800 dark:text-emerald-300">
            <span>Don't have an institutional account? </span>
            <button
              type="button"
              onClick={() => setIsRegisterModalOpen(true)}
              className="font-bold text-emerald-700 dark:text-emerald-400 hover:underline cursor-pointer"
            >
              Register here
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-emerald-700/80 dark:text-emerald-500/80">
        SmartCampus Operations & REST API Hub • Secure Institutional Gateway
      </footer>

      {/* Forgot Password Modal */}
      {isForgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-sm bg-white dark:bg-[#08150d] rounded-2xl border border-emerald-200 dark:border-emerald-900 p-6 shadow-2xl relative">
            <button
              onClick={() => setIsForgotModalOpen(false)}
              className="absolute top-4 right-4 text-emerald-700 dark:text-emerald-400 hover:text-emerald-950 dark:hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
            <h3 className="text-base font-bold text-emerald-950 dark:text-[#f0fdf4] mb-1">
              Reset Password
            </h3>
            <p className="text-xs text-emerald-700 dark:text-emerald-400 mb-4">
              Enter your registered campus email address to receive password reset instructions.
            </p>

            {forgotSent ? (
              <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-center text-xs text-emerald-900 dark:text-emerald-200 font-semibold flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Reset email sent successfully!</span>
              </div>
            ) : (
              <form onSubmit={handleForgotPasswordSubmit} className="space-y-3">
                <input
                  type="email"
                  required
                  value={forgotEmail}
                  onChange={e => setForgotEmail(e.target.value)}
                  placeholder="name@smartcampus.edu"
                  className="w-full px-3.5 py-2 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/40 dark:bg-[#050e08] text-xs text-emerald-950 dark:text-[#f0fdf4] focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <button
                  type="submit"
                  className="w-full py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-bold text-xs shadow-xs"
                >
                  Send Reset Link
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Registration Modal */}
      {isRegisterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-white dark:bg-[#08150d] rounded-2xl border border-emerald-200 dark:border-emerald-900 p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsRegisterModalOpen(false)}
              className="absolute top-4 right-4 text-emerald-700 dark:text-emerald-400 hover:text-emerald-950 dark:hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
            <h3 className="text-base font-bold text-emerald-950 dark:text-[#f0fdf4] mb-1 flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Campus Registration</span>
            </h3>
            <p className="text-xs text-emerald-700 dark:text-emerald-400 mb-4">
              Register a new account via REST API: POST /api/auth/register
            </p>

            <form onSubmit={handleRegisterSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-emerald-900 dark:text-emerald-200 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={regName}
                  onChange={e => setRegName(e.target.value)}
                  placeholder="e.g. Maya Sundaram"
                  className="w-full px-3.5 py-2 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/40 dark:bg-[#050e08] text-xs text-emerald-950 dark:text-[#f0fdf4] focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-emerald-900 dark:text-emerald-200 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={regEmail}
                  onChange={e => setRegEmail(e.target.value)}
                  placeholder="maya@smartcampus.edu"
                  className="w-full px-3.5 py-2 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/40 dark:bg-[#050e08] text-xs text-emerald-950 dark:text-[#f0fdf4] focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-emerald-900 dark:text-emerald-200 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={regPassword}
                  onChange={e => setRegPassword(e.target.value)}
                  placeholder="Create a strong password"
                  className="w-full px-3.5 py-2 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/40 dark:bg-[#050e08] text-xs text-emerald-950 dark:text-[#f0fdf4] focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-emerald-900 dark:text-emerald-200 mb-1">
                    Role
                  </label>
                  <select
                    value={regRole}
                    onChange={e => setRegRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/40 dark:bg-[#050e08] text-xs text-emerald-950 dark:text-[#f0fdf4] focus:outline-none"
                  >
                    <option value="Student">Student</option>
                    <option value="Faculty">Faculty</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-emerald-900 dark:text-emerald-200 mb-1">
                    Department
                  </label>
                  <select
                    value={regDept}
                    onChange={e => setRegDept(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/40 dark:bg-[#050e08] text-xs text-emerald-950 dark:text-[#f0fdf4] focus:outline-none"
                  >
                    <option value="Computer Science & Engineering">CSE</option>
                    <option value="Information Technology">IT</option>
                    <option value="Electronics & Communication Engineering">ECE</option>
                    <option value="Mechanical Engineering">Mechanical</option>
                    <option value="Civil Engineering">Civil</option>
                  </select>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={regLoading}
                  className="w-full py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2"
                >
                  {regLoading ? 'Registering...' : 'Complete Registration'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
