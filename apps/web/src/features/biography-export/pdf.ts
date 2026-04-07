import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from 'pdf-lib';
import type { BiographyToneType } from '@nality/schema';

type ExportChapter = {
  title: string;
  timeRange: string | null;
};

export type BiographyPdfInput = {
  fullName: string | null;
  createdAt: string | null;
  version: number;
  tone: BiographyToneType;
  content: string;
  chapters: ExportChapter[];
};

const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const MARGIN_X = 68;
const MARGIN_TOP = 72;
const MARGIN_BOTTOM = 62;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN_X * 2;
const BODY_FONT_SIZE = 12.5;
const BODY_LINE_HEIGHT = 19;

const COLORS = {
  paper: rgb(0.996, 0.992, 0.980),
  cream: rgb(0.969, 0.957, 0.922),
  dark: rgb(0.078, 0.071, 0.063),
  ink: rgb(0.129, 0.114, 0.102),
  muted: rgb(0.420, 0.376, 0.322),
  gold: rgb(0.834, 0.686, 0.216),
  goldSoft: rgb(0.855, 0.812, 0.620),
  border: rgb(0.875, 0.847, 0.749),
  chapter: rgb(0.250, 0.227, 0.196),
  white: rgb(0.996, 0.992, 0.980),
};

const TONE_LABELS: Record<BiographyToneType, string> = {
  neutral: 'Ausgewogene Erzählweise',
  poetic: 'Poetische Erzählweise',
  formal: 'Formale Erzählweise',
};

const TEXT_REPLACEMENTS: Record<string, string> = {
  '\u2018': "'",
  '\u2019': "'",
  '\u201C': '"',
  '\u201D': '"',
  '\u2013': '-',
  '\u2014': '-',
  '\u2026': '...',
  '\u2022': '-',
  '\u00A0': ' ',
};

function sanitizePdfText(input: string) {
  const normalized = input
    .normalize('NFKC')
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n');

  let result = '';
  for (const character of normalized) {
    const replacement = TEXT_REPLACEMENTS[character];
    if (replacement) {
      result += replacement;
      continue;
    }

    const codePoint = character.codePointAt(0) ?? 63;
    result += codePoint <= 255 ? character : '?';
  }

  return result;
}

function formatDateLabel(dateInput: string | null) {
  if (!dateInput) return null;

  const parsed = new Date(dateInput);
  if (Number.isNaN(parsed.getTime())) return null;

  return parsed.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function wrapText(text: string, font: PDFFont, fontSize: number, maxWidth: number) {
  const words = sanitizePdfText(text).trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];

  const lines: string[] = [];
  let currentLine = words[0] ?? '';

  for (const word of words.slice(1)) {
    const candidate = `${currentLine} ${word}`;
    if (font.widthOfTextAtSize(candidate, fontSize) <= maxWidth) {
      currentLine = candidate;
      continue;
    }

    if (font.widthOfTextAtSize(word, fontSize) > maxWidth) {
      if (currentLine) {
        lines.push(currentLine);
      }

      let fragment = '';
      for (const character of word) {
        const nextFragment = `${fragment}${character}`;
        if (font.widthOfTextAtSize(nextFragment, fontSize) <= maxWidth) {
          fragment = nextFragment;
          continue;
        }

        if (fragment) {
          lines.push(fragment);
        }
        fragment = character;
      }

      currentLine = fragment;
      continue;
    }

    lines.push(currentLine);
    currentLine = word;
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines;
}

function drawText(page: PDFPage, text: string, options: Parameters<PDFPage['drawText']>[1]) {
  page.drawText(sanitizePdfText(text), options);
}

function buildCoverPage(
  pdf: PDFDocument,
  input: BiographyPdfInput,
  sansFont: PDFFont,
  boldFont: PDFFont,
) {
  const page = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  const authorName = sanitizePdfText(input.fullName?.trim() || 'Deine Biografie');
  const createdLabel = formatDateLabel(input.createdAt);
  const chapterPreview = input.chapters.slice(0, 5);
  const overflowChapters = Math.max(0, input.chapters.length - chapterPreview.length);

  page.drawRectangle({ x: 0, y: 0, width: PAGE_WIDTH, height: PAGE_HEIGHT, color: COLORS.cream });
  page.drawRectangle({ x: 0, y: PAGE_HEIGHT - 170, width: PAGE_WIDTH, height: 170, color: COLORS.dark });
  drawText(page, 'NALITY', {
    x: MARGIN_X,
    y: PAGE_HEIGHT - 78,
    font: sansFont,
    size: 13,
    color: COLORS.gold,
  });
  drawText(page, authorName, {
    x: MARGIN_X,
    y: PAGE_HEIGHT - 126,
    font: boldFont,
    size: 30,
    color: COLORS.white,
  });
  drawText(page, 'Biografie', {
    x: MARGIN_X,
    y: PAGE_HEIGHT - 158,
    font: sansFont,
    size: 14,
    color: COLORS.goldSoft,
  });
  page.drawLine({
    start: { x: MARGIN_X, y: PAGE_HEIGHT - 215 },
    end: { x: PAGE_WIDTH - MARGIN_X, y: PAGE_HEIGHT - 215 },
    thickness: 1.3,
    color: COLORS.gold,
  });
  drawText(page, `Version ${input.version}`, {
    x: MARGIN_X,
    y: PAGE_HEIGHT - 262,
    font: sansFont,
    size: 11,
    color: COLORS.ink,
  });
  drawText(page, TONE_LABELS[input.tone] ?? 'Biografie', {
    x: MARGIN_X + 110,
    y: PAGE_HEIGHT - 262,
    font: sansFont,
    size: 11,
    color: COLORS.muted,
  });

  if (createdLabel) {
    drawText(page, `Erstellt am ${createdLabel}`, {
      x: MARGIN_X,
      y: PAGE_HEIGHT - 287,
      font: sansFont,
      size: 10.5,
      color: COLORS.muted,
    });
  }

  drawText(page, 'Erstellt aus bestätigten Kapiteln', {
    x: MARGIN_X,
    y: PAGE_HEIGHT - 350,
    font: sansFont,
    size: 12,
    color: COLORS.ink,
  });

  let chapterY = PAGE_HEIGHT - 382;
  for (const chapter of chapterPreview) {
    const chapterLabel = chapter.timeRange ? `${chapter.title}  |  ${chapter.timeRange}` : chapter.title;
    drawText(page, `- ${chapterLabel}`, {
      x: MARGIN_X,
      y: chapterY,
      font: sansFont,
      size: 11.5,
      color: COLORS.chapter,
    });
    chapterY -= 22;
  }

  if (overflowChapters > 0) {
    drawText(page, `+ ${overflowChapters} weitere bestätigte Kapitel`, {
      x: MARGIN_X,
      y: chapterY,
      font: sansFont,
      size: 11,
      color: COLORS.muted,
    });
  }

  drawText(page, 'Eine private Lebensgeschichte, erstellt aus deiner bestätigten Kapitelstruktur.', {
    x: MARGIN_X,
    y: 92,
    font: sansFont,
    size: 11,
    color: COLORS.muted,
  });
}

function startBodyPage(pdf: PDFDocument, headerText: string, sansFont: PDFFont, pageNumber: number) {
  const page = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  page.drawRectangle({ x: 0, y: 0, width: PAGE_WIDTH, height: PAGE_HEIGHT, color: COLORS.paper });
  drawText(page, headerText, {
    x: MARGIN_X,
    y: PAGE_HEIGHT - 54,
    font: sansFont,
    size: 11.5,
    color: COLORS.ink,
  });
  page.drawLine({
    start: { x: MARGIN_X, y: PAGE_HEIGHT - 66 },
    end: { x: PAGE_WIDTH - MARGIN_X, y: PAGE_HEIGHT - 66 },
    thickness: 0.8,
    color: COLORS.border,
  });
  drawText(page, `Seite ${pageNumber}`, {
    x: PAGE_WIDTH - MARGIN_X - 46,
    y: 36,
    font: sansFont,
    size: 10,
    color: COLORS.muted,
  });
  return page;
}

function buildBodyPages(
  pdf: PDFDocument,
  input: BiographyPdfInput,
  bodyFont: PDFFont,
  sansFont: PDFFont,
) {
  const headerText = input.fullName?.trim() || 'Biografie';
  const paragraphs = sanitizePdfText(input.content)
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.replace(/\s+/g, ' ').trim())
    .filter(Boolean);

  let pageNumber = 1;
  let page = startBodyPage(pdf, headerText, sansFont, pageNumber);
  let y = PAGE_HEIGHT - MARGIN_TOP - 24;

  for (const paragraph of paragraphs) {
    const lines = wrapText(paragraph, bodyFont, BODY_FONT_SIZE, CONTENT_WIDTH);
    const paragraphHeight = lines.length * BODY_LINE_HEIGHT + 10;

    if (y - paragraphHeight < MARGIN_BOTTOM) {
      pageNumber += 1;
      page = startBodyPage(pdf, headerText, sansFont, pageNumber);
      y = PAGE_HEIGHT - MARGIN_TOP - 24;
    }

    for (const line of lines) {
      drawText(page, line, {
        x: MARGIN_X,
        y,
        font: bodyFont,
        size: BODY_FONT_SIZE,
        color: COLORS.ink,
      });
      y -= BODY_LINE_HEIGHT;
    }

    y -= 10;
  }
}

export async function buildBiographyPdf(input: BiographyPdfInput) {
  const pdf = await PDFDocument.create();
  pdf.setTitle(`${sanitizePdfText(input.fullName?.trim() || 'Biografie')} Biografie`);
  pdf.setAuthor('Nality');
  pdf.setSubject('Private Lebensgeschichte');
  pdf.setCreator('Nality');
  pdf.setProducer('Nality');
  pdf.setLanguage('de');

  const [bodyFont, sansFont, boldFont] = await Promise.all([
    pdf.embedFont(StandardFonts.TimesRoman),
    pdf.embedFont(StandardFonts.Helvetica),
    pdf.embedFont(StandardFonts.HelveticaBold),
  ]);

  buildCoverPage(pdf, input, sansFont, boldFont);
  buildBodyPages(pdf, input, bodyFont, sansFont);

  return pdf.save({ useObjectStreams: false });
}

export function buildBiographyPdfFilename(fullName: string | null, version: number) {
  const normalized = (fullName || 'nality-biografie')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return `${normalized || 'nality-biography'}-biography-v${version}.pdf`;
}
