import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent, Badge } from '@/components/ui';
import {
  FileSignature,
  Clock,
  CheckCircle,
  User,
  Building2,
  Calendar,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';

export default async function AdminSignedLettersPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Check if user is admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();

  if (profile?.role !== 'admin') {
    redirect('/dashboard');
  }

  // Get letters pending signature review
  const { data: pendingLetters } = await supabase
    .from('interest_letters')
    .select(`
      id,
      job_title,
      status,
      signature_status,
      talent_signed_at,
      responded_at,
      talent_response_message,
      talent:talent_profiles(
        id,
        user_id
      ),
      employer:employer_profiles(
        id,
        company_name
      )
    `)
    .eq('status', 'accepted')
    .eq('signature_status', 'admin_reviewing')
    .order('talent_signed_at', { ascending: true });

  // Get recently forwarded letters
  const { data: forwardedLetters } = await supabase
    .from('interest_letters')
    .select(`
      id,
      job_title,
      signature_status,
      forwarded_to_employer_at,
      talent:talent_profiles(
        id,
        user_id
      ),
      employer:employer_profiles(
        id,
        company_name
      )
    `)
    .eq('signature_status', 'forwarded_to_employer')
    .order('forwarded_to_employer_at', { ascending: false })
    .limit(10);

  // Get talent names
  const talentUserIds = [
    ...(pendingLetters || []).map(l => l.talent?.user_id),
    ...(forwardedLetters || []).map(l => l.talent?.user_id),
  ].filter(Boolean);

  const { data: talentProfiles } = await supabase
    .from('profiles')
    .select('id, full_name, email')
    .in('id', talentUserIds);

  const talentMap = new Map(talentProfiles?.map(p => [p.id, p]) || []);

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <FileSignature className="w-7 h-7" />
          Signed Letters Review
        </h1>
        <p className="text-gray-600 mt-1">
          Review and forward talent-signed letters to employers
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="flex items-center gap-4 py-4">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{pendingLetters?.length || 0}</p>
              <p className="text-sm text-gray-600">Pending Review</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 py-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{forwardedLetters?.length || 0}</p>
              <p className="text-sm text-gray-600">Recently Forwarded</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Review */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-yellow-600" />
            Pending Signature Review
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pendingLetters && pendingLetters.length > 0 ? (
            <div className="space-y-4">
              {pendingLetters.map((letter) => {
                const talent = talentMap.get(letter.talent?.user_id);
                return (
                  <div
                    key={letter.id}
                    className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-yellow-700" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{letter.job_title}</p>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {talent?.full_name || 'Unknown Talent'}
                          </span>
                          <span>→</span>
                          <span className="flex items-center gap-1">
                            <Building2 className="w-3 h-3" />
                            {letter.employer?.company_name || 'Unknown Company'}
                          </span>
                        </div>
                        {letter.talent_signed_at && (
                          <p className="text-xs text-gray-500 mt-1">
                            Signed {formatDate(letter.talent_signed_at)}
                          </p>
                        )}
                      </div>
                    </div>
                    <Link
                      href={`/dashboard/admin/signed-letters/${letter.id}`}
                      className="flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                    >
                      Review
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-400" />
              <p>No letters pending review</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recently Forwarded */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            Recently Forwarded to Employers
          </CardTitle>
        </CardHeader>
        <CardContent>
          {forwardedLetters && forwardedLetters.length > 0 ? (
            <div className="space-y-3">
              {forwardedLetters.map((letter) => {
                const talent = talentMap.get(letter.talent?.user_id);
                return (
                  <div
                    key={letter.id}
                    className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="font-medium text-gray-900">{letter.job_title}</p>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <span>{talent?.full_name || 'Unknown'}</span>
                          <span>→</span>
                          <span>{letter.employer?.company_name || 'Unknown'}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      {letter.forwarded_to_employer_at && (
                        <p className="text-xs text-gray-500">
                          {formatDate(letter.forwarded_to_employer_at)}
                        </p>
                      )}
                      <Link
                        href={`/dashboard/admin/signed-letters/${letter.id}`}
                        className="text-sm text-green-600 hover:underline"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-center py-4 text-gray-500">No forwarded letters yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}