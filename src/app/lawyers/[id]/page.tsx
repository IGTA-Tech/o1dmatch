import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent, Badge } from '@/components/ui';
import {
  ArrowLeft,
  Mail,
  Phone,
  Globe,
  MapPin,
  Scale,
  Award,
  Users,
  Eye,
  Calendar,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function LawyerProfilePage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

// Increment view count
try {
    await supabase.rpc('increment_lawyer_views', { lawyer_id: id });
  } catch {
    // Ignore if RPC doesn't exist
  }

  // Get lawyer profile
  const { data: lawyer, error } = await supabase
    .from('lawyer_profiles')
    .select(`
      *,
      user:profiles(
        full_name,
        avatar_url
      )
    `)
    .eq('id', id)
    .eq('is_active', true)
    .maybeSingle();

  if (error || !lawyer) {
    notFound();
  }

  function getTierBadge(tier: string) {
    switch (tier) {
      case 'premium':
        return { label: 'Premium', variant: 'warning' as const };
      case 'featured':
        return { label: 'Featured', variant: 'success' as const };
      default:
        return { label: 'Basic', variant: 'default' as const };
    }
  }

  const tierBadge = getTierBadge(lawyer.tier || 'basic');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link
            href="/lawyers"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Directory
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Profile Header */}
        <Card>
          <CardContent className="flex flex-col md:flex-row gap-6">
            {/* Logo/Avatar */}
            <div className="flex-shrink-0">
              {lawyer.firm_logo_url ? (
                <Image
                  src={lawyer.firm_logo_url}
                  alt={lawyer.firm_name}
                  className="w-24 h-24 object-contain rounded-lg border"
                />
              ) : (
                <div className="w-24 h-24 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Scale className="w-12 h-12 text-blue-600" />
                </div>
              )}
            </div>

            {/* Main Info */}
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {lawyer.attorney_name}
                  </h1>
                  {lawyer.attorney_title && (
                    <p className="text-gray-600">{lawyer.attorney_title}</p>
                  )}
                  <p className="text-lg text-blue-600 font-medium mt-1">
                    {lawyer.firm_name}
                  </p>
                </div>
                <Badge variant={tierBadge.variant}>{tierBadge.label}</Badge>
              </div>

              {/* Quick Info */}
              <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-600">
                {lawyer.office_location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {lawyer.office_location}
                  </span>
                )}
                {lawyer.firm_size && (
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {lawyer.firm_size}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  {lawyer.profile_views || 0} views
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bio */}
        {lawyer.bio && (
          <Card>
            <CardHeader>
              <CardTitle>About</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 whitespace-pre-wrap">{lawyer.bio}</p>
            </CardContent>
          </Card>
        )}

        {/* Specializations */}
        {lawyer.specializations && lawyer.specializations.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5" />
                Specializations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {lawyer.specializations.map((spec: string, index: number) => (
                  <span
                    key={index}
                    className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm"
                  >
                    {spec}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Visa Types */}
        {lawyer.visa_types && lawyer.visa_types.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scale className="w-5 h-5" />
                Visa Types Handled
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {lawyer.visa_types.map((visa: string, index: number) => (
                  <span
                    key={index}
                    className="px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-sm font-medium"
                  >
                    {visa}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
                <a href={`mailto:${lawyer.contact_email}`}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Mail className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="text-gray-900">{lawyer.contact_email}</p>
                </div>
              </a>

              {lawyer.contact_phone && (
                
                  <a href={`tel:${lawyer.contact_phone}`}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <Phone className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="text-gray-900">{lawyer.contact_phone}</p>
                  </div>
                </a>
              )}

              {lawyer.website_url && (
                
                  <a href={lawyer.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <Globe className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-500">Website</p>
                    <p className="text-gray-900 truncate">{lawyer.website_url}</p>
                  </div>
                </a>
              )}

              {lawyer.office_location && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-500">Office Location</p>
                    <p className="text-gray-900">{lawyer.office_location}</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Connect Button */}
        <Card>
          <CardContent className="text-center py-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Interested in working with {lawyer.attorney_name}?
            </h3>
            <p className="text-gray-600 mb-4">
              Send a connection request to discuss your immigration needs.
            </p>
            <Link
              href={`/lawyers/${id}/connect`}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Mail className="w-5 h-5" />
              Request Consultation
            </Link>
          </CardContent>
        </Card>

        {/* Footer Info */}
        <div className="text-center text-sm text-gray-500">
          <p className="flex items-center justify-center gap-1">
            <Calendar className="w-4 h-4" />
            Member since {new Date(lawyer.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </p>
        </div>
      </div>
    </div>
  );
}