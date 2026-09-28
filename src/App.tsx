import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext.js';
import { AuthProvider, useAuth } from './context/AuthContext.js';
import { ToastProvider } from './components/Toast.js';
import { Navbar } from './components/Navbar.js';
import { Sidebar, ActiveTab } from './components/Sidebar.js';

// Views
import { DashboardView } from './views/DashboardView.js';
import { StudentsView } from './views/StudentsView.js';
import { AttendanceView } from './views/AttendanceView.js';
import { ComplaintsView } from './views/ComplaintsView.js';
import { EventsView } from './views/EventsView.js';
import { BusView } from './views/BusView.js';
import { ClassroomsView } from './views/ClassroomsView.js';
import { NotificationsView } from './views/NotificationsView.js';
import { LostFoundView } from './views/LostFoundView.js';
import { ApiExplorerView } from './views/ApiExplorerView.js';
import { ApiDocsView } from './views/ApiDocsView.js';
import { LoginModal } from './views/LoginModal.js';
import { LoginPage } from './views/LoginPage.js';
import { UserRole } from './types/index.js';

const MainAppContent: React.FC = () => {
  const { user, role, switchRoleToDemo, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [currentPath, setCurrentPath] = useState<string>(() => {
    return typeof window !== 'undefined' ? window.location.pathname : '/';
  });

  const navigateTo = (path: string) => {
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', path);
      setCurrentPath(path);
    }
  };

  useEffect(() => {
    const handleLocationChange = () => {
      const path = window.location.pathname;
      setCurrentPath(path);
      if (path.includes('/student')) {
        if (role !== 'Student') switchRoleToDemo('Student');
        setActiveTab('dashboard');
      } else if (path.includes('/faculty')) {
        if (role !== 'Faculty') switchRoleToDemo('Faculty');
        setActiveTab('dashboard');
      } else if (path.includes('/admin')) {
        if (role !== 'Admin') switchRoleToDemo('Admin');
        setActiveTab('dashboard');
      }
    };

    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, [role, switchRoleToDemo]);

  const handleLoginSuccess = (userRole: UserRole) => {
    const targetPath = `/${userRole.toLowerCase()}/dashboard`;
    navigateTo(targetPath);
    setActiveTab('dashboard');
  };

  // If on /login or /register and not authenticating, render dedicated LoginPage
  if (currentPath === '/login' || currentPath === '/register') {
    return (
      <LoginPage
        onLoginSuccess={handleLoginSuccess}
        onNavigateToRegister={() => navigateTo('/register')}
      />
    );
  }

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView onNavigate={(tab: ActiveTab) => setActiveTab(tab)} />;
      case 'students':
        return <StudentsView />;
      case 'attendance':
        return <AttendanceView />;
      case 'complaints':
        return <ComplaintsView />;
      case 'events':
        return <EventsView />;
      case 'bus':
        return <BusView />;
      case 'classrooms':
        return <ClassroomsView />;
      case 'notifications':
        return <NotificationsView />;
      case 'lostfound':
        return <LostFoundView />;
      case 'apiexplorer':
        return <ApiExplorerView />;
      case 'apidocs':
        return <ApiDocsView />;
      default:
        return <DashboardView onNavigate={(tab: ActiveTab) => setActiveTab(tab)} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] dark:bg-[#040806] text-emerald-950 dark:text-[#f0fdf4] transition-colors duration-200">
      {/* Top Navigation */}
      <Navbar
        onToggleSidebar={() => setSidebarOpen(prev => !prev)}
        onOpenLoginModal={() => setIsLoginModalOpen(true)}
      />

      {/* Main Body */}
      <div className="flex-1 flex max-w-[1600px] w-full mx-auto">
        {/* Sidebar Navigation */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={(tab: ActiveTab) => {
            setActiveTab(tab);
            setSidebarOpen(false);
            if (tab === 'dashboard') {
              navigateTo(`/${role.toLowerCase()}/dashboard`);
            }
          }}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Dynamic View Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-full">
          {renderActiveView()}
        </main>
      </div>

      {/* Login Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <MainAppContent />
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
