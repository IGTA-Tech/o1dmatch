import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Card, CardContent, Badge } from '@/components/ui';
import {
  Mail,
  Building2,
  Calendar,
  ArrowRight,
  FileText,
  Download,
  CheckCircle,
  XCircle,
  Clock,
  PenTool,
} from 'lucide-react';
import Link from 'next/link';
import { LetterStatus, COMMITMENT_LEVELS } from '@/types/enums';
import Image from "next/image";

const STATUS_CONFIG: Record<
  LetterStatus,
  { label: string; variant: 'success' | 'warning' | 'error' | 'info' | 'default'; icon: React.ReactNode }
> = {
  draft: { label: 'Draft', variant: 'default', icon: <Clock className="w-4 h-4" /> },
  sent: { label: 'Pending Response', variant: 'warning', icon: <Clock className="w-4 h-4" /> },
  viewed: { label: 'Viewed', variant: 'info', icon: <Clock className="w-4 h-4" /> },
  accepted: { label: 'Accepted', variant: 'success', icon: <CheckCircle className="w-4 h-4" /> },
  declined: { label: 'Declined', variant: 'error', icon: <XCircle className="w-4 h-4" /> },
  expired: { label: 'Expired', variant: 'default', icon: <Clock className="w-4 h-4" /> },
  signature_requested: { label: 'Sign Required', variant: 'info', icon: <PenTool className="w-4 h-4" /> },
  signature_pending: { label: 'Awaiting Signature', variant: 'warning', icon: <PenTool className="w-4 h-4" /> },
  signed: { label: 'Signed', variant: 'success', icon: <CheckCircle className="w-4 h-4" /> },
};

export default async function TalentLettersPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: talentProfile } = await supabase
    .from('talent_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (!talentProfile) {
    redirect('/dashboard/talent');
  }

  const { data: letters } = await supabase
    .from('interest_letters')
    .select(`
      *,
      employer:employer_profiles(
        company_name,
        company_logo_url,
        city,
        state,
        signatory_name,
        signatory_title
      )
    `)
    .eq('talent_id', talentProfile.id)
    .order('created_at', { ascending: false });

  const stats = {
    total: letters?.length || 0,
    pending: letters?.filter((l) => ['sent', 'viewed'].includes(l.status)).length || 0,
    accepted: letters?.filter((l) => l.status === 'accepted').length || 0,
    declined: letters?.filter((l) => l.status === 'declined').length || 0,
  };

  const formatSalary = (min?: number | null, max?: number | null) => {
    if (!min && !max) return 'Not specified';
    if (min && max) return `$${(min / 1000).toFixed(0)}k - $${(max / 1000).toFixed(0)}k`;
    if (min) return `$${(min / 1000).toFixed(0)}k+`;
    return `Up to $${((max || 0) / 1000).toFixed(0)}k`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Interest Letters</h1>
        <p className="text-gray-600">
          View and respond to interest letters from employers
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card padding="sm">
          <CardContent>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            <p className="text-sm text-gray-600">Total Letters</p>
          </CardContent>
        </Card>
        <Card padding="sm">
          <CardContent>
            <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            <p className="text-sm text-gray-600">Pending Response</p>
          </CardContent>
        </Card>
        <Card padding="sm">
          <CardContent>
            <p className="text-2xl font-bold text-green-600">{stats.accepted}</p>
            <p className="text-sm text-gray-600">Accepted</p>
          </CardContent>
        </Card>
        <Card padding="sm">
          <CardContent>
            <p className="text-2xl font-bold text-red-600">{stats.declined}</p>
            <p className="text-sm text-gray-600">Declined</p>
          </CardContent>
        </Card>
      </div>

      {/* Info box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <FileText className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <p className="font-medium text-blue-900">What are Interest Letters?</p>
            <p className="text-sm text-blue-700 mt-1">
              Interest letters are formal expressions of intent from employers to sponsor your
              O-1 visa. These letters can be used as part of your visa application to demonstrate
              employer interest. Your personal information is only revealed after you accept a letter.
            </p>
          </div>
        </div>
      </div>

      {/* Letters List */}
      {!letters || letters.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No letters received</h3>
            <p className="text-gray-600">
              When employers send you interest letters, they&apos;ll appear here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {letters.map((letter) => {
            const statusConfig = STATUS_CONFIG[letter.status as LetterStatus];
            const commitmentLevel =
              COMMITMENT_LEVELS[letter.commitment_level as keyof typeof COMMITMENT_LEVELS];

            return (
              <Card key={letter.id}>
                <CardContent>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      {letter.employer?.logo_url ? (
                        <Image
                          src={letter.employer.logo_url}
                          alt={letter.employer.company_name}
                          className="w-14 h-14 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-14 h-14 bg-gray-100 rounded-lg flex items-center justify-center">
                          <Building2 className="w-7 h-7 text-gray-400" />
                        </div>
                      )}
                      <div>
                        <h3 className="font-semibold text-gray-900">{letter.job_title}</h3>
                        <p className="text-gray-600">{letter.employer?.company_name}</p>
                        <div className="flex items-center gap-3 mt-2 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(letter.created_at).toLocaleDateString()}
                          </span>
                          <span>{formatSalary(letter.salary_min, letter.salary_max)}</span>
                        </div>
                      </div>
                    </div>

                    <Badge variant={statusConfig?.variant || 'default'}>
                      {statusConfig?.icon}
                      <span className="ml-1">{statusConfig?.label || letter.status}</span>
                    </Badge>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Commitment Level</span>
                        <p className="font-medium text-gray-900">
                          {commitmentLevel?.name || letter.commitment_level}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500">Engagement</span>
                        <p className="font-medium text-gray-900 capitalize">
                          {letter.engagement_type?.replace('_', ' ') || 'Not specified'}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500">Work Arrangement</span>
                        <p className="font-medium text-gray-900 capitalize">
                          {letter.work_arrangement?.replace('_', ' ') || 'Not specified'}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500">Duration</span>
                        <p className="font-medium text-gray-900">
                          {letter.duration_years ? `${letter.duration_years} years` : 'Not specified'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      From: {letter.employer?.signatory_name}
                      {letter.employer?.signatory_title && `, ${letter.employer.signatory_title}`}
                    </div>

                    <div className="flex items-center gap-2">
                      {letter.pdf_url && (
                        <a
                          href={letter.pdf_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <Download className="w-4 h-4" />
                          Download PDF
                        </a>
                      )}
                      <Link
                        href={`/dashboard/talent/letters/${letter.id}`}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        View Details
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>

                  {/* Action buttons for pending letters */}
                  {['sent', 'viewed'].includes(letter.status) && (
                    <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end gap-3">
                      <Link
                        href={`/dashboard/talent/letters/${letter.id}?action=decline`}
                        className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        Decline
                      </Link>
                      <Link
                        href={`/dashboard/talent/letters/${letter.id}?action=accept`}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        Accept Letter
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
