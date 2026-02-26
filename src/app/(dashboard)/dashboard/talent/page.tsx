import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { ScoreDisplay } from '@/components/talent/ScoreDisplay';
import { CriteriaBreakdown } from '@/components/talent/CriteriaBreakdown';
import { O1Criterion, O1_CRITERIA } from '@/types/enums';
import {
  FileText,
  Send,
  Mail,
  Eye,
  Briefcase,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';

export default async function TalentDashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Get talent profile
  const { data: talentProfile } = await supabase
    .from('talent_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();

  // If no talent profile exists, create one
  if (!talentProfile) {
    // Get profile for name
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    // Create talent profile
    await supabase.from('talent_profiles').insert({
      user_id: user.id,
      first_name: profile?.full_name?.split(' ')[0] || '',
      last_name: profile?.full_name?.split(' ').slice(1).join(' ') || '',
      email: user.email || '',
    });

    redirect('/dashboard/talent/profile');
  }

  // Get all documents for this talent to calculate counts per criterion
  const { data: documents } = await supabase
    .from('talent_documents')
    .select('criterion, status')
    .eq('talent_id', talentProfile.id);

  // Calculate document counts per criterion
  const documentCounts: Record<string, { total: number; verified: number; pending: number; needsReview: number; rejected: number }> = {};
  
  // Initialize all criteria with 0
  (Object.keys(O1_CRITERIA) as O1Criterion[]).forEach(criterion => {
    documentCounts[criterion] = { total: 0, verified: 0, pending: 0, needsReview: 0, rejected: 0 };
  });
  
  // Count documents per criterion by status
  documents?.forEach(doc => {
    if (doc.criterion && documentCounts[doc.criterion]) {
      documentCounts[doc.criterion].total += 1;
      
      switch (doc.status) {
        case 'verified':
          documentCounts[doc.criterion].verified += 1;
          break;
        case 'pending':
          documentCounts[doc.criterion].pending += 1;
          break;
        case 'needs_review':
          documentCounts[doc.criterion].needsReview += 1;
          break;
        case 'rejected':
          documentCounts[doc.criterion].rejected += 1;
          break;
      }
    }
  });

  // Calculate criteria met (criteria with at least one verified document)
  const criteriaMet = (Object.keys(O1_CRITERIA) as O1Criterion[]).filter(
    criterion => documentCounts[criterion]?.verified > 0
  );

  // Get stats
  const [
    { count: documentsCount },
    { count: applicationsCount },
    { count: lettersCount },
  ] = await Promise.all([
    supabase
      .from('talent_documents')
      .select('*', { count: 'exact', head: true })
      .eq('talent_id', talentProfile.id),
    supabase
      .from('job_applications')
      .select('*', { count: 'exact', head: true })
      .eq('talent_id', talentProfile.id)
      .neq('status', 'withdrawn'),
    supabase
      .from('interest_letters')
      .select('*', { count: 'exact', head: true })
      .eq('talent_id', talentProfile.id),
  ]);

  // Determine if this is a first-time login
  const createdAt = new Date(user.created_at).getTime();
  const lastSignIn = user.last_sign_in_at
    ? new Date(user.last_sign_in_at).getTime()
    : createdAt;
  const isFirstLogin = Math.abs(lastSignIn - createdAt) < 2 * 60 * 1000;

  // Get matching jobs count (jobs where their score meets minimum)
  const { count: matchingJobsCount } = await supabase
    .from('job_listings')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active')
    .lte('min_score', talentProfile.o1_score || 0);

  const stats = [
    {
      label: 'Documents',
      value: documentsCount || 0,
      icon: FileText,
      href: '/dashboard/talent/evidence',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      label: 'Applications',
      value: applicationsCount || 0,
      icon: Send,
      href: '/dashboard/talent/applications',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      label: 'Letters Received',
      value: lettersCount || 0,
      icon: Mail,
      href: '/dashboard/talent/letters',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      label: 'Matching Jobs',
      value: matchingJobsCount || 0,
      icon: Briefcase,
      href: '/dashboard/talent/jobs',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div>
        {isFirstLogin ? (
          <>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-yellow-500" />
              Welcome to O1DMatch!
            </h1>
            <p className="text-gray-600 mt-1">
              Get started by uploading evidence to build your O-1 visa profile
            </p>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back, {talentProfile.first_name}!
            </h1>
            <p className="text-gray-600 mt-1">
              Here&apos;s an overview of your O-1 visa profile
            </p>
          </>
        )}
      </div>

      {/* First-time user onboarding banner */}
      {isFirstLogin && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-5">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Sparkles className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-blue-900">
                Here&apos;s how to get started
              </p>
              <ul className="text-sm text-blue-800 mt-2 space-y-1">
                <li>1. Complete your profile with your professional details</li>
                <li>2. Upload evidence documents for each O-1 criterion</li>
                <li>3. Browse jobs and connect with employers</li>
              </ul>
            </div>
            <Link
              href="/dashboard/talent/profile"
              className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 whitespace-nowrap"
            >
              Complete Profile
            </Link>
          </div>
        </div>
      )}

      {/* Score and Stats Row */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Score Card */}
        <Card className="lg:col-span-1">
          <CardContent className="flex flex-col items-center py-6">
            <ScoreDisplay
              score={talentProfile.o1_score || 0}
              size="lg"
              showLabel
              showStatus
            />
            <p className="text-xs text-gray-500 mt-4 text-center">
              {criteriaMet.length} of 8 criteria met
            </p>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="lg:col-span-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <Link key={stat.label} href={stat.href}>
              <Card hover padding="sm" className="h-full">
                <CardContent>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-2xl font-bold text-gray-900">
                        {stat.value}
                      </p>
                      <p className="text-sm text-gray-600">{stat.label}</p>
                    </div>
                    <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                      <stat.icon className={`w-5 h-5 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Criteria Breakdown */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Criteria Breakdown</CardTitle>
            <Link
              href="/dashboard/talent/evidence"
              className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              Add Evidence
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <CriteriaBreakdown
            documentCounts={documentCounts}
            criteriaMet={criteriaMet}
            showUploadButtons
          />
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/dashboard/talent/profile">
          <Card hover className="h-full">
            <CardContent className="flex items-center gap-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <Eye className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Complete Profile</h3>
                <p className="text-sm text-gray-500">
                  Add more details to attract employers
                </p>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400 ml-auto" />
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/talent/jobs">
          <Card hover className="h-full">
            <CardContent className="flex items-center gap-4">
              <div className="p-3 bg-green-50 rounded-lg">
                <Briefcase className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Browse Jobs</h3>
                <p className="text-sm text-gray-500">
                  Find opportunities matching your profile
                </p>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400 ml-auto" />
            </CardContent>
          </Card>
        </Link>

        <Link href="/lawyers">
          <Card hover className="h-full">
            <CardContent className="flex items-center gap-4">
              <div className="p-3 bg-purple-50 rounded-lg">
                <Mail className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Find a Lawyer</h3>
                <p className="text-sm text-gray-500">
                  Connect with immigration attorneys
                </p>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400 ml-auto" />
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}