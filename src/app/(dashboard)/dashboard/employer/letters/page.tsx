// src/app/(dashboard)/dashboard/employer/letters/page.tsx

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent, Badge } from '@/components/ui';
import {
  Mail,
  Calendar,
  ArrowRight,
  FileText,
  Download,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  PenTool,
  ArrowLeft,
  Lock,
} from 'lucide-react';
import Link from 'next/link';
import { LetterStatus, COMMITMENT_LEVELS } from '@/types/enums';

const STATUS_CONFIG: Record<
  LetterStatus,
  { label: string; variant: 'success' | 'warning' | 'error' | 'info' | 'default'; icon: React.ReactNode }
> = {
  draft: { label: 'Draft', variant: 'default', icon: <FileText className="w-4 h-4" /> },
  sent: { label: 'Sent', variant: 'info', icon: <Mail className="w-4 h-4" /> },
  viewed: { label: 'Viewed', variant: 'warning', icon: <Eye className="w-4 h-4" /> },
  accepted: { label: 'Accepted', variant: 'success', icon: <CheckCircle className="w-4 h-4" /> },
  declined: { label: 'Declined', variant: 'error', icon: <XCircle className="w-4 h-4" /> },
  expired: { label: 'Expired', variant: 'default', icon: <Clock className="w-4 h-4" /> },
  signature_requested: { label: 'Signature Requested', variant: 'info', icon: <PenTool className="w-4 h-4" /> },
  signature_pending: { label: 'Awaiting Signature', variant: 'warning', icon: <PenTool className="w-4 h-4" /> },
  signed: { label: 'Signed', variant: 'success', icon: <CheckCircle className="w-4 h-4" /> },
};

export default async function EmployerLettersPage() {
  const supabase = await createClient();

  // Use getSession instead of getUser to avoid type issues
  const { data: { session } } = await supabase.auth.getSession();

  if (!session?.user) {
    redirect('/login');
  }

  const user = session.user;

  const { data: employerProfile } = await supabase
    .from('employer_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (!employerProfile) {
    redirect('/dashboard/employer');
  }

  const { data: letters } = await supabase
    .from('interest_letters')
    .select(`
      *,
      talent:talent_profiles(
        candidate_id,
        professional_headline,
        o1_score,
        industry,
        first_name,
        last_name,
        email,
        phone
      )
    `)
    .eq('employer_id', employerProfile.id)
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

      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/employer"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sent Letters</h1>
          <p className="text-gray-600">Track interest letters sent to candidates</p>
        </div>
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
            <p className="text-sm text-gray-600">Awaiting Response</p>
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

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <FileText className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <p className="font-medium text-blue-900">About Interest Letters</p>
            <p className="text-sm text-blue-700 mt-1">
              Interest letters are formal expressions of your intent to sponsor or hire O-1 talent.
              When a candidate accepts and signs the letter, our admin will review and forward
              the signed document to you. Contact information will be revealed once the signed
              letter is delivered.
            </p>
          </div>
        </div>
      </div>

      {/* Letters List */}
      {!letters || letters.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No letters sent yet</h3>
            <p className="text-gray-600 mb-4">
              Browse our talent pool and send interest letters to qualified candidates.
            </p>
            <Link
              href="/dashboard/employer/browse"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Browse Talent
            </Link>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>All Letters</CardTitle>
          </CardHeader>
          <CardContent className="divide-y divide-gray-100">
            {letters.map((letter) => {
              const statusConfig = STATUS_CONFIG[letter.status as LetterStatus];
              const commitmentLevel =
                COMMITMENT_LEVELS[letter.commitment_level as keyof typeof COMMITMENT_LEVELS];
              
              // Contact info is only revealed when:
              // 1. Letter is accepted AND
              // 2. Admin has forwarded the signed letter (employer_received_signed_at is set)
              const isAccepted = letter.status === 'accepted';
              const isSignedAndForwarded = letter.employer_received_signed_at !== null;
              const canViewContactInfo = isAccepted && isSignedAndForwarded;

              // Type assertion for talent relationship
              const talent = letter.talent as {
                candidate_id?: string;
                professional_headline?: string;
                o1_score?: number;
                industry?: string;
                first_name?: string;
                last_name?: string;
                email?: string;
                phone?: string;
              } | null;

              return (
                <div
                  key={letter.id}
                  className="py-4 first:pt-0 last:pb-0"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-gray-900">
                          {canViewContactInfo
                            ? `${talent?.first_name} ${talent?.last_name}`
                            : talent?.candidate_id || 'Unknown'}
                        </h3>
                        <Badge variant={statusConfig?.variant || 'default'}>
                          {statusConfig?.icon}
                          <span className="ml-1">{statusConfig?.label}</span>
                        </Badge>
                        {/* Show signed badge if talent has signed */}
                        {letter.talent_signed_at && (
                          <Badge variant="success">
                            <PenTool className="w-3 h-3" />
                            <span className="ml-1">Signed</span>
                          </Badge>
                        )}
                      </div>

                      <div className="mt-1">
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">{letter.job_title}</span>
                          {' • '}
                          {formatSalary(letter.salary_min, letter.salary_max)}
                        </p>
                      </div>

                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          Sent {new Date(letter.created_at).toLocaleDateString()}
                        </span>
                        <span>
                          {commitmentLevel?.name || letter.commitment_level}
                        </span>
                        {talent?.o1_score && (
                          <span>Score: {talent.o1_score}%</span>
                        )}
                      </div>

                      {/* Contact Information - Only shown after admin forwards signed letter */}
                      {canViewContactInfo && talent && (
                        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                          <p className="text-sm font-medium text-green-800 mb-1">
                            Contact Information Revealed
                          </p>
                          <div className="text-sm text-green-700">
                            <p>Email: {talent.email}</p>
                            {talent.phone && <p>Phone: {talent.phone}</p>}
                          </div>
                          {letter.employer_received_signed_at && (
                            <p className="text-xs text-green-600 mt-2">
                              Signed letter delivered on {new Date(letter.employer_received_signed_at).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Pending Signed Letter Delivery - Show when accepted but not yet forwarded */}
                      {isAccepted && !isSignedAndForwarded && (
                        <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <div className="flex items-center gap-2">
                            <Lock className="w-4 h-4 text-yellow-600" />
                            <p className="text-sm font-medium text-yellow-800">
                              Contact Information Pending
                            </p>
                          </div>
                          <p className="text-sm text-yellow-700 mt-1">
                            {letter.talent_signed_at 
                              ? "The candidate has signed the letter. Our admin is reviewing and will forward it to you shortly."
                              : "Waiting for the candidate to sign the letter. Contact information will be revealed once the signed letter is delivered to you."}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Show signed PDF download if forwarded to employer */}
                      {letter.signed_pdf_url && isSignedAndForwarded && (
                        <a
                          href={letter.signed_pdf_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 px-3 py-1.5 text-sm text-green-600 hover:bg-green-50 rounded-lg"
                        >
                          <Download className="w-4 h-4" />
                          Signed PDF
                        </a>
                      )}
                      {letter.generated_pdf_url && (
                        <a
                          href={letter.generated_pdf_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 px-3 py-1.5 text-sm text-teal-600 hover:bg-teal-50 rounded-lg"
                        >
                          <FileText className="w-4 h-4" />
                          USCIS PDF
                        </a>
                      )}
                      {letter.pdf_url && (
                        <a
                          href={letter.pdf_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
                        >
                          <Download className="w-4 h-4" />
                          PDF
                        </a>
                      )}
                      <Link
                        href={`/dashboard/employer/letters/${letter.id}`}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg"
                      >
                        Details
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}
    </div>
  );
}