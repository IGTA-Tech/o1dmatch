import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent, Badge } from '@/components/ui';
import {
  ArrowLeft,
  Building2,
  Calendar,
  Paperclip,
  ExternalLink,
  Mail,
  MapPin,
  Briefcase,
  DollarSign,
  Clock,
  FileText,
} from 'lucide-react';
import Link from 'next/link';

export default async function LetterDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: talentProfile } = await supabase
    .from('talent_profiles')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (!talentProfile) {
    redirect('/dashboard/talent');
  }

  // Get letter details
  const { data: letter } = await supabase
    .from('interest_letters')
    .select(`
      *,
      employer:employer_profiles(
        id,
        user_id,
        company_name,
        company_description,
        company_website,
        city,
        state,
        industry
      ),
      job:job_listings(
        id,
        title,
        description
      )
    `)
    .eq('id', id)
    .eq('talent_id', talentProfile.id)
    .single();

  if (!letter) {
    redirect('/dashboard/talent/inbox');
  }

  // Mark as read if unread
  if (letter.status === 'sent') {
    await supabase
      .from('interest_letters')
      .update({ 
        status: 'read',
      })
      .eq('id', id);
  }

  // Get employer contact email
  const { data: employerUser } = await supabase
    .from('profiles')
    .select('email')
    .eq('id', letter.employer?.user_id)
    .single();

  const formatSalary = (min?: number | null, max?: number | null) => {
    if (!min && !max) return 'Not specified';
    if (min && max) return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
    if (min) return `$${min.toLocaleString()}+`;
    return `Up to $${(max || 0).toLocaleString()}`;
  };

  const getCommitmentInfo = (level: string) => {
    switch (level) {
      case 'ready_to_hire':
        return { label: 'Ready to Hire', variant: 'success' as const, desc: 'Employer is prepared to make an offer' };
      case 'serious':
        return { label: 'Serious Interest', variant: 'info' as const, desc: 'Employer is actively looking to hire' };
      default:
        return { label: 'Exploratory', variant: 'default' as const, desc: 'Employer is gauging interest' };
    }
  };

  const commitment = getCommitmentInfo(letter.commitment_level);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/talent/inbox"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{letter.job_title}</h1>
          <p className="text-gray-600">
            From {letter.employer?.company_name}
          </p>
        </div>
        <Badge variant={commitment.variant} className="text-sm">
          {commitment.label}
        </Badge>
      </div>

      {/* Position Overview */}
      <Card>
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Building2 className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">
                  {letter.employer?.company_name}
                </h3>
                {letter.employer?.city && (
                  <p className="text-sm text-gray-500 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {letter.employer.city}, {letter.employer.state}
                  </p>
                )}
              </div>
            </div>
            <div className="text-sm text-gray-500 flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {new Date(letter.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {/* Position Details Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">Salary Range</p>
              <p className="font-medium text-gray-900 flex items-center gap-1">
                <DollarSign className="w-4 h-4 text-green-600" />
                {formatSalary(letter.salary_min, letter.salary_max)}
              </p>
              {letter.salary_negotiable && (
                <p className="text-xs text-green-600">Negotiable</p>
              )}
            </div>
            
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">Work Type</p>
              <p className="font-medium text-gray-900 capitalize">
                {letter.engagement_type?.replace('_', ' ') || 'Full-time'}
              </p>
            </div>

            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">Arrangement</p>
              <p className="font-medium text-gray-900 capitalize">
                {letter.work_arrangement?.replace('_', ' ') || 'Flexible'}
              </p>
            </div>

            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">Start Date</p>
              <p className="font-medium text-gray-900 flex items-center gap-1">
                <Clock className="w-4 h-4 text-blue-600" />
                {letter.start_timing || 'Flexible'}
              </p>
            </div>
          </div>

          {/* Locations */}
          {letter.locations && letter.locations.length > 0 && (
            <div className="mb-6">
              <p className="text-sm font-medium text-gray-700 mb-2">Location(s)</p>
              <div className="flex flex-wrap gap-2">
                {letter.locations.map((location: string, index: number) => (
                  <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                    {location}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Commitment Level Info */}
          <div className="p-4 bg-blue-50 rounded-lg mb-6">
            <p className="text-sm font-medium text-blue-900 mb-1">
              Employer Commitment: {commitment.label}
            </p>
            <p className="text-sm text-blue-700">{commitment.desc}</p>
          </div>
        </CardContent>
      </Card>

      {/* Job Duties */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="w-5 h-5" />
            Job Duties & Responsibilities
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 whitespace-pre-wrap">{letter.duties_description}</p>
        </CardContent>
      </Card>

      {/* Why O-1 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Why O-1 Talent is Required
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 whitespace-pre-wrap">{letter.why_o1_required}</p>
          <p className="mt-4 text-sm text-gray-500 bg-yellow-50 p-3 rounded-lg">
            💡 This justification may be used as supporting evidence in your O-1 visa petition.
          </p>
        </CardContent>
      </Card>

      {/* Personal Message */}
      {letter.letter_content && (
        <Card>
          <CardHeader>
            <CardTitle>Personal Message</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 whitespace-pre-wrap">{letter.letter_content}</p>
          </CardContent>
        </Card>
      )}

      {/* Attachment */}
      {letter.pdf_url && (
        <Card>
          <CardContent>
            <p className="text-sm font-medium text-gray-700 mb-2">Attachment</p>
            
              <a href={letter.pdf_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <Paperclip className="w-4 h-4 text-gray-600" />
              <span className="text-sm text-gray-900">View Attachment</span>
              <ExternalLink className="w-3 h-3 text-gray-400" />
            </a>
          </CardContent>
        </Card>
      )}

      {/* Company Info */}
      {letter.employer && (
        <Card>
          <CardHeader>
            <CardTitle>About {letter.employer.company_name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {letter.employer.company_description && (
              <p className="text-gray-600">{letter.employer.company_description}</p>
            )}
            
            <div className="flex flex-wrap gap-4 text-sm">
              {letter.employer.industry && (
                <span className="flex items-center gap-1 text-gray-600">
                  <Briefcase className="w-4 h-4" />
                  {letter.employer.industry}
                </span>
              )}
              {letter.employer.company_website && (
                
                  <a href={letter.employer.company_website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline flex items-center gap-1"
                >
                  Visit Website <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <Card>
        <CardContent className="flex gap-3">
          
            <a href={`mailto:${employerUser?.email}?subject=Re: ${letter.job_title} Opportunity`}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Mail className="w-4 h-4" />
            Respond to Employer
          </a>
          {letter.job && (
            <Link
              href={`/dashboard/talent/jobs/${letter.job.id}`}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Briefcase className="w-4 h-4" />
              View Related Job
            </Link>
          )}
        </CardContent>
      </Card>
    </div>
  );
}