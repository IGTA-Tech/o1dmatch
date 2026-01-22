// src/app/(dashboard)/dashboard/talent/jobs/JobsList.tsx

'use client';

import { useState, useCallback, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui';
import { JobFilters, FilterState } from './JobFilters';
import {
  Briefcase,
  MapPin,
  DollarSign,
  Calendar,
  ArrowRight,
  Building2,
  Target,
} from 'lucide-react';
import Link from 'next/link';

interface Job {
  id: string;
  title: string;
  description: string;
  salary_min?: number | null;
  salary_max?: number | null;
  work_arrangement?: string;
  created_at: string;
  min_score?: number;
  min_years_experience?: number | null;
  required_skills?: string[];
  preferred_skills?: string[];
  employer?: {
    company_name?: string;
    city?: string;
    state?: string;
  };
  match: {
    overall_score: number;
    category: 'excellent' | 'good' | 'fair' | 'poor';
  };
}

interface JobsListProps {
  jobs: Job[];
  availableSkills: string[];
}

export function JobsList({ jobs, availableSkills }: JobsListProps) {
  const [filters, setFilters] = useState<FilterState>({
    skills: [],
    minExperience: null,
    maxExperience: null,
    searchQuery: '',
  });

  const handleFilterChange = useCallback((newFilters: FilterState) => {
    setFilters(newFilters);
  }, []);

  // Filter jobs based on current filters
  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      // Search query filter
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        const matchesSearch =
          job.title.toLowerCase().includes(query) ||
          job.description?.toLowerCase().includes(query) ||
          job.employer?.company_name?.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      // Skills filter
      if (filters.skills.length > 0) {
        const jobSkills = [...(job.required_skills || []), ...(job.preferred_skills || [])];
        const hasMatchingSkill = filters.skills.some((skill) =>
          jobSkills.some((jobSkill) => 
            jobSkill.toLowerCase().includes(skill.toLowerCase()) ||
            skill.toLowerCase().includes(jobSkill.toLowerCase())
          )
        );
        if (!hasMatchingSkill) return false;
      }

      // Experience filter
      if (filters.minExperience !== null || filters.maxExperience !== null) {
        const jobMinExp = job.min_years_experience || 0;
        
        if (filters.minExperience !== null && jobMinExp < filters.minExperience) {
          return false;
        }
        if (filters.maxExperience !== null && jobMinExp > filters.maxExperience) {
          return false;
        }
      }

      return true;
    });
  }, [jobs, filters]);

  // Categorize filtered jobs by match quality
  const categorizedJobs = useMemo(() => ({
    excellent: filteredJobs.filter((job) => job.match.category === 'excellent'),
    good: filteredJobs.filter((job) => job.match.category === 'good'),
    fair: filteredJobs.filter((job) => job.match.category === 'fair'),
    poor: filteredJobs.filter((job) => job.match.category === 'poor'),
  }), [filteredJobs]);

  const formatSalary = (min?: number | null, max?: number | null) => {
    if (!min && !max) return 'Not specified';
    if (min && max) return `$${(min / 1000).toFixed(0)}k - $${(max / 1000).toFixed(0)}k`;
    if (min) return `$${(min / 1000).toFixed(0)}k+`;
    return `Up to $${((max || 0) / 1000).toFixed(0)}k`;
  };

  const getMatchBadgeColor = (category: string) => {
    switch (category) {
      case 'excellent':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'good':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'fair':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  const renderJobCard = (job: Job) => (
    <Link key={job.id} href={`/dashboard/talent/jobs/${job.id}`}>
      <Card hover className="h-full">
        <CardContent className="flex flex-col h-full">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <Building2 className="w-6 h-6 text-gray-400" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{job.title}</h3>
                <p className="text-sm text-gray-600">{job.employer?.company_name}</p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span
                className={`text-xs font-medium px-2 py-0.5 rounded-full border ${getMatchBadgeColor(job.match.category)}`}
              >
                {job.match.overall_score}% match
              </span>
              <span className="text-xs text-gray-500">Min: {job.min_score || 0}%</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 text-sm text-gray-600 mb-4">
            {job.employer?.city && (
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {job.employer.city}, {job.employer.state}
              </span>
            )}
            <span className="flex items-center gap-1">
              <DollarSign className="w-4 h-4" />
              {formatSalary(job.salary_min, job.salary_max)}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {job.work_arrangement?.replace('_', ' ') || 'Not specified'}
            </span>
          </div>

          {/* Skills Preview */}
          {job.required_skills && job.required_skills.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {job.required_skills.slice(0, 3).map((skill) => (
                <span
                  key={skill}
                  className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded"
                >
                  {skill}
                </span>
              ))}
              {job.required_skills.length > 3 && (
                <span className="text-xs px-2 py-0.5 text-gray-500">
                  +{job.required_skills.length - 3} more
                </span>
              )}
            </div>
          )}

          <p className="text-sm text-gray-600 line-clamp-2 flex-grow">
            {job.description?.substring(0, 150)}...
          </p>

          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
            <span className="text-xs text-gray-500">
              Posted {new Date(job.created_at).toLocaleDateString()}
            </span>
            <span className="flex items-center gap-1 text-blue-600 text-sm font-medium">
              View Details
              <ArrowRight className="w-4 h-4" />
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );

  const renderSection = (
    title: string,
    jobs: Job[],
    icon?: React.ReactNode,
    badgeColor?: string
  ) => {
    if (jobs.length === 0) return null;

    return (
      <section>
        <div className="flex items-center gap-2 mb-4">
          {icon}
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${badgeColor}`}>
            {jobs.length} job{jobs.length !== 1 ? 's' : ''}
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {jobs.map(renderJobCard)}
        </div>
      </section>
    );
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <JobFilters
        availableSkills={availableSkills}
        onFilterChange={handleFilterChange}
      />

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Showing {filteredJobs.length} of {jobs.length} jobs
        </p>
      </div>

      {/* Job Listings */}
      {filteredJobs.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs match your filters</h3>
            <p className="text-gray-600">
              Try adjusting your filters to see more results.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {renderSection(
            'Excellent Matches',
            categorizedJobs.excellent,
            <Target className="w-5 h-5 text-green-600" />,
            'bg-green-100 text-green-800'
          )}
          {renderSection(
            'Good Matches',
            categorizedJobs.good,
            null,
            'bg-blue-100 text-blue-800'
          )}
          {renderSection(
            'Fair Matches',
            categorizedJobs.fair,
            null,
            'bg-yellow-100 text-yellow-800'
          )}
          {renderSection(
            'Other Opportunities',
            categorizedJobs.poor,
            null,
            'bg-gray-100 text-gray-800'
          )}
        </div>
      )}
    </div>
  );
}