import { createClient } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent, Badge } from '@/components/ui';
import {
  ArrowLeft,
  User,
  Building2,
  Briefcase,
  FileSignature,
  Calendar,
  CheckCircle,
  Clock,
  Download,
  FileText,
} from 'lucide-react';
import Link from 'next/link';
import AdminSignatureActions from './AdminSignatureActions';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminSignedLetterDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Check if user is admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();

  if (profile?.role !== 'admin') {
    redirect('/dashboard');
  }

  // Get the letter
  const { data: letter, error } = await supabase
    .from('interest_letters')
    .select(`
      *,
      talent:talent_profiles(
        id,
        user_id,
        skills,
        professional_headline
      ),
      employer:employer_profiles(
        id,
        company_name,
        company_website
      )
    `)
    .eq('id', id)
    .maybeSingle();

  if (error || !letter) {
    notFound();
  }

  // Get talent user info
  let talentUser: { full_name: string; email: string } | null = null;
  if (letter.talent?.user_id) {
    const { data: talentProfile } = await supabase
      .from('profiles')
      .select('full_name, email')
      .eq('id', letter.talent.user_id)
      .maybeSingle();
    talentUser = talentProfile;
  }

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  function getSignatureStatusBadge(status: string | null) {
    switch (status) {
      case 'admin_reviewing':
        return { label: 'Pending Review', variant: 'warning' as const };
      case 'approved':
        return { label: 'Approved', variant: 'success' as const };
      case 'forwarded_to_employer':
        return { label: 'Forwarded to Employer', variant: 'success' as const };
      default:
        return { label: status || 'Unknown', variant: 'default' as const };
    }
  }

  const signatureStatus = getSignatureStatusBadge(letter.signature_status);
  const isPendingReview = letter.signature_status === 'admin_reviewing';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/admin/signed-letters"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Review Signed Letter</h1>
            <p className="text-gray-600">{letter.job_title}</p>
          </div>
        </div>
        <Badge variant={signatureStatus.variant} className="text-sm px-3 py-1">
          {signatureStatus.label}
        </Badge>
      </div>

      {/* Workflow Info Banner */}
      {isPendingReview && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-yellow-800">
            <Clock className="w-5 h-5" />
            <p className="font-medium">This signed letter needs your review</p>
          </div>
          <p className="text-sm text-yellow-600 mt-1">
            Review the talent&apos;s signature and forward to the employer when ready.
          </p>
        </div>
      )}

      {letter.signature_status === 'forwarded_to_employer' && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-green-800">
            <CheckCircle className="w-5 h-5" />
            <p className="font-medium">This letter has been forwarded to the employer</p>
          </div>
          {letter.forwarded_to_employer_at && (
            <p className="text-sm text-green-600 mt-1">
              Forwarded on {formatDate(letter.forwarded_to_employer_at)}
            </p>
          )}
        </div>
      )}

      {/* Parties Involved */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Talent Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <User className="w-5 h-5" />
              Talent
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">{talentUser?.full_name || 'Unknown'}</p>
                <p className="text-sm text-gray-500">{talentUser?.email}</p>
                {letter.talent?.professional_headline && (
                  <p className="text-xs text-gray-400 mt-1">{letter.talent.professional_headline}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Employer Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Building2 className="w-5 h-5" />
              Employer
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <Building2 className="w-6 h-6 text-gray-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">{letter.employer?.company_name || 'Unknown'}</p>
                {letter.employer?.company_website && (
                  <a
                    href={letter.employer.company_website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    {letter.employer.company_website}
                  </a>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Position Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="w-5 h-5" />
            Position Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-500">Job Title</p>
              <p className="font-medium text-gray-900">{letter.job_title}</p>
            </div>
            {letter.department && (
              <div>
                <p className="text-sm text-gray-500">Department</p>
                <p className="font-medium text-gray-900">{letter.department}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-gray-500">Commitment</p>
              <p className="font-medium text-gray-900 capitalize">
                {letter.commitment_level?.replace(/_/g, ' ')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Signature Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSignature className="w-5 h-5" />
            Talent&apos;s Signature
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {letter.talent_signature_data ? (
            <div className="space-y-3">
              <div className="bg-white p-4 border-2 border-gray-200 rounded-lg inline-block">
                <img
                  src={letter.talent_signature_data}
                  alt="Talent signature"
                  className="h-24 object-contain"
                />
              </div>
              {letter.talent_signed_at && (
                <p className="text-sm text-gray-500 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Signed on {formatDate(letter.talent_signed_at)}
                </p>
              )}
            </div>
          ) : (
            <p className="text-gray-500">No signature data available</p>
          )}

          {letter.talent_response_message && (
            <div>
              <p className="text-sm text-gray-500 mb-2">Talent&apos;s Message</p>
              <p className="text-gray-900 bg-gray-50 p-3 rounded-lg whitespace-pre-wrap">
                {letter.talent_response_message}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Letter Content Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Letter Content
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-gray-500 mb-1">Job Duties</p>
            <p className="text-gray-900 whitespace-pre-wrap text-sm bg-gray-50 p-3 rounded">
              {letter.duties_description}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Why O-1 Required</p>
            <p className="text-gray-900 whitespace-pre-wrap text-sm bg-gray-50 p-3 rounded">
              {letter.why_o1_required}
            </p>
          </div>
          {letter.pdf_url && (
            <a
              href={letter.pdf_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Download className="w-4 h-4" />
              Download Original Attachment
            </a>
          )}
        </CardContent>
      </Card>

      {/* Admin Actions */}
      {isPendingReview && (
        <AdminSignatureActions letterId={letter.id} />
      )}

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <div className="w-2 h-2 bg-gray-400 rounded-full" />
              <span className="text-gray-500">Letter created:</span>
              <span className="text-gray-900">{formatDate(letter.created_at)}</span>
            </div>
            {letter.responded_at && (
              <div className="flex items-center gap-3 text-sm">
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                <span className="text-gray-500">Talent responded:</span>
                <span className="text-gray-900">{formatDate(letter.responded_at)}</span>
              </div>
            )}
            {letter.talent_signed_at && (
              <div className="flex items-center gap-3 text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span className="text-gray-500">Talent signed:</span>
                <span className="text-gray-900">{formatDate(letter.talent_signed_at)}</span>
              </div>
            )}
            {letter.signature_reviewed_at && (
              <div className="flex items-center gap-3 text-sm">
                <div className="w-2 h-2 bg-purple-500 rounded-full" />
                <span className="text-gray-500">Admin reviewed:</span>
                <span className="text-gray-900">{formatDate(letter.signature_reviewed_at)}</span>
              </div>
            )}
            {letter.forwarded_to_employer_at && (
              <div className="flex items-center gap-3 text-sm">
                <div className="w-2 h-2 bg-green-600 rounded-full" />
                <span className="text-gray-500">Forwarded to employer:</span>
                <span className="text-gray-900">{formatDate(letter.forwarded_to_employer_at)}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}