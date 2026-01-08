'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
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
  X,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';
import { O1Criterion, O1_CRITERIA } from '@/types/enums';
import { TalentDocument, TalentProfile } from '@/types/models';

export default function EvidencePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<TalentProfile | null>(null);
  const [documents, setDocuments] = useState<TalentDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCriterion, setSelectedCriterion] = useState<O1Criterion | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [preselectedCriterion, setPreselectedCriterion] = useState<O1Criterion | null>(null);

  const supabase = createClient();

  const loadData = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/login');
      return;
    }

    const { data: talentProfile } = await supabase
      .from('talent_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (talentProfile) {
      setProfile(talentProfile);

      const { data: docs } = await supabase
        .from('talent_documents')
        .select('*')
        .eq('talent_id', talentProfile.id)
        .order('created_at', { ascending: false });

      if (docs) {
        setDocuments(docs);
      }
    }

    setLoading(false);
  }, [supabase, router]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleUploadComplete = () => {
    setShowUploadModal(false);
    setPreselectedCriterion(null);
    loadData();
  };

  const handleDelete = async (doc: TalentDocument) => {
    if (!confirm('Are you sure you want to delete this document?')) return;

    const { error } = await supabase
      .from('talent_documents')
      .delete()
      .eq('id', doc.id);

    if (error) {
      alert('Failed to delete document.');
    } else {
      setDocuments(documents.filter((d) => d.id !== doc.id));
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
          onClick={() => setShowUploadModal(true)}
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
          </p>
        </div>
      </div>

      {/* Criteria Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Criteria Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <CriteriaBreakdown
            breakdown={profile?.evidence_summary || {}}
            criteriaMet={profile?.criteria_met || []}
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
                onClick={() => setShowUploadModal(true)}
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
                  {doc.score_impact && doc.status === 'verified' && (
                    <span className="text-sm font-medium text-green-600">
                      +{doc.score_impact} pts
                    </span>
                  )}
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

      {/* Upload Modal with New Uploader */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => {
              setShowUploadModal(false);
              setPreselectedCriterion(null);
            }}
          />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 p-6 max-h-[90vh] overflow-y-auto">
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

            <DocumentUploader
              onUploadComplete={handleUploadComplete}
              onCancel={() => {
                setShowUploadModal(false);
                setPreselectedCriterion(null);
              }}
            />

            <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg mt-4">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-blue-700">
                Documents are automatically analyzed with AI. High-confidence documents may be
                auto-verified. All documents are subject to review.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
