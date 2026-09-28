import React from 'react';
import {
  LayoutDashboard,
  Users,
  CalendarCheck2,
  AlertTriangle,
  Calendar,
  Bus,
  DoorOpen,
  Bell,
  Search,
  Code2,
  FileText,
  ShieldAlert,
  GraduationCap,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';

export type ActiveTab =
  | 'dashboard'
  | 'students'
  | 'attendance'
  | 'complaints'
  | 'events'
  | 'bus'
  | 'classrooms'
  | 'notifications'
  | 'lostfound'
  | 'apiexplorer'
  | 'apidocs';

interface SidebarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  isOpen,
  onClose,
}) => {
  const { role } = useAuth();

  const navItems: {
    id: ActiveTab;
    label: string;
    icon: React.ReactNode;
    badge?: string;
    section: 'core' | 'campus' | 'developer';
  }[] = [
    {
      id: 'dashboard',
      label: `${role} Dashboard`,
      icon: <LayoutDashboard className="w-4 h-4" />,
      section: 'core',
    },
    {
      id: 'students',
      label: 'Students Directory',
      icon: <Users className="w-4 h-4" />,
      badge: 'REST',
      section: 'core',
    },
    {
      id: 'attendance',
      label: 'Attendance Tracking',
      icon: <CalendarCheck2 className="w-4 h-4" />,
      section: 'core',
    },
    {
      id: 'complaints',
      label: 'Grievance / Complaints',
      icon: <AlertTriangle className="w-4 h-4" />,
      badge: '4 Active',
      section: 'campus',
    },
    {
      id: 'events',
      label: 'Campus Events',
      icon: <Calendar className="w-4 h-4" />,
      section: 'campus',
    },
    {
      id: 'bus',
      label: 'Campus Transit Bus',
      icon: <Bus className="w-4 h-4" />,
      badge: 'Live GPS',
      section: 'campus',
    },
    {
      id: 'classrooms',
      label: 'Classrooms & Labs',
      icon: <DoorOpen className="w-4 h-4" />,
      section: 'campus',
    },
    {
      id: 'notifications',
      label: 'Broadcast Notices',
      icon: <Bell className="w-4 h-4" />,
      badge: 'New',
      section: 'campus',
    },
    {
      id: 'lostfound',
      label: 'Lost & Found Hub',
      icon: <Search className="w-4 h-4" />,
      section: 'campus',
    },
    {
      id: 'apiexplorer',
      label: 'REST API Explorer',
      icon: <Code2 className="w-4 h-4" />,
      badge: 'Interactive',
      section: 'developer',
    },
    {
      id: 'apidocs',
      label: 'Swagger / OpenAPI Docs',
      icon: <FileText className="w-4 h-4" />,
      badge: 'v1.0',
      section: 'developer',
    },
  ];

  const handleSelect = (tab: ActiveTab) => {
    onSelectTab(tab);
    onClose();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed md:sticky top-0 md:top-16 z-40 md:z-20 h-screen md:h-[calc(100vh-4rem)] w-64 shrink-0 bg-[#f6fcf8] dark:bg-[#051009] border-r border-emerald-200 dark:border-emerald-950 transition-transform duration-200 ease-in-out flex flex-col ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {/* Core Operations Section */}
          <div>
            <div className="px-3 mb-2 text-[11px] font-bold tracking-wider uppercase text-emerald-900 dark:text-emerald-400">
              Campus Operations
            </div>
            <div className="space-y-1">
              {navItems
                .filter(i => i.section === 'core')
                .map(item => {
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelect(item.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                        isActive
                          ? 'bg-emerald-800 text-white shadow-xs dark:bg-emerald-700 dark:text-white font-bold'
                          : 'text-emerald-950 dark:text-[#d1fae5]/85 hover:bg-emerald-100/70 dark:hover:bg-[#0d1e14] hover:text-emerald-950 dark:hover:text-[#ecfdf5]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className={isActive ? 'text-white' : 'text-emerald-700 dark:text-emerald-400'}>
                          {item.icon}
                        </span>
                        <span className="truncate">{item.label}</span>
                      </div>
                      {item.badge && (
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono ${
                            isActive
                              ? 'bg-white/20 text-white dark:bg-emerald-900/50 dark:text-emerald-100'
                              : 'bg-emerald-200/60 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
            </div>
          </div>

          {/* Campus Services Section */}
          <div>
            <div className="px-3 mb-2 text-[11px] font-bold tracking-wider uppercase text-emerald-800/70 dark:text-emerald-400/70">
              Campus Services
            </div>
            <div className="space-y-1">
              {navItems
                .filter(i => i.section === 'campus')
                .map(item => {
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelect(item.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                        isActive
                          ? 'bg-emerald-800 text-white shadow-xs dark:bg-emerald-700 dark:text-white font-bold'
                          : 'text-emerald-950 dark:text-[#d1fae5]/85 hover:bg-emerald-100/70 dark:hover:bg-[#0d1e14] hover:text-emerald-950 dark:hover:text-[#ecfdf5]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className={isActive ? 'text-white' : 'text-emerald-700 dark:text-emerald-400'}>
                          {item.icon}
                        </span>
                        <span className="truncate">{item.label}</span>
                      </div>
                      {item.badge && (
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono ${
                            isActive
                              ? 'bg-white/20 text-white'
                              : 'bg-emerald-200/70 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-300'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
            </div>
          </div>

          {/* REST API & Developer Section */}
          <div>
            <div className="px-3 mb-2 text-[11px] font-bold tracking-wider uppercase text-emerald-900 dark:text-emerald-400 flex items-center justify-between">
              <span>Developer Suite</span>
              <Sparkles className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="space-y-1">
              {navItems
                .filter(i => i.section === 'developer')
                .map(item => {
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelect(item.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                        isActive
                          ? 'bg-emerald-800 text-white shadow-xs dark:bg-emerald-700 dark:text-white font-bold'
                          : 'text-emerald-950 dark:text-[#d1fae5]/85 hover:bg-emerald-100/70 dark:hover:bg-[#0d1e14] hover:text-emerald-950 dark:hover:text-[#ecfdf5]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className={isActive ? 'text-white' : 'text-emerald-700 dark:text-emerald-400'}>
                          {item.icon}
                        </span>
                        <span className="truncate">{item.label}</span>
                      </div>
                      {item.badge && (
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono ${
                            isActive
                              ? 'bg-white/20 text-white'
                              : 'bg-emerald-200/70 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-300'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
            </div>
          </div>
        </div>

        {/* Bottom REST System Architecture Status Card */}
        <div className="p-3 border-t border-emerald-100 dark:border-emerald-950/80">
          <div className="p-3 rounded-xl bg-white dark:bg-[#0e1913] border border-emerald-200/60 dark:border-emerald-900/40">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold text-emerald-950 dark:text-[#ecfdf5]">REST Architecture</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold">
                10/10 Live
              </span>
            </div>
            <p className="text-[10px] text-emerald-700/80 dark:text-emerald-400/80 leading-snug">
              JSON REST APIs handling all student, faculty, and administrative campus pipelines.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};
