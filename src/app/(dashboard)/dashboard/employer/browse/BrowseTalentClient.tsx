'use client';

import { useState, useMemo } from 'react';
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
  ArrowLeft,
  Users,
  Mail,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { O1Criterion } from '@/types/enums';

interface TalentProfile {
  id: string;
  candidate_id: string;
  industry: string | null;
  professional_headline: string | null;
  city: string | null;
  state: string | null;
  years_experience: number | null;
  education: string | null;
  o1_score: number | null;
  criteria_met: string[] | null;
  skills: string[] | null;
}

interface BrowseTalentClientProps {
  talents: TalentProfile[];
  lettersSentTo: Set<string>;
}

export default function BrowseTalentClient({ talents, lettersSentTo }: BrowseTalentClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [industryFilter, setIndustryFilter] = useState('all');
  const [minScoreFilter, setMinScoreFilter] = useState(0);
  const [experienceFilter, setExperienceFilter] = useState('all');
  const [skillFilter, setSkillFilter] = useState('all');
  const [sortOption, setSortOption] = useState('score-desc');
  const [showMoreFilters, setShowMoreFilters] = useState(false);

  // Extract unique industries from data
  const industries = useMemo(() => {
    const set = new Set<string>();
    talents.forEach(t => {
      if (t.industry) set.add(t.industry);
    });
    return Array.from(set).sort();
  }, [talents]);

  // Extract unique skills from data
  const allSkills = useMemo(() => {
    const set = new Set<string>();
    talents.forEach(t => {
      t.skills?.forEach(skill => set.add(skill));
    });
    return Array.from(set).sort();
  }, [talents]);

  // Filter and sort talents
  const filteredTalents = useMemo(() => {
    let result = talents;

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(t =>
        t.professional_headline?.toLowerCase().includes(query) ||
        t.industry?.toLowerCase().includes(query) ||
        t.candidate_id?.toLowerCase().includes(query) ||
        t.skills?.some(s => s.toLowerCase().includes(query))
      );
    }

    // Industry filter
    if (industryFilter !== 'all') {
      result = result.filter(t => t.industry === industryFilter);
    }

    // Min score filter
    if (minScoreFilter > 0) {
      result = result.filter(t => (t.o1_score || 0) >= minScoreFilter);
    }

    // Experience filter
    if (experienceFilter !== 'all') {
      result = result.filter(t => {
        const exp = t.years_experience || 0;
        switch (experienceFilter) {
          case '0-2':
            return exp >= 0 && exp <= 2;
          case '3-5':
            return exp >= 3 && exp <= 5;
          case '6-10':
            return exp >= 6 && exp <= 10;
          case '10+':
            return exp > 10;
          default:
            return true;
        }
      });
    }

    // Skill filter
    if (skillFilter !== 'all') {
      result = result.filter(t =>
        t.skills?.some(s => s.toLowerCase() === skillFilter.toLowerCase())
      );
    }

    // Sort
    result = [...result].sort((a, b) => {
      switch (sortOption) {
        case 'score-desc':
          return (b.o1_score || 0) - (a.o1_score || 0);
        case 'score-asc':
          return (a.o1_score || 0) - (b.o1_score || 0);
        case 'experience-desc':
          return (b.years_experience || 0) - (a.years_experience || 0);
        case 'experience-asc':
          return (a.years_experience || 0) - (b.years_experience || 0);
        default:
          return 0;
      }
    });

    return result;
  }, [talents, searchQuery, industryFilter, minScoreFilter, experienceFilter, skillFilter, sortOption]);

  const hasActiveFilters = searchQuery || industryFilter !== 'all' || minScoreFilter > 0 || experienceFilter !== 'all' || skillFilter !== 'all';

  const clearFilters = () => {
    setSearchQuery('');
    setIndustryFilter('all');
    setMinScoreFilter(0);
    setExperienceFilter('all');
    setSkillFilter('all');
  };

  const getExperienceLabel = (value: string) => {
    switch (value) {
      case '0-2':
        return '0-2 years';
      case '3-5':
        return '3-5 years';
      case '6-10':
        return '6-10 years';
      case '10+':
        return '10+ years';
      default:
        return value;
    }
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
          <h1 className="text-2xl font-bold text-gray-900">Browse Talent</h1>
          <p className="text-gray-600">
            Discover O-1 candidates that match your hiring needs
          </p>
        </div>
      </div>
      {/* Search and Filters */}
      <Card>
        <CardContent>
          <div className="flex flex-col gap-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by skills, industry, or keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Primary Filters */}
            <div className="flex gap-2 flex-wrap">
              <select
                value={industryFilter}
                onChange={(e) => setIndustryFilter(e.target.value)}
                className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Industries</option>
                {industries.map(ind => (
                  <option key={ind} value={ind}>{ind}</option>
                ))}
              </select>

              <select
                value={experienceFilter}
                onChange={(e) => setExperienceFilter(e.target.value)}
                className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Experience</option>
                <option value="0-2">0-2 years</option>
                <option value="3-5">3-5 years</option>
                <option value="6-10">6-10 years</option>
                <option value="10+">10+ years</option>
              </select>

              <select
                value={minScoreFilter}
                onChange={(e) => setMinScoreFilter(Number(e.target.value))}
                className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value={0}>Min Score: Any</option>
                <option value={50}>Min Score: 50%</option>
                <option value={60}>Min Score: 60%</option>
                <option value={70}>Min Score: 70%</option>
                <option value={80}>Min Score: 80%</option>
              </select>

              <button
                onClick={() => setShowMoreFilters(!showMoreFilters)}
                className={`flex items-center gap-2 px-4 py-2.5 border rounded-lg hover:bg-gray-50 ${showMoreFilters ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
              >
                <Filter className="w-4 h-4" />
                More Filters
              </button>
            </div>

            {/* More Filters (expanded) */}
            {showMoreFilters && (
              <div className="flex gap-2 flex-wrap pt-2 border-t border-gray-200">
                <select
                  value={skillFilter}
                  onChange={(e) => setSkillFilter(e.target.value)}
                  className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Skills</option>
                  {allSkills.map(skill => (
                    <option key={skill} value={skill}>{skill}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Active Filters */}
            {hasActiveFilters && (
              <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-gray-200">
                <span className="text-sm text-gray-500">Active filters:</span>
                {searchQuery && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
                    Search: {searchQuery}
                    <button onClick={() => setSearchQuery('')}><X className="w-3 h-3" /></button>
                  </span>
                )}
                {industryFilter !== 'all' && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
                    {industryFilter}
                    <button onClick={() => setIndustryFilter('all')}><X className="w-3 h-3" /></button>
                  </span>
                )}
                {experienceFilter !== 'all' && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-sm rounded-full">
                    {getExperienceLabel(experienceFilter)}
                    <button onClick={() => setExperienceFilter('all')}><X className="w-3 h-3" /></button>
                  </span>
                )}
                {minScoreFilter > 0 && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 text-sm rounded-full">
                    Min: {minScoreFilter}%
                    <button onClick={() => setMinScoreFilter(0)}><X className="w-3 h-3" /></button>
                  </span>
                )}
                {skillFilter !== 'all' && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 text-sm rounded-full">
                    Skill: {skillFilter}
                    <button onClick={() => setSkillFilter('all')}><X className="w-3 h-3" /></button>
                  </span>
                )}
                <button onClick={clearFilters} className="text-sm text-red-600 hover:underline">
                  Clear all
                </button>
              </div>
            )}
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
          {filteredTalents.length} candidate{filteredTalents.length !== 1 ? 's' : ''} found
          {hasActiveFilters && ` (of ${talents.length} total)`}
        </p>
        <select
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
          className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
        >
          <option value="score-desc">Sort by: Score (High to Low)</option>
          <option value="score-asc">Sort by: Score (Low to High)</option>
          <option value="experience-desc">Sort by: Experience (High to Low)</option>
          <option value="experience-asc">Sort by: Experience (Low to High)</option>
        </select>
      </div>

      {/* Talent Cards */}
      {filteredTalents.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No candidates found</h3>
            <p className="text-gray-600">
              {hasActiveFilters ? 'Try adjusting your filters.' : 'Check back later for new candidates.'}
            </p>
            {hasActiveFilters && (
              <button onClick={clearFilters} className="mt-4 text-blue-600 hover:underline">
                Clear all filters
              </button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTalents.map((talent) => {
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

                  {/* Skills */}
                  {talent.skills && talent.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {talent.skills.slice(0, 3).map((skill) => (
                        <span
                          key={skill}
                          className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded-full"
                        >
                          {skill}
                        </span>
                      ))}
                      {talent.skills.length > 3 && (
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded-full">
                          +{talent.skills.length - 3} more
                        </span>
                      )}
                    </div>
                  )}

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