import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
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
    Clock,
    CheckCircle,
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
        user_id,
        skills
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
    console.log("letter ====> ", letter.talent);

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
            return { label: 'Declined', variant: 'error' as const };
          default:
            return { label: status, variant: 'default' as const };
        }
    }

    function getCommitmentLabel(level: string) {
        return level.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
    }

    const status = getStatusBadge(letter.status || 'draft');
    
    // Check if signed letter has been forwarded to employer
    const isSignedLetterForwarded = letter.signature_status === 'forwarded_to_employer';

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
                                {letter.talent.skills && letter.talent.skills.length > 0 && (
                                    <div className="mt-0">
                                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Skills</p>
                                        <div className="flex flex-wrap gap-2">
                                            {letter.talent.skills.map((skill:string, index:number) => (
                                                <span
                                                    key={index}
                                                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                                                >
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
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

            {/* Talent Response Section */}
            {letter.status === 'accepted' && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                            Talent Response
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                            <p className="text-green-800 font-medium">
                                The talent has accepted and signed this letter
                            </p>
                            {letter.responded_at && (
                                <p className="text-sm text-green-600">
                                    on {formatDate(letter.responded_at)}
                                </p>
                            )}
                        </div>

                        {letter.talent_response_message && (
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Message from Talent</p>
                                <p className="text-gray-900 whitespace-pre-wrap bg-gray-50 p-3 rounded-lg">
                                    {letter.talent_response_message}
                                </p>
                            </div>
                        )}

                        {/* Only show signed letter if admin has forwarded it */}
                        {isSignedLetterForwarded ? (
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-green-700">
                                    <CheckCircle className="w-4 h-4" />
                                    <p className="text-sm font-medium">Signed letter approved and forwarded by admin</p>
                                </div>
                                
                                {/* Show signature */}
                                {letter.talent_signature_data && (
                                    <div>
                                        <p className="text-sm text-gray-500 mb-2">Talent&apos;s Signature</p>
                                        <div className="bg-white p-3 rounded-lg border inline-block">
                                            <img 
                                                src={letter.talent_signature_data} 
                                                alt="Talent signature" 
                                                className="h-20 object-contain"
                                            />
                                        </div>
                                    </div>
                                )}

                                {letter.forwarded_to_employer_at && (
                                    <p className="text-xs text-gray-500">
                                        Forwarded on {formatDate(letter.forwarded_to_employer_at)}
                                    </p>
                                )}
                            </div>
                        ) : (
                            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                <div className="flex items-center gap-2 text-yellow-800">
                                    <Clock className="w-4 h-4" />
                                    <p className="text-sm font-medium">Signed letter pending admin review</p>
                                </div>
                                <p className="text-xs text-yellow-600 mt-1">
                                    The signed letter will be available once the admin team reviews and forwards it.
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {letter.status === 'declined' && (
                <Card>
                    <CardHeader>
                        <CardTitle>Talent Response</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-red-800 font-medium">
                                The talent has declined this letter
                            </p>
                            {letter.responded_at && (
                                <p className="text-sm text-red-600">
                                    on {formatDate(letter.responded_at)}
                                </p>
                            )}
                        </div>
                        {letter.talent_response_message && (
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Message from Talent</p>
                                <p className="text-gray-900 whitespace-pre-wrap bg-gray-50 p-3 rounded-lg">
                                    {letter.talent_response_message}
                                </p>
                            </div>
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
                </CardContent>
            </Card>
        </div>
    );
}