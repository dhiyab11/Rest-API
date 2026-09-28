import React, { useEffect, useState } from 'react';
import {
  DoorOpen,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  Users,
  Building,
  Plus,
  Trash2,
} from 'lucide-react';
import { api } from '../api/client.js';
import { IClassroom } from '../types/index.js';
import { useAuth } from '../context/AuthContext.js';
import { useToast } from '../components/Toast.js';
import { Modal } from '../components/Modal.js';

export const ClassroomsView: React.FC = () => {
  const { role } = useAuth();
  const { success, error } = useToast();

  const [classrooms, setClassrooms] = useState<IClassroom[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [onlyAvailable, setOnlyAvailable] = useState<boolean>(false);
  const [selectedBlock, setSelectedBlock] = useState<string>('All');

  // Booking Modal
  const [isBookingModalOpen, setIsBookingModalOpen] = useState<boolean>(false);
  const [selectedRoomToBook, setSelectedRoomToBook] = useState<IClassroom | null>(null);
  const [bookingForm, setBookingForm] = useState({
    roomNumber: '',
    date: new Date().toISOString().split('T')[0],
    timeSlot: '02:00 PM - 04:00 PM',
    purpose: '',
  });

  const blocks = ['All', 'Newton Block', 'Turing Block', 'Raman Block'];

  const fetchClassrooms = async () => {
    setLoading(true);
    try {
      const endpoint = onlyAvailable ? '/classrooms/available' : '/classrooms';
      const { response } = await api.get(endpoint);
      if (response.success && response.data) {
        setClassrooms(response.data);
      }
    } catch (err: any) {
      error('Failed to load classrooms', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClassrooms();
  }, [onlyAvailable]);

  const handleOpenBookModal = (room: IClassroom) => {
    setSelectedRoomToBook(room);
    setBookingForm({
      roomNumber: room.roomNumber,
      date: new Date().toISOString().split('T')[0],
      timeSlot: '02:00 PM - 04:00 PM',
      purpose: '',
    });
    setIsBookingModalOpen(true);
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { response, durationMs } = await api.post('/classrooms/book', bookingForm);
    if (response.success) {
      success('Classroom Reserved', `${bookingForm.roomNumber} booked (${durationMs}ms)`);
      setIsBookingModalOpen(false);
      fetchClassrooms();
    } else {
      error('Booking Failed', response.message);
    }
  };

  const handleCancelBooking = async (bookingId: string, roomNum: string) => {
    const { response } = await api.delete(`/classrooms/booking/${bookingId}`);
    if (response.success) {
      success('Booking Released', `${roomNum} is now available`);
      fetchClassrooms();
    } else {
      error('Cancellation Failed', response.message);
    }
  };

  const filtered = selectedBlock === 'All'
    ? classrooms
    : classrooms.filter(c => c.block.includes(selectedBlock.replace(' Block', '')));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#0e1913] border border-emerald-100/90 dark:border-emerald-900/60 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400">
                <DoorOpen className="w-4 h-4" />
              </span>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                Campus Facilities & Labs
              </span>
            </div>
            <h1 className="text-2xl font-black text-emerald-950 dark:text-[#ecfdf5]">
              Classroom & Laboratory Allocations
            </h1>
            <p className="text-xs text-emerald-700/80 dark:text-emerald-400/80 mt-1">
              Check real-time hall availability and reserve slots via <code className="font-mono text-emerald-600 dark:text-emerald-300">/api/classrooms</code>
            </p>
          </div>
        </div>
      </div>

      {/* Filter bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#0e1913] border border-emerald-100/90 dark:border-emerald-900/60 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {blocks.map(b => (
            <button
              key={b}
              onClick={() => setSelectedBlock(b)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedBlock === b
                  ? 'bg-emerald-600 text-white dark:bg-emerald-500 dark:text-emerald-950 font-bold'
                  : 'bg-emerald-50/50 dark:bg-[#0c1611] text-emerald-800/80 dark:text-slate-300 hover:bg-emerald-100'
              }`}
            >
              {b}
            </button>
          ))}
        </div>

        <label className="flex items-center gap-2 text-xs font-bold text-emerald-900 dark:text-emerald-200 cursor-pointer">
          <input
            type="checkbox"
            checked={onlyAvailable}
            onChange={e => setOnlyAvailable(e.target.checked)}
            className="rounded text-emerald-600 focus:ring-emerald-500"
          />
          <span>Show Vacant / Available Rooms Only</span>
        </label>
      </div>

      {/* Classrooms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-3 py-12 text-center text-xs text-emerald-700 dark:text-emerald-400">
            Querying classrooms via REST API...
          </div>
        ) : filtered.length === 0 ? (
          <div className="col-span-3 py-12 text-center text-xs text-emerald-700 dark:text-emerald-400">
            No classrooms found matching filter criteria.
          </div>
        ) : (
          filtered.map(room => (
            <div
              key={room._id}
              className="p-5 rounded-2xl bg-white dark:bg-[#0e1913] border border-emerald-100/90 dark:border-emerald-900/60 shadow-xs flex flex-col justify-between hover:border-emerald-300 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold">
                    {room.type}
                  </span>

                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      room.isAvailable
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                    }`}
                  >
                    {room.isAvailable ? (
                      <>
                        <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                        <span>Available</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3 h-3 text-rose-600 dark:text-rose-400" />
                        <span>Occupied</span>
                      </>
                    )}
                  </span>
                </div>

                <h3 className="font-black text-xl text-emerald-950 dark:text-[#ecfdf5]">
                  {room.roomNumber}
                </h3>
                <p className="text-xs text-emerald-700/80 dark:text-emerald-400/80 mt-0.5">
                  {room.block} • Capacity: {room.capacity} students
                </p>

                {/* Facilities tags */}
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {room.facilities.map((fac, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-[#132219] text-emerald-800 dark:text-emerald-300 border border-emerald-200/40 dark:border-emerald-900/40"
                    >
                      {fac}
                    </span>
                  ))}
                </div>

                {/* Booking details if occupied */}
                {room.currentBooking && (
                  <div className="mt-3 p-3 rounded-xl bg-rose-50/60 dark:bg-[#1f1013] border border-rose-200/50 dark:border-rose-900/40 text-xs space-y-1">
                    <div className="font-bold text-rose-950 dark:text-rose-200">
                      Reserved by {room.currentBooking.facultyName}
                    </div>
                    <div className="text-[11px] text-rose-800/80 dark:text-rose-300/80">
                      {room.currentBooking.purpose}
                    </div>
                    <div className="text-[10px] font-mono text-rose-700 dark:text-rose-400">
                      {room.currentBooking.startTime} - {room.currentBooking.endTime}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Button */}
              <div className="mt-5 pt-3 border-t border-emerald-100/60 dark:border-emerald-950/60">
                {room.isAvailable ? (
                  <button
                    onClick={() => handleOpenBookModal(room)}
                    className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs active:scale-98 transition-all"
                  >
                    Reserve Classroom
                  </button>
                ) : (
                  (role === 'Faculty' || role === 'Admin') && room.currentBooking ? (
                    <button
                      onClick={() => handleCancelBooking(room.currentBooking!.bookingId, room.roomNumber)}
                      className="w-full py-2 rounded-xl border border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300 hover:bg-rose-50 text-xs font-bold transition-colors"
                    >
                      Release / Cancel Booking
                    </button>
                  ) : (
                    <div className="text-center py-2 text-xs text-rose-600/80 dark:text-rose-400 font-medium">
                      In session until scheduled end
                    </div>
                  )
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Book Classroom Modal */}
      <Modal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        title={`Reserve Room ${selectedRoomToBook?.roomNumber}`}
        subtitle="REST API: POST /api/classrooms/book"
      >
        <form onSubmit={handleBookingSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-emerald-900 dark:text-emerald-200 mb-1">
              Booking Purpose *
            </label>
            <input
              type="text"
              required
              value={bookingForm.purpose}
              onChange={e => setBookingForm({ ...bookingForm, purpose: e.target.value })}
              placeholder="e.g. Distributed Systems Lab Practice Session"
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
                value={bookingForm.date}
                onChange={e => setBookingForm({ ...bookingForm, date: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/20 dark:bg-[#0a120d] text-xs text-emerald-950 dark:text-slate-100 focus:outline-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-emerald-900 dark:text-emerald-200 mb-1">
                Time Slot *
              </label>
              <select
                value={bookingForm.timeSlot}
                onChange={e => setBookingForm({ ...bookingForm, timeSlot: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/20 dark:bg-[#0a120d] text-xs text-emerald-950 dark:text-slate-100 focus:outline-emerald-500"
              >
                <option value="09:00 AM - 11:00 AM">09:00 AM - 11:00 AM</option>
                <option value="11:00 AM - 01:00 PM">11:00 AM - 01:00 PM</option>
                <option value="02:00 PM - 04:00 PM">02:00 PM - 04:00 PM</option>
                <option value="04:00 PM - 06:00 PM">04:00 PM - 06:00 PM</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-4 border-t border-emerald-100 dark:border-emerald-900/40">
            <button
              type="button"
              onClick={() => setIsBookingModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold rounded-xl border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-slate-300 hover:bg-emerald-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
            >
              Confirm Reservation
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
