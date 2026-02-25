import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Card, CardContent } from '@/components/ui';
import {
  Scale,
  ExternalLink,
  Shield,
  Cpu,
  Users,
  ArrowRight,
  Info,
} from 'lucide-react';
import Link from 'next/link';

const PETITIONER_OPTIONS = [
  {
    name: 'IGTA',
    fullName: 'Innovative Global Talent Agency',
    url: 'https://www.innovativeglobaltalent.com',
    description: 'Full-service O-1 filing with comprehensive legal support.',
    details:
      'IGTA provides end-to-end petition management — from eligibility assessment and evidence compilation to filing and USCIS correspondence. Ideal for candidates who want hands-on guidance through every step of the O-1 process.',
    icon: Shield,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    highlights: ['Full-service filing', 'Legal support included', 'Evidence compilation'],
  },
  {
    name: 'Innovative Automations',
    fullName: 'Innovative Automations',
    url: 'https://innovativeautomations.dev',
    description: 'Technology-forward petitioning services.',
    details:
      'Innovative Automations leverages modern technology to streamline the O-1 petition process. Their platform helps organize documentation, track milestones, and ensure nothing falls through the cracks — making the filing process faster and more transparent.',
    icon: Cpu,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    highlights: ['Tech-driven workflow', 'Milestone tracking', 'Faster processing'],
  },
  {
    name: 'Aventus',
    fullName: 'Aventus Visa Agents',
    url: 'https://www.aventusvisaagents.com',
    description: 'Agent-based petitioning for independent professionals.',
    details:
      'Aventus specializes in agent-based O-1 petitions, which is the ideal route for freelancers, consultants, and independent professionals who work with multiple clients rather than a single employer. They handle the petitioner role so you can focus on your career.',
    icon: Users,
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
                {/* Icon */}
                <div className={`p-3 rounded-lg ${petitioner.bgColor} flex-shrink-0`}>
                  <petitioner.icon className={`w-7 h-7 ${petitioner.color}`} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-semibold text-gray-900">{petitioner.name}</h3>
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