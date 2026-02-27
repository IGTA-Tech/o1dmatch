import { createClient } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent, Badge } from '@/components/ui';
import {
  ArrowLeft,
  Building2,
  Briefcase,
  DollarSign,
  MapPin,
  Calendar,
  FileText,
  Download,
  Clock,
  Lock,
} from 'lucide-react';
import Link from 'next/link';
import LetterResponseActions from './LetterResponseActions';
import Image from 'next/image';

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ action?: string }>;
}

export default async function TalentLetterDetailPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const { action } = await searchParams;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Get talent profile
  const { data: talentProfile } = await supabase
    .from('talent_profiles')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle();

  if (!talentProfile) {
    redirect('/dashboard/talent');
  }

  // Check subscription tier
  const { data: subscription } = await supabase
    .from('talent_subscriptions')
    .select('tier')
    .eq('talent_id', user.id)
    .single();

  const isFreeTier = !subscription || subscription.tier === 'profile_only';

  // If free tier, show upgrade prompt instead of letter content
  if (isFreeTier) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/talent/letters"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Interest Letter</h1>
            <p className="text-gray-600">Upgrade required to view this letter</p>
          </div>
        </div>

        <Card>
          <CardContent className="text-center py-16">
            <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-amber-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Upgrade to View This Letter
            </h3>
            <p className="text-gray-600 max-w-md mx-auto mb-6">
              Interest letters from employers are available on paid plans. Upgrade your subscription to view, accept, and sign letters from companies interested in sponsoring your O-1 visa.
            </p>
            <Link
              href="/dashboard/talent/billing"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              View Plans &amp; Upgrade
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Get the letter
  const { data: letter, error } = await supabase
    .from('interest_letters')
    .select(`
      *,
      employer:employer_profiles(
        id,
        company_name,
        company_website,
        company_logo_url
      ),
      agency:agency_profiles(
        id,
        agency_name
      ),
      agency_client:agency_clients(
        id,
        company_name
      ),
      job:job_listings(
        id,
        title,
        department
      )
    `)
    .eq('id', id)
    .eq('talent_id', talentProfile.id)
    .maybeSingle();

  if (error || !letter) {
    notFound();
  }

  // Get employer/agency user info for contact
  let senderName = 'Unknown';
  let senderCompany = 'Unknown Company';

  if (letter.source_type === 'employer' && letter.employer) {
    senderCompany = letter.employer.company_name || 'Unknown Company';
    senderName = senderCompany;
  } else if (letter.source_type === 'agency') {
    if (letter.agency_client) {
      senderCompany = letter.agency_client.company_name;
    }
    if (letter.agency) {
      senderName = `${letter.agency.agency_name} (Agency)`;
    }
  }

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  }

  function formatSalary(min?: number | null, max?: number | null) {
    if (!min && !max) return 'Not specified';
    if (min && max) return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
    if (min) return `$${min.toLocaleString()}+`;
    return `Up to $${(max || 0).toLocaleString()}`;
  }

  function getStatusBadge(status: string) {
    switch (status) {
      case 'draft':
        return { label: 'Draft', variant: 'default' as const };
      case 'sent':
        return { label: 'New', variant: 'info' as const };
      case 'viewed':
        return { label: 'Viewed', variant: 'info' as const };
      case 'accepted':
        return { label: 'Accepted', variant: 'success' as const };
      case 'declined':
        return { label: 'Declined', variant: 'error' as const };
      case 'expired':
        return { label: 'Expired', variant: 'default' as const };
      default:
        return { label: status, variant: 'default' as const };
    }
  }

  function getSignatureStatusBadge(signatureStatus: string | null) {
    switch (signatureStatus) {
      case 'admin_reviewing':
        return { label: 'Pending Admin Review', variant: 'warning' as const };
      case 'approved':
        return { label: 'Signature Approved', variant: 'success' as const };
      case 'forwarded_to_employer':
        return { label: 'Sent to Employer', variant: 'success' as const };
      default:
        return null;
    }
  }

  function getCommitmentLabel(level: string) {
    return level.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  }

  const status = getStatusBadge(letter.status || 'sent');
  const signatureStatus = getSignatureStatusBadge(letter.signature_status);
  const canRespond = ['sent', 'viewed'].includes(letter.status || '');

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/talent/letters"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Interest Letter</h1>
            <p className="text-gray-600">From {senderName}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={status.variant} className="text-sm px-3 py-1">
            {status.label}
          </Badge>
        </div>
      </div>

      {/* Action Banner */}
      {canRespond && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-800 font-medium mb-2">
            You have received an interest letter for the position of {letter.job_title}
          </p>
          <p className="text-blue-600 text-sm">
            Review the details below and respond to this letter.
          </p>
        </div>
      )}

      {/* Sender Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            From
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 bg-gray-100 rounded-lg flex items-center justify-center">
              {letter.employer?.company_logo_url ? (
                <Image
                  src={letter.employer.company_logo_url}
                  alt={senderCompany}
                  width={48}
                  height={48}
                  className="w-12 h-12 object-contain rounded"
                />
              ) : (
                <Building2 className="w-7 h-7 text-gray-400" />
              )}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{senderCompany}</h3>
              {letter.source_type === 'agency' && letter.agency && (
                <p className="text-gray-600">Represented by {letter.agency.agency_name}</p>
              )}
              {letter.employer?.company_website && (
                <a 
                  href={letter.employer.company_website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline text-sm"
                >
                  {letter.employer.company_website}
                </a>
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
            {letter.department && (
              <div>
                <p className="text-sm text-gray-500">Department</p>
                <p className="font-medium text-gray-900">{letter.department}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-gray-500">Commitment Level</p>
              <p className="font-medium text-gray-900 capitalize">
                {getCommitmentLabel(letter.commitment_level)}
              </p>
            </div>
            {letter.engagement_type && (
              <div>
                <p className="text-sm text-gray-500">Engagement Type</p>
                <p className="font-medium text-gray-900 capitalize">
                  {letter.engagement_type.replace(/_/g, ' ')}
                </p>
              </div>
            )}
            {letter.work_arrangement && (
              <div>
                <p className="text-sm text-gray-500">Work Arrangement</p>
                <p className="font-medium text-gray-900 capitalize">
                  {letter.work_arrangement.replace(/_/g, ' ')}
                </p>
              </div>
            )}
            {letter.start_timing && (
              <div>
                <p className="text-sm text-gray-500">Start Timing</p>
                <p className="font-medium text-gray-900">{letter.start_timing}</p>
              </div>
            )}
          </div>

          {letter.locations && letter.locations.length > 0 && (
            <div>
              <p className="text-sm text-gray-500">Locations</p>
              <div className="flex flex-wrap gap-2 mt-1">
                {letter.locations.map((loc: string, i: number) => (
                  <span
                    key={i}
                    className="px-2 py-1 bg-gray-100 rounded text-sm text-gray-700 flex items-center gap-1"
                  >
                    <MapPin className="w-3 h-3" />
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
            O-1 Visa Justification
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

      {/* Personal Message */}
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

      {/* Attachment */}
      {letter.pdf_url && (
        <Card>
          <CardHeader>
            <CardTitle>Attachment</CardTitle>
          </CardHeader>
          <CardContent>
            <a 
              href={letter.pdf_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Download className="w-4 h-4" />
              Download Attachment
            </a>
          </CardContent>
        </Card>
      )}

      {/* Response Actions */}
      {canRespond && (
        <LetterResponseActions 
          letterId={letter.id} 
          initialAction={action}
        />
      )}

      {/* Already Responded - Accepted */}
      {letter.status === 'accepted' && (
        <Card>
          <CardContent className="bg-green-50 border-green-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="font-medium text-green-800">You accepted and signed this letter</p>
                {letter.responded_at && (
                  <p className="text-sm text-green-600">on {formatDate(letter.responded_at)}</p>
                )}
              </div>
              {signatureStatus && (
                <Badge variant={signatureStatus.variant} className="text-xs">
                  {signatureStatus.label}
                </Badge>
              )}
            </div>
            
            {/* Show signature status info */}
            {letter.signature_status === 'admin_reviewing' && (
              <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center gap-2 text-yellow-800">
                  <Clock className="w-4 h-4" />
                  <p className="text-sm font-medium">Your signed letter is being reviewed by the admin team.</p>
                </div>
                <p className="text-xs text-yellow-600 mt-1">
                  Once approved, it will be forwarded to the employer.
                </p>
              </div>
            )}

            {letter.signature_status === 'forwarded_to_employer' && (
              <div className="mt-3 p-3 bg-green-100 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800">
                  ✓ Your signed letter has been approved and forwarded to the employer.
                </p>
              </div>
            )}

            {letter.talent_response_message && (
              <p className="mt-3 text-gray-700 bg-white p-3 rounded border">
                {letter.talent_response_message}
              </p>
            )}

            {/* Show signature preview */}
            {letter.talent_signature_data && (
              <div className="mt-3">
                <p className="text-sm text-gray-500 mb-2">Your Signature</p>
                <div className="bg-white p-2 rounded border inline-block">
                  <img 
                    src={letter.talent_signature_data} 
                    alt="Your signature" 
                    className="h-16 object-contain"
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Already Responded - Declined */}
      {letter.status === 'declined' && (
        <Card>
          <CardContent className="bg-red-50 border-red-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-red-800">You declined this letter</p>
                {letter.responded_at && (
                  <p className="text-sm text-red-600">on {formatDate(letter.responded_at)}</p>
                )}
              </div>
            </div>
            {letter.talent_response_message && (
              <p className="mt-3 text-gray-700 bg-white p-3 rounded border">
                {letter.talent_response_message}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Meta Info */}
      <Card>
        <CardContent className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Received {formatDate(letter.created_at)}
          </div>
          {letter.expires_at && (
            <p className="text-orange-600">
              Expires {formatDate(letter.expires_at)}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}