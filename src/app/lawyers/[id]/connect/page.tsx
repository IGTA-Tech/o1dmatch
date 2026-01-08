import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { ArrowLeft, Scale, MapPin } from 'lucide-react';
import Link from 'next/link';
import ConnectForm from './ConnectForm';
import Image from 'next/image';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function LawyerConnectPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  // Get lawyer profile
  const { data: lawyer, error } = await supabase
    .from('lawyer_profiles')
    .select('id, attorney_name, attorney_title, firm_name, firm_logo_url, office_location')
    .eq('id', id)
    .eq('is_active', true)
    .maybeSingle();

  if (error || !lawyer) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <Link
            href={`/lawyers/${id}`}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Profile
          </Link>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        {/* Lawyer Info */}
        <Card>
          <CardContent className="flex items-center gap-4">
            {lawyer.firm_logo_url ? (
              <Image
                src={lawyer.firm_logo_url}
                alt={lawyer.firm_name}
                className="w-16 h-16 object-contain rounded-lg border"
              />
            ) : (
              <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center">
                <Scale className="w-8 h-8 text-blue-600" />
              </div>
            )}
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {lawyer.attorney_name}
              </h2>
              {lawyer.attorney_title && (
                <p className="text-gray-600 text-sm">{lawyer.attorney_title}</p>
              )}
              <p className="text-blue-600">{lawyer.firm_name}</p>
              {lawyer.office_location && (
                <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                  <MapPin className="w-3 h-3" />
                  {lawyer.office_location}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Connect Form */}
        <Card>
          <CardHeader>
            <CardTitle>Request a Consultation</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-6">
              Fill out the form below to send a connection request to {lawyer.attorney_name}. 
              They will review your information and get back to you.
            </p>
            <ConnectForm lawyerId={lawyer.id} lawyerName={lawyer.attorney_name} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}