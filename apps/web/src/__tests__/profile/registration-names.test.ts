import { describe, expect, it } from 'vitest';
import { buildFullName, normalizeOptionalName } from '@/lib/profile/registrationNames';

describe('registration name helpers', () => {
  it('requires non-empty optional names to survive normalization', () => {
    expect(normalizeOptionalName('  ')).toBeNull();
    expect(normalizeOptionalName('  Alex  ')).toBe('Alex');
  });

  it('builds full name from first name only when no last name', () => {
    expect(buildFullName('  Mia  ', '')).toBe('Mia');
  });

  it('builds full name from first and last name', () => {
    expect(buildFullName('Mia', '  Sommer ')).toBe('Mia Sommer');
  });
});
