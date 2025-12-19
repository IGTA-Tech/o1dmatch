import { createClient } from '@/lib/supabase/server';
import { Card, CardContent } from '@/components/ui';
import {
  Scale,
  MapPin,
  ArrowRight,
  Search,
  Filter,
} from 'lucide-react';
import Link from 'next/link';

export default async function LawyerDirectoryPage() {
  const supabase = await createClient();

  // Get all public lawyer profiles
  const { data: lawyers } = await supabase
    .from('lawyer_profiles')
    .select('*')
    .eq('is_public', true)
    .eq('is_verified', true)
    .order('view_count', { ascending: false });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
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
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="flex gap-2">
                <select className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                  <option>All Locations</option>
                  <option>New York</option>
                  <option>California</option>
                  <option>Texas</option>
                  <option>Florida</option>
                </select>
                <select className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                  <option>All Visa Types</option>
                  <option>O-1A (Sciences/Business)</option>
                  <option>O-1B (Arts)</option>
                  <option>EB-1A</option>
                </select>
                <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50">
                  <Filter className="w-4 h-4" />
                  More
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-gray-600">
            {lawyers?.length || 0} attorneys found
          </p>
        </div>

        {/* Lawyers Grid */}
        {!lawyers || lawyers.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Scale className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No attorneys listed yet</h3>
              <p className="text-gray-600">
                Check back soon for immigration attorneys specializing in O-1 visas.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lawyers.map((lawyer) => (
              <Link key={lawyer.id} href={`/lawyers/${lawyer.id}`}>
                <Card hover className="h-full">
                  <CardContent>
                    <div className="flex items-start gap-4">
                      {lawyer.photo_url ? (
                        <img
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
