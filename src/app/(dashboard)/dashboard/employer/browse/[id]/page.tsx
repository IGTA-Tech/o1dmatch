import { createClient } from '@/lib/supabase/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';
import { redirect } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent, Badge } from '@/components/ui';
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
} from 'lucide-react';
import Link from 'next/link';

// ── Helpers ────────────────────────────────────────────────────────────────

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long' });

const formatSalary = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);

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
  if (score >= 80) return 'text-green-600';
  if (score >= 60) return 'text-yellow-600';
  return 'text-red-500';
};

const confidenceColor = (c: string) => {
  if (c === 'high') return 'bg-green-100 text-green-700';
  if (c === 'medium') return 'bg-yellow-100 text-yellow-700';
  return 'bg-red-100 text-red-700';
};

// ── Page ───────────────────────────────────────────────────────────────────

export default async function TalentProfilePage({
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

  const { data: employerProfile } = await supabase
    .from('employer_profiles')
    .select('id')
    .eq('user_id', user.id)
    .single();
  if (!employerProfile) redirect('/dashboard/employer');

  const { data: talent, error } = await supabase
    .from('talent_profiles')
    .select('*')
    .eq('id', id)
    .single();

  if (error) console.error(error);
  if (!talent) redirect('/dashboard/employer/browse');

  // Only safe public field — no email/phone
  const { data: userProfile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', talent.user_id)
    .single();

  // Use service role to bypass RLS — employers can't read other users' talent_documents via normal client
  const serviceClient = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: documents } = await serviceClient
    .from('talent_documents')
    .select('id, title, description, file_url, criterion, auto_classified_criterion, classification_confidence, ai_notes, created_at')
    .eq('talent_id', id)
    .eq('status', 'verified')
    .order('created_at', { ascending: false });

  // Build uploaded criteria set from both criterion fields
  const uploadedCriteria = new Set(
    (documents ?? []).flatMap((d) =>
      [d.criterion, d.auto_classified_criterion].filter(Boolean)
    )
  );

  const displayName =
    userProfile?.full_name ||
    (talent.first_name || talent.last_name
      ? `${talent.first_name ?? ''} ${talent.last_name ?? ''}`.trim()
      : 'Talent Profile');

  const hasAcademicStats =
    talent.publications_count > 0 ||
    talent.h_index > 0 ||
    talent.citations_count > 0 ||
    talent.patents_count > 0;

  const publicLinks = [
    { url: talent.linkedin_url, label: 'LinkedIn', icon: <Link2 className="w-4 h-4" /> },
    { url: talent.github_url, label: 'GitHub', icon: <Github className="w-4 h-4" /> },
    { url: talent.google_scholar_url, label: 'Google Scholar', icon: <BookOpen className="w-4 h-4" /> },
    { url: talent.personal_website, label: 'Website', icon: <Globe className="w-4 h-4" /> },
  ].filter((l) => !!l.url);

  return (
    <div className="space-y-6">

      {/* ── Hero header ── */}
      <div className="flex items-start gap-4">
        <Link
          href="/dashboard/employer/browse"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors mt-1"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">{displayName}</h1>
            {talent.candidate_id && (
              <span className="text-xs font-mono bg-gray-100 text-gray-500 px-2 py-0.5 rounded">
                {talent.candidate_id}
              </span>
            )}
            {talent.seniority && (
              <Badge variant="default" className="capitalize">{label(talent.seniority)}</Badge>
            )}
          </div>

          {talent.professional_headline && (
            <p className="mt-1 text-gray-600 text-base">{talent.professional_headline}</p>
          )}

          {(talent.current_job_title || talent.current_employer) && (
            <p className="mt-0.5 text-sm text-gray-500">
              {[talent.current_job_title, talent.current_employer].filter(Boolean).join(' · ')}
            </p>
          )}

          {talent.industry && (
            <p className="mt-0.5 text-sm text-gray-400">{talent.industry}</p>
          )}
        </div>

        {/* O-1 Score pill */}
        <div className="shrink-0 text-center bg-white border border-gray-200 rounded-xl px-5 py-3 shadow-sm">
          <div className={`text-3xl font-bold ${scoreColor(talent.o1_score || 0)}`}>
            {talent.o1_score || 0}
            <span className="text-lg">%</span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">O-1 Score</p>
          {talent.score_updated_at && (
            <p className="text-xs text-gray-400">
              Updated {formatDate(talent.score_updated_at)}
            </p>
          )}
        </div>
      </div>

      {/* ── Body ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Main column ── */}
        <div className="lg:col-span-2 space-y-6">

          {/* About */}
          {talent.bio && (
            <Card>
              <CardHeader><CardTitle>About</CardTitle></CardHeader>
              <CardContent>
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{talent.bio}</p>
              </CardContent>
            </Card>
          )}

          {/* Academic / Research Stats */}
          {hasAcademicStats && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-indigo-500" />
                  Research Impact
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {talent.publications_count > 0 && (
                    <div className="text-center p-3 bg-indigo-50 rounded-xl">
                      <div className="text-2xl font-bold text-indigo-700">{talent.publications_count}</div>
                      <div className="text-xs text-indigo-500 mt-0.5">Publications</div>
                    </div>
                  )}
                  {talent.citations_count > 0 && (
                    <div className="text-center p-3 bg-blue-50 rounded-xl">
                      <div className="text-2xl font-bold text-blue-700">{talent.citations_count}</div>
                      <div className="text-xs text-blue-500 mt-0.5">Citations</div>
                    </div>
                  )}
                  {talent.h_index > 0 && (
                    <div className="text-center p-3 bg-purple-50 rounded-xl">
                      <div className="text-2xl font-bold text-purple-700">{talent.h_index}</div>
                      <div className="text-xs text-purple-500 mt-0.5">h-index</div>
                    </div>
                  )}
                  {talent.patents_count > 0 && (
                    <div className="text-center p-3 bg-amber-50 rounded-xl">
                      <div className="text-2xl font-bold text-amber-700">{talent.patents_count}</div>
                      <div className="text-xs text-amber-500 mt-0.5">Patents</div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Skills */}
          {talent.skills && talent.skills.length > 0 && (
            <Card>
              <CardHeader><CardTitle>Skills</CardTitle></CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {talent.skills.map((skill: string, i: number) => (
                    <Badge key={i} variant="default">{skill}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* O-1 Criteria */}
          {talent.criteria_met && talent.criteria_met.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-yellow-500" />
                  O-1 Criteria Met
                  <span className="ml-auto text-sm font-normal text-gray-500">
                    {talent.criteria_met.length} criteria
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {talent.criteria_met.map((c: string, i: number) => (
                    <Badge key={i} variant="success" className="capitalize">
                      {c.replace(/_/g, ' ')}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Evidence Summary — checkmark if files uploaded, else not uploaded */}
          {talent.evidence_summary && Object.keys(talent.evidence_summary).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Layers className="w-5 h-5 text-teal-500" />
                  Evidence Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {Object.keys(talent.evidence_summary as Record<string, unknown>).map((key) => {
                    const hasEvidence = uploadedCriteria.has(key);
                    return (
                      <div
                        key={key}
                        className={`flex items-center gap-2.5 px-3 py-2 rounded-lg border ${
                          hasEvidence
                            ? 'bg-green-50 border-green-200'
                            : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        {hasEvidence ? (
                          <span className="shrink-0 w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          </span>
                        ) : (
                          <span className="shrink-0 w-5 h-5 rounded-full bg-gray-300 flex items-center justify-center">
                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </span>
                        )}
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-800 capitalize">
                            {key.replace(/_/g, ' ')}
                          </p>
                          <p className={`text-xs ${hasEvidence ? 'text-green-600' : 'text-gray-400'}`}>
                            {hasEvidence ? 'Evidence uploaded' : 'Not uploaded'}
                          </p>
                        </div>
                      </div>
                    );
                  })}
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
                  <span className="ml-auto text-sm font-normal text-gray-500">
                    {documents.length} document{documents.length !== 1 ? 's' : ''}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {documents.map((doc) => (
                  <div key={doc.id} className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900">{doc.title}</h4>
                        {doc.description && (
                          <p className="text-sm text-gray-600 mt-0.5">{doc.description}</p>
                        )}
                        <div className="flex flex-wrap gap-2 mt-2">
                          {doc.criterion && (
                            <span className="text-xs bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded-full capitalize">
                              {doc.criterion.replace(/_/g, ' ')}
                            </span>
                          )}
                          {doc.classification_confidence && (
                            <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${confidenceColor(doc.classification_confidence)}`}>
                              {doc.classification_confidence} confidence
                            </span>
                          )}
                        </div>
                        {doc.ai_notes && (
                          <p className="text-xs text-gray-500 mt-1.5 italic">{doc.ai_notes}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Public Profiles & Links — external profile links only, no document links */}
          {publicLinks.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-gray-500" />
                  Public Profiles &amp; Links
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-3">
                {publicLinks.map((l) => (
                  <a
                    key={l.label}
                    href={l.url!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-sm text-blue-600 hover:underline border border-blue-100 bg-blue-50 px-3 py-1.5 rounded-lg"
                  >
                    {l.icon}
                    {l.label}
                    <ExternalLink className="w-3 h-3 opacity-60" />
                  </a>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* ── Sidebar ── */}
        <div className="space-y-6">

          {/* Location & Availability */}
          <Card>
            <CardHeader><CardTitle>Location &amp; Availability</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {(talent.city || talent.state || talent.country) && (
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Location</p>
                    <p className="font-medium">
                      {[talent.city, talent.state, talent.country].filter(Boolean).join(', ')}
                    </p>
                  </div>
                </div>
              )}

              {talent.willing_to_relocate !== null && (
                <div className="flex items-start gap-3">
                  <MoveRight className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Relocation</p>
                    <p className="font-medium">
                      {talent.willing_to_relocate ? 'Open to relocate' : 'Not open to relocate'}
                    </p>
                  </div>
                </div>
              )}

              {talent.preferred_locations && talent.preferred_locations.length > 0 && (
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Preferred Locations</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {talent.preferred_locations.map((loc: string, i: number) => (
                        <span key={i} className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">
                          {loc}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {(talent.available_start || talent.available_start_date) && (
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Available From</p>
                    <p className="font-medium capitalize">
                      {talent.available_start_date
                        ? formatDate(talent.available_start_date)
                        : label(talent.available_start ?? '')}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Professional Details */}
          <Card>
            <CardHeader><CardTitle>Professional Details</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {talent.years_experience && (
                <div className="flex items-start gap-3">
                  <Briefcase className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Experience</p>
                    <p className="font-medium">{talent.years_experience} years</p>
                  </div>
                </div>
              )}

              {talent.seniority && (
                <div className="flex items-start gap-3">
                  <TrendingUp className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Seniority</p>
                    <p className="font-medium capitalize">{label(talent.seniority)}</p>
                  </div>
                </div>
              )}

              {talent.industry && (
                <div className="flex items-start gap-3">
                  <Building2 className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Industry</p>
                    <p className="font-medium">{talent.industry}</p>
                  </div>
                </div>
              )}

              {talent.work_arrangement && (
                <div className="flex items-start gap-3">
                  <Users className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Work Arrangement</p>
                    <p className="font-medium">{label(talent.work_arrangement)}</p>
                  </div>
                </div>
              )}

              {talent.engagement_type && (
                <div className="flex items-start gap-3">
                  <Briefcase className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Engagement Type</p>
                    <p className="font-medium">{label(talent.engagement_type)}</p>
                  </div>
                </div>
              )}

              {(talent.salary_min || talent.salary_preferred) && (
                <div className="flex items-start gap-3">
                  <DollarSign className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Salary Expectation</p>
                    <p className="font-medium">
                      {talent.salary_min && talent.salary_preferred
                        ? `${formatSalary(talent.salary_min)} – ${formatSalary(talent.salary_preferred)}`
                        : talent.salary_preferred
                        ? formatSalary(talent.salary_preferred)
                        : formatSalary(talent.salary_min!)}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Education */}
          {(talent.education || talent.university || talent.field_of_study) && (
            <Card>
              <CardHeader><CardTitle>Education</CardTitle></CardHeader>
              <CardContent>
                <div className="flex items-start gap-3">
                  <GraduationCap className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    {talent.education && (
                      <p className="font-medium capitalize">{label(talent.education)}</p>
                    )}
                    {talent.university && (
                      <p className="text-sm text-gray-600">{talent.university}</p>
                    )}
                    {talent.field_of_study && (
                      <p className="text-sm text-gray-500">{talent.field_of_study}</p>
                    )}
                    {talent.graduation_year && (
                      <p className="text-xs text-gray-400 mt-0.5">Class of {talent.graduation_year}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Visa Status */}
          <Card>
            <CardHeader><CardTitle>Visa &amp; O-1 Status</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {talent.visa_status && (
                <div className="flex items-start gap-3">
                  <FileText className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Visa Status</p>
                    <p className="font-medium capitalize">{label(talent.visa_status)}</p>
                  </div>
                </div>
              )}
              <div className="flex items-start gap-3">
                <Star className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">O-1 Score</p>
                  <p className={`font-bold text-lg ${scoreColor(talent.o1_score || 0)}`}>
                    {talent.o1_score || 0}%
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Award className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Criteria Met</p>
                  <p className="font-medium">{talent.criteria_met?.length ?? 0} criteria</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Research Stats (sidebar compact) */}
          {hasAcademicStats && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FlaskConical className="w-5 h-5 text-indigo-500" />
                  Research Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {talent.publications_count > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Publications</span>
                    <span className="font-semibold">{talent.publications_count}</span>
                  </div>
                )}
                {talent.citations_count > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Citations</span>
                    <span className="font-semibold">{talent.citations_count}</span>
                  </div>
                )}
                {talent.h_index > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">h-index</span>
                    <span className="font-semibold">{talent.h_index}</span>
                  </div>
                )}
                {talent.patents_count > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Patents</span>
                    <span className="font-semibold">{talent.patents_count}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Member since */}
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Member Since</p>
                  <p className="font-medium">{formatDate(talent.created_at)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* CTA */}
          <Card>
            <CardContent className="space-y-3 pt-4">
              <Link
                href={`/dashboard/employer/interest-letter?talent=${id}`}
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