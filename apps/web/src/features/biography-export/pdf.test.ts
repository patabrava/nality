import { describe, expect, it } from 'vitest';
import { buildBiographyPdf, buildBiographyPdfFilename } from './pdf';

describe('biography pdf export', () => {
  it('builds a valid pdf buffer with branded structure', async () => {
    const pdf = await buildBiographyPdf({
      fullName: 'Märta Müller',
      createdAt: '2026-03-14T10:00:00.000Z',
      version: 2,
      tone: 'poetic',
      content:
        'Märta grew up between two languages and a restless household.\n\nLater she found steadiness in music, family, and the routines she built herself.',
      chapters: [
        {
          title: 'Where everything began',
          timeRange: 'Feb 1982 - Dec 1999',
        },
        {
          title: 'Finding her own voice',
          timeRange: 'Jan 2000 - Dec 2010',
        },
      ],
    });

    const text = Buffer.from(pdf).toString('latin1');

    expect(text.startsWith('%PDF-1.')).toBe(true);
    expect(text).toContain('/Type /Catalog');
    expect(text).toContain('/BaseFont /Times-Roman');
    expect(text).toContain('/BaseFont /Helvetica-Bold');
  });

  it('builds a filesystem-safe filename', () => {
    expect(buildBiographyPdfFilename('Märta Müller', 2)).toBe('marta-muller-biography-v2.pdf');
  });
});
