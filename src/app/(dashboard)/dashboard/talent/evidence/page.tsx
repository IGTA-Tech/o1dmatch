'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { CriteriaBreakdown } from '@/components/talent/CriteriaBreakdown';
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
} from 'lucide-react';
import Link from 'next/link';
import { O1Criterion, O1_CRITERIA } from '@/types/enums';
import { TalentDocument, TalentProfile } from '@/types/models';

export default function EvidencePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<TalentProfile | null>(null);
  const [documents, setDocuments] = useState<TalentDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedCriterion, setSelectedCriterion] = useState<O1Criterion | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    title: '',
    description: '',
    criterion: '' as O1Criterion | '',
    auto_classify: true,
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      if (!uploadForm.title) {
        setUploadForm({
          ...uploadForm,
          title: e.target.files[0].name.replace(/\.[^/.]+$/, ''),
        });
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !profile) return;

    setUploading(true);

    try {
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${profile.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('evidence')
        .upload(fileName, selectedFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('evidence')
        .getPublicUrl(fileName);

      const { error: dbError } = await supabase.from('talent_documents').insert({
        talent_id: profile.id,
        title: uploadForm.title,
        description: uploadForm.description || null,
        file_url: publicUrl,
        file_type: fileExt?.toUpperCase() || 'PDF',
        file_size: selectedFile.size,
        criterion: uploadForm.criterion || null,
        status: 'pending',
      });

      if (dbError) throw dbError;

      setShowUploadModal(false);
      setSelectedFile(null);
      setUploadForm({
        title: '',
        description: '',
        criterion: '',
        auto_classify: true,
      });

      await loadData();
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload document. Please try again.');
    } finally {
      setUploading(false);
    }
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
      default:
        return <Clock className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
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
              setUploadForm({ ...uploadForm, criterion });
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
                    <div className="flex items-center gap-3 mt-1">
                      {doc.criterion && (
                        <span className="text-xs text-gray-500">
                          {O1_CRITERIA[doc.criterion].name}
                        </span>
                      )}
                      <span className="text-xs text-gray-400">
                        {new Date(doc.created_at).toLocaleDateString()}
                      </span>
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
                    {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                  </span>

                  <div className="flex items-center gap-2">
                    <a
                      href={doc.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <Eye className="w-4 h-4 text-gray-600" />
                    </a>
                    <button
                      onClick={() => handleDelete(doc)}
                      className="p-2 hover:bg-red-50 rounded-lg transition-colors"
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

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowUploadModal(false)}
          />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Upload Document</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  File *
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  {selectedFile ? (
                    <div className="flex items-center justify-center gap-2">
                      <FileText className="w-5 h-5 text-blue-600" />
                      <span className="text-sm text-gray-900">{selectedFile.name}</span>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">
                        Click or drag to upload PDF, DOC, or image
                      </p>
                    </>
                  )}
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    style={{ position: 'absolute', top: 0, left: 0 }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  value={uploadForm.title}
                  onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={uploadForm.description}
                  onChange={(e) =>
                    setUploadForm({ ...uploadForm, description: e.target.value })
                  }
                  rows={2}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  O-1 Criterion
                </label>
                <select
                  value={uploadForm.criterion}
                  onChange={(e) =>
                    setUploadForm({ ...uploadForm, criterion: e.target.value as O1Criterion })
                  }
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Auto-detect or select...</option>
                  {(Object.keys(O1_CRITERIA) as O1Criterion[]).map((criterion) => (
                    <option key={criterion} value={criterion}>
                      {O1_CRITERIA[criterion].name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="auto_classify"
                  checked={uploadForm.auto_classify}
                  onChange={(e) =>
                    setUploadForm({ ...uploadForm, auto_classify: e.target.checked })
                  }
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded"
                />
                <label htmlFor="auto_classify" className="text-sm text-gray-700">
                  Auto-classify using AI
                </label>
              </div>

              <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
                <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-blue-700">
                  Documents will be reviewed by our team. Verified documents contribute to
                  your O-1 score.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowUploadModal(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleUpload}
                disabled={!selectedFile || !uploadForm.title || uploading}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Upload
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
