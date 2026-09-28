import React, { useEffect, useState } from 'react';
import {
  Bus,
  MapPin,
  Clock,
  Phone,
  Radio,
  Navigation,
  RefreshCw,
  Zap,
} from 'lucide-react';
import { api } from '../api/client.js';
import { IBus } from '../types/index.js';
import { useAuth } from '../context/AuthContext.js';
import { useToast } from '../components/Toast.js';
import { Modal } from '../components/Modal.js';

export const BusView: React.FC = () => {
  const { role } = useAuth();
  const { success, error } = useToast();

  const [buses, setBuses] = useState<IBus[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedBus, setSelectedBus] = useState<IBus | null>(null);

  // Telemetry modal
  const [isTelemetryModalOpen, setIsTelemetryModalOpen] = useState<boolean>(false);
  const [telemetryForm, setTelemetryForm] = useState({
    busId: '',
    lat: 13.0827,
    lng: 80.2707,
    landmark: 'Central Station Junction',
    speedKmH: 42,
  });

  const fetchBuses = async () => {
    setLoading(true);
    try {
      const { response } = await api.get('/buses');
      if (response.success && response.data) {
        setBuses(response.data);
        if (!selectedBus && response.data.length > 0) {
          setSelectedBus(response.data[0]);
        }
      }
    } catch (err: any) {
      error('Failed to load bus fleet', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBuses();
  }, []);

  const handleUpdateTelemetrySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { response } = await api.post('/buses/location', telemetryForm);
    if (response.success) {
      success('GPS Telemetry Dispatched', `Updated ${telemetryForm.landmark} at ${telemetryForm.speedKmH} km/h`);
      setIsTelemetryModalOpen(false);
      fetchBuses();
    } else {
      error('Telemetry Update Failed', response.message);
    }
  };

  const handlePingLocation = async (busId: string) => {
    const { response, durationMs } = await api.get(`/buses/${busId}/location`);
    if (response.success) {
      success('Live GPS Received', `${response.data.location?.landmark} (${durationMs}ms)`);
      fetchBuses();
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
                <Bus className="w-4 h-4" />
              </span>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                Transit Fleet Telemetry
              </span>
            </div>
            <h1 className="text-2xl font-black text-emerald-950 dark:text-[#ecfdf5]">
              Campus Bus Fleet & Live GPS
            </h1>
            <p className="text-xs text-emerald-700/80 dark:text-emerald-400/80 mt-1">
              Real-time transit coordinates, stop sequences, and seat availability tracked via <code className="font-mono text-emerald-600 dark:text-emerald-300">/api/buses</code>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchBuses}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-50 text-xs font-semibold"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh Telemetry</span>
            </button>
            {(role === 'Faculty' || role === 'Admin') && (
              <button
                onClick={() => {
                  if (selectedBus) {
                    setTelemetryForm({
                      busId: selectedBus._id,
                      lat: selectedBus.currentLocation.lat + 0.002,
                      lng: selectedBus.currentLocation.lng + 0.002,
                      landmark: 'Approaching Next Campus Transit Gate',
                      speedKmH: 38,
                    });
                  }
                  setIsTelemetryModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs"
              >
                <Radio className="w-3.5 h-3.5" />
                <span>Simulate GPS Telemetry</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Grid: Bus Cards & Route Visualizer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Bus List (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 block">
            Fleet Schedule & Status
          </span>

          <div className="space-y-3">
            {buses.map(bus => {
              const isSelected = selectedBus?._id === bus._id;
              const occupancyPct = Math.round((bus.currentOccupancy / bus.capacity) * 100);

              return (
                <div
                  key={bus._id}
                  onClick={() => setSelectedBus(bus)}
                  className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-emerald-50/70 dark:bg-[#152a1e] border-emerald-500 shadow-md ring-1 ring-emerald-500/30'
                      : 'bg-white dark:bg-[#0e1913] border-emerald-100/80 dark:border-emerald-900/40 hover:border-emerald-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-sm text-emerald-950 dark:text-[#ecfdf5]">
                      {bus.busNumber}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                        bus.status === 'On Route'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : bus.status === 'Delayed'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300'
                      }`}
                    >
                      {bus.status}
                    </span>
                  </div>

                  <p className="text-xs text-emerald-800/80 dark:text-slate-300 line-clamp-2">
                    {bus.route}
                  </p>

                  <div className="mt-3 p-2.5 rounded-xl bg-white/80 dark:bg-[#0d1812] border border-emerald-100 dark:border-emerald-900/40 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-emerald-700 dark:text-emerald-400 font-medium">GPS Location:</span>
                      <span className="font-bold text-emerald-950 dark:text-emerald-100 truncate max-w-[170px]">
                        {bus.currentLocation?.landmark}
                      </span>
                    </div>
                    <div className="flex items-center justify-between font-mono text-[11px]">
                      <span className="text-emerald-700 dark:text-emerald-400">Speed / Occupancy:</span>
                      <span className="text-emerald-900 dark:text-emerald-300">
                        {bus.currentLocation?.speedKmH} km/h • {bus.currentOccupancy}/{bus.capacity} seats ({occupancyPct}%)
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Route Details & Visual Map Simulation (7 Cols) */}
        <div className="lg:col-span-7">
          {selectedBus ? (
            <div className="p-6 rounded-2xl bg-white dark:bg-[#0e1913] border border-emerald-100/90 dark:border-emerald-900/60 shadow-xs space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-emerald-100 dark:border-emerald-900/50">
                <div>
                  <h3 className="text-lg font-bold text-emerald-950 dark:text-[#ecfdf5]">
                    {selectedBus.busNumber} Route & Stops Telemetry
                  </h3>
                  <p className="text-xs text-emerald-700/80 dark:text-emerald-400/80 font-mono">
                    Departure: {selectedBus.departureTime} • ETA: {selectedBus.arrivalTime}
                  </p>
                </div>

                <button
                  onClick={() => handlePingLocation(selectedBus._id)}
                  className="px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800 text-xs font-semibold text-emerald-800 dark:text-emerald-300 hover:bg-emerald-50 transition-colors"
                >
                  Ping GPS Live
                </button>
              </div>

              {/* Driver & Contact Card */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-emerald-50/60 dark:bg-[#122219] border border-emerald-100 dark:border-emerald-900/40">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                    {selectedBus.driverName[0]}
                  </div>
                  <div>
                    <div className="font-bold text-xs text-emerald-950 dark:text-[#ecfdf5]">
                      {selectedBus.driverName}
                    </div>
                    <div className="text-[11px] text-emerald-700 dark:text-emerald-400">
                      Assigned Campus Transit Driver
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-emerald-800 dark:text-emerald-300">
                  <Phone className="w-3.5 h-3.5" />
                  <span>{selectedBus.driverPhone}</span>
                </div>
              </div>

              {/* Route Sequence Timeline */}
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 block mb-3">
                  Scheduled Transit Stops
                </span>

                <div className="relative pl-6 space-y-4 border-l-2 border-emerald-200 dark:border-emerald-800/80 ml-3">
                  {selectedBus.stops.map((stop, idx) => {
                    const isPassed = idx === 0;
                    return (
                      <div key={idx} className="relative">
                        <div
                          className={`absolute -left-[31px] top-0.5 w-4 h-4 rounded-full border-2 border-white dark:border-[#0e1913] ${
                            isPassed
                              ? 'bg-emerald-500'
                              : 'bg-emerald-200 dark:bg-emerald-900'
                          }`}
                        />
                        <div className="text-xs font-bold text-emerald-950 dark:text-slate-100">
                          {stop}
                        </div>
                        <div className="text-[10px] text-emerald-700/80 dark:text-emerald-400/80">
                          {idx === 0 ? 'Departed on schedule' : idx === selectedBus.stops.length - 1 ? 'Destination Terminal' : 'Transit Stop'}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Live Coordinates Box */}
              <div className="p-4 rounded-xl bg-emerald-950 text-emerald-100 font-mono text-xs space-y-1">
                <div className="flex items-center justify-between text-emerald-300">
                  <span>GPS LATITUDE:</span>
                  <span>{selectedBus.currentLocation?.lat}</span>
                </div>
                <div className="flex items-center justify-between text-emerald-300">
                  <span>GPS LONGITUDE:</span>
                  <span>{selectedBus.currentLocation?.lng}</span>
                </div>
                <div className="flex items-center justify-between text-emerald-400">
                  <span>LAST TELEMETRY UPDATE:</span>
                  <span>{new Date(selectedBus.currentLocation?.lastUpdated || '').toLocaleTimeString()}</span>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {/* Telemetry Simulator Modal */}
      <Modal
        isOpen={isTelemetryModalOpen}
        onClose={() => setIsTelemetryModalOpen(false)}
        title="Simulate Bus GPS Telemetry"
        subtitle="REST API: POST /api/buses/location"
      >
        <form onSubmit={handleUpdateTelemetrySubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-emerald-900 dark:text-emerald-200 mb-1">
              Select Bus Fleet *
            </label>
            <select
              value={telemetryForm.busId}
              onChange={e => setTelemetryForm({ ...telemetryForm, busId: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/20 dark:bg-[#0a120d] text-xs text-emerald-950 dark:text-slate-100 focus:outline-emerald-500"
            >
              {buses.map(b => (
                <option key={b._id} value={b._id}>
                  {b.busNumber} ({b.driverName})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-emerald-900 dark:text-emerald-200 mb-1">
              Current Landmark Description *
            </label>
            <input
              type="text"
              required
              value={telemetryForm.landmark}
              onChange={e => setTelemetryForm({ ...telemetryForm, landmark: e.target.value })}
              placeholder="e.g. Passing Anna Nagar East Flyover"
              className="w-full px-3.5 py-2 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/20 dark:bg-[#0a120d] text-xs text-emerald-950 dark:text-slate-100 focus:outline-emerald-500"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-emerald-900 dark:text-emerald-200 mb-1">
                Latitude
              </label>
              <input
                type="number"
                step="0.0001"
                value={telemetryForm.lat}
                onChange={e => setTelemetryForm({ ...telemetryForm, lat: parseFloat(e.target.value) })}
                className="w-full px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/20 dark:bg-[#0a120d] text-xs font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-emerald-900 dark:text-emerald-200 mb-1">
                Longitude
              </label>
              <input
                type="number"
                step="0.0001"
                value={telemetryForm.lng}
                onChange={e => setTelemetryForm({ ...telemetryForm, lng: parseFloat(e.target.value) })}
                className="w-full px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/20 dark:bg-[#0a120d] text-xs font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-emerald-900 dark:text-emerald-200 mb-1">
                Speed (km/h)
              </label>
              <input
                type="number"
                value={telemetryForm.speedKmH}
                onChange={e => setTelemetryForm({ ...telemetryForm, speedKmH: parseInt(e.target.value) })}
                className="w-full px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/20 dark:bg-[#0a120d] text-xs font-mono"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-4 border-t border-emerald-100 dark:border-emerald-900/40">
            <button
              type="button"
              onClick={() => setIsTelemetryModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold rounded-xl border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-slate-300 hover:bg-emerald-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
            >
              Dispatch Coordinates
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
