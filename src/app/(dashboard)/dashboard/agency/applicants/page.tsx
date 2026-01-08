import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Card, CardContent, Badge } from '@/components/ui';
import {
  Users,
  Briefcase,
  Building2,
  Calendar,
  MapPin,
  Eye,
  Mail,
} from 'lucide-react';
import Link from 'next/link';

export default async function AgencyApplicantsPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Get agency profile
  const { data: agencyProfile } = await supabase
    .from('agency_profiles')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (!agencyProfile) {
    redirect('/dashboard/agency');
  }

  // Get all jobs for this agency
  const { data: jobs } = await supabase
    .from('job_listings')
    .select('id')
    .eq('agency_id', agencyProfile.id);

  const jobIds = jobs?.map(j => j.id) || [];

  // Get all applications for agency jobs
  
const { data: applications, error } = await supabase
  .from('job_applications')
  .select(`
    *,
    job:job_listings(
      id,
      title,
      department,
      client:agency_clients(
        company_name,
        show_client_identity
      )
    ),
    talent:talent_profiles(
      id,
      user_id
    )
  `)
  .in('job_id', jobIds.length > 0 ? jobIds : ['00000000-0000-0000-0000-000000000000'])
  .order('created_at', { ascending: false });

console.log("jobIds=============>");
console.log(jobIds);
console.log("applications=============>");
console.log(applications);
console.log("error =================>");
console.log(error);
  // Get talent emails
  const talentUserIds = applications?.map(a => a.talent?.user_id).filter(Boolean) || [];
  const talentEmails: Record<string, string> = {};

  if (talentUserIds.length > 0) {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, email, full_name')
      .in('id', talentUserIds);

    profiles?.forEach(p => {
      talentEmails[p.id] = p.email;
    });
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
      case 'submitted':
        return { label: 'New', variant: 'info' as const };
      case 'under_review':
        return { label: 'Under Review', variant: 'warning' as const };
      case 'shortlisted':
        return { label: 'Shortlisted', variant: 'success' as const };
      case 'rejected':
        return { label: 'Rejected', variant: 'error' as const };  // Changed from 'destructive' to 'error'
      case 'hired':
        return { label: 'Hired', variant: 'success' as const };
      default:
        return { label: status, variant: 'default' as const };
    }
  };

  // Group applications by status for stats
  const stats = {
    total: applications?.length || 0,
    new: applications?.filter(a => ['pending', 'submitted'].includes(a.status)).length || 0,
    shortlisted: applications?.filter(a => a.status === 'shortlisted').length || 0,
    rejected: applications?.filter(a => a.status === 'rejected').length || 0,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Applicants</h1>
        <p className="text-gray-600">Manage all applications for your client jobs</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="text-center">
            <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
            <p className="text-sm text-gray-500">Total Applicants</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="text-center">
            <p className="text-3xl font-bold text-blue-600">{stats.new}</p>
            <p className="text-sm text-gray-500">New</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="text-center">
            <p className="text-3xl font-bold text-green-600">{stats.shortlisted}</p>
            <p className="text-sm text-gray-500">Shortlisted</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="text-center">
            <p className="text-3xl font-bold text-red-600">{stats.rejected}</p>
            <p className="text-sm text-gray-500">Rejected</p>
          </CardContent>
        </Card>
      </div>

      {/* Applicants List */}
      {!applications || applications.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Applicants Yet</h3>
            <p className="text-gray-600 mb-4">
              When candidates apply to your job listings, they&apos;ll appear here.
            </p>
            <Link
              href="/dashboard/agency/jobs"
              className="text-blue-600 hover:underline"
            >
              View Job Listings
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {applications.map((application) => {
            const status = getStatusBadge(application.status);
            const talentEmail = application.talent?.user_id 
              ? talentEmails[application.talent.user_id] 
              : null;

            return (
              <Card key={application.id} hover>
                <CardContent className="flex items-start gap-6">
                  {/* Talent Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Link
                        href={`/dashboard/agency/applicants/${application.id}`}
                        className="text-lg font-semibold text-gray-900 hover:text-blue-600"
                      >
                        {application.talent?.professional_headline || 'Applicant'}
                      </Link>
                      <Badge variant={status.variant}>{status.label}</Badge>
                      {application.talent?.o1_score && (
                        <span className="text-sm font-medium text-blue-600">
                          {application.talent.o1_score}% O-1 Score
                        </span>
                      )}
                    </div>

                    {/* Job Info */}
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                      <span className="flex items-center gap-1">
                        <Briefcase className="w-4 h-4" />
                        {application.job?.title}
                      </span>
                      <span className="flex items-center gap-1">
                        <Building2 className="w-4 h-4" />
                        {application.job?.client?.show_client_identity
                          ? application.job?.client?.company_name
                          : 'Confidential Client'}
                      </span>
                    </div>

                    {/* Location & Date */}
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      {application.talent?.city && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {application.talent.city}, {application.talent.state}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        Applied {formatDate(application.created_at)}
                      </span>
                    </div>

                    {/* Skills */}
                    {application.talent?.skills && application.talent.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-3">
                        {application.talent.skills.slice(0, 5).map((skill: string, index: number) => (
                          <span
                            key={index}
                            className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded"
                          >
                            {skill}
                          </span>
                        ))}
                        {application.talent.skills.length > 5 && (
                          <span className="px-2 py-0.5 text-gray-500 text-xs">
                            +{application.talent.skills.length - 5} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/dashboard/agency/browse/${application.talent?.id}`}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      title="View Profile"
                    >
                      <Eye className="w-5 h-5 text-gray-600" />
                    </Link>
                    {talentEmail && (
                      
                        <a href={`mailto:${talentEmail}`}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Send Email"
                      >
                        <Mail className="w-5 h-5 text-gray-600" />
                      </a>
                    )}
                    <Link
                      href={`/dashboard/agency/applicants/${application.id}`}
                      className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Review
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}