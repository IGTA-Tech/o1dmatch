import { DemoLoginPrompt } from '@/components/demo/DemoLoginPrompt';
import { DemoBanner } from '@/components/demo/DemoBanner';

export const metadata = {
  title: 'Demo - O1DMatch',
  description: 'Explore O1DMatch demo with simulated data',
};

export default function DemoPage() {
  return (
    <>
      <DemoBanner dismissible={false} />
      <DemoLoginPrompt />
    </>
  );
}
