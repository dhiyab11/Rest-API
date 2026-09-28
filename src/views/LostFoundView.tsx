import React, { useEffect, useState } from 'react';
import {
  HelpCircle,
  Plus,
  MapPin,
  Clock,
  Phone,
  CheckCircle2,
  Trash2,
  Search,
} from 'lucide-react';
import { api } from '../api/client.js';
import { ILostFound } from '../types/index.js';
import { useAuth } from '../context/AuthContext.js';
import { useToast } from '../components/Toast.js';
import { Modal } from '../components/Modal.js';
import { ConfirmDialog } from '../components/ConfirmDialog.js';

export const LostFoundView: React.FC = () => {
  const { role, user } = useAuth();
  const { success, error } = useToast();

  const [items, setItems] = useState<ILostFound[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>('All');

  // Modals
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);
  const [itemToDelete, setItemToDelete] = useState<ILostFound | null>(null);

  const [reportForm, setReportForm] = useState({
    title: '',
    description: '',
    type: 'Lost' as 'Lost' | 'Found',
    category: 'Electronics',
    location: '',
    date: new Date().toISOString().split('T')[0],
    contactPhone: '+91 98401 22334',
  });

  const fetchItems = async () => {
    setLoading(true);
    try {
      let query = '/lost-found?';
      if (activeTab !== 'All') {
        if (activeTab === 'Claimed') query += 'status=Claimed&';
        else query += `type=${activeTab}&status=Open&`;
      }

      const { response } = await api.get(query);
      if (response.success && response.data) {
        setItems(response.data);
      }
    } catch (err: any) {
      error('Failed to load items', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [activeTab]);

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { response } = await api.post('/lost-found', reportForm);
    if (response.success) {
      success('Item Reported', `${reportForm.title} logged in Lost & Found registry`);
      setIsReportModalOpen(false);
      setReportForm({
        title: '',
        description: '',
        type: 'Lost',
        category: 'Electronics',
        location: '',
        date: new Date().toISOString().split('T')[0],
        contactPhone: '+91 98401 22334',
      });
      fetchItems();
    } else {
      error('Report Failed', response.message);
    }
  };

  const handleClaimItem = async (itemId: string, title: string) => {
    const { response } = await api.put(`/lost-found/${itemId}/claim`, {
      claimedBy: user?.name || 'Verified Campus Member',
    });
    if (response.success) {
      success('Item Claimed', `Marked ${title} as returned`);
      fetchItems();
    } else {
      error('Claim Failed', response.message);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;
    const { response } = await api.delete(`/lost-found/${itemToDelete._id}`);
    if (response.success) {
      success('Item Removed', 'Record purged from registry');
      setItemToDelete(null);
      fetchItems();
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
                <HelpCircle className="w-4 h-4" />
              </span>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                Campus Property Assistance
              </span>
            </div>
            <h1 className="text-2xl font-black text-emerald-950 dark:text-[#ecfdf5]">
              Lost & Found Assistance Desk
            </h1>
            <p className="text-xs text-emerald-700/80 dark:text-emerald-400/80 mt-1">
              Report misplaced items and track recovered articles via <code className="font-mono text-emerald-600 dark:text-emerald-300">/api/lost-found</code>
            </p>
          </div>

          <button
            onClick={() => setIsReportModalOpen(true)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all active:scale-98"
          >
            <Plus className="w-4 h-4" />
            <span>Report Item</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-white dark:bg-[#0e1913] border border-emerald-100/90 dark:border-emerald-900/60 w-fit">
        {['All', 'Lost', 'Found', 'Claimed'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              activeTab === tab
                ? 'bg-emerald-600 text-white dark:bg-emerald-500 dark:text-emerald-950 font-bold shadow-2xs'
                : 'text-emerald-900/80 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-[#13241c]'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-3 py-12 text-center text-xs text-emerald-700 dark:text-emerald-400">
            Querying lost & found records via REST API...
          </div>
        ) : items.length === 0 ? (
          <div className="col-span-3 py-12 text-center text-xs text-emerald-700 dark:text-emerald-400">
            No items logged under {activeTab}.
          </div>
        ) : (
          items.map(item => (
            <div
              key={item._id}
              className="p-5 rounded-2xl bg-white dark:bg-[#0e1913] border border-emerald-100/90 dark:border-emerald-900/60 shadow-xs flex flex-col justify-between hover:border-emerald-300 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold ${
                      item.type === 'Lost'
                        ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                        : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    }`}
                  >
                    {item.type.toUpperCase()}
                  </span>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      item.status === 'Claimed'
                        ? 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300'
                        : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    }`}
                  >
                    {item.status}
                  </span>
                </div>

                <h3 className="font-bold text-base text-emerald-950 dark:text-slate-100">
                  {item.title}
                </h3>
                <p className="text-xs text-emerald-800/80 dark:text-slate-300 mt-1.5 leading-relaxed">
                  {item.description}
                </p>

                <div className="mt-3 space-y-1 text-xs text-emerald-700 dark:text-emerald-400">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{item.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="font-mono">{item.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="font-mono">{item.contactPhone}</span>
                  </div>
                </div>

                {item.claimedBy && (
                  <div className="mt-3 p-2.5 rounded-xl bg-emerald-50 dark:bg-[#122219] text-[11px] text-emerald-900 dark:text-emerald-300">
                    Claimed & retrieved by: <strong>{item.claimedBy}</strong>
                  </div>
                )}
              </div>

              <div className="mt-5 pt-3 border-t border-emerald-100/60 dark:border-emerald-950/60 flex items-center justify-between">
                <span className="text-[11px] text-emerald-700/80 dark:text-emerald-400/80 truncate max-w-[150px]">
                  By {item.reportedBy}
                </span>

                <div className="flex items-center gap-2">
                  {item.status === 'Open' && (
                    <button
                      onClick={() => handleClaimItem(item._id, item.title)}
                      className="px-3 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs"
                    >
                      Mark as Claimed
                    </button>
                  )}
                  {role === 'Admin' && (
                    <button
                      onClick={() => setItemToDelete(item)}
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

      {/* Report Modal */}
      <Modal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        title="Report Lost or Found Item"
        subtitle="REST API: POST /api/lost-found"
      >
        <form onSubmit={handleReportSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-emerald-900 dark:text-emerald-200 mb-1">
                Report Type *
              </label>
              <select
                value={reportForm.type}
                onChange={e => setReportForm({ ...reportForm, type: e.target.value as any })}
                className="w-full px-3.5 py-2 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/20 dark:bg-[#0a120d] text-xs text-emerald-950 dark:text-slate-100 focus:outline-emerald-500"
              >
                <option value="Lost">I Lost Something</option>
                <option value="Found">I Found Something</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-emerald-900 dark:text-emerald-200 mb-1">
                Category *
              </label>
              <select
                value={reportForm.category}
                onChange={e => setReportForm({ ...reportForm, category: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/20 dark:bg-[#0a120d] text-xs text-emerald-950 dark:text-slate-100 focus:outline-emerald-500"
              >
                <option value="Electronics">Electronics</option>
                <option value="Books">Books & Stationery</option>
                <option value="ID Cards">ID Cards & Documents</option>
                <option value="Accessories">Accessories & Bags</option>
                <option value="Keys">Keys</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-emerald-900 dark:text-emerald-200 mb-1">
              Item Title *
            </label>
            <input
              type="text"
              required
              value={reportForm.title}
              onChange={e => setReportForm({ ...reportForm, title: e.target.value })}
              placeholder="e.g. Blue HP Pavilion Laptop Charger"
              className="w-full px-3.5 py-2 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/20 dark:bg-[#0a120d] text-xs text-emerald-950 dark:text-slate-100 focus:outline-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-emerald-900 dark:text-emerald-200 mb-1">
                Location *
              </label>
              <input
                type="text"
                required
                value={reportForm.location}
                onChange={e => setReportForm({ ...reportForm, location: e.target.value })}
                placeholder="e.g. Central Library 2nd Floor"
                className="w-full px-3.5 py-2 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/20 dark:bg-[#0a120d] text-xs text-emerald-950 dark:text-slate-100 focus:outline-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-emerald-900 dark:text-emerald-200 mb-1">
                Contact Phone
              </label>
              <input
                type="text"
                value={reportForm.contactPhone}
                onChange={e => setReportForm({ ...reportForm, contactPhone: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/20 dark:bg-[#0a120d] text-xs text-emerald-950 dark:text-slate-100 focus:outline-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-emerald-900 dark:text-emerald-200 mb-1">
              Description & Identifying Details *
            </label>
            <textarea
              required
              rows={3}
              value={reportForm.description}
              onChange={e => setReportForm({ ...reportForm, description: e.target.value })}
              placeholder="Brand, color, scratches, stickers, or unique marks..."
              className="w-full px-3.5 py-2 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/20 dark:bg-[#0a120d] text-xs text-emerald-950 dark:text-slate-100 focus:outline-emerald-500"
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-4 border-t border-emerald-100 dark:border-emerald-900/40">
            <button
              type="button"
              onClick={() => setIsReportModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold rounded-xl border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-slate-300 hover:bg-emerald-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
            >
              Submit Report
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Item Record"
        message="Are you sure you want to remove this lost & found entry?"
        confirmLabel="Delete"
      />
    </div>
  );
};
