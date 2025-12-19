import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Card, CardContent, Badge } from '@/components/ui';
import { ScoreDisplay } from '@/components/talent/ScoreDisplay';
import { CriteriaBadges } from '@/components/talent/CriteriaBreakdown';
import {
  Search,
  Filter,
  MapPin,
  Briefcase,
  GraduationCap,
  ArrowRight,
  Users,
  Mail,
} from 'lucide-react';
import Link from 'next/link';
import { O1Criterion } from '@/types/enums';

export default async function BrowseTalentPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: employerProfile } = await supabase
    .from('employer_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (!employerProfile) {
    redirect('/dashboard/employer');
  }

  // Get public talent profiles with score >= 40
  const { data: talents } = await supabase
    .from('talent_profiles')
    .select('*')
    .eq('is_public', true)
    .gte('o1_score', 40)
    .order('o1_score', { ascending: false });

  // Check which talents already have letters from this employer
  const { data: existingLetters } = await supabase
    .from('interest_letters')
    .select('talent_id')
    .eq('employer_id', employerProfile.id);

  const lettersSentTo = new Set(existingLetters?.map((l) => l.talent_id) || []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Browse Talent</h1>
        <p className="text-gray-600">
          Discover O-1 candidates that match your hiring needs
        </p>
      </div>

      {/* Search and Filters */}
      <Card padding="sm">
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by skills, industry, or keywords..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex gap-2">
              <select className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                <option>All Industries</option>
                <option>Technology</option>
                <option>Research</option>
                <option>Arts</option>
                <option>Business</option>
              </select>
              <select className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                <option>Min Score: Any</option>
                <option>Min Score: 50%</option>
                <option>Min Score: 60%</option>
                <option>Min Score: 70%</option>
                <option>Min Score: 80%</option>
              </select>
              <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50">
                <Filter className="w-4 h-4" />
                More Filters
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Users className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <p className="font-medium text-blue-900">Identity Protection</p>
            <p className="text-sm text-blue-700 mt-1">
              Candidate identities are masked until they accept your interest letter.
              You&apos;ll see their qualifications and O-1 score, but personal details
              (name, photo, contact info) are hidden.
            </p>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="flex items-center justify-between">
        <p className="text-gray-600">
          {talents?.length || 0} candidates found
        </p>
        <select className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm">
          <option>Sort by: Score (High to Low)</option>
          <option>Sort by: Recently Updated</option>
          <option>Sort by: Experience</option>
        </select>
      </div>

      {/* Talent Cards */}
      {!talents || talents.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No candidates found</h3>
            <p className="text-gray-600">
              Try adjusting your filters or check back later.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {talents.map((talent) => {
            const hasLetter = lettersSentTo.has(talent.id);
            return (
              <Card key={talent.id} hover className="h-full">
                <CardContent className="flex flex-col h-full">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold">
                        {talent.candidate_id?.substring(5, 7) || '??'}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{talent.candidate_id}</p>
                        <p className="text-sm text-gray-600">{talent.industry || 'Not specified'}</p>
                      </div>
                    </div>
                    <ScoreDisplay score={talent.o1_score || 0} size="sm" />
                  </div>

                  {talent.professional_headline && (
                    <p className="text-sm text-gray-700 mb-3 line-clamp-2">
                      {talent.professional_headline}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-2 text-sm text-gray-600 mb-3">
                    {talent.city && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        {talent.city}, {talent.state}
                      </span>
                    )}
                    {talent.years_experience && (
                      <span className="flex items-center gap-1">
                        <Briefcase className="w-3.5 h-3.5" />
                        {talent.years_experience} years
                      </span>
                    )}
                    {talent.education && (
                      <span className="flex items-center gap-1">
                        <GraduationCap className="w-3.5 h-3.5" />
                        {talent.education === 'phd' ? 'Ph.D.' : talent.education}
                      </span>
                    )}
                  </div>

                  {talent.criteria_met && talent.criteria_met.length > 0 && (
                    <div className="mb-4">
                      <CriteriaBadges
                        criteriaMet={talent.criteria_met as O1Criterion[]}
                        maxShow={3}
                      />
                    </div>
                  )}

                  <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                    {hasLetter ? (
                      <Badge variant="info">Letter Sent</Badge>
                    ) : (
                      <Link
                        href={`/dashboard/employer/browse/${talent.id}/letter`}
                        className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
                      >
                        <Mail className="w-4 h-4" />
                        Send Letter
                      </Link>
                    )}
                    <Link
                      href={`/dashboard/employer/browse/${talent.id}`}
                      className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"
                    >
                      View Profile
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
