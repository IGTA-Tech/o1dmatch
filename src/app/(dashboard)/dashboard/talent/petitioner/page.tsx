import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Card, CardContent } from '@/components/ui';
import {
  Scale,
  ExternalLink,
  ArrowRight,
  Info,
} from 'lucide-react';
import Link from 'next/link';

const PETITIONER_OPTIONS = [
  {
    name: 'IGTA',
    fullName: 'Innovative Global Talent Agency',
    url: 'https://www.innovativeglobaltalent.com',
    logoUrl: 'https://images.squarespace-cdn.com/content/v1/660c89baf3daeb40cf3ee9b2/7a2b3342-784f-41fc-83ee-474258562941/IGTA_Black.png?format=1500w',
    logoBg: 'bg-white',
    logoPadding: 'p-0.5',
    description: 'Full-service O-1 filing with comprehensive legal support.',
    details:
      'An international talent agency specializing in serving as an active visa agent that navigates and directs opportunities across various industries. IGTA provides end-to-end petition management — from eligibility assessment and evidence compilation to filing and USCIS correspondence, with specialized offerings for business owners, startups, and international students.',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    highlights: ['Full-service filing', 'Legal support included', 'Evidence compilation'],
  },
  {
    name: 'Innovative Automations',
    fullName: 'Innovative Automation Studios',
    url: 'https://innovativeautomations.dev',
    logoUrl: 'https://innovativeautomations.dev/wp-content/uploads/2025/04/Innovative-Automation-Studios-Logo-trimmed.png',
    logoBg: 'bg-gray-900',
    logoPadding: 'p-2',
    description: 'Technology-forward petitioning services for AI/ML professionals.',
    details:
      'Built for extraordinary developers and tech professionals, Innovative Automations offers an O-1 Ready Agent Filing Program, a Profile Building Program, and a Visa Accelerator. Their platform streamlines the petition process — file in as little as 30 days or build your profile over 6–12 months — with no lottery, multiple employer support, and the freedom to start your own business.',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    highlights: ['Tech-driven workflow', 'Milestone tracking', 'Faster processing'],
  },
  {
    name: 'Aventus',
    fullName: 'Aventus Visa Agents',
    url: 'https://www.aventusvisaagents.com',
    logoUrl: 'https://images.squarespace-cdn.com/content/v1/685e28edd1e979636aeb8e7c/0bebbbc5-0439-444e-af6e-e2e9d34dc1a1/AVA-Logo-Final.png?format=1500w',
    logoBg: 'bg-white',
    logoPadding: 'p-2',
    description: 'Agent-based petitioning for independent professionals.',
    details:
      'Aventus serves as your official petitioner on Form I-129, enabling you to work with multiple clients while your attorney handles the legal expertise. Trusted by 50+ top immigration firms, they offer agent solutions for freelancers, entrepreneurs, foreign employers, and single employers — with a pay-only-when-approved model and a perfect USCIS audit record.',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    highlights: ['Agent-based petitions', 'For freelancers & consultants', 'Multi-client support'],
  },
];

export default async function SeekPetitionerPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: talentProfile } = await supabase
    .from('talent_profiles')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle();

  if (!talentProfile) {
    redirect('/dashboard/talent');
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Seek a Petitioner</h1>
        <p className="text-gray-600">
          Find the right petitioner to file your O-1 visa petition
        </p>
      </div>

      {/* Info Banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
        <div className="text-sm text-amber-800">
          <p className="font-semibold mb-1">What is a petitioner?</p>
          <p>
            A petitioner is the entity that files the O-1 visa petition on your behalf with USCIS.
            This can be your employer, an agent, or a specialized petitioning service. Choosing the
            right petitioner depends on your employment situation — whether you work for a single
            employer, freelance, or consult for multiple clients.
          </p>
        </div>
      </div>

      {/* Petitioner Cards */}
      <div className="space-y-4">
        {PETITIONER_OPTIONS.map((petitioner) => (
          <Card
            key={petitioner.name}
            className={`border ${petitioner.borderColor} hover:shadow-md transition-shadow`}
          >
            <CardContent className="p-6">
              <div className="flex items-start gap-5">
                {/* Logo */}
                <Link
                  href={petitioner.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-20 h-20 rounded-lg ${petitioner.logoBg} border border-gray-200 flex items-center justify-center flex-shrink-0 ${petitioner.logoPadding} hover:opacity-80 transition-opacity`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={petitioner.logoUrl}
                    alt={`${petitioner.name} logo`}
                    className="w-full h-full object-contain"
                  />
                </Link>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Link
                      href={petitioner.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors"
                    >
                      {petitioner.name}
                    </Link>
                  </div>
                  <p className="text-sm font-medium text-gray-700 mb-2">{petitioner.description}</p>
                  <p className="text-sm text-gray-600 mb-4">{petitioner.details}</p>

                  {/* Highlights */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {petitioner.highlights.map((highlight) => (
                      <span
                        key={highlight}
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${petitioner.bgColor} ${petitioner.color}`}
                      >
                        {highlight}
                      </span>
                    ))}
                  </div>
                </div>

                {/* CTA */}
                <Link
                  href={petitioner.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-white transition-colors flex-shrink-0 ${
                    petitioner.color === 'text-blue-600'
                      ? 'bg-blue-600 hover:bg-blue-700'
                      : petitioner.color === 'text-purple-600'
                      ? 'bg-purple-600 hover:bg-purple-700'
                      : 'bg-green-600 hover:bg-green-700'
                  }`}
                >
                  Visit Website
                  <ExternalLink className="w-4 h-4" />
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Bottom CTA */}
      <Card className="bg-gray-50 border-gray-200">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white rounded-lg border border-gray-200 flex-shrink-0">
              <Scale className="w-6 h-6 text-gray-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">Not sure which option is right for you?</h3>
              <p className="text-sm text-gray-600 mt-1">
                Browse our lawyer directory to consult with an immigration attorney who can help you
                determine the best petitioning strategy for your situation.
              </p>
            </div>
            <Link
              href="/lawyers"
              className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium flex-shrink-0"
            >
              Find a Lawyer
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}