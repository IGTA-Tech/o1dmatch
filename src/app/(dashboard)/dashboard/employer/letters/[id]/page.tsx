import { createClient } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent, Badge } from '@/components/ui';
import {
    ArrowLeft,
    User,
    Briefcase,
    DollarSign,
    MapPin,
    Calendar,
    FileText,
    Download,
    Mail,
} from 'lucide-react';
import Link from 'next/link';

export default async function LetterDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    const { data: employerProfile } = await supabase
        .from('employer_profiles')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

    if (!employerProfile) {
        redirect('/dashboard/employer');
    }

    const { data: letter, error } = await supabase
        .from('interest_letters')
        .select(
            `
      *,
      talent:talent_profiles(
        id,
        user_id
      ),
      job:job_listings(
        id,
        title,
        department
      )
    `
        )
        .eq('id', id)
        .eq('employer_id', employerProfile.id)
        .maybeSingle();

    if (error || !letter) {
        console.log("error ====> ", error);
    }
    console.log("letter ====> ", letter);

    let talentUser: { full_name: string; email: string } | null = null;
    if (letter.talent?.user_id) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, email')
            .eq('id', letter.talent.user_id)
            .maybeSingle();
        talentUser = profile;
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
            return { label: 'Sent', variant: 'info' as const };
          case 'viewed':
            return { label: 'Viewed', variant: 'info' as const };
          case 'accepted':
            return { label: 'Accepted', variant: 'success' as const };
          case 'declined':
            return { label: 'Declined', variant: 'error' as const };  // Changed from 'destructive' to 'error'
          default:
            return { label: status, variant: 'default' as const };
        }
      }

    function getCommitmentLabel(level: string) {
        return level.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
    }

    const status = getStatusBadge(letter.status || 'draft');

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link
                        href="/dashboard/employer/letters"
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{letter.job_title}</h1>
                        <p className="text-gray-600">Interest Letter</p>
                    </div>
                </div>
                <Badge variant={status.variant} className="text-sm px-3 py-1">
                    {status.label}
                </Badge>
            </div>

            {letter.talent && talentUser && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="w-5 h-5" />
                            Recipient
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-start gap-4">
                            <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center">
                                <User className="w-7 h-7 text-blue-600" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold text-gray-900">
                                    {talentUser.full_name}
                                </h3>
                                <p className="text-gray-600">{letter.talent.professional_headline}</p>
                                <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                                    {letter.talent.current_location && (
                                        <span className="flex items-center gap-1">
                                            <MapPin className="w-4 h-4" />
                                            {letter.talent.current_location}
                                        </span>
                                    )}
                                    {letter.talent.years_experience && (
                                        <span>{letter.talent.years_experience} years exp</span>
                                    )}
                                </div>
                                {talentUser.email && (

                                    <a href={`mailto:${talentUser.email}`}
                                        className="inline-flex items-center gap-1 mt-2 text-blue-600 hover:underline text-sm"
                                    >
                                        <Mail className="w-4 h-4" />
                                        {talentUser.email}
                                    </a>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

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
                                        className="px-2 py-1 bg-gray-100 rounded text-sm text-gray-700"
                                    >
                                        {loc}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

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

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="w-5 h-5" />
                        O-1 Justification
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <p className="text-sm text-gray-500 mb-1">Job Duties & Responsibilities</p>
                        <p className="text-gray-900 whitespace-pre-wrap">
                            {letter.duties_description}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 mb-1">Why O-1 Visa is Required</p>
                        <p className="text-gray-900 whitespace-pre-wrap">
                            {letter.why_o1_required}
                        </p>
                    </div>
                </CardContent>
            </Card>

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

            {letter.talent_response_message && (
                <Card>
                    <CardHeader>
                        <CardTitle>Talent Response</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-gray-900 whitespace-pre-wrap">
                            {letter.talent_response_message}
                        </p>
                        {letter.responded_at && (
                            <p className="text-sm text-gray-500 mt-2">
                                Responded on {formatDate(letter.responded_at)}
                            </p>
                        )}
                    </CardContent>
                </Card>
            )}

            {letter.pdf_url && (
                <Card>
                    <CardHeader>
                        <CardTitle>Attachment</CardTitle>
                    </CardHeader>
                    <CardContent>

                        <a href={letter.pdf_url}
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

            <Card>
                <CardContent className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Created {formatDate(letter.created_at)}
                    </div>
                    {letter.job && (
                        <Link
                            href={`/dashboard/employer/jobs/${letter.job.id}`}
                            className="text-blue-600 hover:underline"
                        >
                            View Linked Job: {letter.job.title}
                        </Link>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}