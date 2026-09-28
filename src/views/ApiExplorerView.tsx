import React, { useState } from 'react';
import {
  Code2,
  Play,
  Copy,
  Check,
  Clock,
  Send,
  Sparkles,
  Layers,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  BookOpen,
} from 'lucide-react';
import { api } from '../api/client.js';
import { useAuth } from '../context/AuthContext.js';
import { useToast } from '../components/Toast.js';

interface EndpointPreset {
  id: string;
  name: string;
  category: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  endpoint: string;
  description: string;
  defaultBody?: any;
}

const PRESETS: EndpointPreset[] = [
  // Authentication
  {
    id: 'auth-me',
    name: 'Get Current Authenticated User',
    category: 'Authentication',
    method: 'GET',
    endpoint: '/api/auth/me',
    description: 'Retrieves active user profile and permissions from JWT token.',
  },
  {
    id: 'auth-login',
    name: 'Login as Demo Student',
    category: 'Authentication',
    method: 'POST',
    endpoint: '/api/auth/login',
    description: 'Authenticates student credentials and returns a secure JWT bearer token.',
    defaultBody: {
      email: 'student@smartcampus.edu',
      password: 'password123',
    },
  },
  // Students
  {
    id: 'students-list',
    name: 'List Students (Query & Filter)',
    category: 'Students',
    method: 'GET',
    endpoint: '/api/students?department=Computer Science & Engineering',
    description: 'Returns enrolled students filtered by department query parameter.',
  },
  {
    id: 'students-create',
    name: 'Enroll New Student',
    category: 'Students',
    method: 'POST',
    endpoint: '/api/students',
    description: 'Enrolls a new student profile into the system database.',
    defaultBody: {
      name: 'Sneha Venkatesh',
      email: 'sneha.v@smartcampus.edu',
      phone: '+91 98401 99988',
      department: 'Artificial Intelligence & Data Science',
      year: 2,
      semester: 4,
      cgpa: 9.15,
      hostelResident: true,
      roomNumber: 'Kaveri-408',
    },
  },
  {
    id: 'student-get-id',
    name: 'Get Student by ID with Full History',
    category: 'Students',
    method: 'GET',
    endpoint: '/api/students/65f1a2b3c4d5e6f7a8b9c101',
    description: 'Fetches profile, enrolled courses, attendance analytics, and filed complaints.',
  },
  // Attendance
  {
    id: 'attendance-list',
    name: 'Query Attendance Records',
    category: 'Attendance',
    method: 'GET',
    endpoint: '/api/attendance?studentId=STU202401',
    description: 'Retrieves attendance logs for a specific student ID.',
  },
  {
    id: 'attendance-mark',
    name: 'Mark Student Class Attendance',
    category: 'Attendance',
    method: 'POST',
    endpoint: '/api/attendance',
    description: 'Records classroom session attendance status (Present, Absent, Late, Excused).',
    defaultBody: {
      studentId: 'STU202401',
      subjectCode: 'CS301',
      subjectName: 'Data Structures & Algorithms',
      status: 'Present',
      date: new Date().toISOString().split('T')[0],
    },
  },
  // Complaints
  {
    id: 'complaints-list',
    name: 'List All Grievances',
    category: 'Complaints',
    method: 'GET',
    endpoint: '/api/complaints',
    description: 'Lists complaints across campus departments with resolution status.',
  },
  {
    id: 'complaints-submit',
    name: 'Submit Grievance / Complaint',
    category: 'Complaints',
    method: 'POST',
    endpoint: '/api/complaints',
    description: 'Creates a tracked campus complaint ticket with priority triage.',
    defaultBody: {
      title: 'Classroom LH-202 Projector Bulb Flicker',
      description: 'The overhead projection unit flickers intermittently during lectures.',
      category: 'Infrastructure',
      priority: 'Medium',
    },
  },
  // Events
  {
    id: 'events-list',
    name: 'Get Campus Events Catalog',
    category: 'Events',
    method: 'GET',
    endpoint: '/api/events',
    description: 'Returns scheduled hackathons, technical symposiums, and cultural fests.',
  },
  {
    id: 'events-register',
    name: 'Register for SmartHack 2026',
    category: 'Events',
    method: 'POST',
    endpoint: '/api/events/65f1a2b3c4d5e6f7a8b9c301/register',
    description: 'Registers the active logged-in student for the campus hackathon.',
  },
  // Transit Bus
  {
    id: 'bus-list',
    name: 'Get Campus Transit Bus Fleet',
    category: 'Campus Transit',
    method: 'GET',
    endpoint: '/api/buses',
    description: 'Fetches live transit buses, routes, occupancy, and current GPS coordinates.',
  },
  {
    id: 'bus-location-update',
    name: 'Push Live Bus GPS Telemetry',
    category: 'Campus Transit',
    method: 'POST',
    endpoint: '/api/buses/location',
    description: 'Simulates onboard IoT GPS tracker pushing real-time location to backend.',
    defaultBody: {
      busId: '65f1a2b3c4d5e6f7a8b9c401',
      lat: 13.0835,
      lng: 80.272,
      landmark: 'Anna Nagar 2nd Avenue Roundabout',
      speedKmH: 44,
    },
  },
  // Classrooms
  {
    id: 'classrooms-available',
    name: 'Check Available Classrooms',
    category: 'Classrooms',
    method: 'GET',
    endpoint: '/api/classrooms/available',
    description: 'Filters classrooms that are currently vacant and ready for booking.',
  },
  {
    id: 'classrooms-book',
    name: 'Book Lecture Hall LH-101',
    category: 'Classrooms',
    method: 'POST',
    endpoint: '/api/classrooms/book',
    description: 'Reserves an engineering block lecture hall for guest lectures or project demos.',
    defaultBody: {
      roomNumber: 'LH-101',
      date: new Date().toISOString().split('T')[0],
      timeSlot: '03:00 PM - 05:00 PM',
      purpose: 'Guest Lecture: Cloud Infrastructure Architecture',
    },
  },
  // Notifications
  {
    id: 'notifications-list',
    name: 'Get Broadcast Campus Notices',
    category: 'Notifications',
    method: 'GET',
    endpoint: '/api/notifications',
    description: 'Fetches announcements published by administration and faculty.',
  },
  // Lost & Found
  {
    id: 'lost-found-list',
    name: 'Get Lost & Found Catalog',
    category: 'Lost & Found',
    method: 'GET',
    endpoint: '/api/lost-found',
    description: 'Retrieves lost and found items submitted by students and staff.',
  },
  // Dashboard & Analytics
  {
    id: 'dashboard-statistics',
    name: 'Get REST API Performance Telemetry',
    category: 'System Telemetry',
    method: 'GET',
    endpoint: '/api/dashboard/statistics',
    description: 'Calculates live endpoint latencies, status code distributions, and cache counts.',
  },
];

interface ExecutionResult {
  method: string;
  url: string;
  statusCode: number;
  durationMs: number;
  timestamp: string;
  requestBody?: any;
  responseBody: any;
}

export const ApiExplorerView: React.FC = () => {
  const { role } = useAuth();
  const { success, error } = useToast();

  const [selectedPresetId, setSelectedPresetId] = useState<string>('students-list');
  const [method, setMethod] = useState<'GET' | 'POST' | 'PUT' | 'DELETE'>('GET');
  const [endpoint, setEndpoint] = useState<string>('/api/students?department=Computer Science & Engineering');
  const [requestBodyText, setRequestBodyText] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const [lastResult, setLastResult] = useState<ExecutionResult | null>({
    method: 'GET',
    url: '/api/students?department=Computer Science & Engineering',
    statusCode: 200,
    durationMs: 14.8,
    timestamp: new Date().toLocaleTimeString(),
    responseBody: {
      success: true,
      message: 'Students retrieved successfully',
      statusCode: 200,
      total: 4,
      data: [
        {
          _id: '65f1a2b3c4d5e6f7a8b9c101',
          studentId: 'STU202401',
          name: 'Priya Sharma',
          email: 'student@smartcampus.edu',
          department: 'Computer Science & Engineering',
          year: 3,
          semester: 6,
          cgpa: 8.92,
          attendanceRate: 88.5,
        },
      ],
    },
  });

  const [history, setHistory] = useState<ExecutionResult[]>([]);

  const handleSelectPreset = (preset: EndpointPreset) => {
    setSelectedPresetId(preset.id);
    setMethod(preset.method);
    setEndpoint(preset.endpoint);
    if (preset.defaultBody) {
      setRequestBodyText(JSON.stringify(preset.defaultBody, null, 2));
    } else {
      setRequestBodyText('');
    }
  };

  const handleExecuteRequest = async () => {
    setLoading(true);
    let parsedBody: any = undefined;

    if (method !== 'GET' && requestBodyText.trim()) {
      try {
        parsedBody = JSON.parse(requestBodyText);
      } catch (err: any) {
        setLoading(false);
        error('Invalid JSON Request Body', err.message);
        return;
      }
    }

    try {
      let result;
      if (method === 'GET') {
        result = await api.get(endpoint);
      } else if (method === 'POST') {
        result = await api.post(endpoint, parsedBody);
      } else if (method === 'PUT') {
        result = await api.put(endpoint, parsedBody);
      } else {
        result = await api.delete(endpoint);
      }

      const execResult: ExecutionResult = {
        method,
        url: endpoint,
        statusCode: result.response.statusCode,
        durationMs: result.durationMs,
        timestamp: new Date().toLocaleTimeString(),
        requestBody: parsedBody,
        responseBody: result.response,
      };

      setLastResult(execResult);
      setHistory(prev => [execResult, ...prev.slice(0, 9)]);

      if (result.response.success) {
        success(`HTTP ${result.response.statusCode} Success`, `${method} ${endpoint} (${result.durationMs}ms)`);
      } else {
        error(`HTTP ${result.response.statusCode} Error`, result.response.message);
      }
    } catch (err: any) {
      error('Request Execution Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyResponse = () => {
    if (!lastResult) return;
    navigator.clipboard.writeText(JSON.stringify(lastResult.responseBody, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const methodColors: Record<string, string> = {
    GET: 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800',
    POST: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800',
    PUT: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800',
    DELETE: 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-800',
  };

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#0e1913] border border-emerald-100/90 dark:border-emerald-900/60 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400">
                <Code2 className="w-4 h-4" />
              </span>
              <span className="text-xs font-mono font-bold tracking-wide uppercase text-emerald-700 dark:text-emerald-400">
                Interactive Developer Suite
              </span>
            </div>
            <h1 className="text-2xl font-black text-emerald-950 dark:text-[#ecfdf5]">
              REST API Explorer & Playground
            </h1>
            <p className="text-xs text-emerald-700/80 dark:text-emerald-400/80 mt-1 max-w-2xl">
              Inspect HTTP methods, customize URL query parameters, supply JSON payloads, measure server response latency in milliseconds, and verify real-time status codes directly.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-3.5 py-2 rounded-xl bg-emerald-50 dark:bg-[#13241c] border border-emerald-200/60 dark:border-emerald-900/60 text-xs font-mono">
              <span className="text-emerald-700 dark:text-emerald-400 font-semibold">Active Auth: </span>
              <span className="font-bold text-emerald-950 dark:text-emerald-200">{role} Role JWT</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Preset Picker & Interactive Request Console */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Preset Endpoints Catalog (4 Cols) */}
        <div className="lg:col-span-4 p-5 rounded-2xl bg-white dark:bg-[#0e1913] border border-emerald-100/90 dark:border-emerald-900/60 shadow-xs flex flex-col max-h-[720px]">
          <div className="flex items-center justify-between pb-3 border-b border-emerald-100 dark:border-emerald-900/50 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
              Select REST Endpoint
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold">
              {PRESETS.length} Endpoints
            </span>
          </div>

          <div className="space-y-2 overflow-y-auto flex-1 pr-1">
            {PRESETS.map(preset => {
              const isSelected = selectedPresetId === preset.id;
              return (
                <button
                  key={preset.id}
                  onClick={() => handleSelectPreset(preset)}
                  className={`w-full text-left p-3 rounded-xl border transition-all ${
                    isSelected
                      ? 'bg-emerald-50 dark:bg-[#152a1e] border-emerald-500/80 shadow-xs ring-1 ring-emerald-500/30'
                      : 'border-emerald-100/70 dark:border-emerald-900/30 hover:bg-emerald-50/50 dark:hover:bg-[#112117]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border ${
                        methodColors[preset.method]
                      }`}
                    >
                      {preset.method}
                    </span>
                    <span className="text-[10px] font-mono text-emerald-600/80 dark:text-emerald-400/80">
                      {preset.category}
                    </span>
                  </div>
                  <div className="font-bold text-xs text-emerald-950 dark:text-slate-100 leading-tight">
                    {preset.name}
                  </div>
                  <div className="text-[11px] font-mono text-emerald-700/80 dark:text-emerald-400/80 mt-1 truncate">
                    {preset.endpoint}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Request Builder & Live Response Inspector (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Request Configurator Box */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#0e1913] border border-emerald-100/90 dark:border-emerald-900/60 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                HTTP Request Configuration
              </span>
              <span className="text-xs text-emerald-600/80 dark:text-emerald-400/80 font-mono">
                JSON Body Supported
              </span>
            </div>

            {/* Method + URL Input Bar */}
            <div className="flex flex-col sm:flex-row items-stretch gap-2.5">
              <select
                value={method}
                onChange={e => setMethod(e.target.value as any)}
                className="px-3.5 py-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/60 dark:bg-[#132219] text-xs font-bold text-emerald-950 dark:text-emerald-100 focus:outline-emerald-500 font-mono"
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="DELETE">DELETE</option>
              </select>

              <input
                type="text"
                value={endpoint}
                onChange={e => setEndpoint(e.target.value)}
                placeholder="/api/students"
                className="flex-1 px-4 py-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-white dark:bg-[#0a120d] text-xs font-mono text-emerald-950 dark:text-[#ecfdf5] focus:outline-emerald-500"
              />

              <button
                onClick={handleExecuteRequest}
                disabled={loading}
                className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 active:scale-98 transition-all shrink-0"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                <span>Send Request</span>
              </button>
            </div>

            {/* Request Body Editor (shown for POST / PUT) */}
            {method !== 'GET' && method !== 'DELETE' && (
              <div className="space-y-1.5 pt-2 border-t border-emerald-100/60 dark:border-emerald-900/40">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-emerald-800 dark:text-emerald-300">
                    Request JSON Body
                  </span>
                  <button
                    onClick={() => {
                      const preset = PRESETS.find(p => p.id === selectedPresetId);
                      if (preset?.defaultBody) {
                        setRequestBodyText(JSON.stringify(preset.defaultBody, null, 2));
                      }
                    }}
                    className="text-[11px] text-emerald-600 hover:underline"
                  >
                    Reset to Default Payload
                  </button>
                </div>
                <textarea
                  rows={6}
                  value={requestBodyText}
                  onChange={e => setRequestBodyText(e.target.value)}
                  placeholder={`{\n  "name": "Value"\n}`}
                  className="w-full p-3 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/30 dark:bg-[#0a120d] text-xs font-mono text-emerald-950 dark:text-emerald-100 focus:outline-emerald-500"
                />
              </div>
            )}
          </div>

          {/* Live Response Inspector */}
          {lastResult && (
            <div className="p-6 rounded-2xl bg-white dark:bg-[#0e1913] border border-emerald-100/90 dark:border-emerald-900/60 shadow-xs space-y-4">
              {/* Response Header Telemetry Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-emerald-100 dark:border-emerald-900/50">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                    Response Output
                  </span>

                  {/* Status Code badge */}
                  <span
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono font-black ${
                      lastResult.statusCode < 300
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                    }`}
                  >
                    {lastResult.statusCode < 300 ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <AlertCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                    )}
                    <span>{lastResult.statusCode} {lastResult.statusCode === 200 ? 'OK' : lastResult.statusCode === 201 ? 'Created' : 'Response'}</span>
                  </span>

                  {/* Execution Latency badge */}
                  <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-teal-50 dark:bg-[#132219] text-teal-800 dark:text-teal-300 border border-teal-200/60 dark:border-teal-900/50">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{lastResult.durationMs} ms latency</span>
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyResponse}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-[#132219] text-xs font-medium text-emerald-800 dark:text-emerald-300 transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy JSON'}</span>
                  </button>
                </div>
              </div>

              {/* JSON Visualizer */}
              <div className="relative">
                <pre className="p-4 rounded-xl bg-emerald-950 text-emerald-100 font-mono text-xs overflow-x-auto max-h-[420px] leading-relaxed select-all">
                  {JSON.stringify(lastResult.responseBody, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {/* Recent Executions History Stream */}
          {history.length > 0 && (
            <div className="p-5 rounded-2xl bg-white dark:bg-[#0e1913] border border-emerald-100/90 dark:border-emerald-900/60 shadow-xs">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 block mb-3">
                Session Execution History
              </span>
              <div className="space-y-2">
                {history.map((h, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50/50 dark:bg-[#122018] text-xs font-mono"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${methodColors[h.method]}`}>
                        {h.method}
                      </span>
                      <span className="text-emerald-950 dark:text-slate-200 truncate max-w-[300px]">
                        {h.url}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">{h.durationMs} ms</span>
                      <span className="text-emerald-800/60 dark:text-slate-400 text-[11px]">{h.timestamp}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
