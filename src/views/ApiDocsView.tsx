import React, { useEffect, useState } from 'react';
import {
  FileText,
  Shield,
  Layers,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  Code2,
  Copy,
  Check,
  Download,
} from 'lucide-react';
import { api } from '../api/client.js';
import { useToast } from '../components/Toast.js';

export const ApiDocsView: React.FC = () => {
  const { success } = useToast();
  const [spec, setSpec] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTag, setActiveTag] = useState<string>('All');
  const [expandedEndpoints, setExpandedEndpoints] = useState<Record<string, boolean>>({});
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    const fetchSpec = async () => {
      try {
        const { response } = await api.get('/swagger.json');
        const swaggerData: any = (response as any)?.data || response;
        if (swaggerData) {
          setSpec(swaggerData);
          // Default expand first 3
          const initialExpanded: Record<string, boolean> = {};
          let count = 0;
          if (swaggerData.paths) {
            for (const pathKey of Object.keys(swaggerData.paths)) {
              for (const method of Object.keys(swaggerData.paths[pathKey])) {
                if (count < 3) {
                  initialExpanded[`${method.toUpperCase()} ${pathKey}`] = true;
                  count++;
                }
              }
            }
          }
          setExpandedEndpoints(initialExpanded);
        }
      } catch {
        // Fallback
      } finally {
        setLoading(false);
      }
    };

    fetchSpec();
  }, []);

  const toggleEndpoint = (key: string) => {
    setExpandedEndpoints(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleCopySpec = () => {
    if (!spec) return;
    navigator.clipboard.writeText(JSON.stringify(spec, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    success('Copied', 'OpenAPI 3.0 specification copied to clipboard');
  };

  const handleDownloadSpec = () => {
    if (!spec) return;
    const blob = new Blob([JSON.stringify(spec, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'smartcampus-openapi-spec.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin dark:border-emerald-950 dark:border-t-emerald-400" />
        <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">
          Loading OpenAPI 3.0 Documentation...
        </p>
      </div>
    );
  }

  // Parse all endpoints
  const endpoints: Array<{
    path: string;
    method: string;
    tag: string;
    summary: string;
    parameters?: any[];
    requestBody?: any;
    responses: any;
    security?: any[];
  }> = [];

  if (spec?.paths) {
    Object.keys(spec.paths).forEach(pathKey => {
      const pathObj = spec.paths[pathKey];
      Object.keys(pathObj).forEach(method => {
        const item = pathObj[method];
        endpoints.push({
          path: pathKey,
          method: method.toUpperCase(),
          tag: item.tags?.[0] || 'General',
          summary: item.summary || 'REST Operation',
          parameters: item.parameters,
          requestBody: item.requestBody,
          responses: item.responses,
          security: item.security,
        });
      });
    });
  }

  const tags = ['All', ...Array.from(new Set(endpoints.map(e => e.tag)))];
  const filtered = activeTag === 'All' ? endpoints : endpoints.filter(e => e.tag === activeTag);

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
                <FileText className="w-4 h-4" />
              </span>
              <span className="text-xs font-mono font-bold tracking-wide uppercase text-emerald-700 dark:text-emerald-400">
                OpenAPI 3.0 / Swagger Documentation
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                v1.0.0
              </span>
            </div>
            <h1 className="text-2xl font-black text-emerald-950 dark:text-[#ecfdf5]">
              SmartCampus API Specifications (/api-docs)
            </h1>
            <p className="text-xs text-emerald-700/80 dark:text-emerald-400/80 mt-1 max-w-2xl">
              Official REST API contracts, request/response models, Bearer JWT security schemes, and data schemas serving the entire campus platform.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopySpec}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-[#132219] text-xs font-semibold text-emerald-800 dark:text-emerald-300 transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>Copy Spec JSON</span>
            </button>
            <button
              onClick={handleDownloadSpec}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Download openapi.json</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tag Filtering Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {tags.map(tag => (
          <button
            key={tag}
            onClick={() => setActiveTag(tag)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              activeTag === tag
                ? 'bg-emerald-600 text-white dark:bg-emerald-500 dark:text-emerald-950 font-bold shadow-xs'
                : 'bg-white dark:bg-[#0e1913] border border-emerald-100 dark:border-emerald-900/60 text-emerald-800/80 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-[#13241c]'
            }`}
          >
            {tag} {tag === 'All' ? `(${endpoints.length})` : ''}
          </button>
        ))}
      </div>

      {/* Endpoints List */}
      <div className="space-y-3">
        {filtered.map(ep => {
          const key = `${ep.method} ${ep.path}`;
          const isExpanded = !!expandedEndpoints[key];

          return (
            <div
              key={key}
              className="rounded-2xl border border-emerald-100/90 dark:border-emerald-900/60 bg-white dark:bg-[#0e1913] overflow-hidden shadow-2xs transition-colors"
            >
              {/* Endpoint Header Bar */}
              <button
                onClick={() => toggleEndpoint(key)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-emerald-50/40 dark:hover:bg-[#13241c]/50 transition-colors"
              >
                <div className="flex items-center gap-3 truncate">
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold border ${methodColors[ep.method]}`}>
                    {ep.method}
                  </span>
                  <span className="font-mono text-xs font-bold text-emerald-950 dark:text-[#ecfdf5]">
                    /api{ep.path}
                  </span>
                  <span className="text-xs text-emerald-700/80 dark:text-emerald-400/80 hidden sm:inline truncate max-w-md">
                    — {ep.summary}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {ep.security && (
                    <span className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-semibold">
                      <Shield className="w-3 h-3" />
                      <span>JWT Bearer</span>
                    </span>
                  )}
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                  )}
                </div>
              </button>

              {/* Endpoint Detail Expansion */}
              {isExpanded && (
                <div className="p-5 border-t border-emerald-100/70 dark:border-emerald-900/40 bg-emerald-50/20 dark:bg-[#0b140f] space-y-4 text-xs font-mono">
                  <div className="text-emerald-800 dark:text-emerald-200 font-sans text-sm">
                    {ep.summary}
                  </div>

                  {/* Parameters */}
                  {ep.parameters && ep.parameters.length > 0 && (
                    <div>
                      <div className="font-bold uppercase tracking-wider text-[11px] text-emerald-700 dark:text-emerald-400 mb-2 font-sans">
                        Request Parameters
                      </div>
                      <div className="space-y-1.5">
                        {ep.parameters.map((param, i) => (
                          <div
                            key={i}
                            className="flex items-center gap-3 p-2 rounded-lg bg-white dark:bg-[#122018] border border-emerald-100 dark:border-emerald-900/50"
                          >
                            <span className="font-bold text-emerald-950 dark:text-emerald-200">{param.name}</span>
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                              {param.in}
                            </span>
                            <span className="text-emerald-600 dark:text-emerald-400">
                              {param.schema?.type || 'string'}
                            </span>
                            {param.required && <span className="text-rose-500 font-bold">*required</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Request Body Specification */}
                  {ep.requestBody && (
                    <div>
                      <div className="font-bold uppercase tracking-wider text-[11px] text-emerald-700 dark:text-emerald-400 mb-2 font-sans">
                        Request Body (application/json)
                      </div>
                      <pre className="p-3.5 rounded-xl bg-emerald-950 text-emerald-100 text-[11px] overflow-x-auto">
                        {JSON.stringify(ep.requestBody.content?.['application/json']?.schema || {}, null, 2)}
                      </pre>
                    </div>
                  )}

                  {/* Responses */}
                  <div>
                    <div className="font-bold uppercase tracking-wider text-[11px] text-emerald-700 dark:text-emerald-400 mb-2 font-sans">
                      Expected Responses
                    </div>
                    <div className="space-y-1.5">
                      {Object.keys(ep.responses).map(code => (
                        <div
                          key={code}
                          className="flex items-center gap-3 p-2 rounded-lg bg-white dark:bg-[#122018] border border-emerald-100 dark:border-emerald-900/50"
                        >
                          <span
                            className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                              code.startsWith('2')
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                            }`}
                          >
                            {code}
                          </span>
                          <span className="text-emerald-900 dark:text-slate-200">
                            {ep.responses[code].description}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
