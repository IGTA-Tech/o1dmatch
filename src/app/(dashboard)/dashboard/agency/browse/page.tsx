import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Card, CardContent, Badge } from '@/components/ui';
import {
  MapPin,
  Briefcase,
  Award,
  Users,
} from 'lucide-react';
import Link from 'next/link';

export default async function AgencyBrowsePage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Verify agency access
  const { data: agencyProfile } = await supabase
    .from('agency_profiles')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (!agencyProfile) {
    redirect('/dashboard/agency');
  }

  // Get all talent profiles
  const { data: talents } = await supabase
    .from('talent_profiles')
    .select(`
      id,
      user_id,
      professional_headline,
      city,
      state,
      country,
      o1_score,
      skills,
      criteria_met,
      years_experience
    `)
    .order('o1_score', { ascending: false, nullsFirst: false });

  // Get user info for talents
  const talentUserIds = talents?.map(t => t.user_id).filter(Boolean) || [];
  const userInfo: Record<string, { email: string; full_name: string }> = {};

  if (talentUserIds.length > 0) {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, email, full_name')
      .in('id', talentUserIds);

    profiles?.forEach(p => {
      userInfo[p.id] = { email: p.email, full_name: p.full_name };
    });
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Browse Talent</h1>
        <p className="text-gray-600">Find exceptional O-1 candidates for your clients</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="text-center">
            <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{talents?.length || 0}</p>
            <p className="text-sm text-gray-500">Total Talent</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="text-center">
            <Award className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">
              {talents?.filter(t => (t.o1_score || 0) >= 65).length || 0}
            </p>
            <p className="text-sm text-gray-500">O-1 Ready</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="text-center">
            <Briefcase className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">
              {talents?.filter(t => (t.years_experience || 0) >= 5).length || 0}
            </p>
            <p className="text-sm text-gray-500">5+ Years Exp</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="text-center">
            <Award className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">
              {talents?.filter(t => (t.criteria_met?.length || 0) >= 3).length || 0}
            </p>
            <p className="text-sm text-gray-500">3+ Criteria Met</p>
          </CardContent>
        </Card>
      </div>

      {/* Talent List */}
      {!talents || talents.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Talent Found</h3>
            <p className="text-gray-600">
              Talent profiles will appear here when candidates register.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {talents.map((talent) => {
            const user = talent.user_id ? userInfo[talent.user_id] : null;
            const scoreColor = (talent.o1_score || 0) >= 65 
              ? 'text-green-600' 
              : (talent.o1_score || 0) >= 40 
                ? 'text-yellow-600' 
                : 'text-gray-600';

            return (
              <Link key={talent.id} href={`/dashboard/agency/browse/${talent.id}`}>
                <Card hover>
                  <CardContent className="flex items-center gap-6">
                    {/* Avatar */}
                    <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-xl font-semibold text-blue-600">
                        {user?.full_name?.charAt(0) || 'T'}
                      </span>
                    </div>

                    {/* Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-semibold text-gray-900">
                          {user?.full_name || 'Talent'}
                        </h3>
                        {talent.criteria_met && talent.criteria_met.length >= 3 && (
                          <Badge variant="success">O-1 Eligible</Badge>
                        )}
                      </div>
                      
                      {talent.professional_headline && (
                        <p className="text-gray-600 mb-2">{talent.professional_headline}</p>
                      )}

                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        {(talent.city || talent.state) && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {[talent.city, talent.state].filter(Boolean).join(', ')}
                          </span>
                        )}
                        {talent.years_experience && (
                          <span className="flex items-center gap-1">
                            <Briefcase className="w-4 h-4" />
                            {talent.years_experience} years exp
                          </span>
                        )}
                        {talent.criteria_met && talent.criteria_met.length > 0 && (
                          <span className="flex items-center gap-1">
                            <Award className="w-4 h-4" />
                            {talent.criteria_met.length} criteria met
                          </span>
                        )}
                      </div>

                      {/* Skills */}
                      {talent.skills && talent.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {talent.skills.slice(0, 5).map((skill: string, index: number) => (
                            <span
                              key={index}
                              className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded"
                            >
                              {skill}
                            </span>
                          ))}
                          {talent.skills.length > 5 && (
                            <span className="px-2 py-0.5 text-gray-500 text-xs">
                              +{talent.skills.length - 5} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* O-1 Score */}
                    <div className="text-right">
                      <div className={`text-3xl font-bold ${scoreColor}`}>
                        {talent.o1_score || 0}%
                      </div>
                      <p className="text-sm text-gray-500">O-1 Score</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}