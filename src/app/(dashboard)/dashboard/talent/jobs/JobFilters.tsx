// src/app/(dashboard)/dashboard/talent/jobs/JobFilters.tsx

'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Filter, X, ChevronDown, Search } from 'lucide-react';

interface JobFiltersProps {
  availableSkills: string[];
  onFilterChange: (filters: FilterState) => void;
}

export interface FilterState {
  skills: string[];
  minExperience: number | null;
  maxExperience: number | null;
  searchQuery: string;
}

export function JobFilters({ availableSkills, onFilterChange }: JobFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [isOpen, setIsOpen] = useState(false);
  const [skillsDropdownOpen, setSkillsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedSkills, setSelectedSkills] = useState<string[]>(
    searchParams.get('skills')?.split(',').filter(Boolean) || []
  );
  const [minExperience, setMinExperience] = useState<string>(
    searchParams.get('minExp') || ''
  );
  const [maxExperience, setMaxExperience] = useState<string>(
    searchParams.get('maxExp') || ''
  );

  // Update URL and trigger filter change
  useEffect(() => {
    const filters: FilterState = {
      skills: selectedSkills,
      minExperience: minExperience ? parseInt(minExperience) : null,
      maxExperience: maxExperience ? parseInt(maxExperience) : null,
      searchQuery: searchQuery,
    };
    onFilterChange(filters);

    // Update URL params
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (selectedSkills.length > 0) params.set('skills', selectedSkills.join(','));
    if (minExperience) params.set('minExp', minExperience);
    if (maxExperience) params.set('maxExp', maxExperience);

    const newUrl = params.toString() ? `?${params.toString()}` : window.location.pathname;
    router.replace(newUrl, { scroll: false });
  }, [selectedSkills, minExperience, maxExperience, searchQuery, onFilterChange, router]);

  const handleSkillToggle = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill)
        ? prev.filter((s) => s !== skill)
        : [...prev, skill]
    );
  };

  const clearFilters = () => {
    setSelectedSkills([]);
    setMinExperience('');
    setMaxExperience('');
    setSearchQuery('');
  };

  const hasActiveFilters = selectedSkills.length > 0 || minExperience || maxExperience || searchQuery;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search jobs by title, company, or description..."
          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Filter Toggle Button (Mobile) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden flex items-center gap-2 text-gray-600 hover:text-gray-900"
      >
        <Filter className="w-4 h-4" />
        Filters
        {hasActiveFilters && (
          <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">
            {selectedSkills.length + (minExperience ? 1 : 0) + (maxExperience ? 1 : 0)}
          </span>
        )}
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Filters Container */}
      <div className={`${isOpen ? 'block' : 'hidden'} md:block space-y-4`}>
        <div className="flex flex-col md:flex-row gap-4">
          {/* Skills Filter */}
          <div className="flex-1 relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Required Skills
            </label>
            <button
              onClick={() => setSkillsDropdownOpen(!skillsDropdownOpen)}
              className="w-full flex items-center justify-between px-4 py-2.5 border border-gray-300 rounded-lg bg-white hover:bg-gray-50"
            >
              <span className="text-gray-600">
                {selectedSkills.length > 0
                  ? `${selectedSkills.length} skill${selectedSkills.length > 1 ? 's' : ''} selected`
                  : 'Select skills'}
              </span>
              <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${skillsDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {skillsDropdownOpen && (
              <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {availableSkills.length > 0 ? (
                  availableSkills.map((skill) => (
                    <label
                      key={skill}
                      className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedSkills.includes(skill)}
                        onChange={() => handleSkillToggle(skill)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{skill}</span>
                    </label>
                  ))
                ) : (
                  <p className="px-4 py-2 text-sm text-gray-500">No skills available</p>
                )}
              </div>
            )}
          </div>

          {/* Experience Range */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Years of Experience
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={minExperience}
                onChange={(e) => setMinExperience(e.target.value)}
                placeholder="Min"
                min="0"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-gray-400">-</span>
              <input
                type="number"
                value={maxExperience}
                onChange={(e) => setMaxExperience(e.target.value)}
                placeholder="Max"
                min="0"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Selected Skills Tags */}
        {selectedSkills.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {selectedSkills.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
              >
                {skill}
                <button
                  onClick={() => handleSkillToggle(skill)}
                  className="hover:bg-blue-200 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Clear Filters */}
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1"
          >
            <X className="w-4 h-4" />
            Clear all filters
          </button>
        )}
      </div>

      {/* Click outside to close skills dropdown */}
      {skillsDropdownOpen && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setSkillsDropdownOpen(false)}
        />
      )}
    </div>
  );
}