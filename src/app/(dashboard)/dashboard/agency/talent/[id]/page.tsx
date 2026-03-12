// src/app/(dashboard)/dashboard/agency/talent/[id]/page.tsx

import { createClient } from '@/lib/supabase/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';
import { redirect } from 'next/navigation';
// import { Badge } from '@/components/ui';
import {
  ArrowLeft,
  MapPin,
  Briefcase,
  GraduationCap,
  Award,
  FileText,
  Calendar,
  ExternalLink,
  Globe,
  Github,
  BookOpen,
  FlaskConical,
  Clock,
  DollarSign,
  TrendingUp,
  Users,
  Star,
  Building2,
  Layers,
  MoveRight,
  Link2,
  BarChart3,
  CheckCircle,
  XCircle,
  Mail,
} from 'lucide-react';
import Link from 'next/link';

// ── Helpers ────────────────────────────────────────────────────────────────

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long' });

const formatSalary = (n: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(n);

const labelMap: Record<string, string> = {
  full_time: 'Full Time',
  part_time: 'Part Time',
  contract: 'Contract',
  on_site: 'On-site',
  remote: 'Remote',
  hybrid: 'Hybrid',
  not_filed: 'Not Filed',
  pending: 'Pending',
  approved: 'Approved',
  denied: 'Denied',
};
const label = (val: string) => labelMap[val] ?? val.replace(/_/g, ' ');

const scoreColor = (score: number) => {
  if (score >= 80) return 'text-emerald-600';
  if (score >= 60) return 'text-amber-600';
  return 'text-red-500';
};

const scoreBg = (score: number) => {
  if (score >= 80) return 'bg-emerald-50 border-emerald-200';
  if (score >= 60) return 'bg-amber-50 border-amber-200';
  return 'bg-red-50 border-red-200';
};

const confidenceColor = (c: string) => {
  if (c === 'high') return 'bg-emerald-100 text-emerald-700';
  if (c === 'medium') return 'bg-amber-100 text-amber-700';
  return 'bg-red-100 text-red-700';
};

// ── Section wrapper ────────────────────────────────────────────────────────
function Section({
  title,
  icon,
  children,
  className = '',
}: {
  title?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`bg-white rounded-xl border border-gray-200 overflow-hidden ${className}`}>
      {title && (
        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
          {icon && <span className="text-gray-400">{icon}</span>}
          <h2 className="font-semibold text-gray-800 text-sm tracking-wide uppercase">{title}</h2>
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  );
}

// ── Stat tile ──────────────────────────────────────────────────────────────
function StatTile({
  value,
  label,
  color,
}: {
  value: number;
  label: string;
  color: string;
}) {
  return (
    <div className={`text-center p-4 rounded-xl border ${color}`}>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs mt-0.5 opacity-70">{label}</div>
    </div>
  );
}

// ── Row item ──────────────────────────────────────────────────────────────
function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="text-gray-400 mt-0.5 shrink-0">{icon}</span>
      <div>
        <p className="text-xs text-gray-500 mb-0.5">{label}</p>
        <div className="text-sm font-medium text-gray-800">{value}</div>
      </div>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────

export default async function AgencyTalentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // Verify agency
  const { data: agencyProfile } = await supabase
    .from('agency_profiles')
    .select('id, agency_name')
    .eq('user_id', user.id)
    .single();
  if (!agencyProfile) redirect('/dashboard/agency');

  // Fetch talent profile
  const { data: talent, error } = await supabase
    .from('talent_profiles')
    .select('*')
    .eq('id', id)
    .single();

  if (error) console.error('[agency/talent/[id]]', error);
  if (!talent) redirect('/dashboard/agency');

  // Public profile name
  const { data: userProfile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', talent.user_id)
    .single();

  // Service role — bypass RLS to read documents
  const serviceClient = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: documents } = await serviceClient
    .from('talent_documents')
    .select(
      'id, title, description, file_url, criterion, auto_classified_criterion, classification_confidence, ai_notes, created_at'
    )
    .eq('talent_id', id)
    .eq('status', 'verified')
    .order('created_at', { ascending: false });

  // Applications this talent made to THIS agency's jobs
  const { data: applications } = await supabase
    .from('job_applications')
    .select(`
      id,
      status,
      applied_at,
      job:job_listings(id, title, status)
    `)
    .eq('talent_id', id)
    .order('applied_at', { ascending: false });

  const uploadedCriteria = new Set(
    (documents ?? []).flatMap((d) =>
      [d.criterion, d.auto_classified_criterion].filter(Boolean)
    )
  );

  const displayName =
    userProfile?.full_name ||
    `${talent.first_name ?? ''} ${talent.last_name ?? ''}`.trim() ||
    'Talent Profile';

  const initials =
    `${talent.first_name?.[0] ?? ''}${talent.last_name?.[0] ?? ''}`.toUpperCase() || '?';

  const hasAcademicStats =
    talent.publications_count > 0 ||
    talent.h_index > 0 ||
    talent.citations_count > 0 ||
    talent.patents_count > 0;

  const publicLinks = [
    { url: talent.linkedin_url, label: 'LinkedIn', icon: <Link2 className="w-4 h-4" /> },
    { url: talent.github_url, label: 'GitHub', icon: <Github className="w-4 h-4" /> },
    { url: talent.google_scholar_url, label: 'Scholar', icon: <BookOpen className="w-4 h-4" /> },
    { url: talent.personal_website, label: 'Website', icon: <Globe className="w-4 h-4" /> },
  ].filter((l) => !!l.url);

  const appStatusIcon = (s: string) => {
    if (s === 'shortlisted' || s === 'hired') return <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />;
    if (s === 'rejected') return <XCircle className="w-3.5 h-3.5 text-red-400" />;
    return <Clock className="w-3.5 h-3.5 text-amber-400" />;
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">

        {/* ── Top nav bar ── */}
        <div className="flex items-center gap-3">
          <Link
            href={`/dashboard/agency/jobs`}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors group"
          >
            <span className="p-1.5 rounded-lg bg-white border border-gray-200 group-hover:border-gray-300 transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </span>
            Back to Jobs
          </Link>
          <span className="text-gray-300">/</span>
          <span className="text-sm text-gray-400">Talent Profile</span>
        </div>

        {/* ── Hero card ── */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          {/* Accent bar */}
          <div className="h-1.5 bg-gradient-to-r from-violet-500 via-blue-500 to-cyan-400" />

          <div className="p-6">
            <div className="flex flex-col sm:flex-row items-start gap-5">

              {/* Avatar */}
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center text-white font-bold text-xl shrink-0 shadow-md">
                {initials}
              </div>

              {/* Name + meta */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-3 mb-1">
                  <h1 className="text-2xl font-bold text-gray-900">{displayName}</h1>
                  {talent.candidate_id && (
                    <span className="text-xs font-mono bg-gray-100 text-gray-400 px-2 py-0.5 rounded-md">
                      {talent.candidate_id}
                    </span>
                  )}
                  {talent.seniority && (
                    <span className="text-xs font-medium bg-violet-50 text-violet-700 border border-violet-200 px-2.5 py-0.5 rounded-full capitalize">
                      {label(talent.seniority)}
                    </span>
                  )}
                </div>

                {talent.professional_headline && (
                  <p className="text-gray-600 mb-1">{talent.professional_headline}</p>
                )}
                {(talent.current_job_title || talent.current_employer) && (
                  <p className="text-sm text-gray-400">
                    {[talent.current_job_title, talent.current_employer].filter(Boolean).join(' · ')}
                  </p>
                )}
                {talent.industry && (
                  <p className="text-xs text-gray-400 mt-0.5">{talent.industry}</p>
                )}

                {/* Public links inline */}
                {publicLinks.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {publicLinks.map((l) => (
                      <a
                        key={l.label}
                        href={l.url!}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-100 px-2.5 py-1 rounded-lg transition-colors"
                      >
                        {l.icon}
                        {l.label}
                        <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                      </a>
                    ))}
                  </div>
                )}
              </div>

              {/* O-1 Score badge */}
              <div className={`shrink-0 text-center rounded-2xl border-2 px-6 py-4 ${scoreBg(talent.o1_score || 0)}`}>
                <div className={`text-4xl font-black tracking-tight ${scoreColor(talent.o1_score || 0)}`}>
                  {talent.o1_score || 0}
                  <span className="text-2xl">%</span>
                </div>
                <p className="text-xs font-semibold text-gray-500 mt-0.5 uppercase tracking-widest">O-1 Score</p>
                {talent.score_updated_at && (
                  <p className="text-xs text-gray-400 mt-1">{formatDate(talent.score_updated_at)}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Body grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Left / Main ── */}
          <div className="lg:col-span-2 space-y-5">

            {/* Bio */}
            {talent.bio && (
              <Section title="About">
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{talent.bio}</p>
              </Section>
            )}

            {/* Research Impact */}
            {hasAcademicStats && (
              <Section title="Research Impact" icon={<BarChart3 className="w-4 h-4" />}>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {talent.publications_count > 0 && (
                    <StatTile
                      value={talent.publications_count}
                      label="Publications"
                      color="bg-indigo-50 border-indigo-200 text-indigo-700"
                    />
                  )}
                  {talent.citations_count > 0 && (
                    <StatTile
                      value={talent.citations_count}
                      label="Citations"
                      color="bg-blue-50 border-blue-200 text-blue-700"
                    />
                  )}
                  {talent.h_index > 0 && (
                    <StatTile
                      value={talent.h_index}
                      label="h-index"
                      color="bg-violet-50 border-violet-200 text-violet-700"
                    />
                  )}
                  {talent.patents_count > 0 && (
                    <StatTile
                      value={talent.patents_count}
                      label="Patents"
                      color="bg-amber-50 border-amber-200 text-amber-700"
                    />
                  )}
                </div>
              </Section>
            )}

            {/* Skills */}
            {talent.skills && talent.skills.length > 0 && (
              <Section title="Skills">
                <div className="flex flex-wrap gap-2">
                  {talent.skills.map((skill: string, i: number) => (
                    <span
                      key={i}
                      className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full border border-gray-200"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </Section>
            )}

            {/* O-1 Criteria Met */}
            {talent.criteria_met && talent.criteria_met.length > 0 && (
              <Section
                title="O-1 Criteria Met"
                icon={<Award className="w-4 h-4 text-amber-500" />}
              >
                <div className="flex flex-wrap gap-2">
                  {talent.criteria_met.map((c: string, i: number) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-800 text-xs font-medium rounded-full border border-amber-200 capitalize"
                    >
                      <CheckCircle className="w-3 h-3 text-amber-500" />
                      {c.replace(/_/g, ' ')}
                    </span>
                  ))}
                </div>
              </Section>
            )}

            {/* Evidence Summary */}
            {talent.evidence_summary && Object.keys(talent.evidence_summary).length > 0 && (
              <Section title="Evidence Summary" icon={<Layers className="w-4 h-4 text-teal-500" />}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {Object.keys(talent.evidence_summary as Record<string, unknown>).map((key) => {
                    const hasEvidence = uploadedCriteria.has(key);
                    return (
                      <div
                        key={key}
                        className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg border text-xs ${
                          hasEvidence
                            ? 'bg-emerald-50 border-emerald-200'
                            : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        {hasEvidence ? (
                          <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                        ) : (
                          <XCircle className="w-4 h-4 text-gray-300 shrink-0" />
                        )}
                        <div>
                          <p className="font-medium text-gray-800 capitalize">{key.replace(/_/g, ' ')}</p>
                          <p className={hasEvidence ? 'text-emerald-600' : 'text-gray-400'}>
                            {hasEvidence ? 'Evidence uploaded' : 'Not uploaded'}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Section>
            )}

            {/* Verified Documents */}
            {documents && documents.length > 0 && (
              <Section
                title={`Verified Evidence · ${documents.length}`}
                icon={<FileText className="w-4 h-4" />}
              >
                <div className="space-y-3">
                  {documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="p-3 bg-gray-50 rounded-xl border border-gray-100"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">{doc.title}</p>
                          {doc.description && (
                            <p className="text-xs text-gray-500 mt-0.5">{doc.description}</p>
                          )}
                          <div className="flex flex-wrap gap-1.5 mt-1.5">
                            {doc.criterion && (
                              <span className="text-xs bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded-full capitalize">
                                {doc.criterion.replace(/_/g, ' ')}
                              </span>
                            )}
                            {doc.classification_confidence && (
                              <span
                                className={`text-xs px-2 py-0.5 rounded-full capitalize ${confidenceColor(
                                  doc.classification_confidence
                                )}`}
                              >
                                {doc.classification_confidence} confidence
                              </span>
                            )}
                          </div>
                          {doc.ai_notes && (
                            <p className="text-xs text-gray-400 mt-1.5 italic">{doc.ai_notes}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {/* Application History (this agency's jobs) */}
            {applications && applications.length > 0 && (
              <Section title="Applications to Your Jobs" icon={<Briefcase className="w-4 h-4" />}>
                <div className="space-y-2">
                  {applications.map((app) => {
                    const jobRaw = Array.isArray(app.job) ? app.job[0] : app.job;
                    return (
                      <div
                        key={app.id}
                        className="flex items-center justify-between gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          {appStatusIcon(app.status)}
                          <span className="text-sm font-medium text-gray-800 truncate">
                            {jobRaw?.title ?? 'Unknown Job'}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className="text-xs text-gray-400">
                            {new Date(app.applied_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                          <span
                            className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${
                              app.status === 'shortlisted' || app.status === 'hired'
                                ? 'bg-emerald-50 text-emerald-700'
                                : app.status === 'rejected'
                                ? 'bg-red-50 text-red-600'
                                : 'bg-amber-50 text-amber-700'
                            }`}
                          >
                            {app.status}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Section>
            )}
          </div>

          {/* ── Right / Sidebar ── */}
          <div className="space-y-5">

            {/* Visa & Score */}
            <Section title="Visa & O-1 Status" icon={<Star className="w-4 h-4 text-amber-500" />}>
              <div className="space-y-4">
                {talent.visa_status && (
                  <InfoRow
                    icon={<FileText className="w-4 h-4" />}
                    label="Visa Status"
                    value={<span className="capitalize">{label(talent.visa_status)}</span>}
                  />
                )}
                <InfoRow
                  icon={<Star className="w-4 h-4" />}
                  label="O-1 Score"
                  value={
                    <span className={`text-lg font-bold ${scoreColor(talent.o1_score || 0)}`}>
                      {talent.o1_score || 0}%
                    </span>
                  }
                />
                <InfoRow
                  icon={<Award className="w-4 h-4" />}
                  label="Criteria Met"
                  value={`${talent.criteria_met?.length ?? 0} criteria`}
                />
              </div>
            </Section>

            {/* Location & Availability */}
            <Section title="Location & Availability" icon={<MapPin className="w-4 h-4" />}>
              <div className="space-y-4">
                {(talent.city || talent.state || talent.country) && (
                  <InfoRow
                    icon={<MapPin className="w-4 h-4" />}
                    label="Location"
                    value={[talent.city, talent.state, talent.country].filter(Boolean).join(', ')}
                  />
                )}
                {talent.willing_to_relocate !== null && (
                  <InfoRow
                    icon={<MoveRight className="w-4 h-4" />}
                    label="Relocation"
                    value={talent.willing_to_relocate ? 'Open to relocate' : 'Not open to relocate'}
                  />
                )}
                {talent.preferred_locations && talent.preferred_locations.length > 0 && (
                  <div className="flex items-start gap-3">
                    <span className="text-gray-400 mt-0.5 shrink-0">
                      <MapPin className="w-4 h-4" />
                    </span>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Preferred Locations</p>
                      <div className="flex flex-wrap gap-1">
                        {talent.preferred_locations.map((loc: string, i: number) => (
                          <span
                            key={i}
                            className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full"
                          >
                            {loc}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                {(talent.available_start || talent.available_start_date) && (
                  <InfoRow
                    icon={<Clock className="w-4 h-4" />}
                    label="Available From"
                    value={
                      talent.available_start_date
                        ? formatDate(talent.available_start_date)
                        : label(talent.available_start ?? '')
                    }
                  />
                )}
              </div>
            </Section>

            {/* Professional Details */}
            <Section title="Professional Details" icon={<Briefcase className="w-4 h-4" />}>
              <div className="space-y-4">
                {talent.years_experience && (
                  <InfoRow
                    icon={<Briefcase className="w-4 h-4" />}
                    label="Experience"
                    value={`${talent.years_experience} years`}
                  />
                )}
                {talent.seniority && (
                  <InfoRow
                    icon={<TrendingUp className="w-4 h-4" />}
                    label="Seniority"
                    value={<span className="capitalize">{label(talent.seniority)}</span>}
                  />
                )}
                {talent.industry && (
                  <InfoRow
                    icon={<Building2 className="w-4 h-4" />}
                    label="Industry"
                    value={talent.industry}
                  />
                )}
                {talent.work_arrangement && (
                  <InfoRow
                    icon={<Users className="w-4 h-4" />}
                    label="Work Arrangement"
                    value={label(talent.work_arrangement)}
                  />
                )}
                {talent.engagement_type && (
                  <InfoRow
                    icon={<Briefcase className="w-4 h-4" />}
                    label="Engagement Type"
                    value={label(talent.engagement_type)}
                  />
                )}
                {(talent.salary_min || talent.salary_preferred) && (
                  <InfoRow
                    icon={<DollarSign className="w-4 h-4" />}
                    label="Salary Expectation"
                    value={
                      talent.salary_min && talent.salary_preferred
                        ? `${formatSalary(talent.salary_min)} – ${formatSalary(talent.salary_preferred)}`
                        : talent.salary_preferred
                        ? formatSalary(talent.salary_preferred)
                        : formatSalary(talent.salary_min!)
                    }
                  />
                )}
              </div>
            </Section>

            {/* Education */}
            {(talent.education || talent.university || talent.field_of_study) && (
              <Section title="Education" icon={<GraduationCap className="w-4 h-4" />}>
                <div className="flex items-start gap-3">
                  <GraduationCap className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                  <div>
                    {talent.education && (
                      <p className="text-sm font-medium text-gray-800 capitalize">
                        {label(talent.education)}
                      </p>
                    )}
                    {talent.university && (
                      <p className="text-sm text-gray-600">{talent.university}</p>
                    )}
                    {talent.field_of_study && (
                      <p className="text-xs text-gray-500">{talent.field_of_study}</p>
                    )}
                    {talent.graduation_year && (
                      <p className="text-xs text-gray-400 mt-0.5">Class of {talent.graduation_year}</p>
                    )}
                  </div>
                </div>
              </Section>
            )}

            {/* Research Stats (compact sidebar) */}
            {hasAcademicStats && (
              <Section title="Research Stats" icon={<FlaskConical className="w-4 h-4 text-indigo-500" />}>
                <div className="space-y-2 text-sm">
                  {talent.publications_count > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500 text-xs">Publications</span>
                      <span className="font-semibold text-gray-800">{talent.publications_count}</span>
                    </div>
                  )}
                  {talent.citations_count > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500 text-xs">Citations</span>
                      <span className="font-semibold text-gray-800">{talent.citations_count}</span>
                    </div>
                  )}
                  {talent.h_index > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500 text-xs">h-index</span>
                      <span className="font-semibold text-gray-800">{talent.h_index}</span>
                    </div>
                  )}
                  {talent.patents_count > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500 text-xs">Patents</span>
                      <span className="font-semibold text-gray-800">{talent.patents_count}</span>
                    </div>
                  )}
                </div>
              </Section>
            )}

            {/* Member since */}
            <Section>
              <InfoRow
                icon={<Calendar className="w-4 h-4" />}
                label="Member Since"
                value={formatDate(talent.created_at)}
              />
            </Section>

            {/* CTAs */}
            <div className="space-y-3">
              <Link
                href={`/dashboard/agency/letters/new?talent=${id}`}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-violet-600 to-blue-600 text-white font-semibold rounded-xl hover:from-violet-700 hover:to-blue-700 transition-all shadow-sm text-sm"
              >
                <Mail className="w-4 h-4" />
                Send Interest Letter
              </Link>
            </div>
          </div>
        </div>
    </div>
  );
}