'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import {
  FileText,
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Eye,
  ChevronDown,
  ChevronUp,
  Search,
  Filter,
  RefreshCw,
  ThumbsUp,
  ThumbsDown,
  User,
} from 'lucide-react';
import { O1_CRITERIA, O1Criterion } from '@/types/enums';
import { getSupabaseAuthData } from '@/lib/supabase/getToken';

interface TalentDocument {
  id: string;
  talent_id: string;
  title: string;
  file_name: string;
  description: string | null;
  file_url: string;
  file_type: string;
  status: 'pending' | 'needs_review' | 'verified' | 'rejected';
  criterion: O1Criterion | null;
  score_impact: number | null;
  extraction_method: string | null;
  extraction_confidence: number | null;
  classification_confidence: number | null;
  extracted_text: string | null;
  ai_reasoning: string | null;
  ai_notes: string | null;
  admin_notes: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
  // Joined data
  talent?: {
    id: string;
    first_name: string;
    last_name: string;
    user_id: string;
  };
}

type StatusFilter = 'all' | 'pending' | 'needs_review' | 'verified' | 'rejected';

export default function AdminDocumentsPage() {
  const router = useRouter();
  const [documents, setDocuments] = useState<TalentDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedDoc, setExpandedDoc] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [adminNotes, setAdminNotes] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  const loadDocuments = useCallback(async () => {
    const auth = getSupabaseAuthData();
    
    if (!auth?.user) {
      router.push('/login');
      return;
    }

    try {
      // Fetch all documents with talent info
      const response = await fetch(
        `${supabaseUrl}/rest/v1/talent_documents?select=*,talent:talent_profiles(id,first_name,last_name,user_id)&order=created_at.desc`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${auth.access_token}`,
            'apikey': supabaseAnonKey,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        const docs = await response.json();
        setDocuments(docs || []);
      }
    } catch (error) {
      console.error('Error loading documents:', error);
    }

    setLoading(false);
  }, [router, supabaseUrl, supabaseAnonKey]);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  const updateDocumentStatus = async (
    docId: string, 
    newStatus: 'verified' | 'rejected',
    scoreImpact?: number
  ) => {
    const auth = getSupabaseAuthData();
    if (!auth?.user) return;

    setProcessingId(docId);
    setMessage(null);

    try {
      const updateData: Record<string, unknown> = {
        status: newStatus,
        reviewed_by: auth.user.id,
        reviewed_at: new Date().toISOString(),
        admin_notes: adminNotes[docId] || null,
      };

      // If verifying, set the score impact
      if (newStatus === 'verified' && scoreImpact) {
        updateData.score_impact = scoreImpact;
      }

      // If rejecting, clear score impact
      if (newStatus === 'rejected') {
        updateData.score_impact = null;
      }

      const response = await fetch(
        `${supabaseUrl}/rest/v1/talent_documents?id=eq.${docId}`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${auth.access_token}`,
            'apikey': supabaseAnonKey,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal',
          },
          body: JSON.stringify(updateData),
        }
      );

      if (response.ok) {
        setMessage({ 
          type: 'success', 
          text: `Document ${newStatus === 'verified' ? 'approved' : 'rejected'} successfully!` 
        });
        
        // Update local state
        setDocuments(docs => 
          docs.map(d => 
            d.id === docId 
              ? { ...d, status: newStatus, reviewed_at: new Date().toISOString() }
              : d
          )
        );

        // If verified, trigger score recalculation
        if (newStatus === 'verified') {
          const doc = documents.find(d => d.id === docId);
          if (doc?.talent_id) {
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
        }
      } else {
        setMessage({ type: 'error', text: 'Failed to update document status.' });
      }
    } catch (error) {
      console.error('Update error:', error);
      setMessage({ type: 'error', text: 'Failed to update document status.' });
    }

    setProcessingId(null);
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

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'verified':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'needs_review':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getConfidenceColor = (confidence: number | null) => {
    if (!confidence) return 'text-gray-400';
    if (confidence >= 80) return 'text-green-600';
    if (confidence >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Filter documents
  const filteredDocuments = documents.filter(doc => {
    // Status filter
    if (statusFilter !== 'all' && doc.status !== statusFilter) return false;
    
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const talentName = doc.talent 
        ? `${doc.talent.first_name} ${doc.talent.last_name}`.toLowerCase()
        : '';
      return (
        doc.title.toLowerCase().includes(query) ||
        doc.file_name.toLowerCase().includes(query) ||
        talentName.includes(query) ||
        (doc.criterion && O1_CRITERIA[doc.criterion]?.name.toLowerCase().includes(query))
      );
    }
    
    return true;
  });

  // Stats
  const stats = {
    total: documents.length,
    pending: documents.filter(d => d.status === 'pending').length,
    needsReview: documents.filter(d => d.status === 'needs_review').length,
    verified: documents.filter(d => d.status === 'verified').length,
    rejected: documents.filter(d => d.status === 'rejected').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Document Review</h1>
          <p className="text-gray-600">Review and approve uploaded evidence documents</p>
        </div>
        <button
          onClick={() => {
            setLoading(true);
            loadDocuments();
          }}
          className="flex items-center gap-2 px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Message */}
      {message && (
        <div className={`p-4 rounded-lg ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-700 border border-green-200'
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card 
          className={`cursor-pointer transition-all ${statusFilter === 'all' ? 'ring-2 ring-blue-500' : ''}`}
          onClick={() => setStatusFilter('all')}
        >
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-sm text-gray-600">Total Documents</div>
          </CardContent>
        </Card>
        <Card 
          className={`cursor-pointer transition-all ${statusFilter === 'pending' ? 'ring-2 ring-blue-500' : ''}`}
          onClick={() => setStatusFilter('pending')}
        >
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-gray-500">{stats.pending}</div>
            <div className="text-sm text-gray-600">Pending</div>
          </CardContent>
        </Card>
        <Card 
          className={`cursor-pointer transition-all ${statusFilter === 'needs_review' ? 'ring-2 ring-blue-500' : ''}`}
          onClick={() => setStatusFilter('needs_review')}
        >
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-500">{stats.needsReview}</div>
            <div className="text-sm text-gray-600">Needs Review</div>
          </CardContent>
        </Card>
        <Card 
          className={`cursor-pointer transition-all ${statusFilter === 'verified' ? 'ring-2 ring-blue-500' : ''}`}
          onClick={() => setStatusFilter('verified')}
        >
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-500">{stats.verified}</div>
            <div className="text-sm text-gray-600">Verified</div>
          </CardContent>
        </Card>
        <Card 
          className={`cursor-pointer transition-all ${statusFilter === 'rejected' ? 'ring-2 ring-blue-500' : ''}`}
          onClick={() => setStatusFilter('rejected')}
        >
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-500">{stats.rejected}</div>
            <div className="text-sm text-gray-600">Rejected</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by title, filename, talent name, or criterion..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="needs_review">Needs Review</option>
            <option value="verified">Verified</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Documents List */}
      <div className="space-y-4">
        {filteredDocuments.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No documents found</h3>
              <p className="text-gray-600">
                {statusFilter !== 'all' 
                  ? `No documents with "${statusFilter}" status.`
                  : 'No documents have been uploaded yet.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredDocuments.map((doc) => (
            <Card key={doc.id} className="overflow-hidden">
              {/* Main Row */}
              <div 
                className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => setExpandedDoc(expandedDoc === doc.id ? null : doc.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <FileText className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{doc.title}</h3>
                      <div className="flex items-center gap-3 mt-1 flex-wrap text-sm">
                        {doc.talent && (
                          <span className="flex items-center gap-1 text-gray-600">
                            <User className="w-3 h-3" />
                            {doc.talent.first_name} {doc.talent.last_name}
                          </span>
                        )}
                        {doc.criterion && (
                          <span className="text-blue-600">
                            {O1_CRITERIA[doc.criterion]?.name}
                          </span>
                        )}
                        <span className="text-gray-400">
                          {new Date(doc.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {/* Confidence Indicators */}
                    <div className="hidden md:flex items-center gap-4 text-sm">
                      <div className="text-center">
                        <div className={`font-medium ${getConfidenceColor(doc.extraction_confidence)}`}>
                          {doc.extraction_confidence ? `${doc.extraction_confidence}%` : 'N/A'}
                        </div>
                        <div className="text-xs text-gray-500">Extraction</div>
                      </div>
                      <div className="text-center">
                        <div className={`font-medium ${getConfidenceColor(doc.classification_confidence)}`}>
                          {doc.classification_confidence ? `${doc.classification_confidence}%` : 'N/A'}
                        </div>
                        <div className="text-xs text-gray-500">Classification</div>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadgeClass(doc.status)}`}>
                      {getStatusIcon(doc.status)}
                      {doc.status === 'needs_review' ? 'Needs Review' : doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                    </span>

                    {/* Expand Icon */}
                    {expandedDoc === doc.id ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </div>
              </div>

              {/* Expanded Details */}
              {expandedDoc === doc.id && (
                <div className="border-t border-gray-200 bg-gray-50 p-4 space-y-4">
                  {/* Document Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <div className="text-xs text-gray-500 mb-1">File Name</div>
                      <div className="text-sm font-medium">{doc.file_name}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">File Type</div>
                      <div className="text-sm font-medium">{doc.file_type}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Extraction Method</div>
                      <div className="text-sm font-medium">{doc.extraction_method || 'N/A'}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Score Impact</div>
                      <div className="text-sm font-medium text-green-600">
                        {doc.score_impact ? `+${doc.score_impact} pts` : 'Not set'}
                      </div>
                    </div>
                  </div>

                  {/* AI Reasoning */}
                  {doc.ai_reasoning && (
                    <div>
                      <div className="text-xs text-gray-500 mb-1">AI Reasoning</div>
                      <div className="text-sm bg-white p-3 rounded-lg border border-gray-200">
                        {doc.ai_reasoning}
                      </div>
                    </div>
                  )}

                  {/* AI Notes */}
                  {doc.ai_notes && (
                    <div>
                      <div className="text-xs text-gray-500 mb-1">AI Notes</div>
                      <div className="text-sm bg-white p-3 rounded-lg border border-gray-200">
                        {doc.ai_notes}
                      </div>
                    </div>
                  )}

                  {/* Extracted Text Preview */}
                  {doc.extracted_text && (
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Extracted Text (Preview)</div>
                      <div className="text-sm bg-white p-3 rounded-lg border border-gray-200 max-h-32 overflow-y-auto">
                        {doc.extracted_text.substring(0, 500)}
                        {doc.extracted_text.length > 500 && '...'}
                      </div>
                    </div>
                  )}

                  {/* Admin Notes Input */}
                  {(doc.status === 'pending' || doc.status === 'needs_review') && (
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Admin Notes (Optional)</div>
                      <textarea
                        value={adminNotes[doc.id] || ''}
                        onChange={(e) => setAdminNotes({ ...adminNotes, [doc.id]: e.target.value })}
                        placeholder="Add notes about your review decision..."
                        rows={2}
                        className="w-full text-sm p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-3 pt-2">
                    <a
                      href={doc.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      <Eye className="w-4 h-4" />
                      View Document
                    </a>

                    {(doc.status === 'pending' || doc.status === 'needs_review') && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            // Use a default score impact of 10 if not set, or use the AI suggested one
                            const score = doc.score_impact || 10;
                            updateDocumentStatus(doc.id, 'verified', score);
                          }}
                          disabled={processingId === doc.id}
                          className="flex items-center gap-2 px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50"
                        >
                          {processingId === doc.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <ThumbsUp className="w-4 h-4" />
                          )}
                          Approve
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            updateDocumentStatus(doc.id, 'rejected');
                          }}
                          disabled={processingId === doc.id}
                          className="flex items-center gap-2 px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50"
                        >
                          {processingId === doc.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <ThumbsDown className="w-4 h-4" />
                          )}
                          Reject
                        </button>
                      </>
                    )}

                    {doc.status === 'verified' && (
                      <span className="text-sm text-green-600 flex items-center gap-1">
                        <CheckCircle className="w-4 h-4" />
                        Approved {doc.reviewed_at && `on ${new Date(doc.reviewed_at).toLocaleDateString()}`}
                      </span>
                    )}

                    {doc.status === 'rejected' && (
                      <span className="text-sm text-red-600 flex items-center gap-1">
                        <XCircle className="w-4 h-4" />
                        Rejected {doc.reviewed_at && `on ${new Date(doc.reviewed_at).toLocaleDateString()}`}
                      </span>
                    )}
                  </div>

                  {/* Previous Admin Notes */}
                  {doc.admin_notes && (
                    <div className="pt-2 border-t border-gray-200">
                      <div className="text-xs text-gray-500 mb-1">Previous Admin Notes</div>
                      <div className="text-sm text-gray-700">{doc.admin_notes}</div>
                    </div>
                  )}
                </div>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  );
}