import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'O1DMatch — Onboarding Videos',
  description:
    'Step-by-step video walkthroughs to help you get the most out of the O1DMatch platform.',
};

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}