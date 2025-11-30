'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';

export interface UserProfile {
  id: string;
  email: string | null;
  full_name: string | null;
  onboarding_complete: boolean;
  form_of_address: 'du' | 'sie' | null;
  language_style: 'prosa' | 'fachlich' | 'locker' | null;
  birth_date: string | null;
  birth_place: string | null;
}

interface UseUserProfileReturn {
  profile: UserProfile | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  isOnboardingComplete: boolean;
}

/**
 * Hook to fetch and manage user profile data
 * Includes onboarding completion status
 */
export function useUserProfile(userId: string | null | undefined): UseUserProfileReturn {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchProfile = useCallback(async () => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('👤 Fetching user profile for:', userId);
      
      const { data, error: fetchError } = await supabase
        .from('users')
        .select('id, email, full_name, onboarding_complete, form_of_address, language_style, birth_date, birth_place')
        .eq('id', userId)
        .single();

      if (fetchError) {
        // If user doesn't exist in users table, they need onboarding
        if (fetchError.code === 'PGRST116') {
          console.log('👤 User not found in users table - needs onboarding');
          setProfile({
            id: userId,
            email: null,
            full_name: null,
            onboarding_complete: false,
            form_of_address: null,
            language_style: null,
            birth_date: null,
            birth_place: null,
          });
        } else {
          throw new Error(fetchError.message);
        }
      } else {
        console.log('✅ User profile loaded:', { 
          id: data.id, 
          onboarding_complete: data.onboarding_complete 
        });
        setProfile(data as UserProfile);
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch profile');
      setError(error);
      console.error('❌ Error fetching user profile:', error);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return {
    profile,
    isLoading,
    error,
    refetch: fetchProfile,
    isOnboardingComplete: profile?.onboarding_complete === true,
  };
}
