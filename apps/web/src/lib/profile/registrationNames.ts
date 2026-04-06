export function normalizeOptionalName(value: string | undefined): string | null {
  if (!value) return null;
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
}

export function buildFullName(firstName: string, lastName?: string): string {
  const normalizedFirst = firstName.trim();
  const normalizedLast = normalizeOptionalName(lastName);
  return normalizedLast ? `${normalizedFirst} ${normalizedLast}` : normalizedFirst;
}
