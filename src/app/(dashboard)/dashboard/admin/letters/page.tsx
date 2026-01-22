// src/app/(dashboard)/dashboard/admin/letters/page.tsx

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent, Badge } from '@/components/ui';
import {
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  ArrowRight,
  FileSignature,
  Send,
  Filter,
} from 'lucide-react';
import Link from 'next/link';

interface PageProps {
  searchParams: Promise<{ status?: string; signature?: string }>;
}

export default async function AdminLettersPage({ searchParams }: PageProps) {
  const { status, signature } = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Build query
  let query = supabase
    .from('interest_letters')
    .select(`
      id,
      job_title,
      commitment_level,
      admin_status,
      status,
      signature_status,
      talent_signed_at,
      forwarded_to_employer_at,
      created_at,
      admin_reviewed_at,
      employer:employer_profiles(id, company_name),
      talent:talent_profiles(id, first_name, last_name)
    `)
    .order('created_at', { ascending: false });

  // Filter by admin_status if provided
  if (status && status !== 'all') {
    query = query.eq('admin_status', status);
  }

  // Filter by signature_status if provided
  if (signature && signature !== 'all') {
    query = query.eq('signature_status', signature);
  }

  const { data: letters, error } = await query;

  if (error) {
    console.error('Error fetching letters:', error);
  }

  // Get counts for tabs
  const [
    { count: allCount },
    { count: pendingCount },
    { count: approvedCount },
    { count: rejectedCount },
    { count: awaitingSignatureReviewCount },
    { count: signatureForwardedCount },
  ] = await Promise.all([
    supabase.from('interest_letters').select('*', { count: 'exact', head: true }),
    supabase.from('interest_letters').select('*', { count: 'exact', head: true }).eq('admin_status', 'pending_review'),
    supabase.from('interest_letters').select('*', { count: 'exact', head: true }).eq('admin_status', 'approved'),
    supabase.from('interest_letters').select('*', { count: 'exact', head: true }).eq('admin_status', 'rejected'),
    supabase.from('interest_letters').select('*', { count: 'exact', head: true }).eq('signature_status', 'admin_reviewing'),
    supabase.from('interest_letters').select('*', { count: 'exact', head: true }).eq('signature_status', 'forwarded_to_employer'),
  ]);

  // Check if any filter is active
  const hasActiveFilter = (status && status !== 'all') || (signature && signature !== 'all');

  const getStatusBadge = (adminStatus: string) => {
    switch (adminStatus) {
      case 'pending_review':
        return <Badge variant="warning">Pending Review</Badge>;
      case 'approved':
        return <Badge variant="success">Approved</Badge>;
      case 'rejected':
        return <Badge variant="error">Rejected</Badge>;
      default:
        return <Badge variant="default">{adminStatus}</Badge>;
    }
  };

  const getSignatureStatusBadge = (signatureStatus: string | null) => {
    switch (signatureStatus) {
      case 'admin_reviewing':
        return (
          <Badge variant="info" className="bg-purple-100 text-purple-700 border-purple-200">
            <FileSignature className="w-3 h-3 mr-1" />
            Signature Pending
          </Badge>
        );
      case 'forwarded_to_employer':
        return (
          <Badge variant="success" className="bg-green-100 text-green-700">
            <Send className="w-3 h-3 mr-1" />
            Forwarded
          </Badge>
        );
      default:
        return null;
    }
  };

  const getStatusIcon = (adminStatus: string, signatureStatus: string | null) => {
    if (signatureStatus === 'admin_reviewing') {
      return <FileSignature className="w-5 h-5 text-purple-500" />;
    }
    
    switch (adminStatus) {
      case 'pending_review':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <FileText className="w-4 h-4 text-gray-500" />;
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Letter Management</h1>
          <p className="text-gray-600 mt-1">Review and manage interest letters</p>
        </div>
        
        {/* Alert for pending signature reviews */}
        {(awaitingSignatureReviewCount || 0) > 0 && (
          <Link
            href="/dashboard/admin/letters?signature=admin_reviewing"
            className="flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
          >
            <FileSignature className="w-5 h-5" />
            <span className="font-medium">{awaitingSignatureReviewCount} signature{(awaitingSignatureReviewCount || 0) !== 1 ? 's' : ''} need review</span>
          </Link>
        )}
      </div>

      {/* Unified Filter Section */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Filters</span>
          {hasActiveFilter && (
            <Link
              href="/dashboard/admin/letters"
              className="ml-auto text-xs text-blue-600 hover:underline"
            >
              Clear all filters
            </Link>
          )}
        </div>
        
        <div className="flex flex-wrap gap-2">
          {/* All Letters */}
          <Link
            href="/dashboard/admin/letters"
            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
              !status && !signature
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            All
            <span className={`ml-1.5 px-1.5 py-0.5 rounded text-xs ${
              !status && !signature ? 'bg-white/20' : 'bg-gray-100'
            }`}>
              {allCount || 0}
            </span>
          </Link>

          {/* Divider */}
          <div className="w-px h-8 bg-gray-300 mx-1" />

          {/* Letter Status Filters - Each resets to filter ALL records */}
          <Link
            href="/dashboard/admin/letters?status=pending_review"
            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
              status === 'pending_review' && !signature
                ? 'bg-yellow-500 text-white'
                : 'bg-white text-yellow-700 hover:bg-yellow-50 border border-yellow-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5 inline mr-1" />
            Pending
            <span className={`ml-1.5 px-1.5 py-0.5 rounded text-xs ${
              status === 'pending_review' && !signature ? 'bg-white/20' : 'bg-yellow-100'
            }`}>
              {pendingCount || 0}
            </span>
          </Link>

          <Link
            href="/dashboard/admin/letters?status=approved"
            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
              status === 'approved' && !signature
                ? 'bg-green-600 text-white'
                : 'bg-white text-green-700 hover:bg-green-50 border border-green-200'
            }`}
          >
            <CheckCircle className="w-3.5 h-3.5 inline mr-1" />
            Approved
            <span className={`ml-1.5 px-1.5 py-0.5 rounded text-xs ${
              status === 'approved' && !signature ? 'bg-white/20' : 'bg-green-100'
            }`}>
              {approvedCount || 0}
            </span>
          </Link>

          <Link
            href="/dashboard/admin/letters?status=rejected"
            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
              status === 'rejected' && !signature
                ? 'bg-red-600 text-white'
                : 'bg-white text-red-700 hover:bg-red-50 border border-red-200'
            }`}
          >
            <XCircle className="w-3.5 h-3.5 inline mr-1" />
            Rejected
            <span className={`ml-1.5 px-1.5 py-0.5 rounded text-xs ${
              status === 'rejected' && !signature ? 'bg-white/20' : 'bg-red-100'
            }`}>
              {rejectedCount || 0}
            </span>
          </Link>

          {/* Divider */}
          <div className="w-px h-8 bg-gray-300 mx-1" />

          {/* Signature Status Filters - Each resets to filter ALL records */}
          <Link
            href="/dashboard/admin/letters?signature=admin_reviewing"
            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
              signature === 'admin_reviewing' && !status
                ? 'bg-purple-600 text-white'
                : 'bg-white text-purple-700 hover:bg-purple-50 border border-purple-200'
            }`}
          >
            <FileSignature className="w-3.5 h-3.5 inline mr-1" />
            Awaiting Signature Review
            <span className={`ml-1.5 px-1.5 py-0.5 rounded text-xs ${
              signature === 'admin_reviewing' && !status ? 'bg-white/20' : 'bg-purple-100'
            }`}>
              {awaitingSignatureReviewCount || 0}
            </span>
          </Link>

          <Link
            href="/dashboard/admin/letters?signature=forwarded_to_employer"
            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
              signature === 'forwarded_to_employer' && !status
                ? 'bg-teal-600 text-white'
                : 'bg-white text-teal-700 hover:bg-teal-50 border border-teal-200'
            }`}
          >
            <Send className="w-3.5 h-3.5 inline mr-1" />
            Forwarded
            <span className={`ml-1.5 px-1.5 py-0.5 rounded text-xs ${
              signature === 'forwarded_to_employer' && !status ? 'bg-white/20' : 'bg-teal-100'
            }`}>
              {signatureForwardedCount || 0}
            </span>
          </Link>
        </div>
      </div>

      {/* Letters List */}
      <Card>
        <CardContent>
          {letters && letters.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {letters.map((letter) => (
                <div
                  key={letter.id}
                  className={`py-4 -mx-4 px-4 first:-mt-4 last:-mb-4 transition-colors ${
                    letter.signature_status === 'admin_reviewing'
                      ? 'bg-purple-50 hover:bg-purple-100'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {getStatusIcon(letter.admin_status || 'pending_review', letter.signature_status)}
                      <div>
                        <h4 className="font-medium text-gray-900">{letter.job_title}</h4>
                        <p className="text-sm text-gray-600">
                          {letter.employer?.company_name || 'Unknown Company'} → {letter.talent?.first_name} {letter.talent?.last_name}
                        </p>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <p className="text-xs text-gray-500">
                            Submitted: {formatDate(letter.created_at)}
                          </p>
                          {letter.admin_reviewed_at && (
                            <p className="text-xs text-gray-500">
                              • Reviewed: {formatDate(letter.admin_reviewed_at)}
                            </p>
                          )}
                          {letter.talent_signed_at && (
                            <p className="text-xs text-purple-600">
                              • Signed: {formatDate(letter.talent_signed_at)}
                            </p>
                          )}
                          {letter.forwarded_to_employer_at && (
                            <p className="text-xs text-green-600">
                              • Forwarded: {formatDate(letter.forwarded_to_employer_at)}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col items-end gap-1">
                        {getStatusBadge(letter.admin_status || 'pending_review')}
                        {getSignatureStatusBadge(letter.signature_status)}
                      </div>
                      
                      {letter.signature_status === 'admin_reviewing' ? (
                        <Link
                          href={`/dashboard/admin/letters/${letter.id}`}
                          className="flex items-center gap-1 px-3 py-1.5 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors"
                        >
                          <FileSignature className="w-4 h-4" />
                          Review
                        </Link>
                      ) : (
                        <Link
                          href={`/dashboard/admin/letters/${letter.id}`}
                          className="flex items-center gap-1 text-gray-400 hover:text-gray-600"
                        >
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No letters found</p>
              {hasActiveFilter && (
                <Link href="/dashboard/admin/letters" className="text-blue-600 hover:underline text-sm mt-2 inline-block">
                  Clear filters
                </Link>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}