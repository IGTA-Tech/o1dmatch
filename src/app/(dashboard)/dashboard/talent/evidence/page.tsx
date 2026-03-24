'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { CriteriaBreakdown } from '@/components/talent/CriteriaBreakdown';
import { DocumentUploader } from '@/components/documents';
import { ConfidenceBadge } from '@/components/documents/ConfidenceIndicator';
import {
  Upload,
  FileText,
  Loader2,
  ArrowLeft,
  Trash2,
  Eye,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  AlertTriangle,
  X,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';
import { O1Criterion, O1_CRITERIA } from '@/types/enums';
import { TalentDocument } from '@/types/models';
import { getSupabaseAuthData } from '@/lib/supabase/getToken';

export default function EvidencePage() {
  const router = useRouter();
  const [documents, setDocuments] = useState<TalentDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCriterion, setSelectedCriterion] = useState<O1Criterion | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [preselectedCriterion, setPreselectedCriterion] = useState<O1Criterion | null>(null);
  const [autoApproving, setAutoApproving] = useState(false);

  // Delete confirmation modal state
  const [deleteModal, setDeleteModal] = useState<{
    open: boolean;
    doc: TalentDocument | null;
    deleting: boolean;
    error: string | null;
  }>({ open: false, doc: null, deleting: false, error: null });

  // Auth state
  const [authData, setAuthData] = useState<{ userId: string; accessToken: string } | null>(null);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  // Calculate document counts per criterion (for CriteriaBreakdown)
  const documentCounts = useMemo(() => {
    const counts: Record<string, { total: number; verified: number; pending: number; needsReview: number; rejected: number }> = {};

    // Initialize all criteria with 0
    (Object.keys(O1_CRITERIA) as O1Criterion[]).forEach(criterion => {
      counts[criterion] = { total: 0, verified: 0, pending: 0, needsReview: 0, rejected: 0 };
    });

    // Count documents per criterion by status
    documents.forEach(doc => {
      if (doc.criterion) {
        counts[doc.criterion].total += 1;

        switch (doc.status) {
          case 'verified':
            counts[doc.criterion].verified += 1;
            break;
          case 'pending':
            counts[doc.criterion].pending += 1;
            break;
          case 'needs_review':
            counts[doc.criterion].needsReview += 1;
            break;
          case 'rejected':
            counts[doc.criterion].rejected += 1;
            break;
        }
      }
    });

    return counts;
  }, [documents]);

  // Calculate criteria met (criteria with at least one verified document)
  const criteriaMet = useMemo(() => {
    return (Object.keys(O1_CRITERIA) as O1Criterion[]).filter(
      criterion => documentCounts[criterion]?.verified > 0
    );
  }, [documentCounts]);

  const loadData = useCallback(async () => {
    // Get auth data directly from cookie instead of hanging supabase.auth.getUser()
    const auth = getSupabaseAuthData();

    if (!auth?.user) {
      router.push('/login');
      return;
    }

    const userId = auth.user.id;
    const accessToken = auth.access_token;

    setAuthData({ userId, accessToken });

    try {
      // Fetch talent profile using direct REST API (only need id for documents query)
      const profileResponse = await fetch(
        `${supabaseUrl}/rest/v1/talent_profiles?user_id=eq.${userId}&select=id`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'apikey': supabaseAnonKey,
            'Content-Type': 'application/json',
          },
        }
      );

      if (profileResponse.ok) {
        const profiles = await profileResponse.json();
        if (profiles && profiles[0]) {
          const talentProfileId = profiles[0].id;

          // Fetch documents using direct REST API
          const docsResponse = await fetch(
            `${supabaseUrl}/rest/v1/talent_documents?talent_id=eq.${talentProfileId}&select=*&order=created_at.desc`,
            {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${accessToken}`,
                'apikey': supabaseAnonKey,
                'Content-Type': 'application/json',
              },
            }
          );

          if (docsResponse.ok) {
            const docs = await docsResponse.json();
            setDocuments(docs || []);
            return { talentProfileId, docs: docs || [] };
          }
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }

    setLoading(false);
    return null;
  }, [router, supabaseUrl, supabaseAnonKey]);

  useEffect(() => {
    loadData().then(() => setLoading(false));
  }, [loadData]);

  /**
   * AUTO-APPROVE: After upload, find all 'pending' docs that were just created
   * (within the last 30 seconds) and immediately set them to 'verified'.
   * This removes the need for admin interaction while still showing docs in admin UI.
   */
  const autoApproveNewDocuments = useCallback(async (
    talentProfileId: string,
    accessToken: string
  ) => {
    setAutoApproving(true);
    try {
      // Fetch latest pending docs for this talent (uploaded in last 60 seconds)
      const since = new Date(Date.now() - 60_000).toISOString();
      const pendingResponse = await fetch(
        `${supabaseUrl}/rest/v1/talent_documents?talent_id=eq.${talentProfileId}&status=eq.pending&created_at=gte.${since}&select=id,talent_id`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'apikey': supabaseAnonKey,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!pendingResponse.ok) return;

      const pendingDocs: { id: string; talent_id: string }[] = await pendingResponse.json();

      if (!pendingDocs || pendingDocs.length === 0) return;

      // Auto-approve each pending doc
      await Promise.all(
        pendingDocs.map(async (doc) => {
          const patchResponse = await fetch(
            `${supabaseUrl}/rest/v1/talent_documents?id=eq.${doc.id}`,
            {
              method: 'PATCH',
              headers: {
                'Authorization': `Bearer ${accessToken}`,
                'apikey': supabaseAnonKey,
                'Content-Type': 'application/json',
                'Prefer': 'return=minimal',
              },
              body: JSON.stringify({
                status: 'verified',
                reviewed_at: new Date().toISOString(),
                review_notes: 'Auto-approved on upload',
              }),
            }
          );

          // Trigger score recalculation for each verified doc
          if (patchResponse.ok && doc.talent_id) {
            try {
              await fetch('/api/calculate-score', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ talent_id: doc.talent_id }),
              });
            } catch (e) {
              console.error('Score recalculation error:', e);
            }
          }
        })
      );
    } catch (error) {
      console.error('Auto-approve error:', error);
    } finally {
      setAutoApproving(false);
    }
  }, [supabaseUrl, supabaseAnonKey]);

  const handleUploadComplete = useCallback(async () => {
    setShowUploadModal(false);
    setPreselectedCriterion(null);

    const auth = getSupabaseAuthData();
    if (!auth?.user) return;

    const accessToken = auth.access_token;
    const userId = auth.user.id;

    // Step 1: Get talent profile id
    try {
      const profileResponse = await fetch(
        `${supabaseUrl}/rest/v1/talent_profiles?user_id=eq.${userId}&select=id`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'apikey': supabaseAnonKey,
            'Content-Type': 'application/json',
          },
        }
      );

      if (profileResponse.ok) {
        const profiles = await profileResponse.json();
        if (profiles && profiles[0]) {
          const talentProfileId = profiles[0].id;

          // Step 2: Auto-approve any newly uploaded pending docs
          await autoApproveNewDocuments(talentProfileId, accessToken);
        }
      }
    } catch (error) {
      console.error('Error during post-upload flow:', error);
    }

    // Step 3: Reload documents to reflect verified status
    await loadData();
    setLoading(false);
  }, [supabaseUrl, supabaseAnonKey, autoApproveNewDocuments, loadData]);

  // Step 1 — open confirmation modal
  const handleDelete = (doc: TalentDocument) => {
    setDeleteModal({ open: true, doc, deleting: false, error: null });
  };

  // Step 2 — confirmed: run the actual delete
  const confirmDelete = async () => {
    const doc = deleteModal.doc;
    if (!doc || !authData) return;

    setDeleteModal(prev => ({ ...prev, deleting: true, error: null }));

    try {
      const response = await fetch(
        `${supabaseUrl}/rest/v1/talent_documents?id=eq.${doc.id}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${authData.accessToken}`,
            'apikey': supabaseAnonKey,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        setDeleteModal(prev => ({ ...prev, deleting: false, error: 'Failed to delete document. Please try again.' }));
      } else {
        setDocuments(documents.filter((d) => d.id !== doc.id));
        setDeleteModal({ open: false, doc: null, deleting: false, error: null });
      }
    } catch (error) {
      console.error('Delete error:', error);
      setDeleteModal(prev => ({ ...prev, deleting: false, error: 'Something went wrong. Please try again.' }));
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'needs_review':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'needs_review':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'verified':
        return 'Verified';
      case 'rejected':
        return 'Rejected';
      case 'needs_review':
        return 'Needs Review';
      default:
        return 'Pending';
    }
  };

  const filteredDocuments = selectedCriterion
    ? documents.filter((doc) => doc.criterion === selectedCriterion)
    : documents;

  // Count documents by status for summary
  const documentStats = useMemo(() => {
    return {
      total: documents.length,
      verified: documents.filter(d => d.status === 'verified').length,
      pending: documents.filter(d => d.status === 'pending').length,
      needsReview: documents.filter(d => d.status === 'needs_review').length,
      rejected: documents.filter(d => d.status === 'rejected').length,
    };
  }, [documents]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/talent"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Evidence Documents</h1>
            <p className="text-gray-600">Upload documents to support your O-1 visa case</p>
          </div>
        </div>
        <button
          onClick={() => {
            setPreselectedCriterion(null);
            setShowUploadModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Upload className="w-4 h-4" />
          Upload Document
        </button>
      </div>

      {/* AI-Powered Feature Banner */}
      <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-100">
        <div className="p-2 bg-purple-100 rounded-lg">
          <Sparkles className="w-5 h-5 text-purple-600" />
        </div>
        <div>
          <h3 className="font-medium text-gray-900">AI-Powered Document Analysis</h3>
          <p className="text-sm text-gray-600">
            Our AI automatically extracts text, classifies documents, and suggests the best O-1 criterion.
            Uploaded documents are verified instantly.
          </p>
        </div>
      </div>

      {/* Auto-approving indicator */}
      {autoApproving && (
        <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-100">
          <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
          <p className="text-sm text-blue-700 font-medium">
            Verifying your document automatically...
          </p>
        </div>
      )}

      {/* Document Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-gray-900">{documentStats.total}</div>
            <div className="text-sm text-gray-600">Total</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{documentStats.verified}</div>
            <div className="text-sm text-gray-600">Verified</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-gray-500">{documentStats.pending}</div>
            <div className="text-sm text-gray-600">Pending</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-500">{documentStats.needsReview}</div>
            <div className="text-sm text-gray-600">Needs Review</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-500">{documentStats.rejected}</div>
            <div className="text-sm text-gray-600">Rejected</div>
          </CardContent>
        </Card>
      </div>

      {/* Criteria Overview - Uses documentCounts */}
      <Card>
        <CardHeader>
          <CardTitle>Criteria Progress</CardTitle>
          <p className="text-sm text-gray-500">
            Based on {documentStats.verified} verified document{documentStats.verified !== 1 ? 's' : ''} • {criteriaMet.length} of 8 criteria met
          </p>
        </CardHeader>
        <CardContent>
          <CriteriaBreakdown
            documentCounts={documentCounts}
            criteriaMet={criteriaMet}
            showUploadButtons
            onUpload={(criterion) => {
              setPreselectedCriterion(criterion);
              setShowUploadModal(true);
            }}
          />
        </CardContent>
      </Card>

      {/* Filter by Criterion */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setSelectedCriterion(null)}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
            !selectedCriterion
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All ({documents.length})
        </button>
        {(Object.keys(O1_CRITERIA) as O1Criterion[]).map((criterion) => {
          const count = documents.filter((d) => d.criterion === criterion).length;
          const verifiedCount = documents.filter((d) => d.criterion === criterion && d.status === 'verified').length;
          return (
            <button
              key={criterion}
              onClick={() => setSelectedCriterion(criterion)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                selectedCriterion === criterion
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {O1_CRITERIA[criterion].name} ({count})
              {verifiedCount > 0 && (
                <span className="ml-1 text-green-600">✓{verifiedCount}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Documents List */}
      <div className="space-y-4">
        {filteredDocuments.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No documents yet</h3>
              <p className="text-gray-600 mb-4">
                Upload evidence documents to strengthen your O-1 visa case.
              </p>
              <button
                onClick={() => {
                  setPreselectedCriterion(null);
                  setShowUploadModal(true);
                }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Upload className="w-4 h-4" />
                Upload Your First Document
              </button>
            </CardContent>
          </Card>
        ) : (
          filteredDocuments.map((doc) => (
            <Card key={doc.id} padding="sm">
              <CardContent className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{doc.title}</h3>
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                      {doc.criterion && (
                        <span className="text-xs text-gray-500">
                          {O1_CRITERIA[doc.criterion].name}
                        </span>
                      )}
                      <span className="text-xs text-gray-400">
                        {new Date(doc.created_at).toLocaleDateString()}
                      </span>
                      {doc.extraction_method && (
                        <span className="text-xs text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">
                          {doc.extraction_method === 'ocr' ? 'OCR' : doc.extraction_method.toUpperCase()}
                        </span>
                      )}
                      {doc.classification_confidence && (
                        <ConfidenceBadge
                          confidence={doc.classification_confidence}
                          size="sm"
                        />
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span
                    className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(
                      doc.status
                    )}`}
                  >
                    {getStatusIcon(doc.status)}
                    {getStatusLabel(doc.status)}
                  </span>

                  <div className="flex items-center gap-2">
                    <a
                      href={doc.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      title="View document"
                    >
                      <Eye className="w-4 h-4 text-gray-600" />
                    </a>
                    <button
                      onClick={() => handleDelete(doc)}
                      className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete document"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* ── Delete Confirmation Modal ── */}
      {deleteModal.open && deleteModal.doc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => !deleteModal.deleting && setDeleteModal({ open: false, doc: null, deleting: false, error: null })}
          />

          {/* Modal card */}
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">

            {/* Red header bar */}
            <div className="bg-gradient-to-r from-red-500 to-red-600 px-6 pt-6 pb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                  <Trash2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Delete Document</h3>
                  <p className="text-red-100 text-xs mt-0.5">This action cannot be undone</p>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="px-6 py-5 space-y-4">
              {/* Document preview */}
              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-gray-50 border border-gray-200">
                <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                  <FileText className="w-4 h-4 text-blue-600" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-gray-900 text-sm truncate">
                    {deleteModal.doc.title}
                  </p>
                  {deleteModal.doc.criterion && (
                    <p className="text-xs text-gray-500 mt-0.5">
                      {O1_CRITERIA[deleteModal.doc.criterion]?.name}
                    </p>
                  )}
                  <p className="text-xs text-gray-400 mt-0.5">
                    {new Date(deleteModal.doc.created_at).toLocaleDateString('en-US', {
                      month: 'short', day: 'numeric', year: 'numeric',
                    })}
                  </p>
                </div>
              </div>

              {/* Warning notice */}
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50 border border-amber-200">
                <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700 leading-relaxed">
                  Deleting this document will remove it from your evidence portfolio and may
                  affect your <span className="font-semibold">O-1 readiness score</span>.
                  Any verified status will be lost.
                </p>
              </div>

              {/* Error message */}
              {deleteModal.error && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200">
                  <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                  <p className="text-xs text-red-600">{deleteModal.error}</p>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex gap-3 pt-1">
                <button
                  onClick={() => setDeleteModal({ open: false, doc: null, deleting: false, error: null })}
                  disabled={deleteModal.deleting}
                  className="flex-1 py-2.5 px-4 border border-gray-300 rounded-xl text-sm font-semibold
                    text-gray-700 hover:bg-gray-50 transition-colors
                    disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Keep Document
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={deleteModal.deleting}
                  className="flex-1 py-2.5 px-4 bg-red-600 rounded-xl text-sm font-semibold
                    text-white hover:bg-red-700 transition-colors
                    disabled:opacity-50 disabled:cursor-not-allowed
                    flex items-center justify-center gap-2"
                >
                  {deleteModal.deleting ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Deleting…</>
                  ) : (
                    <><Trash2 className="w-4 h-4" /> Yes, Delete</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal with Criterion Selection */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => {
              setShowUploadModal(false);
              setPreselectedCriterion(null);
            }}
          />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-2xl mx-4 p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Upload Document</h2>
                {preselectedCriterion && (
                  <p className="text-sm text-gray-600">
                    For: {O1_CRITERIA[preselectedCriterion].name}
                  </p>
                )}
              </div>
              <button
                onClick={() => {
                  setShowUploadModal(false);
                  setPreselectedCriterion(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Pass preselectedCriterion to DocumentUploader */}
            <DocumentUploader
              onUploadComplete={handleUploadComplete}
              onCancel={() => {
                setShowUploadModal(false);
                setPreselectedCriterion(null);
              }}
              preselectedCriterion={preselectedCriterion}
            />


          </div>
        </div>
      )}
    </div>
  );
}