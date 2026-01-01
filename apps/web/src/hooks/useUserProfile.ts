'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';

// ──────────────────────
// Types
// ──────────────────────

/**
 * User data from the users table
 */
export interface UserData {
  id: string;
  email: string | null;
  full_name: string | null;
  onboarding_complete: boolean;
  form_of_address: 'du' | 'sie' | null;
  language_style: 'prosa' | 'fachlich' | 'locker' | null;
  birth_date: string | null;
  birth_place: string | null;
}

/**
 * Life event from life_event table
 */
export interface LifeEvent {
  id: string;
  title: string;
  description: string | null;
  category: 'family' | 'education' | 'career' | 'personal' | 'travel' | 'achievement' | 'health' | 'relationship' | 'other';
  start_date: string | null;
  end_date: string | null;
  is_ongoing: boolean;
  location: string | null;
}

/**
 * Profile attributes from the user_profile table
 */
export interface ProfileAttributes {
  values: string[];
  motto: string | null;
  influences: Array<{
    name: string;
    type: string;
    why?: string;
  }>;
  role_models: Array<{
    name: string;
    relationship?: string;
    traits?: string[];
  }>;
  favorite_authors: string[];
}

/**
 * Life events grouped by category
 */
export interface LifeEventsData {
  family: LifeEvent[];
  education: LifeEvent[];
  career: LifeEvent[];
}

/**
 * Combined user profile (users + user_profile + life_event tables)
 */
export interface UserProfile extends UserData {
  attributes: ProfileAttributes | null;
  lifeEvents: LifeEventsData | null;
}

interface UseUserProfileReturn {
  profile: UserProfile | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  isOnboardingComplete: boolean;
  updateAttributes: (updates: Partial<ProfileAttributes>) => Promise<boolean>;
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
      
      // Fetch user data from users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, email, full_name, onboarding_complete, form_of_address, language_style, birth_date, birth_place')
        .eq('id', userId)
        .single();

      // Fetch profile attributes from user_profile table
      const { data: profileData, error: profileError } = await supabase
        .from('user_profile')
        .select('values, motto, influences, role_models, favorite_authors')
        .eq('user_id', userId)
        .maybeSingle();

      // Fetch life events from life_event table
      const { data: lifeEventsData, error: lifeEventsError } = await supabase
        .from('life_event')
        .select('id, title, description, category, start_date, end_date, is_ongoing, location')
        .eq('user_id', userId)
        .in('category', ['family', 'education', 'career'])
        .order('start_date', { ascending: true });

      if (userError) {
        // If user doesn't exist in users table, they need onboarding
        if (userError.code === 'PGRST116') {
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
            attributes: null,
            lifeEvents: null,
          });
        } else {
          throw new Error(userError.message);
        }
      } else {
        // Build combined profile
        const attributes: ProfileAttributes | null = profileData ? {
          values: profileData.values || [],
          motto: profileData.motto || null,
          influences: profileData.influences || [],
          role_models: profileData.role_models || [],
          favorite_authors: profileData.favorite_authors || [],
        } : null;

        // Group life events by category
        const lifeEvents: LifeEventsData | null = lifeEventsData && lifeEventsData.length > 0 ? {
          family: lifeEventsData.filter((e: LifeEvent) => e.category === 'family'),
          education: lifeEventsData.filter((e: LifeEvent) => e.category === 'education'),
          career: lifeEventsData.filter((e: LifeEvent) => e.category === 'career'),
        } : null;

        console.log('✅ User profile loaded:', { 
          id: userData.id, 
          onboarding_complete: userData.onboarding_complete,
          hasAttributes: !!attributes,
          hasLifeEvents: !!lifeEvents,
          familyCount: lifeEvents?.family.length || 0,
          educationCount: lifeEvents?.education.length || 0,
          careerCount: lifeEvents?.career.length || 0,
        });
        
        setProfile({
          ...userData,
          attributes,
          lifeEvents,
        } as UserProfile);
      }

      // Log profile error separately (not critical)
      if (profileError && profileError.code !== 'PGRST116') {
        console.warn('⚠️ Could not fetch profile attributes:', profileError.message);
      }
      if (lifeEventsError) {
        console.warn('⚠️ Could not fetch life events:', lifeEventsError.message);
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch profile');
      setError(error);
      console.error('❌ Error fetching user profile:', error);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  /**
   * Update profile attributes in user_profile table
   */
  const updateAttributes = useCallback(async (updates: Partial<ProfileAttributes>): Promise<boolean> => {
    if (!userId) return false;

    try {
      const { error: updateError } = await supabase
        .from('user_profile')
        .upsert({
          user_id: userId,
          ...updates,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' });

      if (updateError) {
        console.error('❌ Failed to update attributes:', updateError);
        return false;
      }

      // Refetch to update local state
      await fetchProfile();
      return true;
    } catch (err) {
      console.error('❌ Error updating attributes:', err);
      return false;
    }
  }, [userId, fetchProfile]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return {
    profile,
    isLoading,
    error,
    refetch: fetchProfile,
    isOnboardingComplete: profile?.onboarding_complete === true,
    updateAttributes,
  };
}
