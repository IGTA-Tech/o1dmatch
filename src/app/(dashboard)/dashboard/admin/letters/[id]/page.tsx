// src/app/(dashboard)/dashboard/admin/letters/[id]/page.tsx

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent, Badge } from '@/components/ui';
import {
  ArrowLeft,
  User,
  Building2,
  Briefcase,
  DollarSign,
  Calendar,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  FileSignature,
  Send,
  Download,
  Paperclip,
  ExternalLink,
} from 'lucide-react';
import Link from 'next/link';
import { AdminReviewActions } from './AdminReviewActions';
import { AdminSignatureActions } from './AdminSignatureActions';

export default async function AdminLetterDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Verify admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') {
    redirect('/dashboard');
  }

  // Get letter details
  const { data: letter, error } = await supabase
    .from('interest_letters')
    .select(`
      *,
      employer:employer_profiles(
        id,
        company_name,
        company_website,
        company_description,
        city,
        state,
        industry,
        signatory_name,
        signatory_title,
        signatory_email
      ),
      talent:talent_profiles(
        id,
        first_name,
        last_name,
        user_id,
        professional_headline,
        skills,
        current_job_title,
        years_experience,
        o1_score
      )
    `)
    .eq('id', id)
    .single();

  if (error || !letter) {
    redirect('/dashboard/admin/letters');
  }

  // Get talent user info
  let talentUser: { full_name: string; email: string } | null = null;
  if (letter.talent?.user_id) {
    const { data: talentProfile } = await supabase
      .from('profiles')
      .select('full_name, email')
      .eq('id', letter.talent.user_id)
      .single();
    talentUser = talentProfile;
  }

  // Get admin reviewer info if reviewed
  let reviewerInfo: { full_name: string } | null = null;
  if (letter.admin_reviewed_by) {
    const { data: reviewer } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', letter.admin_reviewed_by)
      .single();
    reviewerInfo = reviewer;
  }

  // Get signature reviewer info if reviewed
  let signatureReviewerInfo: { full_name: string } | null = null;
  if (letter.signature_reviewed_by) {
    const { data: sigReviewer } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', letter.signature_reviewed_by)
      .single();
    signatureReviewerInfo = sigReviewer;
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatSalary = (min?: number | null, max?: number | null) => {
    if (!min && !max) return 'Not specified';
    if (min && max) return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
    if (min) return `$${min.toLocaleString()}+`;
    return `Up to $${(max || 0).toLocaleString()}`;
  };

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
            Signature Pending Review
          </Badge>
        );
      case 'forwarded_to_employer':
        return (
          <Badge variant="success">
            <Send className="w-3 h-3 mr-1" />
            Signature Forwarded
          </Badge>
        );
      default:
        return null;
    }
  };

  // Helper function to get filename from URL
  const getFilenameFromUrl = (url: string) => {
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      const filename = pathname.split('/').pop() || 'interest-letter.pdf';
      return decodeURIComponent(filename);
    } catch {
      return 'interest-letter.pdf';
    }
  };

  const isPending = letter.admin_status === 'pending_review';
  const isPendingSignatureReview = letter.signature_status === 'admin_reviewing';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/admin/letters"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Review Letter</h1>
            <p className="text-gray-600">{letter.job_title}</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          {getStatusBadge(letter.admin_status || 'pending_review')}
          {getSignatureStatusBadge(letter.signature_status)}
        </div>
      </div>

      {/* Signature Review Alert Banner */}
      {isPendingSignatureReview && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-purple-800">
            <FileSignature className="w-5 h-5" />
            <p className="font-medium">This letter has a signed document awaiting your review</p>
          </div>
          <p className="text-sm text-purple-600 mt-1">
            Review the talent&apos;s signature below and forward to the employer when ready.
          </p>
        </div>
      )}

      {/* Review Status Card */}
      {!isPending && !isPendingSignatureReview && (
        <Card className={letter.admin_status === 'approved' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full ${letter.admin_status === 'approved' ? 'bg-green-100' : 'bg-red-100'}`}>
                {letter.admin_status === 'approved' ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-600" />
                )}
              </div>
              <div>
                <p className={`font-medium ${letter.admin_status === 'approved' ? 'text-green-800' : 'text-red-800'}`}>
                  {letter.admin_status === 'approved' ? 'Approved' : 'Rejected'} by {reviewerInfo?.full_name || 'Admin'}
                </p>
                <p className={`text-sm ${letter.admin_status === 'approved' ? 'text-green-600' : 'text-red-600'}`}>
                  {letter.admin_reviewed_at && formatDate(letter.admin_reviewed_at)}
                </p>
                {letter.admin_notes && (
                  <p className="text-sm mt-2 text-gray-700">
                    <strong>Notes:</strong> {letter.admin_notes}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons for Pending Letter Review */}
      {isPending && (
        <AdminReviewActions letterId={letter.id} />
      )}

      {/* Employer Attached Letter - Download Section */}
      {letter.pdf_url && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <Paperclip className="w-5 h-5" />
              Employer&apos;s Attached Letter
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white rounded-lg border border-blue-200">
                  <FileText className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {getFilenameFromUrl(letter.pdf_url)}
                  </p>
                  <p className="text-sm text-gray-500">
                    Uploaded by {letter.employer?.company_name || 'Employer'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={letter.pdf_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 text-blue-700 bg-white border border-blue-300 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  View
                </a>
                <a
                  href={letter.pdf_url}
                  download
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Download
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Talent Signature Section - Show if talent has signed */}
      {letter.talent_signature_data && (
        <Card className={isPendingSignatureReview ? 'border-2 border-purple-300' : ''}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileSignature className="w-5 h-5 text-purple-600" />
              Talent&apos;s Signature
              {isPendingSignatureReview && (
                <Badge variant="info" className="bg-purple-100 text-purple-700 ml-2">
                  Needs Review
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Signature Display */}
            <div>
              <p className="text-sm text-gray-500 mb-2">Signature</p>
              <div className="bg-white p-4 border-2 border-gray-200 rounded-lg inline-block">
                <img
                  src={letter.talent_signature_data}
                  alt="Talent signature"
                  className="h-24 object-contain"
                />
              </div>
            </div>

            {/* Signed Date */}
            {letter.talent_signed_at && (
              <p className="text-sm text-gray-500 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Signed on {formatDate(letter.talent_signed_at)}
              </p>
            )}

            {/* Talent's Message */}
            {letter.talent_response_message && (
              <div>
                <p className="text-sm text-gray-500 mb-2">Talent&apos;s Message</p>
                <p className="text-gray-900 bg-gray-50 p-3 rounded-lg whitespace-pre-wrap">
                  {letter.talent_response_message}
                </p>
              </div>
            )}

            {/* Forwarded Status */}
            {letter.signature_status === 'forwarded_to_employer' && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 text-green-700">
                  <CheckCircle className="w-4 h-4" />
                  <p className="text-sm font-medium">
                    Signature forwarded to employer
                    {signatureReviewerInfo && ` by ${signatureReviewerInfo.full_name}`}
                  </p>
                </div>
                {letter.forwarded_to_employer_at && (
                  <p className="text-xs text-green-600 mt-1">
                    {formatDate(letter.forwarded_to_employer_at)}
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Signature Review Actions */}
      {isPendingSignatureReview && (
        <AdminSignatureActions letterId={letter.id} />
      )}

      {/* Employer Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Employer Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Company</p>
              <p className="font-medium text-gray-900">{letter.employer?.company_name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Industry</p>
              <p className="font-medium text-gray-900">{letter.employer?.industry || 'Not specified'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Location</p>
              <p className="font-medium text-gray-900">
                {letter.employer?.city && letter.employer?.state 
                  ? `${letter.employer.city}, ${letter.employer.state}` 
                  : 'Not specified'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Website</p>
              {letter.employer?.company_website ? (
                <a 
                  href={letter.employer.company_website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="font-medium text-blue-600 hover:underline"
                >
                  {letter.employer.company_website}
                </a>
              ) : (
                <p className="font-medium text-gray-900">Not specified</p>
              )}
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t">
            <p className="text-sm text-gray-500 mb-2">Signatory</p>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-gray-500" />
              </div>
              <div>
                <p className="font-medium text-gray-900">{letter.employer?.signatory_name}</p>
                <p className="text-sm text-gray-600">{letter.employer?.signatory_title}</p>
                <p className="text-sm text-gray-500">{letter.employer?.signatory_email}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Talent Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Talent Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="w-7 h-7 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">
                {letter.talent?.first_name} {letter.talent?.last_name}
              </h3>
              <p className="text-gray-600">{letter.talent?.professional_headline || letter.talent?.current_job_title}</p>
              <p className="text-sm text-gray-500">{talentUser?.email}</p>
              
              <div className="flex items-center gap-4 mt-2 text-sm">
                {letter.talent?.years_experience && (
                  <span className="text-gray-600">{letter.talent.years_experience} years exp</span>
                )}
                {letter.talent?.o1_score && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                    O-1 Score: {letter.talent.o1_score}%
                  </span>
                )}
              </div>

              {letter.talent?.skills && letter.talent.skills.length > 0 && (
                <div className="mt-3">
                  <div className="flex flex-wrap gap-2">
                    {letter.talent.skills.slice(0, 8).map((skill: string, index: number) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-100 rounded text-sm text-gray-700"
                      >
                        {skill}
                      </span>
                    ))}
                    {letter.talent.skills.length > 8 && (
                      <span className="px-2 py-1 text-sm text-gray-500">
                        +{letter.talent.skills.length - 8} more
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Position Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="w-5 h-5" />
            Position Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Job Title</p>
              <p className="font-medium text-gray-900">{letter.job_title}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Commitment Level</p>
              <p className="font-medium text-gray-900 capitalize">
                {letter.commitment_level?.replace(/_/g, ' ')}
              </p>
            </div>
            {letter.department && (
              <div>
                <p className="text-sm text-gray-500">Department</p>
                <p className="font-medium text-gray-900">{letter.department}</p>
              </div>
            )}
            {letter.engagement_type && (
              <div>
                <p className="text-sm text-gray-500">Engagement Type</p>
                <p className="font-medium text-gray-900 capitalize">
                  {letter.engagement_type?.replace(/_/g, ' ')}
                </p>
              </div>
            )}
          </div>

          {letter.locations && letter.locations.length > 0 && (
            <div>
              <p className="text-sm text-gray-500 mb-1">Locations</p>
              <div className="flex flex-wrap gap-2">
                {letter.locations.map((loc: string, i: number) => (
                  <span key={i} className="px-2 py-1 bg-gray-100 rounded text-sm text-gray-700">
                    {loc}
                  </span>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Compensation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Compensation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div>
              <p className="text-sm text-gray-500">Salary Range</p>
              <p className="text-xl font-semibold text-gray-900">
                {formatSalary(letter.salary_min, letter.salary_max)}
              </p>
            </div>
            {letter.salary_negotiable && <Badge variant="info">Negotiable</Badge>}
          </div>
        </CardContent>
      </Card>

      {/* O-1 Justification */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            O-1 Justification
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-gray-500 mb-1">Job Duties & Responsibilities</p>
            <p className="text-gray-900 whitespace-pre-wrap">{letter.duties_description}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Why O-1 Visa is Required</p>
            <p className="text-gray-900 whitespace-pre-wrap">{letter.why_o1_required}</p>
          </div>
        </CardContent>
      </Card>

      {/* Letter Content */}
      {letter.letter_content && (
        <Card>
          <CardHeader>
            <CardTitle>Personal Message</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-900 whitespace-pre-wrap">{letter.letter_content}</p>
          </CardContent>
        </Card>
      )}

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <div className="w-2 h-2 bg-gray-400 rounded-full" />
              <span className="text-gray-600 w-36">Created:</span>
              <span className="text-gray-900">{formatDate(letter.created_at)}</span>
            </div>
            {letter.admin_reviewed_at && (
              <div className="flex items-center gap-3 text-sm">
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                <span className="text-gray-600 w-36">Letter Reviewed:</span>
                <span className="text-gray-900">{formatDate(letter.admin_reviewed_at)}</span>
              </div>
            )}
            {letter.responded_at && (
              <div className="flex items-center gap-3 text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span className="text-gray-600 w-36">Talent Responded:</span>
                <span className="text-gray-900">{formatDate(letter.responded_at)}</span>
              </div>
            )}
            {letter.talent_signed_at && (
              <div className="flex items-center gap-3 text-sm">
                <div className="w-2 h-2 bg-purple-500 rounded-full" />
                <span className="text-gray-600 w-36">Talent Signed:</span>
                <span className="text-gray-900">{formatDate(letter.talent_signed_at)}</span>
              </div>
            )}
            {letter.signature_reviewed_at && (
              <div className="flex items-center gap-3 text-sm">
                <div className="w-2 h-2 bg-indigo-500 rounded-full" />
                <span className="text-gray-600 w-36">Signature Reviewed:</span>
                <span className="text-gray-900">{formatDate(letter.signature_reviewed_at)}</span>
              </div>
            )}
            {letter.forwarded_to_employer_at && (
              <div className="flex items-center gap-3 text-sm">
                <div className="w-2 h-2 bg-green-600 rounded-full" />
                <span className="text-gray-600 w-36">Forwarded:</span>
                <span className="text-gray-900">{formatDate(letter.forwarded_to_employer_at)}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}