import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import {
  Users,
  Briefcase,
  Mail,
  Eye,
  ArrowRight,
  Plus,
  Building2,
  CheckCircle2,
  Circle,
  Search,
  FileEdit,
  Send,
  Lightbulb,
  Handshake,
} from 'lucide-react';
import Link from 'next/link';

export default async function EmployerDashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  // Get employer profile
  const { data: employerProfile } = await supabase
    .from('employer_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();

  // If no employer profile, create one and redirect
  if (!employerProfile) {
    await supabase.from('employer_profiles').insert({
      user_id: user.id,
      company_name: profile?.full_name
        ? `${profile.full_name}'s Company`
        : 'My Company',
      signatory_name: profile?.full_name || '',
      signatory_email: user.email || '',
    });
    redirect('/dashboard/employer/profile');
  }

  if (employerProfile.company_name === 'My Company') {
    redirect('/dashboard/employer/profile');
  }

  // First-time login detection
  const createdAt = new Date(user.created_at).getTime();
  const lastSignIn = user.last_sign_in_at
    ? new Date(user.last_sign_in_at).getTime()
    : createdAt;
  const isFirstLogin = Math.abs(lastSignIn - createdAt) < 2 * 60 * 1000;

  // Get stats
  const [
    { count: activeJobsCount },
    { count: totalApplicationsCount },
    { count: lettersSentCount },
  ] = await Promise.all([
    supabase
      .from('job_listings')
      .select('*', { count: 'exact', head: true })
      .eq('employer_id', employerProfile.id)
      .eq('status', 'active'),
    supabase
      .from('job_applications')
      .select('*, job:job_listings!inner(*)', { count: 'exact', head: true })
      .eq('job.employer_id', employerProfile.id),
    supabase
      .from('interest_letters')
      .select('*', { count: 'exact', head: true })
      .eq('employer_id', employerProfile.id),
  ]);

  // Get recent applications
  const { data: recentApplications } = await supabase
    .from('job_applications')
    .select(
      `
      *,
      job:job_listings!inner(
        id,
        title,
        employer_id
      ),
      talent:talent_profiles(
        candidate_id,
        professional_headline,
        o1_score,
        industry
      )
    `
    )
    .eq('job.employer_id', employerProfile.id)
    .order('created_at', { ascending: false })
    .limit(5);

  // Profile completion check
  const isProfileComplete =
    employerProfile.company_name &&
    employerProfile.signatory_name &&
    employerProfile.signatory_email &&
    employerProfile.is_authorized_signatory;

  // Onboarding step statuses
  const steps = [
    {
      icon: Building2,
      iconBg: 'rgba(212,168,75,0.15)',
      title: 'Complete Your Profile',
      desc: 'Add company info, logo, and description to attract top talent.',
      done: !!isProfileComplete,
      href: '/dashboard/employer/profile',
    },
    {
      icon: FileEdit,
      iconBg: 'rgba(59,130,246,0.15)',
      title: 'Post Your First Job',
      desc: 'Create a job listing specifying O-1 sponsorship availability.',
      done: (activeJobsCount || 0) > 0,
      href: '/dashboard/employer/jobs/new',
    },
    {
      icon: Search,
      iconBg: 'rgba(16,185,129,0.15)',
      title: 'Browse Talent',
      desc: 'Explore pre-screened O-1 candidates matched to your industry.',
      done: false,
      href: '/dashboard/employer/browse',
    },
    {
      icon: Send,
      iconBg: 'rgba(168,85,247,0.15)',
      title: 'Send Interest Letters',
      desc: 'Express formal sponsorship intent to candidates you like.',
      done: (lettersSentCount || 0) > 0,
      href: '/dashboard/employer/letters',
    },
  ];

  const allStepsDone = steps.every((s) => s.done);

  // Stats config
  const stats = [
    {
      icon: Briefcase,
      value: activeJobsCount || 0,
      label: 'Active Jobs',
      iconBg: 'rgba(59,130,246,0.08)',
      trend:
        (activeJobsCount || 0) > 0
          ? `${activeJobsCount} active listing${activeJobsCount === 1 ? '' : 's'}`
          : 'Post your first job →',
      trendUp: (activeJobsCount || 0) > 0,
      href: '/dashboard/employer/jobs',
    },
    {
      icon: Users,
      value: totalApplicationsCount || 0,
      label: 'Total Applications',
      iconBg: 'rgba(16,185,129,0.08)',
      trend:
        (totalApplicationsCount || 0) > 0
          ? `${totalApplicationsCount} received`
          : 'Publish a job to attract applicants',
      trendUp: (totalApplicationsCount || 0) > 0,
      href: '/dashboard/employer/jobs',
    },
    {
      icon: Mail,
      value: lettersSentCount || 0,
      label: 'Letters Sent',
      iconBg: 'rgba(212,168,75,0.08)',
      trend:
        (lettersSentCount || 0) > 0
          ? `${lettersSentCount} sent`
          : 'Browse talent to get started',
      trendUp: (lettersSentCount || 0) > 0,
      href: '/dashboard/employer/letters',
    },
    {
      icon: Eye,
      value: employerProfile.view_count || 0,
      label: 'Profile Views',
      iconBg: 'rgba(168,85,247,0.08)',
      trend:
        (employerProfile.view_count || 0) > 0
          ? `${employerProfile.view_count} total views`
          : 'Complete profile to increase visibility',
      trendUp: (employerProfile.view_count || 0) > 0,
      href: '/dashboard/employer/profile',
    },
  ];

  // Quick actions
  const quickActions = [
    {
      icon: Users,
      iconBg: 'rgba(59,130,246,0.1)',
      title: 'Browse Talent',
      desc: 'Explore O-1 candidates in your field',
      href: '/dashboard/employer/browse',
    },
    {
      icon: FileEdit,
      iconBg: 'rgba(212,168,75,0.1)',
      title: 'Post a Job',
      desc: 'Create an O-1 sponsoring job listing',
      href: '/dashboard/employer/jobs/new',
    },
    {
      icon: Mail,
      iconBg: 'rgba(16,185,129,0.1)',
      title: 'Track Letters',
      desc: 'View sent and signed interest letters',
      href: '/dashboard/employer/letters',
    },
  ];

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }}>
      {/* Welcome */}
      <div className="mb-6">
        <h1
          className="text-2xl font-bold mb-1"
          style={{
            fontFamily: "'Playfair Display', serif",
            color: '#0B1D35',
          }}
        >
          {isFirstLogin
            ? `Welcome to O1DMatch, ${employerProfile.company_name}!`
            : `Welcome back, ${employerProfile.company_name}!`}
        </h1>
        <p className="text-sm" style={{ color: '#64748B' }}>
          {isFirstLogin
            ? "Manage your job postings and connect with O-1 talent. Here's how to get started."
            : 'Manage your job postings and connect with O-1 talent.'}
        </p>
      </div>

      {/* Onboarding Wizard (show unless all steps complete) */}
      {!allStepsDone && (
        <div
          className="rounded-2xl p-6 mb-6 relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #0B1D35 0%, #132D50 100%)',
          }}
        >
          {/* Decorative glow */}
          <div
            className="absolute pointer-events-none"
            style={{
              top: '-50%',
              right: '-10%',
              width: '300px',
              height: '300px',
              background:
                'radial-gradient(circle, rgba(212,168,75,0.1) 0%, transparent 70%)',
            }}
          />

          <div className="flex justify-between items-center mb-5 relative z-10">
            <h2 className="text-white text-lg font-semibold flex items-center gap-2">
              🚀 Get Started in 4 Steps
            </h2>
            {/* Could add dismiss logic here */}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 relative z-10">
            {steps.map((step) => (
              <Link
                key={step.title}
                href={step.href}
                className="rounded-xl p-4 transition-all hover:border-[rgba(212,168,75,0.3)]"
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: step.done
                    ? '1px solid rgba(16,185,129,0.4)'
                    : '1px solid rgba(255,255,255,0.08)',
                }}
              >
                <div
                  className="w-9 h-9 rounded-[9px] flex items-center justify-center mb-3"
                  style={{ background: step.iconBg }}
                >
                  <step.icon className="w-5 h-5 text-white/80" />
                </div>
                <h4 className="text-white text-sm font-semibold mb-1">
                  {step.title}
                </h4>
                <p className="text-white/50 text-xs leading-relaxed">
                  {step.desc}
                </p>
                <div className="mt-2.5">
                  {step.done ? (
                    <span
                      className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full"
                      style={{
                        background: 'rgba(16,185,129,0.15)',
                        color: '#10B981',
                      }}
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      Complete
                    </span>
                  ) : (
                    <span
                      className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full"
                      style={{
                        background: 'rgba(255,255,255,0.08)',
                        color: 'rgba(255,255,255,0.5)',
                      }}
                    >
                      <Circle className="w-3 h-3" />
                      Pending
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 mb-6">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="bg-white rounded-[14px] p-5 border border-[#E8ECF1] transition-all hover:border-[#D4A84B] hover:shadow-[0_4px_15px_rgba(212,168,75,0.08)] hover:-translate-y-0.5 group"
          >
            <div
              className="w-10 h-10 rounded-[10px] flex items-center justify-center mb-3"
              style={{ background: stat.iconBg }}
            >
              <stat.icon className="w-5 h-5 text-gray-600" />
            </div>
            <div
              className="text-3xl font-bold"
              style={{
                fontFamily: "'Playfair Display', serif",
                color: '#0B1D35',
              }}
            >
              {stat.value}
            </div>
            <div className="text-sm mt-0.5" style={{ color: '#64748B' }}>
              {stat.label}
            </div>
            <span
              className="inline-flex items-center gap-1 text-xs font-semibold mt-2 px-2 py-0.5 rounded-full"
              style={
                stat.trendUp
                  ? { background: 'rgba(16,185,129,0.1)', color: '#10B981' }
                  : { background: 'rgba(100,116,139,0.1)', color: '#64748B' }
              }
            >
              {stat.trend}
            </span>
          </Link>
        ))}
      </div>

      {/* Main Grid: Applications + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-5">
        {/* Left Column */}
        <div className="space-y-5">
          {/* Recent Applications */}
          <div className="bg-white rounded-[14px] border border-[#E8ECF1] overflow-hidden">
            <div className="px-5 py-4 flex justify-between items-center border-b border-[#E8ECF1]">
              <h3
                className="text-[0.95rem] font-semibold"
                style={{ color: '#0B1D35' }}
              >
                Recent Applications
              </h3>
              <Link
                href="/dashboard/employer/jobs"
                className="text-sm font-semibold hover:opacity-80 transition-opacity"
                style={{ color: '#D4A84B' }}
              >
                View All →
              </Link>
            </div>

            {!recentApplications || recentApplications.length === 0 ? (
              <div className="py-12 px-6 text-center">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                  style={{ background: '#FAFAF7' }}
                >
                  <Mail className="w-7 h-7" style={{ color: '#64748B' }} />
                </div>
                <h4
                  className="text-base font-semibold mb-1.5"
                  style={{ color: '#0B1D35' }}
                >
                  No applications yet
                </h4>
                <p
                  className="text-sm leading-relaxed mb-5 max-w-md mx-auto"
                  style={{ color: '#64748B' }}
                >
                  Post a job to start receiving applications from pre-vetted O-1
                  talent. You can also browse our talent pool and send interest
                  letters directly.
                </p>
                <Link
                  href="/dashboard/employer/jobs/new"
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-[10px] text-white font-semibold text-sm transition-all hover:opacity-90"
                  style={{ background: '#0B1D35' }}
                >
                  <Plus className="w-4 h-4" />
                  Post Your First Job
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {recentApplications.map((app) => (
                  <div
                    key={app.id}
                    className="px-5 py-3.5 flex items-center justify-between"
                  >
                    <div>
                      <p
                        className="font-medium text-sm"
                        style={{ color: '#0B1D35' }}
                      >
                        {app.talent?.candidate_id || 'Unknown Candidate'}
                      </p>
                      <p className="text-xs" style={{ color: '#64748B' }}>
                        Applied for {app.job?.title}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: '#94A3B8' }}>
                        {new Date(app.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      {app.talent?.o1_score && (
                        <span className="text-xs font-semibold text-emerald-600">
                          {app.talent.o1_score}% score
                        </span>
                      )}
                      <Link
                        href={`/dashboard/employer/jobs/${app.job?.id}/applications`}
                        className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <ArrowRight className="w-4 h-4 text-gray-400" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Interest Letters Info */}
          <div className="bg-white rounded-[14px] border border-[#E8ECF1] overflow-hidden">
            <div className="px-5 py-4 border-b border-[#E8ECF1]">
              <h3
                className="text-[0.95rem] font-semibold"
                style={{ color: '#0B1D35' }}
              >
                About Interest Letters
              </h3>
            </div>
            <div className="p-5">
              <p
                className="text-sm leading-relaxed"
                style={{ color: '#1E293B' }}
              >
                Interest letters are formal expressions of your intent to sponsor
                or hire O-1 talent. When a candidate accepts and signs the letter,
                our admin will review and forward the signed document to you.
                Contact information will be revealed once the signed letter is
                delivered.
              </p>
              <div
                className="mt-4 px-4 py-3 rounded-r-[10px]"
                style={{
                  background: 'rgba(212,168,75,0.08)',
                  borderLeft: '3px solid #D4A84B',
                }}
              >
                <p className="text-xs flex gap-1.5" style={{ color: '#64748B' }}>
                  <Lightbulb
                    className="w-4 h-4 flex-shrink-0 mt-0.5"
                    style={{ color: '#D4A84B' }}
                  />
                  <span>
                    <strong className="text-gray-700">Tip:</strong> Completing
                    your company profile is required before sending interest
                    letters. A well-crafted profile increases candidate acceptance
                    rates.
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-5">
          {/* Quick Actions */}
          <div className="bg-white rounded-[14px] border border-[#E8ECF1] overflow-hidden">
            <div className="px-5 py-4 border-b border-[#E8ECF1]">
              <h3
                className="text-[0.95rem] font-semibold"
                style={{ color: '#0B1D35' }}
              >
                Quick Actions
              </h3>
            </div>
            <div className="p-4 space-y-2.5">
              {quickActions.map((action) => (
                <Link
                  key={action.title}
                  href={action.href}
                  className="flex items-center gap-3.5 p-3.5 rounded-xl transition-all hover:translate-x-1"
                  style={{ background: '#FAFAF7' }}
                  onMouseEnter={undefined}
                >
                  <div
                    className="w-11 h-11 rounded-[10px] flex items-center justify-center flex-shrink-0"
                    style={{ background: action.iconBg }}
                  >
                    <action.icon className="w-5 h-5 text-gray-600" />
                  </div>
                  <div className="min-w-0">
                    <h4
                      className="text-sm font-semibold"
                      style={{ color: '#0B1D35' }}
                    >
                      {action.title}
                    </h4>
                    <p className="text-xs" style={{ color: '#64748B' }}>
                      {action.desc}
                    </p>
                  </div>
                  <ArrowRight
                    className="w-4 h-4 ml-auto flex-shrink-0"
                    style={{ color: '#64748B' }}
                  />
                </Link>
              ))}
            </div>
          </div>

          {/* Help Card */}
          <div className="bg-white rounded-[14px] border border-[#E8ECF1] p-6 text-center">
            <div className="text-3xl mb-2">
              <Handshake className="w-10 h-10 mx-auto" style={{ color: '#D4A84B' }} />
            </div>
            <h4
              className="text-[0.95rem] font-semibold mb-1.5"
              style={{ color: '#0B1D35' }}
            >
              Need Help?
            </h4>
            <p
              className="text-sm leading-relaxed mb-4"
              style={{ color: '#64748B' }}
            >
              Our team is here to guide you through the O-1 hiring process.
            </p>
            <a
              href="mailto:support@o1dmatch.com"
              className="font-semibold text-sm hover:opacity-80 transition-opacity"
              style={{ color: '#D4A84B' }}
            >
              Contact Support →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}