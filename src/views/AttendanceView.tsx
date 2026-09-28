import React, { useEffect, useState } from 'react';
import {
  CalendarCheck2,
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  HelpCircle,
  Filter,
} from 'lucide-react';
import { api } from '../api/client.js';
import { IAttendance, IStudent } from '../types/index.js';
import { useAuth } from '../context/AuthContext.js';
import { useToast } from '../components/Toast.js';
import { Modal } from '../components/Modal.js';

export const AttendanceView: React.FC = () => {
  const { role } = useAuth();
  const { success, error } = useToast();

  const [records, setRecords] = useState<IAttendance[]>([]);
  const [studentsList, setStudentsList] = useState<IStudent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filters
  const [filterDate, setFilterDate] = useState<string>('');
  const [filterSubject, setFilterSubject] = useState<string>('All');
  const [filterStudentId, setFilterStudentId] = useState<string>('');

  // Mark Modal
  const [isMarkModalOpen, setIsMarkModalOpen] = useState<boolean>(false);
  const [markForm, setMarkForm] = useState({
    studentId: 'STU202401',
    subjectCode: 'CS301',
    subjectName: 'Data Structures & Algorithms',
    date: new Date().toISOString().split('T')[0],
    status: 'Present' as 'Present' | 'Absent' | 'Late' | 'Excused',
  });

  const subjects = [
    { code: 'CS301', name: 'Data Structures & Algorithms' },
    { code: 'CS302', name: 'Database Management Systems' },
    { code: 'CS303', name: 'Operating Systems & Architecture' },
    { code: 'CS304', name: 'Computer Networks' },
  ];

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      let query = '/attendance?';
      if (filterDate) query += `date=${filterDate}&`;
      if (filterSubject !== 'All') query += `subjectCode=${filterSubject}&`;
      if (filterStudentId) query += `studentId=${encodeURIComponent(filterStudentId)}&`;

      const [attRes, stuRes] = await Promise.all([
        api.get(query),
        api.get('/students'),
      ]);

      if (attRes.response.success && attRes.response.data) {
        setRecords(attRes.response.data);
      }
      if (stuRes.response.success && stuRes.response.data) {
        setStudentsList(stuRes.response.data);
      }
    } catch (err: any) {
      error('Failed to load attendance', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [filterDate, filterSubject]);

  const handleMarkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const sub = subjects.find(s => s.code === markForm.subjectCode);
    const payload = {
      ...markForm,
      subjectName: sub?.name || markForm.subjectName,
    };

    const { response } = await api.post('/attendance', payload);
    if (response.success) {
      success('Attendance Recorded', `Marked ${markForm.status} for ${markForm.studentId}`);
      setIsMarkModalOpen(false);
      fetchAttendance();
    } else {
      error('Submission Failed', response.message);
    }
  };

  const handleQuickStatusChange = async (recordId: string, newStatus: string) => {
    const { response } = await api.put(`/attendance/${recordId}`, { status: newStatus });
    if (response.success) {
      success('Status Updated', `Changed to ${newStatus}`);
      setRecords(prev =>
        prev.map(r => (r._id === recordId ? { ...r, status: newStatus as any } : r))
      );
    } else {
      error('Update Failed', response.message);
    }
  };

  // Stats calculation
  const totalCount = records.length;
  const presentCount = records.filter(r => r.status === 'Present').length;
  const absentCount = records.filter(r => r.status === 'Absent').length;
  const lateCount = records.filter(r => r.status === 'Late').length;
  const percentage = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#0e1913] border border-emerald-100/90 dark:border-emerald-900/60 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400">
                <CalendarCheck2 className="w-4 h-4" />
              </span>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                Academic Operations
              </span>
            </div>
            <h1 className="text-2xl font-black text-emerald-950 dark:text-[#ecfdf5]">
              Attendance Tracking & Analytics
            </h1>
            <p className="text-xs text-emerald-700/80 dark:text-emerald-400/80 mt-1">
              Centralized lecture attendance logged via <code className="font-mono text-emerald-600 dark:text-emerald-300">/api/attendance</code>
            </p>
          </div>

          {(role === 'Faculty' || role === 'Admin') && (
            <button
              onClick={() => setIsMarkModalOpen(true)}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all active:scale-98"
            >
              <Plus className="w-4 h-4" />
              <span>Mark Session Attendance</span>
            </button>
          )}
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-[#0e1913] border border-emerald-100/90 dark:border-emerald-900/50">
          <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 block">TOTAL ENTRIES</span>
          <span className="text-2xl font-extrabold text-emerald-950 dark:text-slate-100 font-mono mt-1 block">
            {totalCount}
          </span>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-[#0e1913] border border-emerald-100/90 dark:border-emerald-900/50">
          <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 block">PRESENT</span>
          <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono mt-1 block">
            {presentCount} ({percentage}%)
          </span>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-[#0e1913] border border-emerald-100/90 dark:border-emerald-900/50">
          <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 block">ABSENT</span>
          <span className="text-2xl font-extrabold text-rose-600 dark:text-rose-400 font-mono mt-1 block">
            {absentCount}
          </span>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-[#0e1913] border border-emerald-100/90 dark:border-emerald-900/50">
          <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 block">LATE / EXCUSED</span>
          <span className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 font-mono mt-1 block">
            {lateCount}
          </span>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#0e1913] border border-emerald-100/90 dark:border-emerald-900/60 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <label className="block text-[10px] font-bold text-emerald-700 dark:text-emerald-400 mb-1">
              SUBJECT COURSE
            </label>
            <select
              value={filterSubject}
              onChange={e => setFilterSubject(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/40 dark:bg-[#0a120d] text-xs text-emerald-950 dark:text-slate-100"
            >
              <option value="All">All Subjects</option>
              {subjects.map(s => (
                <option key={s.code} value={s.code}>
                  {s.code}: {s.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-emerald-700 dark:text-emerald-400 mb-1">
              SESSION DATE
            </label>
            <input
              type="date"
              value={filterDate}
              onChange={e => setFilterDate(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/40 dark:bg-[#0a120d] text-xs text-emerald-950 dark:text-slate-100"
            />
          </div>
        </div>

        {filterDate || filterSubject !== 'All' ? (
          <button
            onClick={() => {
              setFilterDate('');
              setFilterSubject('All');
            }}
            className="text-xs text-emerald-600 hover:underline font-semibold"
          >
            Clear Filters
          </button>
        ) : null}
      </div>

      {/* Attendance Records Table */}
      <div className="rounded-2xl bg-white dark:bg-[#0e1913] border border-emerald-100/90 dark:border-emerald-900/60 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-emerald-100 dark:border-emerald-900/60 bg-emerald-50/50 dark:bg-[#0a120d] text-emerald-800 dark:text-emerald-300 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Student ID & Name</th>
                <th className="py-3 px-4">Subject</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Recorded By</th>
                {(role === 'Faculty' || role === 'Admin') && (
                  <th className="py-3 px-4 text-right">Quick Toggle</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-50 dark:divide-emerald-950/60">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-emerald-700 dark:text-emerald-400">
                    Querying attendance records via REST API...
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-emerald-700 dark:text-emerald-400">
                    No attendance logs matching selected criteria.
                  </td>
                </tr>
              ) : (
                records.map(rec => (
                  <tr
                    key={rec._id}
                    className="hover:bg-emerald-50/40 dark:hover:bg-[#13241c] transition-colors"
                  >
                    <td className="py-3 px-4 font-semibold text-emerald-950 dark:text-slate-100">
                      <div>{rec.studentName}</div>
                      <div className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400">
                        {rec.studentId}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-emerald-800 dark:text-emerald-300">
                      <div className="font-bold">{rec.subjectCode}</div>
                      <div className="text-[11px] text-emerald-700/80 dark:text-emerald-400/80">
                        {rec.subjectName}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-emerald-700 dark:text-emerald-400">
                      {rec.date}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          rec.status === 'Present'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : rec.status === 'Absent'
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                            : rec.status === 'Late'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300'
                        }`}
                      >
                        {rec.status === 'Present' && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                        {rec.status === 'Absent' && <XCircle className="w-3 h-3 text-rose-600" />}
                        {rec.status === 'Late' && <Clock className="w-3 h-3 text-amber-600" />}
                        {rec.status === 'Excused' && <HelpCircle className="w-3 h-3 text-teal-600" />}
                        <span>{rec.status}</span>
                      </span>
                    </td>
                    <td className="py-3 px-4 text-emerald-700/80 dark:text-slate-400 text-xs">
                      {rec.markedBy}
                    </td>
                    {(role === 'Faculty' || role === 'Admin') && (
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleQuickStatusChange(rec._id, 'Present')}
                            className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 hover:bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300"
                          >
                            Present
                          </button>
                          <button
                            onClick={() => handleQuickStatusChange(rec._id, 'Absent')}
                            className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-800 hover:bg-rose-100 dark:bg-rose-950 dark:text-rose-300"
                          >
                            Absent
                          </button>
                          <button
                            onClick={() => handleQuickStatusChange(rec._id, 'Late')}
                            className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 hover:bg-amber-100 dark:bg-amber-950 dark:text-amber-300"
                          >
                            Late
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mark Attendance Modal */}
      <Modal
        isOpen={isMarkModalOpen}
        onClose={() => setIsMarkModalOpen(false)}
        title="Record Lecture Attendance"
        subtitle="REST API: POST /api/attendance"
      >
        <form onSubmit={handleMarkSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-emerald-900 dark:text-emerald-200 mb-1">
              Select Student *
            </label>
            <select
              value={markForm.studentId}
              onChange={e => setMarkForm({ ...markForm, studentId: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/20 dark:bg-[#0a120d] text-xs text-emerald-950 dark:text-slate-100 focus:outline-emerald-500"
            >
              {studentsList.map(s => (
                <option key={s.studentId} value={s.studentId}>
                  {s.studentId} - {s.name} ({s.department})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-emerald-900 dark:text-emerald-200 mb-1">
              Course Subject *
            </label>
            <select
              value={markForm.subjectCode}
              onChange={e => setMarkForm({ ...markForm, subjectCode: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/20 dark:bg-[#0a120d] text-xs text-emerald-950 dark:text-slate-100 focus:outline-emerald-500"
            >
              {subjects.map(s => (
                <option key={s.code} value={s.code}>
                  {s.code}: {s.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-emerald-900 dark:text-emerald-200 mb-1">
                Date *
              </label>
              <input
                type="date"
                required
                value={markForm.date}
                onChange={e => setMarkForm({ ...markForm, date: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/20 dark:bg-[#0a120d] text-xs text-emerald-950 dark:text-slate-100 focus:outline-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-emerald-900 dark:text-emerald-200 mb-1">
                Attendance Status *
              </label>
              <select
                value={markForm.status}
                onChange={e => setMarkForm({ ...markForm, status: e.target.value as any })}
                className="w-full px-3.5 py-2 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/20 dark:bg-[#0a120d] text-xs text-emerald-950 dark:text-slate-100 focus:outline-emerald-500"
              >
                <option value="Present">Present</option>
                <option value="Absent">Absent</option>
                <option value="Late">Late</option>
                <option value="Excused">Excused</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-4 border-t border-emerald-100 dark:border-emerald-900/40">
            <button
              type="button"
              onClick={() => setIsMarkModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold rounded-xl border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-slate-300 hover:bg-emerald-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
            >
              Save Attendance
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
