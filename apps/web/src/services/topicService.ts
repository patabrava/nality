'use client'

import { supabase } from '@/lib/supabase/client'

// ──────────────────────
// Topic Management Service
// ──────────────────────

export interface Topic {
  id: string
  name: string
  category?: string
  is_default: boolean
  user_id?: string
  created_at?: string
}

export interface ValidationResult {
  isValid: boolean
  error?: string
}

/**
 * Default topics that map to existing categories
 * CODE_EXPANSION: Preserves existing category functionality
 */
export const DEFAULT_TOPICS: Topic[] = [
  { id: 'personal', name: 'Personal', category: 'personal', is_default: true },
  { id: 'education', name: 'Education', category: 'education', is_default: true },
  { id: 'career', name: 'Career', category: 'career', is_default: true },
  { id: 'family', name: 'Family', category: 'family', is_default: true },
  { id: 'travel', name: 'Travel', category: 'travel', is_default: true },
  { id: 'achievement', name: 'Achievement', category: 'achievement', is_default: true },
  { id: 'health', name: 'Health', category: 'health', is_default: true },
  { id: 'relationship', name: 'Relationship', category: 'relationship', is_default: true },
  { id: 'other', name: 'Other', category: 'other', is_default: true },
]

/**
 * Topic Management Service
 * Extends existing category system with custom topics
 */
export class TopicService {
  
  /**
   * Get default topics (existing categories)
   * CODE_EXPANSION: Maintains backward compatibility
   */
  static getDefaultTopics(): Topic[] {
    return DEFAULT_TOPICS
  }

  /**
   * Get user's custom topics from database
   * CODE_EXPANSION: Added graceful handling for missing user_topics table
   */
  static async getUserTopics(userId: string): Promise<Topic[]> {
    try {
      const { data, error } = await supabase
        .from('user_topics')
        .select('*')
        .eq('user_id', userId)
        .order('name')

      if (error) {
        // Check if error is due to missing table (common during development)
        if (error.message?.includes('does not exist') || error.code === 'PGRST116') {
          console.info('user_topics table not found - using default topics only. Run the migration to enable custom topics.')
          return []
        }
        console.error('Error fetching user topics:', error.message || error)
        return []
      }

      return (data || []).map((topic: any) => ({
        id: topic.id,
        name: topic.name,
        category: topic.category,
        is_default: false,
        user_id: userId,
        created_at: topic.created_at
      }))
    } catch (error) {
      // Additional safety net for any other errors
      if (error instanceof Error && error.message?.includes('does not exist')) {
        console.info('user_topics table not found - using default topics only. Run the migration to enable custom topics.')
        return []
      }
      console.error('Unexpected error fetching user topics:', error)
      return []
    }
  }

  /**
   * Get all topics for a user (default + custom)
   */
  static async getAllTopics(userId: string): Promise<Topic[]> {
    const defaultTopics = this.getDefaultTopics()
    const userTopics = await this.getUserTopics(userId)
    
    return [...defaultTopics, ...userTopics]
  }

  /**
   * Create a custom topic for user
   * CODE_EXPANSION: Added graceful handling for missing user_topics table
   */
  static async createCustomTopic(userId: string, name: string): Promise<Topic | null> {
    const validation = this.validateTopic(name)
    if (!validation.isValid) {
      throw new Error(validation.error)
    }

    try {
      const { data, error } = await supabase
        .from('user_topics')
        .insert([{
          user_id: userId,
          name: name.trim(),
          category: null // Custom topics don't map to legacy categories
        }])
        .select()
        .single()

      if (error) {
        // Check if error is due to missing table
        if (error.message?.includes('does not exist') || error.code === 'PGRST116') {
          throw new Error('Custom topics are not available yet. Please contact support to enable this feature.')
        }
        console.error('Error creating custom topic:', error)
        throw new Error(`Failed to create topic: ${error.message}`)
      }

      return {
        id: data.id,
        name: data.name,
        category: data.category,
        is_default: false,
        user_id: userId,
        created_at: data.created_at
      }
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('does not exist')) {
          throw new Error('Custom topics are not available yet. Please contact support to enable this feature.')
        }
        throw error // Re-throw known errors
      }
      console.error('Unexpected error creating custom topic:', error)
      throw new Error('An unexpected error occurred while creating the topic')
    }
  }

  /**
   * Validate topic name
   */
  static validateTopic(name: string): ValidationResult {
    const trimmedName = name.trim()
    
    if (!trimmedName) {
      return { isValid: false, error: 'Topic name cannot be empty' }
    }
    
    if (trimmedName.length < 2) {
      return { isValid: false, error: 'Topic name must be at least 2 characters' }
    }
    
    if (trimmedName.length > 50) {
      return { isValid: false, error: 'Topic name must be less than 50 characters' }
    }

    // Check if name conflicts with default topics
    const defaultNames = DEFAULT_TOPICS.map(t => t.name.toLowerCase())
    if (defaultNames.includes(trimmedName.toLowerCase())) {
      return { isValid: false, error: 'This topic already exists' }
    }

    return { isValid: true }
  }

  /**
   * Delete a custom topic
   * CODE_EXPANSION: Added graceful handling for missing user_topics table
   */
  static async deleteCustomTopic(userId: string, topicId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_topics')
        .delete()
        .eq('id', topicId)
        .eq('user_id', userId)

      if (error) {
        // Check if error is due to missing table
        if (error.message?.includes('does not exist') || error.code === 'PGRST116') {
          console.info('user_topics table not found - delete operation skipped')
          return true // Return success since there's nothing to delete
        }
        console.error('Error deleting custom topic:', error)
        return false
      }

      return true
    } catch (error) {
      if (error instanceof Error && error.message?.includes('does not exist')) {
        console.info('user_topics table not found - delete operation skipped')
        return true
      }
      console.error('Unexpected error deleting custom topic:', error)
      return false
    }
  }

  /**
   * Map legacy category to topic
   * CODE_EXPANSION: Ensures backward compatibility
   */
  static mapCategoryToTopic(category: string): Topic | null {
    return DEFAULT_TOPICS.find(topic => topic.category === category) || null
  }

  /**
   * Map topic back to legacy category
   * CODE_EXPANSION: Maintains existing data structure
   */
  static mapTopicToCategory(topicId: string): string | null {
    const topic = DEFAULT_TOPICS.find(t => t.id === topicId)
    return topic?.category || null
  }
}
