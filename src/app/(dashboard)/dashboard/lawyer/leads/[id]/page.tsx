import { createClient } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent, Badge } from '@/components/ui';
import {
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  User,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import Link from 'next/link';
import LeadActions from './LeadActions';

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
              {request.requester_name}
            </h1>
            <Badge variant={status.variant}>
              <StatusIcon className="w-3 h-3 mr-1" />
              {status.label}
            </Badge>
          </div>
          <p className="text-gray-600 capitalize">{request.requester_type}</p>
        </div>
      </div>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Contact Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
              <a href={`mailto:${request.requester_email}`}
              className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Mail className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="text-gray-900">{request.requester_email}</p>
              </div>
            </a>

            {request.requester_phone && (
              
                <a href={`tel:${request.requester_phone}`}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Phone className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="text-gray-900">{request.requester_phone}</p>
                </div>
              </a>
            )}
          </div>

          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <Calendar className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Submitted</p>
              <p className="text-gray-900">{formatDate(request.created_at)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Message */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Message
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 whitespace-pre-wrap">{request.message}</p>
        </CardContent>
      </Card>

      {/* Talent Profile (if shared) */}
      {talentProfile && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Shared Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {talentProfile.professional_headline && (
              <div>
                <p className="text-sm text-gray-500">Headline</p>
                <p className="text-gray-900">{talentProfile.professional_headline}</p>
              </div>
            )}

            {talentProfile.bio && (
              <div>
                <p className="text-sm text-gray-500">Bio</p>
                <p className="text-gray-700">{talentProfile.bio}</p>
              </div>
            )}

            {talentProfile.skills && talentProfile.skills.length > 0 && (
              <div>
                <p className="text-sm text-gray-500 mb-2">Skills</p>
                <div className="flex flex-wrap gap-2">
                  {talentProfile.skills.map((skill: string, index: number) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-blue-100 text-blue-700 text-sm rounded"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {talentProfile.o1_score && (
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-500">O-1 Eligibility Score</p>
                <p className="text-2xl font-bold text-blue-600">{talentProfile.o1_score}%</p>
              </div>
            )}

            <Link
              href={`/talent/${talentProfile.id}`}
              className="inline-flex items-center gap-2 text-blue-600 hover:underline"
            >
              View Full Profile
              <ArrowLeft className="w-4 h-4 rotate-180" />
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Lawyer Notes */}
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

      {/* Response Info */}
      {request.responded_at && (
        <Card>
          <CardHeader>
            <CardTitle>Response</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">
              You {request.status === 'accepted' ? 'accepted' : 'declined'} this request on{' '}
              {formatDate(request.responded_at)}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      {request.status === 'pending' && (
        <LeadActions requestId={request.id} requesterName={request.requester_name} />
      )}
    </div>
  );
}