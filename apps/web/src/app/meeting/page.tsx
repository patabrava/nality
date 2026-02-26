'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AltOnboardingWizard } from '@/components/onboarding-alt/AltOnboardingWizard';
import { useAuth } from '@/hooks/useAuth';

export const dynamic = 'force-dynamic';

export default function MeetingPage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.replace('/login?mode=signup');
    }
  }, [authLoading, isAuthenticated, router]);

  if (authLoading || isAuthenticated) {
    return null;
  }

  return <AltOnboardingWizard />;
}
