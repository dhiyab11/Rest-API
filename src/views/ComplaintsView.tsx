import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  Plus,
  CheckCircle2,
  Clock,
  XCircle,
  MessageSquare,
  Trash2,
  Filter,
} from 'lucide-react';
import { api } from '../api/client.js';
import { IComplaint } from '../types/index.js';
import { useAuth } from '../context/AuthContext.js';
import { useToast } from '../components/Toast.js';
import { Modal } from '../components/Modal.js';
import { ConfirmDialog } from '../components/ConfirmDialog.js';

export const ComplaintsView: React.FC = () => {
  const { role, user } = useAuth();
  const { success, error } = useToast();

  const [complaints, setComplaints] = useState<IComplaint[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Modals
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState<boolean>(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState<boolean>(false);
  const [selectedComplaint, setSelectedComplaint] = useState<IComplaint | null>(null);
  const [complaintToDelete, setComplaintToDelete] = useState<IComplaint | null>(null);

  // Form states
  const [submitForm, setSubmitForm] = useState({
    title: '',
    description: '',
    category: 'Infrastructure',
    priority: 'Medium',
  });

  const [statusForm, setStatusForm] = useState({
    status: 'In Progress',
    resolutionNotes: '',
  });

  const categories = [
    'All',
    'Hostel',
    'Academic',
    'Transport',
    'Infrastructure',
    'Cafeteria',
    'Library',
    'Other',
  ];

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      let query = '/complaints?';
      if (activeTab !== 'All') query += `status=${encodeURIComponent(activeTab)}&`;
      if (selectedCategory !== 'All') query += `category=${encodeURIComponent(selectedCategory)}&`;

      const { response } = await api.get(query);
      if (response.success && response.data) {
        setComplaints(response.data);
      }
    } catch (err: any) {
      error('Failed to load complaints', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [activeTab, selectedCategory]);

  const handleSubmitComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    const { response } = await api.post('/complaints', submitForm);
    if (response.success) {
      success('Grievance Filed', 'Ticket registered and routed to administrators');
      setIsSubmitModalOpen(false);
      setSubmitForm({
        title: '',
        description: '',
        category: 'Infrastructure',
        priority: 'Medium',
      });
      fetchComplaints();
    } else {
      error('Submission Failed', response.message);
    }
  };

  const handleUpdateStatusSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedComplaint) return;
    const { response } = await api.put(`/complaints/${selectedComplaint._id}/status`, statusForm);
    if (response.success) {
      success('Status Updated', `Complaint marked as ${statusForm.status}`);
      setIsStatusModalOpen(false);
      fetchComplaints();
    } else {
      error('Update Failed', response.message);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!complaintToDelete) return;
    const { response } = await api.delete(`/complaints/${complaintToDelete._id}`);
    if (response.success) {
      success('Complaint Deleted', 'Record removed from system');
      setComplaintToDelete(null);
      fetchComplaints();
    } else {
      error('Deletion Failed', response.message);
    }
  };

  const priorityColors: Record<string, string> = {
    Low: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300',
    Medium: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300',
    High: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
    Urgent: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#0e1913] border border-emerald-100/90 dark:border-emerald-900/60 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400">
                <AlertTriangle className="w-4 h-4" />
              </span>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                Campus Grievance Redressal
              </span>
            </div>
            <h1 className="text-2xl font-black text-emerald-950 dark:text-[#ecfdf5]">
              Student Grievances & Complaints
            </h1>
            <p className="text-xs text-emerald-700/80 dark:text-emerald-400/80 mt-1">
              Track resolution lifecycle, priority triage, and administrative responses via <code className="font-mono text-emerald-600 dark:text-emerald-300">/api/complaints</code>
            </p>
          </div>

          <button
            onClick={() => setIsSubmitModalOpen(true)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all active:scale-98"
          >
            <Plus className="w-4 h-4" />
            <span>File New Grievance</span>
          </button>
        </div>
      </div>

      {/* Tabs & Category Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-2 rounded-2xl bg-white dark:bg-[#0e1913] border border-emerald-100/90 dark:border-emerald-900/60">
        <div className="flex items-center gap-1 overflow-x-auto p-1">
          {['All', 'Pending', 'In Progress', 'Resolved', 'Rejected'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                activeTab === tab
                  ? 'bg-emerald-600 text-white dark:bg-emerald-500 dark:text-emerald-950 font-bold shadow-2xs'
                  : 'text-emerald-900/80 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-[#13241c]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="px-2">
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-white dark:bg-[#0c1611] text-xs text-emerald-900 dark:text-[#ecfdf5]"
          >
            {categories.map(c => (
              <option key={c} value={c}>
                Category: {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Complaints Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          <div className="col-span-2 py-12 text-center text-xs text-emerald-700 dark:text-emerald-400">
            Querying campus complaints via REST API...
          </div>
        ) : complaints.length === 0 ? (
          <div className="col-span-2 py-12 text-center text-xs text-emerald-700 dark:text-emerald-400">
            No complaints found under selected status.
          </div>
        ) : (
          complaints.map(c => (
            <div
              key={c._id}
              className="p-5 rounded-2xl bg-white dark:bg-[#0e1913] border border-emerald-100/90 dark:border-emerald-900/60 shadow-xs flex flex-col justify-between hover:border-emerald-300 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-semibold">
                      {c.category}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${priorityColors[c.priority]}`}>
                      {c.priority} Priority
                    </span>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      c.status === 'Resolved'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : c.status === 'In Progress'
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        : c.status === 'Rejected'
                        ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                        : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300'
                    }`}
                  >
                    {c.status === 'Resolved' && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                    {c.status === 'In Progress' && <Clock className="w-3 h-3 text-amber-600" />}
                    {c.status === 'Rejected' && <XCircle className="w-3 h-3 text-rose-600" />}
                    <span>{c.status}</span>
                  </span>
                </div>

                <h3 className="font-bold text-sm text-emerald-950 dark:text-slate-100">
                  {c.title}
                </h3>
                <p className="text-xs text-emerald-800/80 dark:text-slate-300 mt-1.5 leading-relaxed">
                  {c.description}
                </p>

                {c.resolutionNotes && (
                  <div className="mt-3 p-3 rounded-xl bg-emerald-50/60 dark:bg-[#13241c] border border-emerald-200/50 dark:border-emerald-900/40 text-xs">
                    <span className="font-bold text-emerald-900 dark:text-emerald-300 block text-[11px] mb-0.5">
                      Administrative Action Taken:
                    </span>
                    <p className="text-emerald-800/90 dark:text-slate-200">{c.resolutionNotes}</p>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-emerald-100/60 dark:border-emerald-950/60 flex items-center justify-between text-xs">
                <span className="text-emerald-700/80 dark:text-emerald-400/80 font-mono text-[11px]">
                  Submitted by: {c.studentName} ({c.submittedBy})
                </span>

                <div className="flex items-center gap-1.5">
                  {(role === 'Faculty' || role === 'Admin') && (
                    <button
                      onClick={() => {
                        setSelectedComplaint(c);
                        setStatusForm({
                          status: c.status,
                          resolutionNotes: c.resolutionNotes || '',
                        });
                        setIsStatusModalOpen(true);
                      }}
                      className="px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-[#132219] text-xs font-semibold text-emerald-800 dark:text-emerald-300 transition-colors"
                    >
                      Update Status
                    </button>
                  )}
                  {role === 'Admin' && (
                    <button
                      onClick={() => setComplaintToDelete(c)}
                      className="p-1 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Submit Grievance Modal */}
      <Modal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        title="Submit New Campus Grievance"
        subtitle="REST API: POST /api/complaints"
      >
        <form onSubmit={handleSubmitComplaint} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-emerald-900 dark:text-emerald-200 mb-1">
              Complaint Subject / Title *
            </label>
            <input
              type="text"
              required
              value={submitForm.title}
              onChange={e => setSubmitForm({ ...submitForm, title: e.target.value })}
              placeholder="e.g. Lab 4 AC cooling malfunction"
              className="w-full px-3.5 py-2 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/20 dark:bg-[#0a120d] text-xs text-emerald-950 dark:text-slate-100 focus:outline-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-emerald-900 dark:text-emerald-200 mb-1">
                Category *
              </label>
              <select
                value={submitForm.category}
                onChange={e => setSubmitForm({ ...submitForm, category: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/20 dark:bg-[#0a120d] text-xs text-emerald-950 dark:text-slate-100 focus:outline-emerald-500"
              >
                {categories
                  .filter(c => c !== 'All')
                  .map(cat => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-emerald-900 dark:text-emerald-200 mb-1">
                Urgency Priority *
              </label>
              <select
                value={submitForm.priority}
                onChange={e => setSubmitForm({ ...submitForm, priority: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/20 dark:bg-[#0a120d] text-xs text-emerald-950 dark:text-slate-100 focus:outline-emerald-500"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-emerald-900 dark:text-emerald-200 mb-1">
              Detailed Description *
            </label>
            <textarea
              required
              rows={4}
              value={submitForm.description}
              onChange={e => setSubmitForm({ ...submitForm, description: e.target.value })}
              placeholder="Provide exact room numbers, symptoms, or dates to help staff resolve rapidly."
              className="w-full px-3.5 py-2 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/20 dark:bg-[#0a120d] text-xs text-emerald-950 dark:text-slate-100 focus:outline-emerald-500"
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-4 border-t border-emerald-100 dark:border-emerald-900/40">
            <button
              type="button"
              onClick={() => setIsSubmitModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold rounded-xl border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-slate-300 hover:bg-emerald-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
            >
              Submit Ticket
            </button>
          </div>
        </form>
      </Modal>

      {/* Update Resolution Modal */}
      <Modal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        title="Update Resolution Status"
        subtitle={`Ticket: ${selectedComplaint?.title}`}
      >
        <form onSubmit={handleUpdateStatusSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-emerald-900 dark:text-emerald-200 mb-1">
              Resolution Status *
            </label>
            <select
              value={statusForm.status}
              onChange={e => setStatusForm({ ...statusForm, status: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/20 dark:bg-[#0a120d] text-xs text-emerald-950 dark:text-slate-100 focus:outline-emerald-500"
            >
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-emerald-900 dark:text-emerald-200 mb-1">
              Resolution Notes & Action Description
            </label>
            <textarea
              rows={3}
              value={statusForm.resolutionNotes}
              onChange={e => setStatusForm({ ...statusForm, resolutionNotes: e.target.value })}
              placeholder="e.g. Maintenance team inspected unit; thermostat controller replaced."
              className="w-full px-3.5 py-2 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/20 dark:bg-[#0a120d] text-xs text-emerald-950 dark:text-slate-100 focus:outline-emerald-500"
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-4 border-t border-emerald-100 dark:border-emerald-900/40">
            <button
              type="button"
              onClick={() => setIsStatusModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold rounded-xl border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-slate-300 hover:bg-emerald-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
            >
              Update Status
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!complaintToDelete}
        onClose={() => setComplaintToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Complaint Ticket"
        message="Are you sure you want to permanently remove this grievance record?"
        confirmLabel="Delete Ticket"
      />
    </div>
  );
};
