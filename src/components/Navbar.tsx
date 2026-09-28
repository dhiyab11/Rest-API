import React, { useState, useEffect } from 'react';
import {
  Sun,
  Moon,
  Zap,
  Activity,
  UserCheck,
  ChevronDown,
  Menu,
  GraduationCap,
  ShieldCheck,
  Briefcase,
  Layers,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext.js';
import { useAuth } from '../context/AuthContext.js';
import { UserRole } from '../types/index.js';
import { onApiResponse } from '../api/client.js';

interface NavbarProps {
  onToggleSidebar: () => void;
  onOpenLoginModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar, onOpenLoginModal }) => {
  const { theme, toggleTheme } = useTheme();
  const { user, role, switchRoleToDemo, logout } = useAuth();
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [lastLatency, setLastLatency] = useState<number>(14.2);
  const [requestCount, setRequestCount] = useState<number>(18);
  const [isPulsing, setIsPulsing] = useState<boolean>(false);

  useEffect(() => {
    const unsub = onApiResponse(info => {
      setLastLatency(info.durationMs);
      setRequestCount(prev => prev + 1);
      setIsPulsing(true);
      const timer = setTimeout(() => setIsPulsing(false), 800);
      return () => clearTimeout(timer);
    });
    return unsub;
  }, []);

  const roleConfig: Record<UserRole, { label: string; icon: React.ReactNode; badgeClass: string }> = {
    Student: {
      label: 'Student',
      icon: <GraduationCap className="w-3.5 h-3.5" />,
      badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-800',
    },
    Faculty: {
      label: 'Faculty',
      icon: <Briefcase className="w-3.5 h-3.5" />,
      badgeClass: 'bg-teal-100 text-teal-800 border-teal-300 dark:bg-teal-950/80 dark:text-teal-300 dark:border-teal-800',
    },
    Admin: {
      label: 'Administrator',
      icon: <ShieldCheck className="w-3.5 h-3.5" />,
      badgeClass: 'bg-green-100 text-green-800 border-green-300 dark:bg-green-950/80 dark:text-green-300 dark:border-green-800',
    },
  };

  return (
    <header className="sticky top-0 z-30 h-16 border-b bg-white/95 dark:bg-[#051009]/95 backdrop-blur-md border-emerald-200 dark:border-emerald-950 transition-colors">
      <div className="flex items-center justify-between h-full px-4 sm:px-6">
        {/* Left Side: Mobile toggle & Brand */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="p-2 -ml-2 rounded-xl text-emerald-800 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 md:hidden"
            aria-label="Toggle Navigation Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 dark:bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight text-emerald-950 dark:text-[#f0fdf4]">
                  SmartCampus
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/80">
                  API Hub
                </span>
              </div>
              <p className="text-[10px] text-emerald-600/80 dark:text-emerald-400/80 font-mono hidden sm:block">
                REST Architecture First
              </p>
            </div>
          </div>
        </div>

        {/* Right Side: Live API telemetry, Role Switcher, Theme Toggle, User */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Live REST API Telemetry Indicator */}
          <div
            className={`hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-mono transition-all ${
              isPulsing
                ? 'bg-emerald-100/90 border-emerald-400 text-emerald-900 scale-102 dark:bg-emerald-950 dark:border-emerald-500 dark:text-emerald-200'
                : 'bg-emerald-50/60 dark:bg-[#0c1611] border-emerald-200/70 dark:border-emerald-900/60 text-emerald-800 dark:text-emerald-300'
            }`}
            title="Real-time REST API round-trip execution latency"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-semibold text-[11px]">API Latency:</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">{lastLatency}ms</span>
            <span className="opacity-40">|</span>
            <span className="opacity-80 text-[10px]">{requestCount} reqs</span>
          </div>

          {/* Quick Role Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setRoleMenuOpen(!roleMenuOpen)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all shadow-2xs ${roleConfig[role].badgeClass}`}
            >
              {roleConfig[role].icon}
              <span className="font-semibold">{roleConfig[role].label}</span>
              <ChevronDown className="w-3.5 h-3.5 opacity-70" />
            </button>

            {roleMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setRoleMenuOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-[#0e1813] border border-emerald-100 dark:border-emerald-900 shadow-xl z-50 py-1.5 overflow-hidden animate-in fade-in zoom-in-95">
                  <div className="px-3 py-2 border-b border-emerald-50 dark:border-emerald-950/60">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                      Switch Role (Demo mode)
                    </p>
                    <p className="text-[10px] text-emerald-800/60 dark:text-slate-400">
                      Instantly toggle dashboard permissions
                    </p>
                  </div>
                  {(['Student', 'Faculty', 'Admin'] as UserRole[]).map(r => (
                    <button
                      key={r}
                      onClick={() => {
                        switchRoleToDemo(r);
                        setRoleMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 text-xs transition-colors text-left ${
                        role === r
                          ? 'bg-emerald-50 text-emerald-900 font-bold dark:bg-emerald-950/80 dark:text-emerald-300'
                          : 'text-emerald-900/80 hover:bg-emerald-50/70 dark:text-slate-300 dark:hover:bg-[#13241c]'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {roleConfig[r].icon}
                        <span>{r} View</span>
                      </div>
                      {role === r && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-emerald-200 text-emerald-900 dark:bg-emerald-900 dark:text-emerald-200">
                          Active
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Clearly Visible Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            id="navbar-theme-toggle"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-[#0b1c12] text-emerald-900 dark:text-emerald-200 hover:bg-emerald-100 dark:hover:bg-[#102719] font-bold text-xs shadow-2xs transition-all cursor-pointer"
            title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            aria-label="Toggle light/dark theme"
          >
            {theme === 'light' ? (
              <>
                <Moon className="w-3.5 h-3.5 text-emerald-800" />
                <span className="hidden sm:inline">Dark Mode</span>
              </>
            ) : (
              <>
                <Sun className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">Light Mode</span>
              </>
            )}
          </button>

          {/* User Profile Info & Menu */}
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2 p-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800/80 bg-white/70 dark:bg-[#0a160f] hover:bg-emerald-50 dark:hover:bg-[#0f2318] transition-colors"
            >
              <div className="text-right hidden sm:block">
                <div className="text-xs font-bold text-emerald-950 dark:text-[#f0fdf4] truncate max-w-[120px]">
                  {user?.name || 'Smart Student'}
                </div>
                <div className="text-[10px] text-emerald-700 dark:text-emerald-400 font-mono">
                  {user?.referenceId || user?.email?.split('@')[0]}
                </div>
              </div>
              <div className="w-8 h-8 rounded-lg bg-emerald-800 dark:bg-emerald-600 text-white font-bold text-xs flex items-center justify-center ring-2 ring-emerald-500/20">
                {(user?.name || 'User')
                  .split(' ')
                  .map(n => n[0])
                  .slice(0, 2)
                  .join('')
                  .toUpperCase()}
              </div>
            </button>

            {userMenuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-[#0e1813] border border-emerald-100 dark:border-emerald-900 shadow-xl z-50 py-2 overflow-hidden animate-in fade-in zoom-in-95">
                  <div className="px-4 py-2 border-b border-emerald-50 dark:border-emerald-950/60">
                    <p className="text-xs font-bold text-emerald-950 dark:text-[#ecfdf5]">{user?.name}</p>
                    <p className="text-[11px] text-emerald-600 dark:text-emerald-400 truncate">{user?.email}</p>
                    <span className="inline-block mt-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                      {user?.role} • {user?.department || 'Engineering'}
                    </span>
                  </div>
                  <div className="p-1">
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        if (typeof window !== 'undefined') {
                          window.history.pushState({}, '', '/login');
                          window.dispatchEvent(new PopStateEvent('popstate'));
                        } else {
                          onOpenLoginModal();
                        }
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-emerald-950 dark:text-[#f0fdf4] hover:bg-emerald-50 dark:hover:bg-[#13241c] rounded-lg transition-colors text-left font-medium"
                    >
                      <UserCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span>Account Credentials & Login</span>
                    </button>
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        logout();
                        if (typeof window !== 'undefined') {
                          window.history.pushState({}, '', '/login');
                          window.dispatchEvent(new PopStateEvent('popstate'));
                        }
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors text-left font-medium"
                    >
                      <Zap className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
