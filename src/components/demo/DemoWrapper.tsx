'use client';

import { ReactNode } from 'react';
import { DEMO_MODE } from '@/lib/demo/config';
import { DemoBanner } from './DemoBanner';
import { DemoRoleSwitcher } from './DemoRoleSwitcher';

interface DemoWrapperProps {
  children: ReactNode;
  showBanner?: boolean;
  showRoleSwitcher?: boolean;
}

/**
 * Wrapper component that adds demo UI elements when in demo mode
 */
export function DemoWrapper({
  children,
  showBanner = true,
  showRoleSwitcher = false,
}: DemoWrapperProps) {
  if (!DEMO_MODE) {
    return <>{children}</>;
  }

  return (
    <>
      {showBanner && <DemoBanner />}
      {showRoleSwitcher && (
        <div className="fixed bottom-4 right-4 z-50">
          <DemoRoleSwitcher />
        </div>
      )}
      {children}
    </>
  );
}
