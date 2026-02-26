import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'O1DMatch — Connect O-1 Talent with Opportunity',
  description:
    'O1DMatch connects O-1 visa holders and applicants with US employers actively seeking exceptional international talent.',
};

export default function EmployersLandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}