import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent, Badge } from '@/components/ui';
import {
  ArrowLeft,
  Briefcase,
  GraduationCap,
  Award,
  FileText,
  Calendar,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import Link from 'next/link';

export default async function AgencyTalentProfilePage({
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

  // Verify agency access
  const { data: agencyProfile } = await supabase
    .from('agency_profiles')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (!agencyProfile) {
    redirect('/dashboard/agency');
  }

  // Get talent profile
  const { data: talent, error } = await supabase
    .from('talent_profiles')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.log(error);
  }

  if (!talent) {
    redirect('/dashboard/agency/browse');
  }

  // Get talent's verified documents/evidence only — no user profile (name/email hidden)
  const { data: documents } = await supabase
    .from('talent_documents')
    .select('*')
    .eq('talent_id', id)
    .eq('status', 'verified')
    .order('created_at', { ascending: false });

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header — no name shown, use candidate_id */}
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/agency/browse"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {talent.candidate_id || 'Candidate Profile'}
          </h1>
          {talent.professional_headline && (
            <p className="text-gray-600">{talent.professional_headline}</p>
          )}
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-blue-600">
            {talent.o1_score || 0}%
          </div>
          <p className="text-sm text-gray-500">O-1 Score</p>
        </div>
      </div>

      {/* Identity protection notice */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
          <div>
            <p className="font-medium text-amber-900">Identity Protected</p>
            <p className="text-sm text-amber-700 mt-1">
              This candidate&apos;s personal details (name, email, phone, location) are
              hidden to protect their privacy. Send an interest letter to initiate contact —
              they can choose to reveal their identity if they accept.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">

          {/* About / Bio */}
          {talent.bio && (
            <Card>
              <CardHeader>
                <CardTitle>About</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 whitespace-pre-wrap">{talent.bio}</p>
              </CardContent>
            </Card>
          )}

          {/* Skills */}
          {talent.skills && talent.skills.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Skills</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {talent.skills.map((skill: string, index: number) => (
                    <Badge key={index} variant="default">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* O-1 Criteria Met */}
          {talent.criteria_met && talent.criteria_met.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-yellow-500" />
                  O-1 Criteria Met
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {talent.criteria_met.map((criterion: string, index: number) => (
                    <Badge key={index} variant="success">
                      {criterion.replace(/_/g, ' ')}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Verified Evidence Documents */}
          {documents && documents.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Verified Evidence
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <h4 className="font-medium text-gray-900">{doc.title}</h4>
                      {doc.criterion && (
                        <p className="text-sm text-gray-500">
                          {doc.criterion.replace(/_/g, ' ')}
                        </p>
                      )}
                    </div>
                    {doc.file_url && (
                      <a
                        href={doc.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-sm text-blue-600 hover:underline"
                      >
                        View <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">

          {/* Professional Details — no contact info */}
          <Card>
            <CardHeader>
              <CardTitle>Professional Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {talent.years_experience && (
                <div className="flex items-center gap-3">
                  <Briefcase className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Experience</p>
                    <p className="font-medium">{talent.years_experience} years</p>
                  </div>
                </div>
              )}

              {talent.education_level && (
                <div className="flex items-center gap-3">
                  <GraduationCap className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Education</p>
                    <p className="font-medium capitalize">
                      {talent.education_level.replace(/_/g, ' ')}
                    </p>
                  </div>
                </div>
              )}

              {talent.current_visa_status && (
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Current Visa</p>
                    <p className="font-medium">{talent.current_visa_status}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Member Since</p>
                  <p className="font-medium">{formatDate(talent.created_at)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardContent className="space-y-3">
              <Link
                href={`/dashboard/agency/letters/new?talent=${id}`}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                Send Interest Letter
              </Link>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}