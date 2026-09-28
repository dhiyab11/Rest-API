import React, { useState } from 'react';
import {
  Layers,
  Eye,
  EyeOff,
  LogIn,
  Sun,
  Moon,
  AlertCircle,
  CheckCircle2,
  X,
  UserPlus,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { useTheme } from '../context/ThemeContext.js';
import { useToast } from '../components/Toast.js';
import { UserRole } from '../types/index.js';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess?: (role: UserRole) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const { login, register } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { success, error } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sub-views in modal: login | forgot | register
  const [view, setView] = useState<'login' | 'forgot' | 'register'>('login');
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState<UserRole>('Student');
  const [regDept, setRegDept] = useState('Computer Science & Engineering');
  const [regLoading, setRegLoading] = useState(false);

  if (!isOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
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
        success('Authentication Successful', `Logged in as ${res.role}`);
        onClose();
        if (onLoginSuccess) {
          onLoginSuccess(res.role);
        }
      } else {
        const msg = res.message || 'Invalid Email ID or Password';
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

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) return;
    setForgotSent(true);
    success('Reset Link Sent', `Sent instructions to ${forgotEmail}`);
    setTimeout(() => {
      setForgotSent(false);
      setView('login');
      setForgotEmail('');
    }, 2000);
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim() || !regEmail.trim() || !regPassword.trim()) {
      error('Validation Error', 'All fields required');
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
        success('Registered', `Account created as ${res.role}`);
        onClose();
        if (onLoginSuccess) {
          onLoginSuccess(res.role);
        }
      } else {
        error('Registration Failed', res.message || 'Could not register');
      }
    } catch (err: any) {
      error('Registration Error', err.message);
    } finally {
      setRegLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-md bg-white dark:bg-[#08150d] rounded-2xl border border-emerald-200/90 dark:border-emerald-900/70 p-6 sm:p-7 shadow-2xl transition-all">
        {/* Top Header: Logo, Theme Toggle, Close Button */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-emerald-100 dark:border-emerald-950">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 dark:bg-emerald-500 text-white flex items-center justify-center shadow-xs">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <span className="font-extrabold text-sm tracking-tight text-emerald-950 dark:text-[#f0fdf4]">
                SmartCampus
              </span>
              <span className="ml-1.5 text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                API Hub
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Theme Toggle Button */}
            <button
              type="button"
              onClick={toggleTheme}
              className="p-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-[#0c1a11] text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-[#13271b]"
              title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
              aria-label="Toggle theme"
            >
              {theme === 'light' ? (
                <Moon className="w-4 h-4 text-emerald-800" />
              ) : (
                <Sun className="w-4 h-4 text-emerald-400" />
              )}
            </button>

            {/* Close Modal */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/60"
              aria-label="Close dialog"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* View 1: Standard Login */}
        {view === 'login' && (
          <div>
            <div className="mb-4">
              <h2 className="text-lg font-black text-emerald-950 dark:text-[#f0fdf4]">
                Account Login
              </h2>
              <p className="text-xs text-emerald-700 dark:text-emerald-400">
                Sign in with institutional Email ID and Password
              </p>
            </div>

            {errorMessage && (
              <div className="mb-4 p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-start gap-2 text-xs text-rose-800 dark:text-rose-300">
                <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-3.5">
              {/* Email ID */}
              <div>
                <label className="block text-xs font-bold text-emerald-900 dark:text-emerald-200 mb-1">
                  Email ID
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="e.g. student@smartcampus.edu"
                  className="w-full px-3 py-2 rounded-xl border border-emerald-200 dark:border-emerald-800/80 bg-emerald-50/30 dark:bg-[#050e08] text-xs text-emerald-950 dark:text-[#f0fdf4] focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Password with Show/Hide button */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-emerald-900 dark:text-emerald-200">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setView('forgot')}
                    className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3 py-2 pr-10 rounded-xl border border-emerald-200 dark:border-emerald-800/80 bg-emerald-50/30 dark:bg-[#050e08] text-xs text-emerald-950 dark:text-[#f0fdf4] focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-emerald-700 dark:text-emerald-400 hover:text-emerald-950 dark:hover:text-emerald-200"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Login Button (Dark green in Light Mode, Green in Dark Mode) */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
                >
                  {loading ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Authenticating...</span>
                    </>
                  ) : (
                    <>
                      <LogIn className="w-3.5 h-3.5" />
                      <span>Login</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Quick Demo Credentials Helper */}
            <div className="mt-4 pt-3 border-t border-emerald-100 dark:border-emerald-950/80">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 block mb-1.5 text-center">
                Demo Accounts (Password: password123)
              </span>
              <div className="grid grid-cols-3 gap-1.5 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setEmail('student@smartcampus.edu');
                    setPassword('password123');
                  }}
                  className="p-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/50 dark:bg-[#07130b] text-[11px] font-semibold text-emerald-900 dark:text-emerald-200 hover:border-emerald-400"
                >
                  Student
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEmail('faculty@smartcampus.edu');
                    setPassword('password123');
                  }}
                  className="p-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/50 dark:bg-[#07130b] text-[11px] font-semibold text-emerald-900 dark:text-emerald-200 hover:border-emerald-400"
                >
                  Faculty
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEmail('admin@smartcampus.edu');
                    setPassword('password123');
                  }}
                  className="p-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/50 dark:bg-[#07130b] text-[11px] font-semibold text-emerald-900 dark:text-emerald-200 hover:border-emerald-400"
                >
                  Admin
                </button>
              </div>
            </div>

            {/* Register Link */}
            <div className="mt-3.5 text-center text-xs text-emerald-800 dark:text-emerald-300">
              <span>No account yet? </span>
              <button
                type="button"
                onClick={() => setView('register')}
                className="font-bold text-emerald-700 dark:text-emerald-400 hover:underline"
              >
                Register here
              </button>
            </div>
          </div>
        )}

        {/* View 2: Forgot Password */}
        {view === 'forgot' && (
          <div>
            <h2 className="text-base font-bold text-emerald-950 dark:text-[#f0fdf4] mb-1">
              Reset Password
            </h2>
            <p className="text-xs text-emerald-700 dark:text-emerald-400 mb-4">
              Enter your email address to receive recovery instructions.
            </p>

            {forgotSent ? (
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-center text-xs text-emerald-900 dark:text-emerald-200 font-semibold flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Reset link sent to your email!</span>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} className="space-y-3">
                <input
                  type="email"
                  required
                  value={forgotEmail}
                  onChange={e => setForgotEmail(e.target.value)}
                  placeholder="name@smartcampus.edu"
                  className="w-full px-3 py-2 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/30 dark:bg-[#050e08] text-xs text-emerald-950 dark:text-[#f0fdf4] focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setView('login')}
                    className="flex-1 py-2 rounded-xl border border-emerald-200 dark:border-emerald-800 text-xs font-semibold text-emerald-800 dark:text-emerald-300"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-bold text-xs"
                  >
                    Send Link
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* View 3: Register */}
        {view === 'register' && (
          <div>
            <h2 className="text-base font-bold text-emerald-950 dark:text-[#f0fdf4] mb-1">
              Create Campus Account
            </h2>
            <p className="text-xs text-emerald-700 dark:text-emerald-400 mb-3">
              POST /api/auth/register
            </p>

            <form onSubmit={handleRegisterSubmit} className="space-y-2.5">
              <div>
                <label className="block text-[11px] font-bold text-emerald-900 dark:text-emerald-200 mb-0.5">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={regName}
                  onChange={e => setRegName(e.target.value)}
                  placeholder="Full Name"
                  className="w-full px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/30 dark:bg-[#050e08] text-xs text-emerald-950 dark:text-[#f0fdf4]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-emerald-900 dark:text-emerald-200 mb-0.5">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={regEmail}
                  onChange={e => setRegEmail(e.target.value)}
                  placeholder="name@smartcampus.edu"
                  className="w-full px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/30 dark:bg-[#050e08] text-xs text-emerald-950 dark:text-[#f0fdf4]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-emerald-900 dark:text-emerald-200 mb-0.5">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={regPassword}
                  onChange={e => setRegPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/30 dark:bg-[#050e08] text-xs text-emerald-950 dark:text-[#f0fdf4]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-emerald-900 dark:text-emerald-200 mb-0.5">
                    Role
                  </label>
                  <select
                    value={regRole}
                    onChange={e => setRegRole(e.target.value as UserRole)}
                    className="w-full px-2 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/30 dark:bg-[#050e08] text-xs text-emerald-950 dark:text-[#f0fdf4]"
                  >
                    <option value="Student">Student</option>
                    <option value="Faculty">Faculty</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-emerald-900 dark:text-emerald-200 mb-0.5">
                    Department
                  </label>
                  <select
                    value={regDept}
                    onChange={e => setRegDept(e.target.value)}
                    className="w-full px-2 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/30 dark:bg-[#050e08] text-xs text-emerald-950 dark:text-[#f0fdf4]"
                  >
                    <option value="Computer Science & Engineering">CSE</option>
                    <option value="Information Technology">IT</option>
                    <option value="Electronics & Communication Engineering">ECE</option>
                    <option value="Mechanical Engineering">Mechanical</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setView('login')}
                  className="flex-1 py-2 rounded-xl border border-emerald-200 dark:border-emerald-800 text-xs font-semibold text-emerald-800 dark:text-emerald-300"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={regLoading}
                  className="flex-1 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-bold text-xs"
                >
                  {regLoading ? 'Registering...' : 'Register'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
