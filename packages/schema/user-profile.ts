/**
 * User Profile Schema
 * 
 * Defines types for atemporal user attributes (values, influences, motto)
 * that describe WHO the user is, not WHAT happened (life events).
 */

import { z } from 'zod';

// ──────────────────────
// Influence Types
// ──────────────────────

/**
 * Types of influences a person can have
 */
export const InfluenceTypeEnum = z.enum([
  'author',
  'philosopher', 
  'person',
  'mentor',
  'public_figure',
  'historical',
  'other'
]);

export type InfluenceType = z.infer<typeof InfluenceTypeEnum>;

/**
 * An influence - someone who shaped the user's thinking
 */
export const InfluenceSchema = z.object({
  name: z.string().min(1, 'Influence name is required'),
  type: InfluenceTypeEnum.default('other'),
  why: z.string().optional(),
});

export type Influence = z.infer<typeof InfluenceSchema>;

// ──────────────────────
// Role Model Types
// ──────────────────────

/**
 * Relationship types for role models
 */
export const RoleModelRelationshipEnum = z.enum([
  'family',
  'teacher',
  'mentor', 
  'colleague',
  'friend',
  'historical',
  'other'
]);

export type RoleModelRelationship = z.infer<typeof RoleModelRelationshipEnum>;

/**
 * A role model - someone the user admires
 */
export const RoleModelSchema = z.object({
  name: z.string().min(1, 'Role model name is required'),
  relationship: RoleModelRelationshipEnum.optional(),
  traits: z.array(z.string()).optional(),
});

export type RoleModel = z.infer<typeof RoleModelSchema>;

// ──────────────────────
// User Profile Schema
// ──────────────────────

/**
 * Full user profile schema - database representation
 */
export const UserProfileSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  
  // Core values (up to 3)
  values: z.array(z.string().min(1)).max(10).default([]),
  
  // Life motto
  motto: z.string().max(500).nullable().optional(),
  
  // Influences
  influences: z.array(InfluenceSchema).default([]),
  
  // Favorite authors (subset of influences for quick access)
  favorite_authors: z.array(z.string()).default([]),
  
  // Role models
  role_models: z.array(RoleModelSchema).default([]),
  
  // Timestamps
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export type UserProfile = z.infer<typeof UserProfileSchema>;

/**
 * User profile input - for create operations
 */
export const UserProfileInputSchema = UserProfileSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export type UserProfileInput = z.infer<typeof UserProfileInputSchema>;

/**
 * User profile update - for partial updates
 */
export const UserProfileUpdateSchema = UserProfileInputSchema.partial().omit({
  user_id: true,
});

export type UserProfileUpdate = z.infer<typeof UserProfileUpdateSchema>;

// ──────────────────────
// Validation Helpers
// ──────────────────────

/**
 * Validate an influence object
 */
export function validateInfluence(data: unknown): Influence | null {
  const result = InfluenceSchema.safeParse(data);
  return result.success ? result.data : null;
}

/**
 * Validate a role model object
 */
export function validateRoleModel(data: unknown): RoleModel | null {
  const result = RoleModelSchema.safeParse(data);
  return result.success ? result.data : null;
}

/**
 * Validate a full user profile
 */
export function validateUserProfile(data: unknown): UserProfile | null {
  const result = UserProfileSchema.safeParse(data);
  return result.success ? result.data : null;
}

/**
 * Validate user profile input for creation
 */
export function validateUserProfileInput(data: unknown): UserProfileInput | null {
  const result = UserProfileInputSchema.safeParse(data);
  return result.success ? result.data : null;
}

// ──────────────────────
// Type Guards
// ──────────────────────

/**
 * Check if a value is a valid influence type
 */
export function isInfluenceType(value: string): value is InfluenceType {
  return InfluenceTypeEnum.safeParse(value).success;
}

/**
 * Check if a value is a valid role model relationship
 */
export function isRoleModelRelationship(value: string): value is RoleModelRelationship {
  return RoleModelRelationshipEnum.safeParse(value).success;
}
