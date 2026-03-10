import { createClient } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent, Badge } from '@/components/ui';
import {
  ArrowLeft,
  Calendar,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  Award,
  Briefcase,
  GraduationCap,
  MapPin,
  MessageSquare,
} from 'lucide-react';
import Link from 'next/link';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function LeadDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Get lawyer profile
  const { data: lawyerProfile } = await supabase
    .from('lawyer_profiles')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (!lawyerProfile) {
    redirect('/dashboard/lawyer/profile');
  }

  // Get the connection request
  const { data: request, error } = await supabase
    .from('lawyer_connection_requests')
    .select('*')
    .eq('id', id)
    .eq('lawyer_id', lawyerProfile.id)
    .single();

  if (error || !request) {
    notFound();
  }

  // Get talent profile if shared
  let talentProfile = null;
  if (request.share_profile && request.talent_profile_id) {
    const { data: talent } = await supabase
      .from('talent_profiles')
      .select('*')
      .eq('id', request.talent_profile_id)
      .single();
    talentProfile = talent;
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return { label: 'Pending', variant: 'warning' as const, icon: Clock };
      case 'accepted':
        return { label: 'Accepted', variant: 'success' as const, icon: CheckCircle };
      case 'declined':
        return { label: 'Declined', variant: 'error' as const, icon: XCircle };
      default:
        return { label: status, variant: 'default' as const, icon: Clock };
    }
  };

  const status = getStatusBadge(request.status);
  const StatusIcon = status.icon;

  return (
    <div className="space-y-6 max-w-3xl mx-auto">

      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/lawyer/leads"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">
              {request.requester_type
                ? request.requester_type.charAt(0).toUpperCase() + request.requester_type.slice(1)
                : 'Lead'}{' '}
              Request
            </h1>
            <Badge variant={status.variant}>
              <StatusIcon className="w-3 h-3 mr-1" />
              {status.label}
            </Badge>
          </div>
          <p className="text-gray-500 text-sm flex items-center gap-1.5 mt-0.5">
            <Calendar className="w-3.5 h-3.5" />
            Submitted {formatDate(request.created_at)}
          </p>
        </div>
      </div>

      {/* Message from requester */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Message
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 whitespace-pre-wrap">{request.message}</p>
        </CardContent>
      </Card>

      {/* Talent Profile (if shared) */}
      {talentProfile ? (
        <div className="space-y-4">
          {/* About */}
          {(talentProfile.professional_headline || talentProfile.bio) && (
            <Card>
              <CardHeader>
                <CardTitle>About</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {talentProfile.professional_headline && (
                  <p className="font-medium text-gray-900">
                    {talentProfile.professional_headline}
                  </p>
                )}
                {talentProfile.bio && (
                  <p className="text-gray-700 whitespace-pre-wrap">{talentProfile.bio}</p>
                )}
              </CardContent>
            </Card>
          )}

          {/* O-1 Score */}
          {talentProfile.o1_score != null && (
            <Card>
              <CardContent className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-0.5">O-1 Eligibility Score</p>
                  <p className="text-sm text-gray-600">
                    Based on USCIS O-1 criteria evaluation
                  </p>
                </div>
                <div className="text-right">
                  <p className={`text-4xl font-bold ${
                    talentProfile.o1_score >= 65
                      ? 'text-green-600'
                      : talentProfile.o1_score >= 40
                      ? 'text-yellow-600'
                      : 'text-gray-600'
                  }`}>
                    {talentProfile.o1_score}%
                  </p>
                  {talentProfile.o1_score >= 65 && (
                    <span className="text-xs text-green-600 font-medium">O-1 Ready</span>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* O-1 Criteria Met */}
          {talentProfile.criteria_met && talentProfile.criteria_met.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-yellow-500" />
                  O-1 Criteria Met ({talentProfile.criteria_met.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {talentProfile.criteria_met.map((criterion: string, index: number) => (
                    <Badge key={index} variant="success">
                      {criterion.replace(/_/g, ' ')}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Skills */}
          {talentProfile.skills && talentProfile.skills.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Skills</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {talentProfile.skills.map((skill: string, index: number) => (
                    <span
                      key={index}
                      className="px-2.5 py-1 bg-blue-50 text-blue-700 text-sm rounded-full border border-blue-100"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Professional Details */}
          <Card>
            <CardHeader>
              <CardTitle>Professional Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {talentProfile.years_experience && (
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-50 rounded-lg">
                      <Briefcase className="w-4 h-4 text-gray-500" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Experience</p>
                      <p className="font-medium text-gray-900">
                        {talentProfile.years_experience} years
                      </p>
                    </div>
                  </div>
                )}

                {talentProfile.education_level && (
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-50 rounded-lg">
                      <GraduationCap className="w-4 h-4 text-gray-500" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Education</p>
                      <p className="font-medium text-gray-900 capitalize">
                        {talentProfile.education_level.replace(/_/g, ' ')}
                      </p>
                    </div>
                  </div>
                )}

                {talentProfile.industry && (
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-50 rounded-lg">
                      <FileText className="w-4 h-4 text-gray-500" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Industry</p>
                      <p className="font-medium text-gray-900">{talentProfile.industry}</p>
                    </div>
                  </div>
                )}

                {talentProfile.current_visa_status && (
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-50 rounded-lg">
                      <FileText className="w-4 h-4 text-gray-500" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Current Visa</p>
                      <p className="font-medium text-gray-900">
                        {talentProfile.current_visa_status}
                      </p>
                    </div>
                  </div>
                )}

                {(talentProfile.city || talentProfile.state) && (
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-50 rounded-lg">
                      <MapPin className="w-4 h-4 text-gray-500" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Location</p>
                      <p className="font-medium text-gray-900">
                        {[talentProfile.city, talentProfile.state, talentProfile.country]
                          .filter(Boolean)
                          .join(', ')}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        /* No profile shared */
        <Card>
          <CardContent className="py-8 text-center">
            <FileText className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">
              This candidate did not share their O-1 profile with this request.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Your Notes (read-only) */}
      {request.lawyer_notes && (
        <Card>
          <CardHeader>
            <CardTitle>Your Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 whitespace-pre-wrap">{request.lawyer_notes}</p>
          </CardContent>
        </Card>
      )}

      {/* Response timestamp */}
      {request.responded_at && (
        <p className="text-sm text-gray-400 text-center">
          You {request.status === 'accepted' ? 'accepted' : 'declined'} this request on{' '}
          {formatDate(request.responded_at)}
        </p>
      )}

    </div>
  );
}