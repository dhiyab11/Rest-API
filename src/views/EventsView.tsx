import React, { useEffect, useState } from 'react';
import {
  Calendar,
  Plus,
  MapPin,
  Clock,
  Users,
  CheckCircle2,
  Trash2,
  Tag,
  Sparkles,
} from 'lucide-react';
import { api } from '../api/client.js';
import { IEvent } from '../types/index.js';
import { useAuth } from '../context/AuthContext.js';
import { useToast } from '../components/Toast.js';
import { Modal } from '../components/Modal.js';
import { ConfirmDialog } from '../components/ConfirmDialog.js';

export const EventsView: React.FC = () => {
  const { role, user } = useAuth();
  const { success, error } = useToast();

  const [events, setEvents] = useState<IEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isPublishModalOpen, setIsPublishModalOpen] = useState<boolean>(false);
  const [eventToDelete, setEventToDelete] = useState<IEvent | null>(null);
  const [registeringId, setRegisteringId] = useState<string | null>(null);

  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    category: 'Workshop' as any,
    venue: '',
    date: new Date().toISOString().split('T')[0],
    time: '10:00 AM - 01:00 PM',
    capacity: 100,
    bannerUrl: '',
  });

  const categories = ['All', 'Workshop', 'Hackathon', 'Cultural', 'Sports', 'Seminar'];

  const fetchEvents = async () => {
    setLoading(true);
    try {
      let query = '/events?';
      if (selectedCategory !== 'All') query += `category=${encodeURIComponent(selectedCategory)}&`;

      const { response } = await api.get(query);
      if (response.success && response.data) {
        setEvents(response.data);
      }
    } catch (err: any) {
      error('Failed to load events', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [selectedCategory]);

  const handleRegisterEvent = async (eventId: string, title: string) => {
    setRegisteringId(eventId);
    const { response, durationMs } = await api.post(`/events/${eventId}/register`);
    setRegisteringId(null);
    if (response.success) {
      success('Registered Successfully', `Confirmed for ${title} (${durationMs}ms)`);
      fetchEvents();
    } else {
      error('Registration Failed', response.message);
    }
  };

  const handlePublishSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { response } = await api.post('/events', eventForm);
    if (response.success) {
      success('Event Published', `${eventForm.title} added to campus calendar`);
      setIsPublishModalOpen(false);
      setEventForm({
        title: '',
        description: '',
        category: 'Workshop',
        venue: '',
        date: new Date().toISOString().split('T')[0],
        time: '10:00 AM - 01:00 PM',
        capacity: 100,
        bannerUrl: '',
      });
      fetchEvents();
    } else {
      error('Publishing Failed', response.message);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!eventToDelete) return;
    const { response } = await api.delete(`/events/${eventToDelete._id}`);
    if (response.success) {
      success('Event Cancelled', 'Event record was removed');
      setEventToDelete(null);
      fetchEvents();
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
                <Calendar className="w-4 h-4" />
              </span>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                Campus Student Life & Technical Fests
              </span>
            </div>
            <h1 className="text-2xl font-black text-emerald-950 dark:text-[#ecfdf5]">
              Campus Events & Hackathons
            </h1>
            <p className="text-xs text-emerald-700/80 dark:text-emerald-400/80 mt-1">
              Discover workshops, register seat quotas, and coordinate symposiums via <code className="font-mono text-emerald-600 dark:text-emerald-300">/api/events</code>
            </p>
          </div>

          {(role === 'Faculty' || role === 'Admin') && (
            <button
              onClick={() => setIsPublishModalOpen(true)}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all active:scale-98"
            >
              <Plus className="w-4 h-4" />
              <span>Publish New Event</span>
            </button>
          )}
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              selectedCategory === cat
                ? 'bg-emerald-600 text-white dark:bg-emerald-500 dark:text-emerald-950 font-bold shadow-2xs'
                : 'bg-white dark:bg-[#0e1913] border border-emerald-100 dark:border-emerald-900/60 text-emerald-800/80 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-[#13241c]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-3 py-12 text-center text-xs text-emerald-700 dark:text-emerald-400">
            Querying campus events catalog via REST API...
          </div>
        ) : events.length === 0 ? (
          <div className="col-span-3 py-12 text-center text-xs text-emerald-700 dark:text-emerald-400">
            No events found under {selectedCategory}.
          </div>
        ) : (
          events.map(evt => {
            const registeredCount = evt.registeredStudents?.length || 0;
            const percentageFilled = Math.min(Math.round((registeredCount / evt.capacity) * 100), 100);
            const isUserRegistered = evt.registeredStudents?.includes(user?.referenceId || '') || evt.isRegistered;

            return (
              <div
                key={evt._id}
                className="rounded-2xl bg-white dark:bg-[#0e1913] border border-emerald-100/90 dark:border-emerald-900/60 shadow-xs overflow-hidden flex flex-col justify-between hover:border-emerald-300 transition-colors"
              >
                <div>
                  {/* Event Banner */}
                  <div className="h-36 relative overflow-hidden bg-emerald-950">
                    <img
                      src={
                        evt.bannerUrl ||
                        'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600&auto=format&fit=crop&q=80'
                      }
                      alt={evt.title}
                      className="w-full h-full object-cover opacity-80 hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold bg-emerald-950/90 text-emerald-300 backdrop-blur-xs border border-emerald-500/40">
                        {evt.category}
                      </span>
                    </div>
                    {role === 'Admin' && (
                      <button
                        onClick={() => setEventToDelete(evt)}
                        className="absolute top-3 right-3 p-1.5 rounded-lg bg-rose-950/80 text-rose-300 hover:bg-rose-900 transition-colors"
                        title="Cancel Event"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Body Content */}
                  <div className="p-5 space-y-3">
                    <h3 className="font-bold text-base text-emerald-950 dark:text-[#ecfdf5] leading-snug">
                      {evt.title}
                    </h3>

                    <p className="text-xs text-emerald-800/80 dark:text-slate-300 line-clamp-2 leading-relaxed">
                      {evt.description}
                    </p>

                    <div className="space-y-1 text-xs text-emerald-700 dark:text-emerald-400">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="truncate">{evt.venue}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="font-mono">{evt.date} • {evt.time}</span>
                      </div>
                    </div>

                    {/* Capacity Progress Bar */}
                    <div className="pt-2">
                      <div className="flex items-center justify-between text-[11px] mb-1">
                        <span className="text-emerald-700 dark:text-emerald-400 font-semibold">Seat Quota</span>
                        <span className="font-mono text-emerald-900 dark:text-emerald-200">
                          {registeredCount} / {evt.capacity} ({percentageFilled}%)
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-emerald-100 dark:bg-emerald-950 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-emerald-500"
                          style={{ width: `${percentageFilled}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="p-5 pt-0">
                  {isUserRegistered ? (
                    <div className="w-full py-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center justify-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span>Registration Confirmed</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleRegisterEvent(evt._id, evt.title)}
                      disabled={registeringId === evt._id || registeredCount >= evt.capacity}
                      className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs active:scale-98 transition-all disabled:opacity-50"
                    >
                      {registeringId === evt._id
                        ? 'Registering...'
                        : registeredCount >= evt.capacity
                        ? 'Event Full'
                        : 'Register for Event'}
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Publish Event Modal */}
      <Modal
        isOpen={isPublishModalOpen}
        onClose={() => setIsPublishModalOpen(false)}
        title="Publish Campus Event"
        subtitle="REST API: POST /api/events"
      >
        <form onSubmit={handlePublishSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-emerald-900 dark:text-emerald-200 mb-1">
              Event Title *
            </label>
            <input
              type="text"
              required
              value={eventForm.title}
              onChange={e => setEventForm({ ...eventForm, title: e.target.value })}
              placeholder="e.g. AI & Robotics Symposium 2026"
              className="w-full px-3.5 py-2 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/20 dark:bg-[#0a120d] text-xs text-emerald-950 dark:text-slate-100 focus:outline-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-emerald-900 dark:text-emerald-200 mb-1">
                Category *
              </label>
              <select
                value={eventForm.category}
                onChange={e => setEventForm({ ...eventForm, category: e.target.value as any })}
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
                Capacity Seats *
              </label>
              <input
                type="number"
                min="10"
                max="1000"
                required
                value={eventForm.capacity}
                onChange={e => setEventForm({ ...eventForm, capacity: parseInt(e.target.value) })}
                className="w-full px-3.5 py-2 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/20 dark:bg-[#0a120d] text-xs text-emerald-950 dark:text-slate-100 focus:outline-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-emerald-900 dark:text-emerald-200 mb-1">
              Venue Location *
            </label>
            <input
              type="text"
              required
              value={eventForm.venue}
              onChange={e => setEventForm({ ...eventForm, venue: e.target.value })}
              placeholder="e.g. APJ Abdul Kalam Auditorium"
              className="w-full px-3.5 py-2 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/20 dark:bg-[#0a120d] text-xs text-emerald-950 dark:text-slate-100 focus:outline-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-emerald-900 dark:text-emerald-200 mb-1">
                Date *
              </label>
              <input
                type="date"
                required
                value={eventForm.date}
                onChange={e => setEventForm({ ...eventForm, date: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/20 dark:bg-[#0a120d] text-xs text-emerald-950 dark:text-slate-100 focus:outline-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-emerald-900 dark:text-emerald-200 mb-1">
                Time Slot
              </label>
              <input
                type="text"
                value={eventForm.time}
                onChange={e => setEventForm({ ...eventForm, time: e.target.value })}
                placeholder="10:00 AM - 01:00 PM"
                className="w-full px-3.5 py-2 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/20 dark:bg-[#0a120d] text-xs text-emerald-950 dark:text-slate-100 focus:outline-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-emerald-900 dark:text-emerald-200 mb-1">
              Description *
            </label>
            <textarea
              required
              rows={3}
              value={eventForm.description}
              onChange={e => setEventForm({ ...eventForm, description: e.target.value })}
              placeholder="Event agenda, keynote speaker details, prerequisites..."
              className="w-full px-3.5 py-2 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/20 dark:bg-[#0a120d] text-xs text-emerald-950 dark:text-slate-100 focus:outline-emerald-500"
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-4 border-t border-emerald-100 dark:border-emerald-900/40">
            <button
              type="button"
              onClick={() => setIsPublishModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold rounded-xl border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-slate-300 hover:bg-emerald-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
            >
              Publish Event
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!eventToDelete}
        onClose={() => setEventToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title="Cancel Campus Event"
        message={`Are you sure you want to cancel ${eventToDelete?.title}? Registered attendees will be notified.`}
        confirmLabel="Cancel Event"
      />
    </div>
  );
};
