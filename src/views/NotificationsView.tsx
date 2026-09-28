import React, { useEffect, useState } from 'react';
import {
  Bell,
  Plus,
  CheckCheck,
  CheckCircle2,
  AlertTriangle,
  Info,
  Calendar,
  Bus,
} from 'lucide-react';
import { api } from '../api/client.js';
import { INotification } from '../types/index.js';
import { useAuth } from '../context/AuthContext.js';
import { useToast } from '../components/Toast.js';
import { Modal } from '../components/Modal.js';

export const NotificationsView: React.FC = () => {
  const { role, user } = useAuth();
  const { success, error } = useToast();

  const [notifications, setNotifications] = useState<INotification[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filterType, setFilterType] = useState<string>('All');

  // Broadcast Modal
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState<boolean>(false);
  const [noticeForm, setNoticeForm] = useState({
    title: '',
    message: '',
    type: 'Academic' as any,
    targetRole: 'All' as any,
  });

  const types = ['All', 'Academic', 'Alert', 'Transport', 'Urgent', 'Info'];

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const { response } = await api.get('/notifications');
      if (response.success && response.data) {
        setNotifications(response.data);
      }
    } catch (err: any) {
      error('Failed to load notifications', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id: string) => {
    const { response } = await api.put(`/notifications/${id}/read`);
    if (response.success) {
      success('Notification Updated', 'Marked as read');
      fetchNotifications();
    } else {
      error('Update Failed', response.message);
    }
  };

  const handleBroadcastSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { response } = await api.post('/notifications', noticeForm);
    if (response.success) {
      success('Broadcast Published', 'Notification sent to campus recipients');
      setIsBroadcastModalOpen(false);
      setNoticeForm({
        title: '',
        message: '',
        type: 'Academic',
        targetRole: 'All',
      });
      fetchNotifications();
    } else {
      error('Broadcast Failed', response.message);
    }
  };

  const filtered = filterType === 'All'
    ? notifications
    : notifications.filter(n => n.type === filterType);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#0e1913] border border-emerald-100/90 dark:border-emerald-900/60 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400">
                <Bell className="w-4 h-4" />
              </span>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                Campus Broadcast Announcements
              </span>
            </div>
            <h1 className="text-2xl font-black text-emerald-950 dark:text-[#ecfdf5]">
              Notifications & Campus Circulars
            </h1>
            <p className="text-xs text-emerald-700/80 dark:text-emerald-400/80 mt-1">
              Live announcement dissemination to students and faculty via <code className="font-mono text-emerald-600 dark:text-emerald-300">/api/notifications</code>
            </p>
          </div>

          {(role === 'Faculty' || role === 'Admin') && (
            <button
              onClick={() => setIsBroadcastModalOpen(true)}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all active:scale-98"
            >
              <Plus className="w-4 h-4" />
              <span>Broadcast Announcement</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {types.map(t => (
          <button
            key={t}
            onClick={() => setFilterType(t)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              filterType === t
                ? 'bg-emerald-600 text-white dark:bg-emerald-500 dark:text-emerald-950 font-bold shadow-2xs'
                : 'bg-white dark:bg-[#0e1913] border border-emerald-100 dark:border-emerald-900/60 text-emerald-800/80 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-[#13241c]'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {loading ? (
          <div className="py-12 text-center text-xs text-emerald-700 dark:text-emerald-400">
            Querying broadcast notifications via REST API...
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center text-xs text-emerald-700 dark:text-emerald-400">
            No notifications found under {filterType}.
          </div>
        ) : (
          filtered.map(notice => {
            const isRead = notice.readBy?.includes(user?.email || 'student@smartcampus.edu');

            return (
              <div
                key={notice._id}
                className={`p-5 rounded-2xl border transition-all ${
                  isRead
                    ? 'bg-white dark:bg-[#0e1913] border-emerald-100/70 dark:border-emerald-900/40 opacity-80'
                    : 'bg-emerald-50/50 dark:bg-[#13241c] border-emerald-300/80 dark:border-emerald-800 shadow-xs'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 shrink-0 mt-0.5">
                      {notice.type === 'Alert' && <AlertTriangle className="w-4 h-4 text-amber-600" />}
                      {notice.type === 'Urgent' && <AlertTriangle className="w-4 h-4 text-rose-600" />}
                      {notice.type === 'Transport' && <Bus className="w-4 h-4 text-teal-600" />}
                      {notice.type === 'Academic' && <Calendar className="w-4 h-4 text-emerald-600" />}
                      {notice.type === 'Info' && <Info className="w-4 h-4 text-blue-600" />}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-200/60 dark:bg-emerald-900/50 text-emerald-900 dark:text-emerald-200">
                          {notice.type}
                        </span>
                        <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-medium">
                          Audience: {notice.targetRole}
                        </span>
                        <span className="text-[10px] text-emerald-700/60 dark:text-emerald-400/60">
                          • {notice.sender}
                        </span>
                      </div>

                      <h3 className="font-bold text-sm text-emerald-950 dark:text-slate-100">
                        {notice.title}
                      </h3>

                      <p className="text-xs text-emerald-800/90 dark:text-slate-200 mt-1.5 leading-relaxed">
                        {notice.message}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-start">
                    {!isRead && (
                      <button
                        onClick={() => handleMarkAsRead(notice._id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-emerald-300 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-950 text-xs font-semibold text-emerald-800 dark:text-emerald-300 transition-colors"
                      >
                        <CheckCheck className="w-3.5 h-3.5" />
                        <span>Mark as Read</span>
                      </button>
                    )}
                    {isRead && (
                      <span className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Read</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Broadcast Announcement Modal */}
      <Modal
        isOpen={isBroadcastModalOpen}
        onClose={() => setIsBroadcastModalOpen(false)}
        title="Broadcast Campus Notice"
        subtitle="REST API: POST /api/notifications"
      >
        <form onSubmit={handleBroadcastSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-emerald-900 dark:text-emerald-200 mb-1">
              Notice Title *
            </label>
            <input
              type="text"
              required
              value={noticeForm.title}
              onChange={e => setNoticeForm({ ...noticeForm, title: e.target.value })}
              placeholder="e.g. End Semester Exam Timetable Announcement"
              className="w-full px-3.5 py-2 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/20 dark:bg-[#0a120d] text-xs text-emerald-950 dark:text-slate-100 focus:outline-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-emerald-900 dark:text-emerald-200 mb-1">
                Notice Category *
              </label>
              <select
                value={noticeForm.type}
                onChange={e => setNoticeForm({ ...noticeForm, type: e.target.value as any })}
                className="w-full px-3.5 py-2 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/20 dark:bg-[#0a120d] text-xs text-emerald-950 dark:text-slate-100 focus:outline-emerald-500"
              >
                <option value="Academic">Academic</option>
                <option value="Alert">Alert</option>
                <option value="Transport">Transport</option>
                <option value="Urgent">Urgent</option>
                <option value="Info">Info</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-emerald-900 dark:text-emerald-200 mb-1">
                Target Role Audience
              </label>
              <select
                value={noticeForm.targetRole}
                onChange={e => setNoticeForm({ ...noticeForm, targetRole: e.target.value as any })}
                className="w-full px-3.5 py-2 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/20 dark:bg-[#0a120d] text-xs text-emerald-950 dark:text-slate-100 focus:outline-emerald-500"
              >
                <option value="All">All Campus Members</option>
                <option value="Student">Students Only</option>
                <option value="Faculty">Faculty Only</option>
                <option value="Admin">Administrators Only</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-emerald-900 dark:text-emerald-200 mb-1">
              Notice Content & Directive *
            </label>
            <textarea
              required
              rows={4}
              value={noticeForm.message}
              onChange={e => setNoticeForm({ ...noticeForm, message: e.target.value })}
              placeholder="Provide exact timelines, link portals, or instructions."
              className="w-full px-3.5 py-2 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/20 dark:bg-[#0a120d] text-xs text-emerald-950 dark:text-slate-100 focus:outline-emerald-500"
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-4 border-t border-emerald-100 dark:border-emerald-900/40">
            <button
              type="button"
              onClick={() => setIsBroadcastModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold rounded-xl border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-slate-300 hover:bg-emerald-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
            >
              Publish Broadcast
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
