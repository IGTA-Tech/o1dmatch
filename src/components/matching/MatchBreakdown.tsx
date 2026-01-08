'use client';

import { X, Check, Minus, Target, Award, Briefcase, GraduationCap } from 'lucide-react';
import { MatchResult } from '@/lib/matching';
import { MatchScoreDisplay } from './MatchScoreDisplay';

interface MatchBreakdownProps {
  match: MatchResult;
  onClose?: () => void;
}

export function MatchBreakdown({ match, onClose }: MatchBreakdownProps) {
  const { overall_score, category, breakdown, summary } = match;

  return (
    <div className="bg-white rounded-xl shadow-lg max-w-lg w-full max-h-[80vh] overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Match Analysis</h2>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        )}
      </div>

      {/* Score overview */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center gap-6">
          <MatchScoreDisplay score={overall_score} category={category} size="lg" />
          <div className="flex-1">
            <p className="text-gray-700">{summary}</p>
          </div>
        </div>
      </div>

      {/* Breakdown sections */}
      <div className="p-6 space-y-6">
        {/* O-1 Score Requirement */}
        <BreakdownSection
          icon={Target}
          title="O-1 Score Requirement"
          met={breakdown.score_requirement.met}
          points={breakdown.score_requirement.points}
          weight={40}
        >
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Required Score</span>
            <span className="font-medium">{breakdown.score_requirement.required}%</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Your Score</span>
            <span className={`font-medium ${breakdown.score_requirement.met ? 'text-green-600' : 'text-red-600'}`}>
              {breakdown.score_requirement.has}%
            </span>
          </div>
        </BreakdownSection>

        {/* Criteria Match */}
        {breakdown.criteria_match.length > 0 && (
          <BreakdownSection
            icon={Award}
            title="O-1 Criteria Match"
            met={breakdown.criteria_match.filter(c => c.required && c.has).length === breakdown.criteria_match.filter(c => c.required).length}
            points={breakdown.criteria_match.reduce((sum, c) => sum + c.points, 0)}
            weight={30}
          >
            <div className="space-y-2">
              {breakdown.criteria_match.map((criterion, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    {criterion.has ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <Minus className="w-4 h-4 text-gray-400" />
                    )}
                    <span className={criterion.has ? 'text-gray-900' : 'text-gray-500'}>
                      {formatCriterion(criterion.criterion)}
                    </span>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${criterion.required ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                    {criterion.required ? 'Preferred' : 'Bonus'}
                  </span>
                </div>
              ))}
            </div>
          </BreakdownSection>
        )}

        {/* Skills Match */}
        {breakdown.skills_match.length > 0 && (
          <BreakdownSection
            icon={Briefcase}
            title="Skills Match"
            met={breakdown.skills_match.filter(s => s.required && !s.has).length === 0}
            points={breakdown.skills_match.reduce((sum, s) => sum + s.points, 0)}
            weight={20}
          >
            <div className="space-y-2">
              {breakdown.skills_match.map((skill, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    {skill.has ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <X className="w-4 h-4 text-red-400" />
                    )}
                    <span className={skill.has ? 'text-gray-900' : 'text-gray-500'}>
                      {skill.skill}
                    </span>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${skill.required ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}>
                    {skill.required ? 'Required' : 'Preferred'}
                  </span>
                </div>
              ))}
            </div>
          </BreakdownSection>
        )}

        {/* Education & Experience */}
        <BreakdownSection
          icon={GraduationCap}
          title="Education & Experience"
          met={breakdown.education_match.met && breakdown.experience_match.met}
          points={(breakdown.education_match.points + breakdown.experience_match.points) / 2}
          weight={10}
        >
          <div className="space-y-2">
            {breakdown.education_match.required && (
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  {breakdown.education_match.met ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <X className="w-4 h-4 text-red-400" />
                  )}
                  <span>Education</span>
                </div>
                <span className="text-gray-600">
                  {formatEducation(breakdown.education_match.required)} required
                </span>
              </div>
            )}
            {breakdown.experience_match.required && (
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  {breakdown.experience_match.met ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <X className="w-4 h-4 text-red-400" />
                  )}
                  <span>Experience</span>
                </div>
                <span className="text-gray-600">
                  {breakdown.experience_match.required}+ years required
                </span>
              </div>
            )}
            {!breakdown.education_match.required && !breakdown.experience_match.required && (
              <p className="text-sm text-gray-500">No specific requirements</p>
            )}
          </div>
        </BreakdownSection>
      </div>
    </div>
  );
}

// Helper component for breakdown sections
function BreakdownSection({
  icon: Icon,
  title,
  met,
  points,
  weight,
  children,
}: {
  icon: React.ElementType;
  title: string;
  met: boolean;
  points: number;
  weight: number;
  children: React.ReactNode;
}) {
  return (
    <div className="border border-gray-100 rounded-lg overflow-hidden">
      <div className={`flex items-center justify-between px-4 py-3 ${met ? 'bg-green-50' : 'bg-gray-50'}`}>
        <div className="flex items-center gap-3">
          <Icon className={`w-5 h-5 ${met ? 'text-green-600' : 'text-gray-400'}`} />
          <span className="font-medium text-gray-900">{title}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500">{weight}% weight</span>
          <span className={`text-sm font-medium ${met ? 'text-green-600' : 'text-gray-600'}`}>
            {Math.round(points)}%
          </span>
        </div>
      </div>
      <div className="p-4">
        {children}
      </div>
    </div>
  );
}

function formatCriterion(criterion: string): string {
  const names: Record<string, string> = {
    awards: 'Awards & Recognition',
    memberships: 'Professional Memberships',
    published_material: 'Published Material',
    judging: 'Judging Experience',
    original_contributions: 'Original Contributions',
    scholarly_articles: 'Scholarly Articles',
    critical_role: 'Critical Role',
    high_salary: 'High Salary',
  };
  return names[criterion] || criterion;
}

function formatEducation(education: string | null): string {
  if (!education) return 'Any';
  const names: Record<string, string> = {
    high_school: 'High School',
    associate: "Associate's",
    bachelor: "Bachelor's",
    bachelors: "Bachelor's",
    master: "Master's",
    masters: "Master's",
    phd: 'PhD',
    doctorate: 'Doctorate',
  };
  return names[education.toLowerCase()] || education;
}

// Modal wrapper for breakdown
export function MatchBreakdownModal({
  match,
  isOpen,
  onClose,
}: {
  match: MatchResult | null;
  isOpen: boolean;
  onClose: () => void;
}) {
  if (!isOpen || !match) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative z-10">
        <MatchBreakdown match={match} onClose={onClose} />
      </div>
    </div>
  );
}
