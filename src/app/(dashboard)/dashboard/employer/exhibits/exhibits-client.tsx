// src/app/(dashboard)/dashboard/employer/exhibits/exhibits-client.tsx
'use client';

import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import {
  FolderOpen, Plus, Upload, FileText, Image as ImageIcon,
  Trash2, GripVertical, Download, Clock, CheckCircle,
  AlertCircle, Loader2, Package, Search, X, ChevronRight,
  ChevronLeft, Settings, Tag, ArrowUpDown, Zap, RotateCcw,
  ArrowDownAZ, Shuffle, Check, FileDown, RefreshCw, Globe,
  ListOrdered, BookOpen, Link2, HardDrive, Mail,
} from 'lucide-react';

// ─── Exhibit Maker Backend ──────────────────────────────────────────────────
// This is the xtraordinaryexhibits.com Express server that handles:
//   POST /api/pdf/generate       → start generation (returns jobId)
//   GET  /api/pdf/status/:jobId  → poll progress
//   GET  /api/pdf/download/:jobId → download completed PDF
//   GET  /api/drive/config       → Google Picker config
//   POST /api/drive/import       → download Drive files to server
const EXHIBIT_MAKER_URL =
  process.env.NEXT_PUBLIC_EXHIBIT_MAKER_URL || 'https://xtraordinaryexhibits.com';

/**
 * Convert a downloadUrl that may be relative (e.g. "/api/pdf/download/xxx")
 * into an absolute URL on the exhibit-maker backend.
 */
function toAbsoluteDownloadUrl(downloadUrl: string | null | undefined): string | null {
  if (!downloadUrl) return null;
  if (downloadUrl.startsWith('http')) return downloadUrl; // already absolute
  return `${EXHIBIT_MAKER_URL}${downloadUrl}`;
}

// ─── Types ──────────────────────────────────────────────────────────────────

interface PetitionCase {
  id: string;
  beneficiary_name: string;
  visa_type: string;
  status: string;
}

interface ExhibitPackage {
  id: string;
  employer_id: string;
  case_id: string | null;
  name: string;
  status: 'draft' | 'processing' | 'completed' | 'failed';
  visa_type: string | null;
  numbering_style: string;
  beneficiary_name: string | null;
  total_exhibits: number;
  total_pages: number | null;
  file_size: number | null;
  download_url: string | null;
  delivery_method: string | null;
  recipient_email: string | null;
  drive_link: string | null;
  created_at: string;
  updated_at: string;
}

interface ExhibitItem {
  id: string;
  type: 'pdf' | 'image' | 'url';
  file?: File;
  url?: string;
  label: string;
  filename: string;
  size: number;
  classification?: string | null;
  confidence?: number | null;
  driveImport?: boolean;
  serverFilename?: string;
}

interface ExhibitsClientProps {
  packages: ExhibitPackage[];
  cases: PetitionCase[];
  employerId: string;
  companyName: string;
  onRefresh?: () => void;
}

// ─── Constants ──────────────────────────────────────────────────────────────

const VISA_TYPES = [
  { group: 'O Visas', items: [
    { value: 'O-1A', label: 'O-1A (Extraordinary Ability - Sciences/Business)' },
    { value: 'O-1B', label: 'O-1B (Extraordinary Ability - Arts)' },
    { value: 'O-2', label: 'O-2 (O-1 Support Personnel)' },
  ]},
  { group: 'P Visas', items: [
    { value: 'P-1A', label: 'P-1A (Internationally Recognized Athlete)' },
    { value: 'P-1B', label: 'P-1B (Entertainment Group)' },
    { value: 'P-1S', label: 'P-1S (P-1 Support Personnel)' },
  ]},
  { group: 'Employment-Based', items: [
    { value: 'EB-1A', label: 'EB-1A (Extraordinary Ability)' },
    { value: 'EB-1B', label: 'EB-1B (Outstanding Researcher)' },
    { value: 'EB-2-NIW', label: 'EB-2 NIW (National Interest Waiver)' },
  ]},
];

const NUMBERING_STYLES = [
  { value: 'letters', preview: 'A', sub: 'Letters' },
  { value: 'numbers', preview: '1', sub: 'Numbers' },
  { value: 'roman', preview: 'I', sub: 'Roman' },
];

const STEPS = [
  { key: 'upload', label: 'Upload', icon: Upload },
  { key: 'review', label: 'Review', icon: Tag },
  { key: 'reorder', label: 'Reorder', icon: ArrowUpDown },
  { key: 'generate', label: 'Generate', icon: Zap },
  { key: 'complete', label: 'Complete', icon: CheckCircle },
] as const;

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatFileSize(bytes: number): string {
  if (!bytes) return '—';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

function formatDate(d: string): string {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function generateId() {
  return 'ex_' + Math.random().toString(36).substr(2, 9);
}

function getExhibitNumber(index: number, style: string): string {
  const num = index + 1;
  if (style === 'numbers') return String(num);
  if (style === 'roman') {
    const r = [['M',1000],['CM',900],['D',500],['CD',400],['C',100],['XC',90],['L',50],['XL',40],['X',10],['IX',9],['V',5],['IV',4],['I',1]] as const;
    let result = '', n = num;
    for (const [letter, value] of r) { while (n >= value) { result += letter; n -= value; } }
    return result;
  }
  let result = '', n = num;
  while (n > 0) { n--; result = String.fromCharCode(65 + (n % 26)) + result; n = Math.floor(n / 26); }
  return result;
}

function getFileExtension(filename: string) {
  return '.' + (filename.split('.').pop()?.toLowerCase() || 'pdf');
}

function getStatusConfig(status: string) {
  switch (status) {
    case 'completed': return { label: 'Completed', color: 'text-green-700 bg-green-50 border-green-200', icon: CheckCircle };
    case 'processing': return { label: 'Processing', color: 'text-blue-700 bg-blue-50 border-blue-200', icon: Loader2 };
    case 'failed': return { label: 'Failed', color: 'text-red-700 bg-red-50 border-red-200', icon: AlertCircle };
    default: return { label: 'Draft', color: 'text-gray-700 bg-gray-50 border-gray-200', icon: Clock };
  }
}

// ─── URL Parser (matches reference app.js) ──────────────────────────────────

function extractUrlsFromText(text: string): { url: string; label: string }[] {
  if (!text?.trim()) return [];
  const results: { url: string; label: string }[] = [];
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || !line.includes('http')) continue;
    if (/^[A-Z][A-Z\s/&]+$/.test(line)) continue;
    const chunks = line.split(/(?=https?:\/\/)/gi);
    for (const chunk of chunks) {
      const m = chunk.match(/^(https?:\/\/[^\s,;""''<>\[\](){}]+)/i);
      if (!m) continue;
      let url = m[1].replace(/[.,;:!?)}\]]+$/, '');
      try { new URL(url); } catch { continue; }
      const remaining = line.replace(url, '').replace(/^\s*[\d#]+[.):\-]?\s*/, '').replace(/^\s*[-*•]\s*/, '').trim();
      let label = remaining.replace(/^[\s—–\-,;:|]+/, '').replace(/[\s—–\-,;:|]+$/, '').trim();
      if (!label) {
        try { const u = new URL(url); label = u.pathname.split('/').filter(Boolean).pop()?.replace(/[-_]/g, ' ').replace(/\.[^.]+$/, '') || u.hostname; } catch { label = 'Document'; }
      }
      results.push({ url, label });
    }
  }
  return results;
}

// ─── Step Progress Bar ──────────────────────────────────────────────────────

function StepProgressBar({ currentStep, onStepClick }: { currentStep: number; onStepClick: (s: number) => void }) {
  return (
    <div className="flex items-center gap-1 mb-8">
      {STEPS.map((step, idx) => {
        const SI = step.icon;
        const isActive = idx === currentStep;
        const isCompleted = idx < currentStep;
        const isClickable = idx < currentStep && idx !== 4;
        return (
          <div key={step.key} className="flex items-center flex-1 last:flex-initial">
            <button onClick={() => isClickable && onStepClick(idx)} disabled={!isClickable}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                isActive ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                : isCompleted ? 'bg-blue-50 text-blue-700 hover:bg-blue-100 cursor-pointer'
                : 'bg-gray-50 text-gray-400 cursor-default'
              }`}>
              {isCompleted && !isActive ? <Check className="w-4 h-4" /> : <SI className={`w-4 h-4 ${isActive ? 'text-white' : ''}`} />}
              <span className="hidden sm:inline">{step.label}</span>
              <span className="sm:hidden">{idx + 1}</span>
            </button>
            {idx < STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 mx-2 rounded ${idx < currentStep ? 'bg-blue-300' : 'bg-gray-200'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// MAIN EXPORT
// ═════════════════════════════════════════════════════════════════════════════

export function ExhibitsClient({ packages, cases, employerId, companyName, onRefresh }: ExhibitsClientProps) {
  const [view, setView] = useState<'list' | 'create'>('list');
  return (
    <div className="max-w-6xl mx-auto">
      {view === 'list' ? (
        <PackageList packages={packages} onCreateNew={() => setView('create')} onRefresh={onRefresh} />
      ) : (
        <ExhibitWizard cases={cases} employerId={employerId} companyName={companyName}
          onBack={() => { setView('list'); onRefresh?.(); }} />
      )}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// PACKAGE LIST VIEW
// ═════════════════════════════════════════════════════════════════════════════

function PackageList({ packages, onCreateNew, onRefresh }: { packages: ExhibitPackage[]; onCreateNew: () => void; onRefresh?: () => void }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filtered = packages.filter(pkg => {
    const matchesSearch = !searchQuery || pkg.name.toLowerCase().includes(searchQuery.toLowerCase()) || pkg.visa_type?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = statusFilter === 'all' || pkg.status === statusFilter;
    return matchesSearch && matchesFilter;
  });

  async function handleDelete(pkgId: string, pkgName: string) {
    if (!confirm(`Delete "${pkgName}"? This cannot be undone.`)) return;
    setDeletingId(pkgId);
    try {
      const res = await fetch(`/api/exhibits/${pkgId}`, { method: 'DELETE' });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error || 'Delete failed');
      }
      onRefresh?.();
    } catch (err: any) {
      alert(`Failed to delete: ${err.message}`);
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><FolderOpen className="w-7 h-7 text-blue-600" /> Exhibit Packages</h1>
          <p className="text-gray-500 mt-1 text-sm">Create and manage exhibit packages for visa petition cases</p>
        </div>
        <button onClick={onCreateNew} className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 shadow-sm">
          <Plus className="w-4 h-4" /> New Package
        </button>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Search packages..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
        </div>
        <div className="flex gap-1.5 bg-gray-100 p-1 rounded-xl">
          {['all','draft','processing','completed','failed'].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all capitalize ${statusFilter === s ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              {s === 'all' ? 'All' : s}
            </button>
          ))}
        </div>
      </div>

      {/* Package Cards */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-16 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-5"><FolderOpen className="w-8 h-8 text-gray-400" /></div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{packages.length === 0 ? 'No exhibit packages yet' : 'No matches found'}</h3>
          <p className="text-gray-500 text-sm mb-6">{packages.length === 0 ? 'Create your first exhibit package to organize and compile petition evidence.' : 'Try adjusting your search or filter.'}</p>
          {packages.length === 0 && (
            <button onClick={onCreateNew} className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700"><Plus className="w-4 h-4" /> Create Package</button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(pkg => {
            const sc = getStatusConfig(pkg.status); const SI = sc.icon;
            return (
              <div key={pkg.id} className="bg-white rounded-2xl border border-gray-200 p-5 hover:shadow-lg hover:border-gray-300 transition-all">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-gray-900 truncate">{pkg.name}</h3>
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-medium rounded-full border ${sc.color}`}>
                        <SI className={`w-3 h-3 ${pkg.status === 'processing' ? 'animate-spin' : ''}`} /> {sc.label}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
                      {pkg.beneficiary_name && <span>{pkg.beneficiary_name}</span>}
                      {pkg.visa_type && <span className="px-2 py-0.5 bg-gray-100 rounded text-xs font-medium text-gray-600">{pkg.visa_type}</span>}
                      <span>{pkg.total_exhibits} exhibit{pkg.total_exhibits !== 1 ? 's' : ''}</span>
                      {pkg.total_pages != null && <span>{pkg.total_pages} pages</span>}
                      {pkg.file_size != null && <span>{formatFileSize(pkg.file_size)}</span>}
                      <span>{formatDate(pkg.created_at)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {pkg.status === 'completed' && pkg.recipient_email && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-2 bg-blue-50 text-blue-700 text-xs font-medium rounded-xl border border-blue-200">
                        <Mail className="w-3.5 h-3.5" /> {pkg.recipient_email}
                      </span>
                    )}
                    {pkg.status === 'completed' && pkg.download_url && (
                      <a href={toAbsoluteDownloadUrl(pkg.download_url) || '#'} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700">
                        <Download className="w-4 h-4" /> Download
                      </a>
                    )}
                    <button onClick={() => handleDelete(pkg.id, pkg.name)} disabled={deletingId === pkg.id}
                      className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-red-600 border border-red-200 rounded-xl hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      title="Delete package">
                      {deletingId === pkg.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                      <span className="hidden sm:inline">Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// EXHIBIT WIZARD (5-step)
// ═════════════════════════════════════════════════════════════════════════════

function ExhibitWizard({ cases, employerId, companyName, onBack }: {
  cases: PetitionCase[]; employerId: string; companyName: string; onBack: () => void;
}) {
  const [currentStep, setCurrentStep] = useState(0);

  // ── Config (sidebar) ──
  const [visaType, setVisaType] = useState('');
  const [numberingStyle, setNumberingStyle] = useState('letters');
  const [beneficiaryName, setBeneficiaryName] = useState('');
  const [petitionerName, setPetitionerName] = useState(companyName || '');
  const [caseName, setCaseName] = useState('');
  const [selectedCase, setSelectedCase] = useState('');
  const [enableCompression, setEnableCompression] = useState(true);
  const [enableToc, setEnableToc] = useState(true);
  const [enableCoverPages, setEnableCoverPages] = useState(true);
  const [enableAiClassify, setEnableAiClassify] = useState(false);
  const [deliveryMethod, setDeliveryMethod] = useState('download');
  const [recipientEmail, setRecipientEmail] = useState('');

  // ── Exhibits ──
  const [exhibits, setExhibits] = useState<ExhibitItem[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Upload tab ──
  const [uploadTab, setUploadTab] = useState<'files' | 'url' | 'drive'>('files');
  const [urlText, setUrlText] = useState('');

  // ── Google Drive ──
  const [driveStatus, setDriveStatus] = useState<'loading' | 'unavailable' | 'ready' | 'connected' | 'importing'>('loading');
  const [driveConfig, setDriveConfig] = useState<any>(null);
  const [driveToken, setDriveToken] = useState<string | null>(null);

  // ── Generation ──
  const [isGenerating, setIsGenerating] = useState(false);
  const [genProgress, setGenProgress] = useState(0);
  const [genStatus, setGenStatus] = useState('');
  const [genLogs, setGenLogs] = useState<string[]>([]);
  const [genResult, setGenResult] = useState<any>(null);

  // ── Reorder ──
  const [reorderHistory, setReorderHistory] = useState<ExhibitItem[][]>([]);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [overIdx, setOverIdx] = useState<number | null>(null);

  const totalFileSize = useMemo(() => exhibits.reduce((s, e) => s + e.size, 0), [exhibits]);
  const detectedUrls = useMemo(() => extractUrlsFromText(urlText), [urlText]);

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Google Drive Init (fetch config from exhibit-maker backend)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${EXHIBIT_MAKER_URL}/api/drive/config`);
        const cfg = await res.json();
        if (!cfg.available) { setDriveStatus('unavailable'); return; }
        setDriveConfig(cfg);
        setDriveStatus('ready');

        // Pre-load Google API scripts
        loadGoogleScripts(cfg);
      } catch {
        setDriveStatus('unavailable');
      }
    })();
  }, []);

  function loadGoogleScripts(cfg: any) {
    // Load GIS
    if (!document.getElementById('google-gis-script')) {
      const s = document.createElement('script');
      s.id = 'google-gis-script';
      s.src = 'https://accounts.google.com/gsi/client';
      document.head.appendChild(s);
    }
    // Load Picker API
    if (!document.getElementById('google-api-script')) {
      const s = document.createElement('script');
      s.id = 'google-api-script';
      s.src = 'https://apis.google.com/js/api.js';
      s.onload = () => { (window as any).gapi?.load('picker', () => {}); };
      document.head.appendChild(s);
    }
  }

  // ── Auto-fill from case ──
  function handleCaseSelect(caseId: string) {
    setSelectedCase(caseId);
    const c = cases.find(cs => cs.id === caseId);
    if (c) {
      setVisaType(c.visa_type || '');
      setBeneficiaryName(c.beneficiary_name || '');
      if (!caseName) setCaseName(`${c.beneficiary_name} - ${c.visa_type}`);
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // File Handling
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  const handleFileDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false); addFiles(e.dataTransfer.files);
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) { addFiles(e.target.files); e.target.value = ''; }
  }, []);

  function addFiles(files: FileList) {
    const newItems: ExhibitItem[] = [];
    for (const file of Array.from(files)) {
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (!['pdf','jpg','jpeg','png'].includes(ext || '')) continue;
      newItems.push({
        id: generateId(), type: ext === 'pdf' ? 'pdf' : 'image', file,
        label: file.name.replace(/\.(pdf|jpe?g|png)$/i, ''),
        filename: file.name, size: file.size,
      });
    }
    setExhibits(prev => [...prev, ...newItems]);
  }

  function addUrlsToExhibits() {
    if (detectedUrls.length === 0) return;
    const items: ExhibitItem[] = detectedUrls.map(u => ({
      id: generateId(), type: 'url' as const, url: u.url,
      label: u.label, filename: `${u.label}.pdf`, size: 0,
    }));
    setExhibits(prev => [...prev, ...items]);
    setUrlText('');
  }

  function removeExhibit(id: string) { setExhibits(prev => prev.filter(e => e.id !== id)); }
  function updateLabel(id: string, label: string) { setExhibits(prev => prev.map(e => e.id === id ? { ...e, label } : e)); }

  function autoNameFromFilename() {
    setExhibits(prev => prev.map(ex => ({
      ...ex,
      label: ex.filename
        .replace(/\.(pdf|jpe?g|png)$/i, '')
        .replace(/[-_]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .replace(/\b\w/g, c => c.toUpperCase()),
    })));
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Google Drive (popup OAuth → Picker → Import via exhibit-maker backend)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  function connectGoogleDrive() {
    if (!driveConfig) return;
    if (driveToken) { openGooglePicker(driveToken); return; }

    // Popup-based OAuth
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(driveConfig.clientId)}&scope=${encodeURIComponent(driveConfig.scope)}&response_type=token&redirect_uri=${encodeURIComponent(window.location.origin + '/oauth-callback.html')}&include_granted_scopes=true&prompt=consent`;

    const w = 500, h = 650;
    const left = window.screenX + (window.outerWidth - w) / 2;
    const top = window.screenY + (window.outerHeight - h) / 2;
    const popup = window.open(authUrl, 'googleDriveAuth', `width=${w},height=${h},left=${left},top=${top},scrollbars=yes`);

    if (!popup) { alert('Popup blocked. Please allow popups for this site and try again.'); return; }

    localStorage.removeItem('googleDriveToken');
    const pollId = setInterval(() => {
      const token = localStorage.getItem('googleDriveToken');
      if (token) {
        clearInterval(pollId);
        localStorage.removeItem('googleDriveToken');
        try { popup.close(); } catch {}
        setDriveToken(token);
        setDriveStatus('connected');
        openGooglePicker(token);
      }
    }, 300);
    setTimeout(() => clearInterval(pollId), 60000);
  }

  function openGooglePicker(token: string) {
    const gapi = (window as any).gapi;
    const google = (window as any).google;

    if (!google?.picker) {
      // Load picker if not ready
      gapi?.load?.('picker', () => buildPicker(token));
      return;
    }
    buildPicker(token);
  }

  function buildPicker(token: string) {
    const google = (window as any).google;
    if (!google?.picker) { alert('Google Picker not loaded. Please try again.'); return; }

    const picker = new google.picker.PickerBuilder()
      .addView(new google.picker.DocsView().setIncludeFolders(true).setSelectFolderEnabled(false).setLabel('All Files'))
      .addView(new google.picker.DocsView().setMimeTypes('application/pdf,image/jpeg,image/png').setIncludeFolders(true).setLabel('PDFs & Images'))
      .addView(new google.picker.DocsView(google.picker.ViewId.DOCUMENTS).setIncludeFolders(true).setLabel('Google Docs'))
      .enableFeature(google.picker.Feature.MULTISELECT_ENABLED)
      .setTitle('Select files to import as exhibits')
      .setAppId(driveConfig.appId)
      .setOAuthToken(token)
      .setDeveloperKey(driveConfig.apiKey)
      .setCallback(handlePickerResult)
      .setMaxItems(50)
      .build();
    picker.setVisible(true);
  }

  async function handlePickerResult(data: any) {
    const google = (window as any).google;
    if (data.action !== google.picker.Action.PICKED) return;
    const docs = data.docs;
    if (!docs?.length) return;

    setDriveStatus('importing');
    try {
      // Send picked files to exhibit-maker backend for download
      const files = docs.map((doc: any) => ({
        id: doc.id, name: doc.name, mimeType: doc.mimeType, sizeBytes: doc.sizeBytes || 0,
      }));

      const res = await fetch(`${EXHIBIT_MAKER_URL}/api/drive/import`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken: driveToken, files }),
      });
      if (!res.ok) throw new Error('Import failed');
      const result = await res.json();

      const newItems: ExhibitItem[] = [];
      for (const f of result.files) {
        if (!f.success) continue;
        newItems.push({
          id: generateId(), type: f.type || 'pdf',
          label: f.name.replace(/\.(pdf|jpe?g|png)$/i, ''),
          filename: f.name, size: f.size || 0,
          driveImport: true, serverFilename: f.localFilename,
        });
      }
      setExhibits(prev => [...prev, ...newItems]);

      const failed = result.files.filter((f: any) => !f.success);
      if (failed.length > 0) alert(`Failed to import: ${failed.map((f: any) => f.name).join(', ')}`);

      setDriveStatus('connected');
    } catch (err: any) {
      alert(`Google Drive import failed: ${err.message}`);
      setDriveStatus('connected');
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Reorder
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  function saveHistory() { setReorderHistory(p => [...p, [...exhibits]]); }
  function undoReorder() { if (!reorderHistory.length) return; setExhibits(reorderHistory[reorderHistory.length - 1]); setReorderHistory(p => p.slice(0, -1)); }
  function sortAZ() { saveHistory(); setExhibits(p => [...p].sort((a, b) => a.label.localeCompare(b.label))); }
  function sortByType() { saveHistory(); setExhibits(p => [...p].sort((a, b) => a.type.localeCompare(b.type))); }
  function reverseOrder() { saveHistory(); setExhibits(p => [...p].reverse()); }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Generate Package (calls exhibit-maker backend, then polls status)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  async function handleGenerate() {
    // Validate delivery requirements
    if ((deliveryMethod === 'drive' || deliveryMethod === 'email') && !recipientEmail.trim()) {
      alert(deliveryMethod === 'drive'
        ? 'Please enter a recipient email for Google Drive delivery.'
        : 'Please enter a recipient email for Email delivery.');
      return;
    }
    if ((deliveryMethod === 'drive' || deliveryMethod === 'email') && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipientEmail.trim())) {
      alert('Please enter a valid email address.');
      return;
    }

    setIsGenerating(true);
    setGenProgress(5);
    setGenStatus('Uploading files...');
    setGenLogs([]);

    try {
      const formData = new FormData();

      // Config JSON (matches what pdf.js expects)
      formData.append('config', JSON.stringify({
        visaType, numberingStyle, beneficiaryName, petitionerName, caseName,
        enableCompression, enableToc, enableCoverPages,
        deliveryMethod, recipientEmail,
      }));

      // Exhibits metadata JSON (matches what pdf.js expects)
      const exhibitsData = exhibits.map((ex, idx) => ({
        id: ex.id, type: ex.type, url: ex.url || null,
        label: ex.label, filename: ex.filename,
        classification: ex.classification || null,
        order: idx,
        serverFilename: ex.serverFilename || null,
      }));
      formData.append('exhibits', JSON.stringify(exhibitsData));

      // Actual files (skip drive imports — already on server)
      exhibits.forEach(ex => {
        if ((ex.type === 'pdf' || ex.type === 'image') && ex.file && !ex.driveImport) {
          formData.append('files', ex.file, ex.id + getFileExtension(ex.filename));
        }
      });

      setGenProgress(10);

      // POST to exhibit-maker backend
      const res = await fetch(`${EXHIBIT_MAKER_URL}/api/pdf/generate`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Failed to start generation' }));
        throw new Error(err.error || 'Generation failed');
      }

      const result = await res.json();
      setGenProgress(15);
      setGenStatus('Processing...');

      // Poll for status
      await pollStatus(result.jobId);
    } catch (err: any) {
      setGenStatus(`Error: ${err.message}`);
      setIsGenerating(false);
    }
  }

  async function pollStatus(jobId: string) {
    let attempts = 0;
    const maxAttempts = 300; // 10 min max

    const poll = async () => {
      try {
        const res = await fetch(`${EXHIBIT_MAKER_URL}/api/pdf/status/${jobId}`);
        if (!res.ok) throw new Error('Failed to check status');
        const job = await res.json();

        setGenProgress(job.progress || 0);
        setGenStatus(job.statusMessage || 'Processing...');
        if (job.logs?.length) {
          setGenLogs(job.logs.map((l: any) => `[${new Date(l.time).toLocaleTimeString()}] ${l.message}`));
        }

        if (job.status === 'completed') {
          // Make download URL absolute
          const downloadUrl = toAbsoluteDownloadUrl(job.downloadUrl);

          setGenResult({ ...job, downloadUrl });
          setCurrentStep(4);
          setIsGenerating(false);

          // Save to our Supabase DB (non-blocking)
          fetch('/api/exhibits/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              employerId, caseId: selectedCase || null,
              name: caseName || `${beneficiaryName || 'Exhibit'} Package`,
              visaType, numberingStyle, beneficiaryName, enableToc, enableCoverPages,
              totalExhibits: exhibits.length,
              totalPages: job.totalPages || null,
              fileSize: job.packageSize || null,
              downloadUrl: downloadUrl,
              status: 'completed',
              deliveryMethod,
              recipientEmail: recipientEmail.trim() || null,
              driveLink: job.driveLink || null,
            }),
          }).catch(() => {/* non-critical */});

        } else if (job.status === 'failed') {
          throw new Error(job.error || 'Generation failed');
        } else if (attempts < maxAttempts) {
          attempts++;
          setTimeout(poll, 2000);
        } else {
          throw new Error('Generation timed out');
        }
      } catch (err: any) {
        setGenStatus(`Error: ${err.message}`);
        setIsGenerating(false);
      }
    };
    poll();
  }

  // ── Navigation ──
  function goNext() {
    if (currentStep === 3) { handleGenerate(); return; }
    if (currentStep < 4) setCurrentStep(p => p + 1);
  }
  function goBack_() { if (currentStep > 0) setCurrentStep(p => p - 1); }

  function resetWizard() {
    setCurrentStep(0); setExhibits([]); setVisaType(''); setBeneficiaryName('');
    setPetitionerName(companyName || ''); setCaseName(''); setSelectedCase('');
    setIsGenerating(false); setGenProgress(0); setGenResult(null); setReorderHistory([]);
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // RENDER
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onBack} className="p-2 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-700"><ChevronLeft className="w-5 h-5" /></button>
        <div><h1 className="text-2xl font-bold text-gray-900">Exhibit Maker</h1><p className="text-sm text-gray-500">Create a new exhibit package</p></div>
      </div>

      <div className="flex gap-6">

        {/* ─── LEFT SIDEBAR ─── */}
        <div className="w-80 flex-shrink-0">
          <div className="bg-white rounded-2xl border border-gray-200 p-5 sticky top-4 space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-900"><Settings className="w-4 h-4 text-blue-600" /> Case Configuration</div>

            {cases.length > 0 && (
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">Link to Case</label>
                <select value={selectedCase} onChange={e => handleCaseSelect(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                  <option value="">None</option>
                  {cases.map(c => <option key={c.id} value={c.id}>{c.beneficiary_name} — {c.visa_type}</option>)}
                </select>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">Visa Type</label>
              <select value={visaType} onChange={e => setVisaType(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                <option value="">Select visa type...</option>
                {VISA_TYPES.map(g => <optgroup key={g.group} label={g.group}>{g.items.map(v => <option key={v.value} value={v.value}>{v.label}</option>)}</optgroup>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">Exhibit Numbering</label>
              <div className="grid grid-cols-3 gap-1.5">
                {NUMBERING_STYLES.map(ns => (
                  <button key={ns.value} onClick={() => setNumberingStyle(ns.value)}
                    className={`px-2 py-2.5 text-xs font-medium rounded-lg border transition-all text-center ${numberingStyle === ns.value ? 'bg-blue-50 border-blue-300 text-blue-700' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                    <div className="text-base font-bold mb-0.5">{ns.preview}</div>{ns.sub}
                  </button>
                ))}
              </div>
            </div>

            <div><label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">Beneficiary Name</label>
              <input type="text" value={beneficiaryName} onChange={e => setBeneficiaryName(e.target.value)} placeholder="e.g., John Smith" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>

            <div><label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">Petitioner Name</label>
              <input type="text" value={petitionerName} onChange={e => setPetitionerName(e.target.value)} placeholder="e.g., Acme Corp" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>

            <div><label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">Case/Matter Name</label>
              <input type="text" value={caseName} onChange={e => setCaseName(e.target.value)} placeholder="e.g., Smith O-1A Petition" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">Options</label>
              <div className="space-y-2.5">
                {([
                  { checked: enableCompression, set: setEnableCompression, label: 'PDF Compression' },
                  { checked: enableToc, set: setEnableToc, label: 'Table of Contents' },
                  { checked: enableCoverPages, set: setEnableCoverPages, label: 'Cover Pages' },
                  { checked: enableAiClassify, set: setEnableAiClassify, label: 'AI Auto-Classification' },
                ] as const).map(opt => (
                  <label key={opt.label} className="flex items-center gap-3 cursor-pointer">
                    <div className="relative"><input type="checkbox" checked={opt.checked} onChange={e => opt.set(e.target.checked)} className="peer sr-only" />
                      <div className="w-8 h-5 bg-gray-200 rounded-full peer-checked:bg-blue-600 transition-colors" />
                      <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow peer-checked:translate-x-3 transition-transform" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div><label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">Delivery</label>
              <select value={deliveryMethod} onChange={e => setDeliveryMethod(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                <option value="download">Download (Browser)</option>
                {/* <option value="drive">Google Drive</option> */}
                <option value="email">Email (ZIP)</option>
              </select>
            </div>
            {(deliveryMethod === 'email' || deliveryMethod === 'drive') && (
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                  Recipient Email <span className="text-red-500">*</span>
                </label>
                <input type="email" value={recipientEmail} onChange={e => setRecipientEmail(e.target.value)} placeholder="recipient@example.com"
                  className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    recipientEmail.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipientEmail.trim())
                      ? 'border-green-300 bg-green-50/30'
                      : recipientEmail.trim()
                        ? 'border-red-300 bg-red-50/30'
                        : 'border-gray-200'
                  }`} />
                {!recipientEmail.trim() && (
                  <p className="text-xs text-red-500 mt-1">Required for {deliveryMethod === 'drive' ? 'Google Drive' : 'Email'} delivery</p>
                )}
                {recipientEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipientEmail.trim()) && (
                  <p className="text-xs text-red-500 mt-1">Please enter a valid email address</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ─── MAIN AREA ─── */}
        <div className="flex-1 min-w-0">
          <StepProgressBar currentStep={currentStep} onStepClick={setCurrentStep} />

          {/* ═══════════════ STEP 0: Upload ═══════════════ */}
          {currentStep === 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Upload Documents</h2>
                {exhibits.length > 0 && <span className="text-sm text-gray-500">{exhibits.length} files · {formatFileSize(totalFileSize)}</span>}
              </div>

              {/* Upload Tabs */}
              <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
                {([
                  { key: 'files' as const, label: 'Upload Files', Icon: FileText },
                  { key: 'url' as const, label: 'From URLs', Icon: Link2 },
                  { key: 'drive' as const, label: 'Google Drive', Icon: HardDrive },
                ]).map(t => (
                  <button key={t.key} onClick={() => setUploadTab(t.key)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all flex-1 justify-center ${uploadTab === t.key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                    <t.Icon className="w-4 h-4" /> {t.label}
                  </button>
                ))}
              </div>

              {/* TAB: File Upload */}
              {uploadTab === 'files' && (
                <div onDragOver={e => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)} onDrop={handleFileDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all ${dragOver ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-blue-300 hover:bg-blue-50/30'}`}>
                  <input ref={fileInputRef} type="file" multiple accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileSelect} className="hidden" />
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 ${dragOver ? 'bg-blue-100' : 'bg-gray-100'}`}>
                    <Upload className={`w-7 h-7 ${dragOver ? 'text-blue-600' : 'text-gray-400'}`} />
                  </div>
                  <p className="text-sm font-semibold text-gray-700 mb-1">Drag & Drop Files Here</p>
                  <p className="text-sm text-gray-500">or <span className="text-blue-600 font-medium">browse files</span></p>
                  <p className="text-xs text-gray-400 mt-2">Supports PDF, JPEG, JPG, and PNG files. Images are auto-converted to PDF.</p>
                </div>
              )}

              {/* TAB: URL Input */}
              {uploadTab === 'url' && (
                <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-3">
                  <textarea value={urlText} onChange={e => setUrlText(e.target.value)} rows={8}
                    placeholder={"Paste URLs here — one per line\n\nhttps://example.com/article — Award Certificate\nhttps://example.com/news — Media Coverage\nhttps://example.com/doc1\nhttps://example.com/doc2"}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">{detectedUrls.length} URL{detectedUrls.length !== 1 ? 's' : ''} detected</span>
                    <button onClick={addUrlsToExhibits} disabled={detectedUrls.length === 0}
                      className="px-4 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed">Add URLs</button>
                  </div>
                </div>
              )}

              {/* TAB: Google Drive */}
              {uploadTab === 'drive' && (
                <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center">
                  {driveStatus === 'loading' && <div className="py-4"><Loader2 className="w-6 h-6 text-gray-400 animate-spin mx-auto mb-2" /><p className="text-sm text-gray-500">Loading Google Drive configuration...</p></div>}
                  {driveStatus === 'unavailable' && (
                    <div><HardDrive className="w-10 h-10 text-gray-300 mx-auto mb-3" /><h3 className="font-semibold text-gray-700 mb-2">Google Drive Import</h3>
                      <p className="text-sm text-gray-500 mb-4 max-w-sm mx-auto">Google Drive is not configured on the exhibit-maker server. Contact your admin to set up <code className="text-xs bg-gray-100 px-1 rounded">GOOGLE_CLIENT_ID</code> and <code className="text-xs bg-gray-100 px-1 rounded">GOOGLE_API_KEY</code>.</p></div>
                  )}
                  {driveStatus === 'ready' && (
                    <div><HardDrive className="w-10 h-10 text-blue-500 mx-auto mb-3" /><h3 className="font-semibold text-gray-700 mb-2">Google Drive Import</h3>
                      <p className="text-sm text-gray-500 mb-4">Browse your Google Drive and select PDFs, images, or Google Docs to import.</p>
                      <button onClick={connectGoogleDrive} className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700">
                        <Link2 className="w-4 h-4" /> Connect & Browse Google Drive
                      </button>
                      <p className="text-xs text-gray-400 mt-3">Supports PDF, JPEG, PNG and Google Docs/Slides (exported as PDF)</p></div>
                  )}
                  {driveStatus === 'connected' && (
                    <div>
                      <div className="flex items-center justify-center gap-2 mb-4 text-green-600"><Check className="w-5 h-5" /><span className="font-semibold">Connected to Google Drive</span></div>
                      <div className="flex gap-3 justify-center">
                        <button onClick={() => openGooglePicker(driveToken!)} className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700"><FolderOpen className="w-4 h-4" /> Browse & Select Files</button>
                        <button onClick={() => { setDriveToken(null); setDriveStatus('ready'); }} className="px-4 py-2 text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 text-sm">Disconnect</button>
                      </div>
                      <p className="text-xs text-gray-400 mt-3">Select multiple files — PDFs, images, and Google Docs are supported</p>
                    </div>
                  )}
                  {driveStatus === 'importing' && (
                    <div className="py-4"><Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-3" /><h3 className="font-semibold text-gray-700 mb-1">Importing files...</h3><p className="text-sm text-gray-500">Downloading from Google Drive. This may take a moment for large files.</p></div>
                  )}
                </div>
              )}

              {/* File List */}
              {exhibits.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                  <div className="px-5 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-gray-700">Uploaded Documents ({exhibits.length})</h3>
                    <button onClick={() => setExhibits([])} className="text-xs text-red-500 hover:text-red-700 font-medium">Clear All</button>
                  </div>
                  <div className="divide-y divide-gray-100 max-h-64 overflow-y-auto">
                    {exhibits.map((ex, idx) => (
                      <div key={ex.id} className="flex items-center gap-3 px-5 py-2.5 hover:bg-gray-50/50 group">
                        <div className="w-7 h-7 flex items-center justify-center rounded-lg bg-blue-50 text-xs font-bold text-blue-600">{getExhibitNumber(idx, numberingStyle)}</div>
                        {ex.type === 'pdf' ? <FileText className="w-4 h-4 text-red-500 flex-shrink-0" /> : ex.type === 'image' ? <ImageIcon className="w-4 h-4 text-green-500 flex-shrink-0" /> : <Globe className="w-4 h-4 text-purple-500 flex-shrink-0" />}
                        <span className="flex-1 text-sm text-gray-700 truncate">{ex.label || ex.filename}</span>
                        {ex.driveImport && <span title="Imported from Google Drive"><HardDrive className="w-3 h-3 text-gray-400 flex-shrink-0" /></span>}
                        <span className="text-xs text-gray-400 flex-shrink-0">{ex.size > 0 ? formatFileSize(ex.size) : ex.type === 'url' ? 'URL' : ''}</span>
                        <button onClick={() => removeExhibit(ex.id)} className="p-1 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 flex-shrink-0"><X className="w-4 h-4" /></button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-2">
                <button onClick={goNext} disabled={exhibits.length === 0}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed">
                  Continue to Review <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ═══════════════ STEP 1: Review & Label ═══════════════ */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div><h2 className="text-lg font-semibold text-gray-900">Review & Label Exhibits</h2><p className="text-sm text-gray-500 mt-1">Review and add descriptive labels to each exhibit.</p></div>
                <button onClick={autoNameFromFilename} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 text-gray-700 border border-gray-200 text-xs font-medium rounded-lg hover:bg-gray-100"><FileText className="w-3.5 h-3.5" /> Auto-Name from Filename</button>
              </div>
              <div className="space-y-3">
                {exhibits.map((ex, idx) => (
                  <div key={ex.id} className="bg-white rounded-xl border border-gray-200 p-4 hover:border-gray-300 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-blue-50 border border-blue-200 text-sm font-bold text-blue-700 flex-shrink-0">{getExhibitNumber(idx, numberingStyle)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          {ex.type === 'pdf' ? <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded bg-red-50 text-red-600 border border-red-200"><FileText className="w-3 h-3" /> PDF</span>
                           : ex.type === 'image' ? <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded bg-green-50 text-green-600 border border-green-200"><ImageIcon className="w-3 h-3" /> Image</span>
                           : <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded bg-purple-50 text-purple-600 border border-purple-200"><Globe className="w-3 h-3" /> URL</span>}
                          <span className="text-xs text-gray-400 truncate">{ex.type === 'url' ? ex.url : ex.filename}</span>
                          {ex.driveImport && <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-xs rounded bg-gray-50 text-gray-500 border border-gray-200"><HardDrive className="w-3 h-3" /> Drive</span>}
                        </div>
                        <input type="text" value={ex.label} onChange={e => updateLabel(ex.id, e.target.value)} placeholder="Enter exhibit label..."
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-gray-300" />
                      </div>
                      <button onClick={() => removeExhibit(ex.id)} className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg flex-shrink-0"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between pt-2">
                <button onClick={goBack_} className="inline-flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 font-medium rounded-xl hover:bg-gray-100"><ChevronLeft className="w-4 h-4" /> Back</button>
                <button onClick={goNext} className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700">Continue to Reorder <ChevronRight className="w-4 h-4" /></button>
              </div>
            </div>
          )}

          {/* ═══════════════ STEP 2: Reorder ═══════════════ */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div><h2 className="text-lg font-semibold text-gray-900">Reorder Exhibits</h2><p className="text-sm text-gray-500 mt-1">Drag and drop to reorder. Final exhibit numbers follow this order.</p></div>
                <div className="flex gap-1.5">
                  <button onClick={sortAZ} className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-white border border-gray-200 text-xs font-medium text-gray-600 rounded-lg hover:bg-gray-50"><ArrowDownAZ className="w-3.5 h-3.5" /> Sort A-Z</button>
                  <button onClick={sortByType} className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-white border border-gray-200 text-xs font-medium text-gray-600 rounded-lg hover:bg-gray-50"><ListOrdered className="w-3.5 h-3.5" /> By Type</button>
                  <button onClick={reverseOrder} className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-white border border-gray-200 text-xs font-medium text-gray-600 rounded-lg hover:bg-gray-50"><Shuffle className="w-3.5 h-3.5" /> Reverse</button>
                  <button onClick={undoReorder} disabled={!reorderHistory.length} className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-white border border-gray-200 text-xs font-medium text-gray-600 rounded-lg hover:bg-gray-50 disabled:opacity-40"><RotateCcw className="w-3.5 h-3.5" /> Undo</button>
                </div>
              </div>
              <div className="space-y-2">
                {exhibits.map((ex, idx) => (
                  <div key={ex.id} draggable
                    onDragStart={() => { saveHistory(); setDragIdx(idx); }}
                    onDragOver={e => { e.preventDefault(); setOverIdx(idx); }}
                    onDrop={() => {
                      if (dragIdx !== null && dragIdx !== idx) {
                        setExhibits(prev => { const c = [...prev]; const [item] = c.splice(dragIdx, 1); c.splice(idx, 0, item); return c; });
                      }
                      setDragIdx(null); setOverIdx(null);
                    }}
                    onDragEnd={() => { setDragIdx(null); setOverIdx(null); }}
                    className={`flex items-center gap-3 p-3 bg-white rounded-xl border cursor-grab active:cursor-grabbing transition-all ${
                      overIdx === idx && dragIdx !== idx ? 'border-blue-400 bg-blue-50 shadow-md' : dragIdx === idx ? 'opacity-50 border-gray-200' : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                    }`}>
                    <GripVertical className="w-4 h-4 text-gray-300 flex-shrink-0" />
                    <div className="w-9 h-9 flex items-center justify-center rounded-lg bg-blue-50 border border-blue-200 text-sm font-bold text-blue-700 flex-shrink-0">{getExhibitNumber(idx, numberingStyle)}</div>
                    {ex.type === 'pdf' ? <FileText className="w-4 h-4 text-red-500 flex-shrink-0" /> : ex.type === 'image' ? <ImageIcon className="w-4 h-4 text-green-500 flex-shrink-0" /> : <Globe className="w-4 h-4 text-purple-500 flex-shrink-0" />}
                    <span className="flex-1 text-sm font-medium text-gray-700 truncate">{ex.label}</span>
                    <span className="text-xs text-gray-400 flex-shrink-0">{ex.type.toUpperCase()}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between pt-2">
                <button onClick={goBack_} className="inline-flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 font-medium rounded-xl hover:bg-gray-100"><ChevronLeft className="w-4 h-4" /> Back</button>
                <button onClick={goNext} className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700">Continue to Generate <ChevronRight className="w-4 h-4" /></button>
              </div>
            </div>
          )}

          {/* ═══════════════ STEP 3: Generate ═══════════════ */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900">Generate Exhibit Package</h2>

              {/* Summary Grid */}
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                <div className="px-5 py-3 bg-gray-50 border-b border-gray-200"><h3 className="text-sm font-semibold text-gray-700">Package Summary</h3></div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-gray-100">
                  {[
                    { label: 'Total Exhibits', value: String(exhibits.length), Icon: Package },
                    { label: 'Visa Type', value: visaType || 'Not selected', Icon: BookOpen },
                    { label: 'Numbering', value: numberingStyle === 'letters' ? 'Letters (A, B, C)' : numberingStyle === 'numbers' ? 'Numbers (1, 2, 3)' : 'Roman (I, II, III)', Icon: ListOrdered },
                    { label: 'Delivery', value: deliveryMethod === 'download' ? 'Download' : deliveryMethod === 'drive' ? (recipientEmail.trim() ? `Drive → ${recipientEmail}` : 'Drive — email required!') : (recipientEmail.trim() ? `Email → ${recipientEmail}` : 'Email — email required!'), Icon: FileDown },
                  ].map(item => (
                    <div key={item.label} className="bg-white p-4"><div className="flex items-center gap-2 text-xs text-gray-500 mb-1"><item.Icon className="w-3.5 h-3.5" />{item.label}</div><div className="text-lg font-bold text-gray-900">{item.value}</div></div>
                  ))}
                </div>
              </div>

              {/* Exhibit Preview */}
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                <div className="px-5 py-3 bg-gray-50 border-b border-gray-200"><h3 className="text-sm font-semibold text-gray-700">Exhibit Preview</h3></div>
                <div className="divide-y divide-gray-100 max-h-64 overflow-y-auto">
                  {exhibits.map((ex, idx) => (
                    <div key={ex.id} className="flex items-center gap-3 px-5 py-2.5">
                      <span className="w-8 text-sm font-bold text-blue-600 text-center">{getExhibitNumber(idx, numberingStyle)}</span>
                      <span className="text-sm text-gray-700 flex-1">{ex.label}</span>
                      <span className="text-xs text-gray-400">{ex.type.toUpperCase()}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Settings Tags */}
              <div className="flex flex-wrap gap-2">
                {enableCompression && <span className="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full border border-blue-200">PDF Compression</span>}
                {enableToc && <span className="px-2.5 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full border border-green-200">Table of Contents</span>}
                {enableCoverPages && <span className="px-2.5 py-1 bg-purple-50 text-purple-700 text-xs font-medium rounded-full border border-purple-200">Cover Pages</span>}
                {beneficiaryName && <span className="px-2.5 py-1 bg-gray-50 text-gray-700 text-xs font-medium rounded-full border border-gray-200">Beneficiary: {beneficiaryName}</span>}
                {petitionerName && <span className="px-2.5 py-1 bg-gray-50 text-gray-700 text-xs font-medium rounded-full border border-gray-200">Petitioner: {petitionerName}</span>}
              </div>

              {/* Generate / Progress */}
              {isGenerating ? (
                <div className="bg-white rounded-2xl border border-blue-200 p-6 space-y-3">
                  <div className="flex items-center gap-3"><Loader2 className="w-5 h-5 text-blue-600 animate-spin" /><span className="text-sm font-medium text-gray-900">Generating Package...</span><span className="ml-auto text-sm font-bold text-blue-600">{genProgress}%</span></div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden"><div className="h-full bg-blue-600 rounded-full transition-all duration-700" style={{ width: `${genProgress}%` }} /></div>
                  <p className="text-xs text-gray-500">{genStatus}</p>
                  {genLogs.length > 0 && (
                    <div className="max-h-40 overflow-y-auto bg-gray-50 rounded-lg p-3 text-xs font-mono text-gray-600 space-y-0.5">
                      {genLogs.map((log, i) => <div key={i}>{log}</div>)}
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-end gap-2 pt-2">
                  <div className="flex justify-between w-full">
                    <button onClick={goBack_} className="inline-flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 font-medium rounded-xl hover:bg-gray-100"><ChevronLeft className="w-4 h-4" /> Back</button>
                    <button onClick={handleGenerate}
                      disabled={(deliveryMethod === 'drive' || deliveryMethod === 'email') && (!recipientEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipientEmail.trim()))}
                      className="inline-flex items-center gap-2 px-8 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 disabled:bg-gray-300 disabled:shadow-none disabled:cursor-not-allowed">
                      <Zap className="w-5 h-5" /> Generate Package
                    </button>
                  </div>
                  {(deliveryMethod === 'drive' || deliveryMethod === 'email') && (!recipientEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipientEmail.trim())) && (
                    <p className="text-xs text-red-500">Please enter a valid recipient email in the sidebar to continue.</p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ═══════════════ STEP 4: Complete ═══════════════ */}
          {currentStep === 4 && genResult && (
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"><CheckCircle className="w-10 h-10 text-green-600" /></div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Package Complete!</h2>
              <p className="text-gray-500 mb-8">Your exhibit package has been generated successfully.</p>

              {/* Stats */}
              <div className="flex justify-center gap-8 mb-8">
                <div className="text-center"><div className="text-3xl font-bold text-blue-600">{exhibits.length}</div><div className="text-xs text-gray-500 mt-1">Exhibits</div></div>
                <div className="text-center"><div className="text-3xl font-bold text-purple-600">{genResult.totalPages || '—'}</div><div className="text-xs text-gray-500 mt-1">Total Pages</div></div>
                <div className="text-center"><div className="text-3xl font-bold text-green-600">{formatFileSize(genResult.packageSize || 0)}</div><div className="text-xs text-gray-500 mt-1">File Size</div></div>
              </div>

              {/* Delivery-specific messages */}
              {deliveryMethod === 'drive' && genResult.driveLink && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl inline-block">
                  <p className="text-sm text-green-800 font-medium mb-1">Uploaded to Google Drive!</p>
                  <a href={genResult.driveLink} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 underline hover:text-blue-800">Open in Google Drive →</a>
                </div>
              )}
              {deliveryMethod === 'email' && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl inline-block">
                  <p className="text-sm text-green-800 font-medium">Email sent to {recipientEmail}!</p>
                  <p className="text-xs text-green-600 mt-1">Check your inbox (and spam folder)</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-center gap-3">
                {genResult.downloadUrl && (
                  <a href={genResult.downloadUrl} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200">
                    <Download className="w-5 h-5" /> Download Package
                  </a>
                )}
                <button onClick={() => { resetWizard(); onBack(); }}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white text-gray-700 font-medium border border-gray-200 rounded-xl hover:bg-gray-50">
                  <RefreshCw className="w-4 h-4" /> Start New Package
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}