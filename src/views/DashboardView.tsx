import React, { useEffect, useState } from 'react';
import {
  CalendarCheck2,
  AlertTriangle,
  Calendar,
  Bus,
  DoorOpen,
  Bell,
  Users,
  Briefcase,
  Zap,
  Clock,
  MapPin,
  TrendingUp,
  CheckCircle2,
  ArrowUpRight,
  RefreshCw,
  Search,
  Code2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { api } from '../api/client.js';
import { StatCard } from '../components/StatCard.js';
import { useToast } from '../components/Toast.js';
import { ActiveTab } from '../components/Sidebar.js';

interface DashboardViewProps {
  onNavigate: (tab: ActiveTab) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate }) => {
  const { role, user } = useAuth();
  const { success, error } = useToast();
  const [loading, setLoading] = useState<boolean>(true);
  const [studentData, setStudentData] = useState<any>(null);
  const [facultyData, setFacultyData] = useState<any>(null);
  const [adminData, setAdminData] = useState<any>(null);
  const [statsData, setStatsData] = useState<any>(null);
  const [quickActionLoading, setQuickActionLoading] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      if (role === 'Student') {
        const { response } = await api.get('/dashboard/student');
        if (response.success) setStudentData(response.data);
      } else if (role === 'Faculty') {
        const { response } = await api.get('/dashboard/faculty');
        if (response.success) setFacultyData(response.data);
      } else if (role === 'Admin') {
        const [adminRes, statsRes] = await Promise.all([
          api.get('/dashboard/admin'),
          api.get('/dashboard/statistics'),
        ]);
        if (adminRes.response.success) setAdminData(adminRes.response.data);
        if (statsRes.response.success) setStatsData(statsRes.response.data);
      }
    } catch (err: any) {
      error('Failed to load dashboard', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [role]);

  // Quick API-powered action: 1-click register for upcoming event
  const handleQuickRegisterEvent = async (eventId: string, title: string) => {
    setQuickActionLoading(`event-${eventId}`);
    const { response, durationMs } = await api.post(`/events/${eventId}/register`);
    setQuickActionLoading(null);
    if (response.success) {
      success('Event Registration Confirmed', `${title} (${durationMs}ms)`);
      fetchDashboardData();
    } else {
      error('Registration Failed', response.message);
    }
  };

  // Quick API-powered action: 1-click mark notification read
  const handleMarkNoticeRead = async (noticeId: string) => {
    setQuickActionLoading(`notice-${noticeId}`);
    const { response } = await api.put(`/notifications/${noticeId}/read`);
    setQuickActionLoading(null);
    if (response.success) {
      success('Notification Updated', 'Marked as read via REST API');
      fetchDashboardData();
    }
  };

  // Quick API-powered action: quick ping bus location
  const handlePingBus = async (busId: string) => {
    setQuickActionLoading(`bus-${busId}`);
    const { response, durationMs } = await api.get(`/buses/${busId}/location`);
    setQuickActionLoading(null);
    if (response.success) {
      success('Live GPS Received', `${response.data.location?.landmark || 'In transit'} (${durationMs}ms)`);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <div className="w-10 h-10 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin dark:border-emerald-950 dark:border-t-emerald-400" />
        <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">
          Querying REST APIs for {role} Dashboard...
        </p>
      </div>
    );
  }

  // -------------------------------------------------------------
  // 1. STUDENT DASHBOARD
  // -------------------------------------------------------------
  if (role === 'Student') {
    const student = studentData?.student;
    const metrics = studentData?.metrics;
    const bus = studentData?.assignedBus;
    const upcomingEvents = studentData?.upcomingEvents || [];
    const notifications = studentData?.notifications || [];
    const complaints = studentData?.complaints || [];
    const subjectStats = studentData?.subjectStats || [];
    const lostFound = studentData?.lostFound || [];

    return (
      <div className="space-y-6">
        {/* Header greeting */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-800 text-white shadow-lg shadow-emerald-900/10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-white/20 text-emerald-100">
                STUDENT PROFILE
              </span>
              <span className="text-xs text-emerald-200">ID: {student?.studentId || 'STU202401'}</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight">
              Welcome back, {student?.name || user?.name}!
            </h1>
            <p className="text-sm text-emerald-100/90 mt-1 max-w-xl">
              {student?.department} • Year {student?.year} (Semester {student?.semester}) • CGPA {student?.cgpa}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchDashboardData}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-xs font-semibold backdrop-blur-xs transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh API</span>
            </button>
            <button
              onClick={() => onNavigate('apiexplorer')}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white text-emerald-900 hover:bg-emerald-50 text-xs font-bold shadow-md transition-colors"
            >
              <Code2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Test APIs</span>
            </button>
          </div>
        </div>

        {/* Top 4 Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="ATTENDANCE PERCENTAGE"
            value={`${metrics?.attendancePercentage || 88.5}%`}
            subtitle={`${metrics?.totalClassesAttended || 5} of ${metrics?.totalClassesScheduled || 6} Sessions`}
            icon={<CalendarCheck2 className="w-5 h-5" />}
            trend={{
              value: (metrics?.attendancePercentage || 88.5) >= 75 ? 'Above 75% Safe' : 'Warning Alert',
              positive: (metrics?.attendancePercentage || 88.5) >= 75,
            }}
            highlight={(metrics?.attendancePercentage || 88.5) >= 85}
          />

          <StatCard
            title="UPCOMING EVENTS"
            value={metrics?.registeredEventsCount || 2}
            subtitle="Registered Hackathons & Fests"
            icon={<Calendar className="w-5 h-5" />}
          />

          <StatCard
            title="ACTIVE COMPLAINTS"
            value={metrics?.activeComplaintsCount || 1}
            subtitle="Under Resolution Investigation"
            icon={<AlertTriangle className="w-5 h-5" />}
            trend={{
              value: metrics?.activeComplaintsCount > 0 ? 'In Review' : 'All Clear',
              positive: metrics?.activeComplaintsCount === 0,
            }}
          />

          <StatCard
            title="NEW NOTICES"
            value={metrics?.unreadNotificationsCount || 1}
            subtitle="Official Campus Bulletins"
            icon={<Bell className="w-5 h-5" />}
          />
        </div>

        {/* 2-Column Section: Attendance Breakdown & Bus Live Status */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Subject Attendance Breakdown */}
          <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-[#0e1913] border border-emerald-100/80 dark:border-emerald-900/50 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-emerald-950 dark:text-[#ecfdf5]">
                  Subject-Wise Attendance
                </h2>
                <p className="text-xs text-emerald-700/80 dark:text-emerald-400/80">
                  Calculated from <code className="font-mono text-emerald-600 dark:text-emerald-300">GET /api/attendance/student/{student?.studentId}</code>
                </p>
              </div>
              <button
                onClick={() => onNavigate('attendance')}
                className="text-xs font-semibold text-emerald-600 hover:text-emerald-800 dark:text-emerald-400 flex items-center gap-1"
              >
                <span>View Full Log</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3.5">
              {subjectStats.map((sub: any) => (
                <div key={sub.subjectCode} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-emerald-950 dark:text-slate-200">
                      {sub.subjectCode}: {sub.subjectName}
                    </span>
                    <span className="font-mono font-semibold text-emerald-700 dark:text-emerald-300">
                      {sub.present}/{sub.total} ({sub.percentage}%)
                    </span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-emerald-100/60 dark:bg-emerald-950/80 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        sub.percentage >= 85
                          ? 'bg-emerald-600 dark:bg-emerald-500'
                          : sub.percentage >= 75
                          ? 'bg-teal-500 dark:bg-teal-400'
                          : 'bg-rose-500'
                      }`}
                      style={{ width: `${Math.min(sub.percentage, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Assigned Bus Status & Live GPS */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#0e1913] border border-emerald-100/80 dark:border-emerald-900/50 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                  <Bus className="w-4 h-4" />
                  <span>Transit Bus Tracking</span>
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  {bus?.status || 'On Route'}
                </span>
              </div>

              <h3 className="text-base font-bold text-emerald-950 dark:text-[#ecfdf5]">
                {bus?.busNumber || 'BUS-01 (Greenline Express)'}
              </h3>
              <p className="text-xs text-emerald-700/80 dark:text-emerald-400/80 mt-1 line-clamp-2">
                {bus?.route}
              </p>

              {/* Live Location telemetry pill */}
              <div className="mt-4 p-3.5 rounded-xl bg-emerald-50/70 dark:bg-[#132219] border border-emerald-200/50 dark:border-emerald-900/40 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-emerald-700 dark:text-emerald-400 font-medium">Landmark:</span>
                  <span className="font-bold text-emerald-950 dark:text-emerald-100 text-right truncate max-w-[170px]">
                    {bus?.currentLocation?.landmark}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-emerald-700 dark:text-emerald-400 font-medium">Speed / Occupancy:</span>
                  <span className="font-mono text-emerald-900 dark:text-emerald-200 font-semibold">
                    {bus?.currentLocation?.speedKmH || 38} km/h • {bus?.currentOccupancy}/{bus?.capacity} seats
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-emerald-100/60 dark:border-emerald-950/60 flex items-center justify-between">
              <button
                onClick={() => handlePingBus(bus?._id || '65f1a2b3c4d5e6f7a8b9c401')}
                disabled={quickActionLoading === `bus-${bus?._id}`}
                className="px-3 py-1.5 rounded-xl border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 text-xs font-semibold transition-colors"
              >
                {quickActionLoading === `bus-${bus?._id}` ? 'Pinging...' : 'Ping GPS Telemetry'}
              </button>
              <button
                onClick={() => onNavigate('bus')}
                className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 flex items-center gap-1"
              >
                <span>Live Map</span>
                <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        {/* 3-Column Section: Upcoming Events, Grievance Status, Notices */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Upcoming Events */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#0e1913] border border-emerald-100/80 dark:border-emerald-900/50 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-emerald-950 dark:text-[#ecfdf5] flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-600" />
                <span>Upcoming Events</span>
              </h3>
              <button
                onClick={() => onNavigate('events')}
                className="text-xs text-emerald-600 hover:text-emerald-800 dark:text-emerald-400 font-semibold"
              >
                View All
              </button>
            </div>

            <div className="space-y-3">
              {upcomingEvents.map((evt: any) => (
                <div
                  key={evt._id}
                  className="p-3.5 rounded-xl bg-emerald-50/40 dark:bg-[#132219] border border-emerald-100/60 dark:border-emerald-900/40 hover:border-emerald-300 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold">
                      {evt.category}
                    </span>
                    <span className="text-[11px] text-emerald-700/80 dark:text-emerald-400/80 font-mono">
                      {evt.date}
                    </span>
                  </div>
                  <h4 className="font-bold text-xs text-emerald-950 dark:text-slate-100 mt-1.5 leading-snug line-clamp-1">
                    {evt.title}
                  </h4>
                  <p className="text-[11px] text-emerald-700/70 dark:text-emerald-400/70 mt-0.5 line-clamp-1">
                    📍 {evt.venue}
                  </p>

                  <div className="mt-2.5 pt-2 border-t border-emerald-100/60 dark:border-emerald-950 flex items-center justify-between">
                    <span className="text-[10px] text-emerald-700/80 dark:text-emerald-400">
                      {evt.registeredStudents?.length || 0}/{evt.capacity} registered
                    </span>
                    {evt.isRegistered ? (
                      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Registered</span>
                      </span>
                    ) : (
                      <button
                        onClick={() => handleQuickRegisterEvent(evt._id, evt.title)}
                        disabled={quickActionLoading === `event-${evt._id}`}
                        className="text-[11px] font-bold text-emerald-700 hover:text-emerald-950 dark:text-emerald-300 underline"
                      >
                        {quickActionLoading === `event-${evt._id}` ? 'Registering...' : '1-Click Register'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Personal Complaints Tracking */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#0e1913] border border-emerald-100/80 dark:border-emerald-900/50 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-emerald-950 dark:text-[#ecfdf5] flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-emerald-600" />
                <span>My Complaints Status</span>
              </h3>
              <button
                onClick={() => onNavigate('complaints')}
                className="text-xs text-emerald-600 hover:text-emerald-800 dark:text-emerald-400 font-semibold"
              >
                File New
              </button>
            </div>

            <div className="space-y-3">
              {complaints.length === 0 ? (
                <div className="text-center py-8 text-xs text-emerald-700/70 dark:text-emerald-400">
                  No active grievances filed.
                </div>
              ) : (
                complaints.map((c: any) => (
                  <div
                    key={c._id}
                    className="p-3.5 rounded-xl bg-emerald-50/40 dark:bg-[#132219] border border-emerald-100/60 dark:border-emerald-900/40"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        {c.category}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          c.status === 'Resolved'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : c.status === 'In Progress'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                        }`}
                      >
                        {c.status}
                      </span>
                    </div>
                    <h4 className="font-semibold text-xs text-emerald-950 dark:text-slate-100 line-clamp-1">
                      {c.title}
                    </h4>
                    {c.resolutionNotes && (
                      <p className="text-[11px] text-emerald-800/80 dark:text-emerald-400/90 mt-1 bg-white/60 dark:bg-[#0c1611] p-2 rounded-lg border border-emerald-200/40 dark:border-emerald-900/40">
                        💬 {c.resolutionNotes}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Broadcast Notices */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#0e1913] border border-emerald-100/80 dark:border-emerald-900/50 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-emerald-950 dark:text-[#ecfdf5] flex items-center gap-2">
                <Bell className="w-4 h-4 text-emerald-600" />
                <span>Broadcast Notices</span>
              </h3>
              <button
                onClick={() => onNavigate('notifications')}
                className="text-xs text-emerald-600 hover:text-emerald-800 dark:text-emerald-400 font-semibold"
              >
                All Notices
              </button>
            </div>

            <div className="space-y-3">
              {notifications.map((n: any) => {
                const isRead = n.readBy?.includes(user?.email || 'student@smartcampus.edu');
                return (
                  <div
                    key={n._id}
                    className={`p-3.5 rounded-xl border transition-colors ${
                      isRead
                        ? 'bg-white dark:bg-[#0e1913] border-emerald-100/60 dark:border-emerald-900/30 opacity-75'
                        : 'bg-emerald-50/70 dark:bg-[#132219] border-emerald-200/70 dark:border-emerald-800/60'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                        {n.type}
                      </span>
                      {!isRead && (
                        <button
                          onClick={() => handleMarkNoticeRead(n._id)}
                          className="text-[10px] text-emerald-600 hover:text-emerald-900 dark:text-emerald-400 underline font-semibold"
                        >
                          Mark Read
                        </button>
                      )}
                    </div>
                    <h4 className="font-bold text-xs text-emerald-950 dark:text-slate-100 mt-1">
                      {n.title}
                    </h4>
                    <p className="text-[11px] text-emerald-800/80 dark:text-emerald-300/80 mt-1 line-clamp-2">
                      {n.message}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // 2. FACULTY DASHBOARD
  // -------------------------------------------------------------
  if (role === 'Faculty') {
    const faculty = facultyData?.faculty;
    const metrics = facultyData?.metrics;
    const recentAttendance = facultyData?.recentAttendance || [];
    const complaints = facultyData?.complaints || [];
    const availableRooms = facultyData?.availableClassrooms || [];
    const departmentStudents = facultyData?.departmentStudents || [];

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-teal-700 via-emerald-700 to-green-800 text-white shadow-lg shadow-teal-900/10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-white/20 text-emerald-100">
                FACULTY PORTAL
              </span>
              <span className="text-xs text-emerald-200">ID: {faculty?.facultyId || 'FAC101'}</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight">
              Welcome, {faculty?.name || user?.name}!
            </h1>
            <p className="text-sm text-emerald-100/90 mt-1">
              {faculty?.designation} • {faculty?.department} • Cabin: {faculty?.cabinNumber}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate('attendance')}
              className="px-3.5 py-2 rounded-xl bg-white text-teal-900 hover:bg-emerald-50 text-xs font-bold shadow-md transition-colors"
            >
              + Mark Attendance
            </button>
            <button
              onClick={() => onNavigate('classrooms')}
              className="px-3.5 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-bold backdrop-blur-xs transition-colors"
            >
              Book Classroom
            </button>
          </div>
        </div>

        {/* Top 4 Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="DEPARTMENT STUDENTS"
            value={metrics?.departmentStudentsCount || 4}
            subtitle="Computer Science & Engineering"
            icon={<Users className="w-5 h-5" />}
          />

          <StatCard
            title="AVG ATTENDANCE RATE"
            value={`${metrics?.averageDepartmentAttendance || 87.8}%`}
            subtitle="Across 4 Active Course Modules"
            icon={<CalendarCheck2 className="w-5 h-5" />}
            trend={{ value: '+2.4% vs last week', positive: true }}
            highlight
          />

          <StatCard
            title="PENDING COMPLAINTS"
            value={metrics?.pendingComplaintsCount || 2}
            subtitle="Awaiting Faculty Investigation"
            icon={<AlertTriangle className="w-5 h-5" />}
          />

          <StatCard
            title="AVAILABLE CLASSROOMS"
            value={metrics?.availableClassroomsCount || 3}
            subtitle="Ready for Instant Allocation"
            icon={<DoorOpen className="w-5 h-5" />}
          />
        </div>

        {/* 2-Column Section: Attendance Management Table & Quick Classroom Allocations */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Attendance Management Logs */}
          <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-[#0e1913] border border-emerald-100/80 dark:border-emerald-900/50 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-emerald-950 dark:text-[#ecfdf5]">
                  Student Attendance Registry
                </h3>
                <p className="text-xs text-emerald-700/80 dark:text-emerald-400/80">
                  Recent entries recorded via REST API <code className="font-mono text-emerald-600 dark:text-emerald-400">POST /api/attendance</code>
                </p>
              </div>
              <button
                onClick={() => onNavigate('attendance')}
                className="text-xs font-semibold text-emerald-600 hover:text-emerald-800 dark:text-emerald-400 flex items-center gap-1"
              >
                <span>Full Manager</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-emerald-100 dark:border-emerald-900 text-emerald-700 dark:text-emerald-400 font-bold">
                    <th className="py-2.5 px-3">Student</th>
                    <th className="py-2.5 px-3">Subject</th>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-emerald-50 dark:divide-emerald-950">
                  {recentAttendance.map((rec: any) => (
                    <tr key={rec._id} className="hover:bg-emerald-50/50 dark:hover:bg-[#13241c] transition-colors">
                      <td className="py-2.5 px-3 font-semibold text-emerald-950 dark:text-slate-200">
                        {rec.studentName} ({rec.studentId})
                      </td>
                      <td className="py-2.5 px-3 text-emerald-800 dark:text-emerald-300">
                        {rec.subjectCode} - {rec.subjectName}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-emerald-700 dark:text-emerald-400">
                        {rec.date}
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            rec.status === 'Present'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : rec.status === 'Late'
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                              : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                          }`}
                        >
                          {rec.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick Classroom Availability */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#0e1913] border border-emerald-100/80 dark:border-emerald-900/50 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                  <DoorOpen className="w-4 h-4" />
                  <span>Available Halls</span>
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  {availableRooms.length} Open Now
                </span>
              </div>

              <div className="space-y-3">
                {availableRooms.slice(0, 3).map((room: any) => (
                  <div
                    key={room._id}
                    className="p-3 rounded-xl bg-emerald-50/50 dark:bg-[#132219] border border-emerald-200/50 dark:border-emerald-900/40"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-emerald-950 dark:text-[#ecfdf5]">
                        {room.roomNumber} ({room.type})
                      </span>
                      <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400">
                        Cap: {room.capacity}
                      </span>
                    </div>
                    <p className="text-[11px] text-emerald-700/80 dark:text-emerald-400/80 mt-0.5">
                      {room.block}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => onNavigate('classrooms')}
              className="mt-4 w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors text-center"
            >
              Open Classroom Scheduler
            </button>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // 3. ADMIN DASHBOARD
  // -------------------------------------------------------------
  const metrics = adminData?.metrics;
  const buses = adminData?.buses || [];
  const classrooms = adminData?.classrooms || [];
  const complaints = adminData?.complaints || [];
  const recentLogs = adminData?.recentApiLogs || [];
  const telemetry = statsData?.data?.apiTelemetry;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-emerald-800 via-emerald-900 to-black text-white shadow-xl shadow-emerald-950/20">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded-md text-[11px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
              CENTRAL OPERATIONS CONSOLE
            </span>
            <span className="text-xs text-emerald-300">Admin Mode</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight">
            SmartCampus Enterprise API Hub
          </h1>
          <p className="text-sm text-emerald-200/80 mt-1 max-w-xl">
            Live telemetry, fleet GPS pipelines, academic records, and REST API performance.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('apiexplorer')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 text-emerald-950 hover:bg-emerald-400 text-xs font-black shadow-lg transition-colors"
          >
            <Code2 className="w-4 h-4" />
            <span>Open API Explorer</span>
          </button>
          <button
            onClick={() => onNavigate('apidocs')}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 transition-colors"
          >
            <span>Swagger Docs</span>
          </button>
        </div>
      </div>

      {/* Top 4 Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="TOTAL ENROLLED STUDENTS"
          value={metrics?.totalStudents || 6}
          subtitle="Across 5 Engineering Disciplines"
          icon={<Users className="w-5 h-5" />}
          trend={{ value: '+12% this semester', positive: true }}
        />

        <StatCard
          title="OVERALL ATTENDANCE RATE"
          value={`${metrics?.overallAttendanceRate || 86.4}%`}
          subtitle="Target threshold: 75.0%"
          icon={<CalendarCheck2 className="w-5 h-5" />}
          trend={{ value: 'Campus Compliant', positive: true }}
          highlight
        />

        <StatCard
          title="ACTIVE GRIEVANCES"
          value={metrics?.activeComplaints || 2}
          subtitle={`${metrics?.resolvedComplaints || 2} Resolved to date`}
          icon={<AlertTriangle className="w-5 h-5" />}
        />

        <StatCard
          title="REST API REQUESTS"
          value={metrics?.totalApiRequests || telemetry?.totalRequests || 42}
          subtitle={`Avg Latency: ${metrics?.avgResponseTimeMs || 16.5} ms`}
          icon={<Zap className="w-5 h-5" />}
          trend={{ value: '99.8% 2xx Status', positive: true }}
        />
      </div>

      {/* 2-Column Section: Real-Time API Activity Telemetry & Campus Fleet Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Real-time REST API Activity & Telemetry */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-[#0e1913] border border-emerald-100/80 dark:border-emerald-900/50 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <h3 className="text-base font-bold text-emerald-950 dark:text-[#ecfdf5]">
                  Live REST API Telemetry & Traffic Logs
                </h3>
              </div>
              <p className="text-xs text-emerald-700/80 dark:text-emerald-400/80 mt-0.5">
                Real-time HTTP execution times and status codes intercepted across all modules
              </p>
            </div>
            <button
              onClick={() => onNavigate('apiexplorer')}
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-800 dark:text-emerald-400 flex items-center gap-1"
            >
              <span>API Playground</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-emerald-100 dark:border-emerald-900 text-emerald-700 dark:text-emerald-400 font-bold">
                  <th className="py-2.5 px-3">Method</th>
                  <th className="py-2.5 px-3">Endpoint</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Latency</th>
                  <th className="py-2.5 px-3">Caller</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-50 dark:divide-emerald-950">
                {recentLogs.slice(0, 7).map((log: any) => (
                  <tr key={log.id} className="hover:bg-emerald-50/50 dark:hover:bg-[#13241c] transition-colors">
                    <td className="py-2 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          log.method === 'GET'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                            : log.method === 'POST'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : log.method === 'PUT'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                        }`}
                      >
                        {log.method}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-emerald-950 dark:text-slate-200 truncate max-w-[200px]">
                      {log.endpoint}
                    </td>
                    <td className="py-2 px-3">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          log.statusCode < 300
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                        }`}
                      >
                        {log.statusCode}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-emerald-600 dark:text-emerald-400 font-bold">
                      {log.durationMs}ms
                    </td>
                    <td className="py-2 px-3 text-emerald-700/80 dark:text-slate-400">
                      {log.userRole || 'Admin'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Transit Fleet Overview */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#0e1913] border border-emerald-100/80 dark:border-emerald-900/50 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                <Bus className="w-4 h-4" />
                <span>Campus Bus Fleet</span>
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                {buses.length} Active
              </span>
            </div>

            <div className="space-y-3">
              {buses.slice(0, 3).map((b: any) => (
                <div
                  key={b._id}
                  className="p-3 rounded-xl bg-emerald-50/50 dark:bg-[#132219] border border-emerald-200/50 dark:border-emerald-900/40"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-emerald-950 dark:text-[#ecfdf5]">
                      {b.busNumber}
                    </span>
                    <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                      {b.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-700/80 dark:text-emerald-400/80 mt-1 truncate">
                    📍 {b.currentLocation?.landmark}
                  </p>
                  <div className="mt-2 text-[10px] text-emerald-800/80 dark:text-emerald-300 flex items-center justify-between">
                    <span>Driver: {b.driverName}</span>
                    <span className="font-mono font-bold">{b.currentOccupancy}/{b.capacity} seats</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => onNavigate('bus')}
            className="mt-4 w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors text-center"
          >
            Manage Transit Fleet
          </button>
        </div>
      </div>
    </div>
  );
};
