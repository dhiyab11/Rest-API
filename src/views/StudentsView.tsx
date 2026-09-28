import React, { useEffect, useState } from 'react';
import {
  Users,
  Search,
  Plus,
  Filter,
  Trash2,
  Edit2,
  CalendarCheck2,
  AlertTriangle,
  GraduationCap,
  Mail,
  Phone,
  BookOpen,
} from 'lucide-react';
import { api } from '../api/client.js';
import { IStudent } from '../types/index.js';
import { useAuth } from '../context/AuthContext.js';
import { useToast } from '../components/Toast.js';
import { Modal } from '../components/Modal.js';
import { ConfirmDialog } from '../components/ConfirmDialog.js';

export const StudentsView: React.FC = () => {
  const { role } = useAuth();
  const { success, error } = useToast();

  const [students, setStudents] = useState<IStudent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDept, setSelectedDept] = useState<string>('All');
  const [selectedYear, setSelectedYear] = useState<string>('All');

  // Modal states
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState<boolean>(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);
  const [selectedStudentDetail, setSelectedStudentDetail] = useState<any>(null);
  const [studentToDelete, setStudentToDelete] = useState<IStudent | null>(null);

  // Form state
  const [enrollForm, setEnrollForm] = useState({
    name: '',
    email: '',
    phone: '',
    department: 'Computer Science & Engineering',
    year: 1,
    semester: 1,
    cgpa: 8.5,
    hostelResident: false,
    roomNumber: '',
  });

  const departments = [
    'All',
    'Computer Science & Engineering',
    'Information Technology',
    'Electronics & Communication Engineering',
    'Mechanical Engineering',
    'Civil Engineering',
  ];

  const fetchStudents = async () => {
    setLoading(true);
    try {
      let query = '/students?';
      if (searchQuery) query += `search=${encodeURIComponent(searchQuery)}&`;
      if (selectedDept !== 'All') query += `department=${encodeURIComponent(selectedDept)}&`;
      if (selectedYear !== 'All') query += `year=${selectedYear}&`;

      const { response } = await api.get(query);
      if (response.success && response.data) {
        setStudents(response.data);
      }
    } catch (err: any) {
      error('Failed to load students', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [selectedDept, selectedYear]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchStudents();
  };

  const handleOpenStudentDetail = async (studentId: string) => {
    const { response } = await api.get(`/students/${studentId}`);
    if (response.success && response.data) {
      setSelectedStudentDetail(response.data);
      setIsDetailModalOpen(true);
    } else {
      error('Failed to load student details', response.message);
    }
  };

  const handleEnrollSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { response } = await api.post('/students', enrollForm);
    if (response.success) {
      success('Student Enrolled', `${enrollForm.name} enrolled via REST API`);
      setIsEnrollModalOpen(false);
      setEnrollForm({
        name: '',
        email: '',
        phone: '',
        department: 'Computer Science & Engineering',
        year: 1,
        semester: 1,
        cgpa: 8.5,
        hostelResident: false,
        roomNumber: '',
      });
      fetchStudents();
    } else {
      error('Enrollment Failed', response.message);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!studentToDelete) return;
    const { response } = await api.delete(`/students/${studentToDelete._id}`);
    if (response.success) {
      success('Student Removed', `${studentToDelete.name} was removed from records`);
      setStudentToDelete(null);
      fetchStudents();
    } else {
      error('Deletion Failed', response.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#0e1913] border border-emerald-100/90 dark:border-emerald-900/60 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400">
                <Users className="w-4 h-4" />
              </span>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                Student Database & Profiles
              </span>
            </div>
            <h1 className="text-2xl font-black text-emerald-950 dark:text-[#ecfdf5]">
              Students Directory
            </h1>
            <p className="text-xs text-emerald-700/80 dark:text-emerald-400/80 mt-1">
              Manage academic records, CGPA rankings, hostel allocations, and attendance via <code className="font-mono text-emerald-600 dark:text-emerald-300">/api/students</code>
            </p>
          </div>

          {(role === 'Admin' || role === 'Faculty') && (
            <button
              onClick={() => setIsEnrollModalOpen(true)}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all active:scale-98"
            >
              <Plus className="w-4 h-4" />
              <span>Enroll New Student</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#0e1913] border border-emerald-100/90 dark:border-emerald-900/60 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-600/70" />
          <input
            type="text"
            placeholder="Search by student name, roll number, email..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-emerald-200 dark:border-emerald-800/80 bg-emerald-50/40 dark:bg-[#0c1611] text-xs text-emerald-950 dark:text-[#ecfdf5] focus:outline-emerald-500"
          />
        </form>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <select
            value={selectedDept}
            onChange={e => setSelectedDept(e.target.value)}
            className="px-3 py-2 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-white dark:bg-[#0c1611] text-xs font-medium text-emerald-900 dark:text-[#ecfdf5] focus:outline-emerald-500"
          >
            {departments.map(d => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>

          <select
            value={selectedYear}
            onChange={e => setSelectedYear(e.target.value)}
            className="px-3 py-2 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-white dark:bg-[#0c1611] text-xs font-medium text-emerald-900 dark:text-[#ecfdf5] focus:outline-emerald-500"
          >
            <option value="All">All Years</option>
            <option value="1">1st Year</option>
            <option value="2">2nd Year</option>
            <option value="3">3rd Year</option>
            <option value="4">4th Year</option>
          </select>
        </div>
      </div>

      {/* Students Table */}
      <div className="rounded-2xl bg-white dark:bg-[#0e1913] border border-emerald-100/90 dark:border-emerald-900/60 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-emerald-100 dark:border-emerald-900/60 bg-emerald-50/50 dark:bg-[#0a120d] text-emerald-800 dark:text-emerald-300 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Student Name / ID</th>
                <th className="py-3 px-4">Department & Year</th>
                <th className="py-3 px-4">CGPA</th>
                <th className="py-3 px-4">Attendance</th>
                <th className="py-3 px-4">Residence</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-50 dark:divide-emerald-950/60">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-emerald-700 dark:text-emerald-400">
                    Querying student records via REST API...
                  </td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-emerald-700 dark:text-emerald-400">
                    No student records match the selected filters.
                  </td>
                </tr>
              ) : (
                students.map(student => (
                  <tr
                    key={student._id}
                    className="hover:bg-emerald-50/40 dark:hover:bg-[#13241c] transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="font-bold text-emerald-950 dark:text-slate-100 text-sm">
                        {student.name}
                      </div>
                      <div className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400">
                        {student.studentId} • {student.email}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-emerald-900 dark:text-slate-200">
                        {student.department}
                      </div>
                      <div className="text-[11px] text-emerald-700/80 dark:text-emerald-400/80">
                        Year {student.year} (Sem {student.semester})
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-emerald-800 dark:text-emerald-300">
                      {student.cgpa.toFixed(2)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-mono font-bold ${
                            student.attendanceRate >= 85
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : student.attendanceRate >= 75
                              ? 'text-teal-600 dark:text-teal-400'
                              : 'text-rose-600 dark:text-rose-400'
                          }`}
                        >
                          {student.attendanceRate}%
                        </span>
                        <div className="w-16 h-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              student.attendanceRate >= 75 ? 'bg-emerald-500' : 'bg-rose-500'
                            }`}
                            style={{ width: `${student.attendanceRate}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {student.hostelResident ? (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                          Hostel ({student.roomNumber})
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                          Day Scholar
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenStudentDetail(student._id)}
                          className="px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-[#132219] text-xs font-semibold text-emerald-800 dark:text-emerald-300 transition-colors"
                        >
                          Profile & History
                        </button>
                        {role === 'Admin' && (
                          <button
                            onClick={() => setStudentToDelete(student)}
                            className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                            title="Delete Student"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Enroll Student Modal */}
      <Modal
        isOpen={isEnrollModalOpen}
        onClose={() => setIsEnrollModalOpen(false)}
        title="Enroll New Student"
        subtitle="REST API: POST /api/students"
      >
        <form onSubmit={handleEnrollSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-emerald-900 dark:text-emerald-200 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={enrollForm.name}
                onChange={e => setEnrollForm({ ...enrollForm, name: e.target.value })}
                placeholder="e.g. Sneha Venkatesh"
                className="w-full px-3.5 py-2 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/20 dark:bg-[#0a120d] text-xs text-emerald-950 dark:text-slate-100 focus:outline-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-emerald-900 dark:text-emerald-200 mb-1">
                Email Address *
              </label>
              <input
                type="email"
                required
                value={enrollForm.email}
                onChange={e => setEnrollForm({ ...enrollForm, email: e.target.value })}
                placeholder="sneha.v@smartcampus.edu"
                className="w-full px-3.5 py-2 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/20 dark:bg-[#0a120d] text-xs text-emerald-950 dark:text-slate-100 focus:outline-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-emerald-900 dark:text-emerald-200 mb-1">
                Phone Number
              </label>
              <input
                type="text"
                value={enrollForm.phone}
                onChange={e => setEnrollForm({ ...enrollForm, phone: e.target.value })}
                placeholder="+91 98401 22334"
                className="w-full px-3.5 py-2 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/20 dark:bg-[#0a120d] text-xs text-emerald-950 dark:text-slate-100 focus:outline-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-emerald-900 dark:text-emerald-200 mb-1">
                Department
              </label>
              <select
                value={enrollForm.department}
                onChange={e => setEnrollForm({ ...enrollForm, department: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/20 dark:bg-[#0a120d] text-xs text-emerald-950 dark:text-slate-100 focus:outline-emerald-500"
              >
                {departments
                  .filter(d => d !== 'All')
                  .map(dept => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-emerald-900 dark:text-emerald-200 mb-1">
                Academic Year
              </label>
              <select
                value={enrollForm.year}
                onChange={e => setEnrollForm({ ...enrollForm, year: parseInt(e.target.value), semester: parseInt(e.target.value) * 2 - 1 })}
                className="w-full px-3.5 py-2 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/20 dark:bg-[#0a120d] text-xs text-emerald-950 dark:text-slate-100 focus:outline-emerald-500"
              >
                <option value={1}>1st Year</option>
                <option value={2}>2nd Year</option>
                <option value={3}>3rd Year</option>
                <option value={4}>4th Year</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-emerald-900 dark:text-emerald-200 mb-1">
                Starting CGPA
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="10"
                value={enrollForm.cgpa}
                onChange={e => setEnrollForm({ ...enrollForm, cgpa: parseFloat(e.target.value) })}
                className="w-full px-3.5 py-2 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/20 dark:bg-[#0a120d] text-xs text-emerald-950 dark:text-slate-100 focus:outline-emerald-500"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-emerald-900 dark:text-emerald-200">
              <input
                type="checkbox"
                checked={enrollForm.hostelResident}
                onChange={e => setEnrollForm({ ...enrollForm, hostelResident: e.target.checked })}
                className="rounded text-emerald-600 focus:ring-emerald-500"
              />
              <span>Hostel Resident</span>
            </label>

            {enrollForm.hostelResident && (
              <input
                type="text"
                placeholder="Room (e.g. Kaveri-302)"
                value={enrollForm.roomNumber}
                onChange={e => setEnrollForm({ ...enrollForm, roomNumber: e.target.value })}
                className="px-3 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800 text-xs bg-white dark:bg-[#0a120d]"
              />
            )}
          </div>

          <div className="flex justify-end gap-2.5 pt-4 border-t border-emerald-100 dark:border-emerald-900/40">
            <button
              type="button"
              onClick={() => setIsEnrollModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold rounded-xl border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-slate-300 hover:bg-emerald-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
            >
              Enroll Student
            </button>
          </div>
        </form>
      </Modal>

      {/* Student Detail Modal */}
      {selectedStudentDetail && (
        <Modal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          title={`${selectedStudentDetail.name} (${selectedStudentDetail.studentId})`}
          subtitle="Full Academic & Campus Profile"
          maxWidth="2xl"
        >
          <div className="space-y-5 text-xs">
            {/* Quick stats banner */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-emerald-50/60 dark:bg-[#122018] border border-emerald-100 dark:border-emerald-900/60">
              <div>
                <span className="text-[10px] text-emerald-700 dark:text-emerald-400 block font-semibold">DEPARTMENT</span>
                <span className="font-bold text-emerald-950 dark:text-slate-100 truncate block">
                  {selectedStudentDetail.department}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-emerald-700 dark:text-emerald-400 block font-semibold">CGPA</span>
                <span className="font-mono font-bold text-emerald-950 dark:text-slate-100 text-sm">
                  {selectedStudentDetail.cgpa}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-emerald-700 dark:text-emerald-400 block font-semibold">ATTENDANCE</span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                  {selectedStudentDetail.attendanceRate}%
                </span>
              </div>
              <div>
                <span className="text-[10px] text-emerald-700 dark:text-emerald-400 block font-semibold">EMAIL</span>
                <span className="font-mono text-emerald-950 dark:text-slate-100 truncate block">
                  {selectedStudentDetail.email}
                </span>
              </div>
            </div>

            {/* Attendance History Section */}
            <div>
              <h4 className="font-bold text-emerald-950 dark:text-[#ecfdf5] mb-2 flex items-center gap-1.5">
                <CalendarCheck2 className="w-4 h-4 text-emerald-600" />
                <span>Recent Attendance Records</span>
              </h4>
              <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                {selectedStudentDetail.attendanceHistory?.length === 0 ? (
                  <div className="text-center py-4 text-emerald-700/70">No attendance sessions logged.</div>
                ) : (
                  selectedStudentDetail.attendanceHistory?.map((att: any) => (
                    <div
                      key={att._id}
                      className="flex items-center justify-between p-2 rounded-lg bg-emerald-50/40 dark:bg-[#122018] text-[11px]"
                    >
                      <span className="font-semibold text-emerald-950 dark:text-slate-200">
                        {att.subjectCode} - {att.subjectName}
                      </span>
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-emerald-700/80 dark:text-emerald-400">{att.date}</span>
                        <span
                          className={`font-bold px-1.5 py-0.5 rounded text-[10px] ${
                            att.status === 'Present'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                          }`}
                        >
                          {att.status}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Filed Complaints */}
            <div>
              <h4 className="font-bold text-emerald-950 dark:text-[#ecfdf5] mb-2 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-emerald-600" />
                <span>Filed Grievances / Complaints</span>
              </h4>
              <div className="space-y-1.5">
                {selectedStudentDetail.complaints?.length === 0 ? (
                  <div className="text-center py-4 text-emerald-700/70">No grievances filed.</div>
                ) : (
                  selectedStudentDetail.complaints?.map((c: any) => (
                    <div
                      key={c._id}
                      className="p-2.5 rounded-lg bg-emerald-50/40 dark:bg-[#122018] text-[11px] space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-emerald-950 dark:text-slate-200">{c.title}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold">
                          {c.status}
                        </span>
                      </div>
                      <p className="text-emerald-800/80 dark:text-slate-400">{c.description}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!studentToDelete}
        onClose={() => setStudentToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Student Record"
        message={`Are you sure you want to delete ${studentToDelete?.name} (${studentToDelete?.studentId})? This action cannot be undone.`}
        confirmLabel="Delete Student"
      />
    </div>
  );
};
