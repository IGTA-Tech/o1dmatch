'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui';
import {
  Scale,
  MapPin,
  ArrowRight,
  Search,
  Filter,
  X,
} from 'lucide-react';
import Link from 'next/link';
import Image from "next/image";
import Navbar from "@/components/Navbar";

interface LawyerProfile {
  id: string;
  name: string;
  firm_name: string | null;
  photo_url: string | null;
  city: string | null;
  state: string | null;
  bio: string | null;
  specializations: string[] | null;
  years_experience: number | null;
}

interface LawyerDirectoryClientProps {
  lawyers: LawyerProfile[];
}

export default function LawyerDirectoryClient({ lawyers }: LawyerDirectoryClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [locationFilter, setLocationFilter] = useState('all');
  const [visaTypeFilter, setVisaTypeFilter] = useState('all');
  const [showMoreFilters, setShowMoreFilters] = useState(false);

  // Extract unique states from data
  const states = useMemo(() => {
    const set = new Set<string>();
    lawyers.forEach(l => {
      if (l.state) set.add(l.state);
    });
    return Array.from(set).sort();
  }, [lawyers]);

  // Filter lawyers
  const filteredLawyers = useMemo(() => {
    let result = lawyers;

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(l =>
        l.name?.toLowerCase().includes(query) ||
        l.firm_name?.toLowerCase().includes(query) ||
        l.bio?.toLowerCase().includes(query) ||
        l.city?.toLowerCase().includes(query) ||
        l.state?.toLowerCase().includes(query)
      );
    }

    // Location filter
    if (locationFilter !== 'all') {
      result = result.filter(l => l.state === locationFilter);
    }

    // Visa type filter
    if (visaTypeFilter !== 'all') {
      result = result.filter(l =>
        l.specializations?.some(s => s.toLowerCase().includes(visaTypeFilter.toLowerCase()))
      );
    }

    return result;
  }, [lawyers, searchQuery, locationFilter, visaTypeFilter]);

  const hasActiveFilters = searchQuery || locationFilter !== 'all' || visaTypeFilter !== 'all';

  const clearFilters = () => {
    setSearchQuery('');
    setLocationFilter('all');
    setVisaTypeFilter('all');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Navbar />
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <Scale className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900">Immigration Attorneys</h1>
            <p className="mt-3 text-lg text-gray-600 max-w-2xl mx-auto">
              Connect with experienced immigration attorneys who specialize in O-1 visa cases.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <Card padding="sm" className="mb-6">
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, firm, or location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                <select
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Locations</option>
                  {states.map(state => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
                <select
                  value={visaTypeFilter}
                  onChange={(e) => setVisaTypeFilter(e.target.value)}
                  className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Visa Types</option>
                  <option value="O-1A">O-1A (Sciences/Business)</option>
                  <option value="O-1B">O-1B (Arts)</option>
                  <option value="EB-1A">EB-1A</option>
                </select>
                <button
                  onClick={() => setShowMoreFilters(!showMoreFilters)}
                  className={`flex items-center gap-2 px-4 py-2.5 border rounded-lg hover:bg-gray-50 ${showMoreFilters ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
                >
                  <Filter className="w-4 h-4" />
                  More
                </button>
              </div>
            </div>

            {hasActiveFilters && (
              <div className="mt-3 flex items-center gap-2">
                <span className="text-sm text-gray-500">Active filters:</span>
                {searchQuery && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
                    Search: {searchQuery}
                    <button onClick={() => setSearchQuery('')}><X className="w-3 h-3" /></button>
                  </span>
                )}
                {locationFilter !== 'all' && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
                    {locationFilter}
                    <button onClick={() => setLocationFilter('all')}><X className="w-3 h-3" /></button>
                  </span>
                )}
                {visaTypeFilter !== 'all' && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
                    {visaTypeFilter}
                    <button onClick={() => setVisaTypeFilter('all')}><X className="w-3 h-3" /></button>
                  </span>
                )}
                <button onClick={clearFilters} className="text-sm text-red-600 hover:underline">
                  Clear all
                </button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-gray-600">
            {filteredLawyers.length} attorneys found
            {hasActiveFilters && ` (of ${lawyers.length} total)`}
          </p>
        </div>

        {/* Lawyers Grid */}
        {filteredLawyers.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Scale className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No attorneys found</h3>
              <p className="text-gray-600">
                {hasActiveFilters ? 'Try adjusting your filters.' : 'Check back soon for immigration attorneys.'}
              </p>
              {hasActiveFilters && (
                <button onClick={clearFilters} className="mt-4 text-blue-600 hover:underline">
                  Clear all filters
                </button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLawyers.map((lawyer) => (
              <Link key={lawyer.id} href={`/lawyers/${lawyer.id}`}>
                <Card hover className="h-full">
                  <CardContent>
                    <div className="flex items-start gap-4">
                      {lawyer.photo_url ? (
                        <Image
                          src={lawyer.photo_url}
                          alt={lawyer.name}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Scale className="w-8 h-8 text-blue-600" />
                        </div>
                      )}
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{lawyer.name}</h3>
                        {lawyer.firm_name && (
                          <p className="text-sm text-gray-600">{lawyer.firm_name}</p>
                        )}
                        {(lawyer.city || lawyer.state) && (
                          <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                            <MapPin className="w-3.5 h-3.5" />
                            {lawyer.city && lawyer.state
                              ? `${lawyer.city}, ${lawyer.state}`
                              : lawyer.city || lawyer.state}
                          </p>
                        )}
                      </div>
                    </div>

                    {lawyer.bio && (
                      <p className="text-sm text-gray-600 mt-3 line-clamp-2">
                        {lawyer.bio}
                      </p>
                    )}

                    {lawyer.specializations && lawyer.specializations.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-3">
                        {lawyer.specializations.slice(0, 3).map((spec: string) => (
                          <span
                            key={spec}
                            className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded-full"
                          >
                            {spec}
                          </span>
                        ))}
                        {lawyer.specializations.length > 3 && (
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                            +{lawyer.specializations.length - 3}
                          </span>
                        )}
                      </div>
                    )}

                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        {lawyer.years_experience && (
                          <span>{lawyer.years_experience}+ years exp</span>
                        )}
                      </div>
                      <span className="flex items-center gap-1 text-blue-600 text-sm font-medium">
                        View Profile
                        <ArrowRight className="w-4 h-4" />
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
