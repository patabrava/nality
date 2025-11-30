# NALITY Design System & Style Guide

## Core Philosophy
**"Cinematic Luxury"**
A maximalist yet refined aesthetic that blends deep, void-like backgrounds with rich gold accents, glassmorphism, and tangible textures. The interface should feel like a high-end editorial piece or a cinematic title sequence.

---

## 1. Design Tokens

### Colors
| Token | Value | Usage |
|-------|-------|-------|
| `bg-void` | `#050505` | Main page background |
| `bg-surface` | `#0f0f0f` | Card backgrounds, elevated surfaces |
| `text-primary` | `#e0e0e0` | Primary body text |
| `text-secondary` | `#a0a0a0` | Secondary text, captions |
| `accent-gold` | `#D4AF37` | Primary actions, highlights, icons |
| `accent-gold-dim` | `#8a7020` | Muted gold for borders or secondary accents |
| `border-subtle` | `rgba(255, 255, 255, 0.08)` | Dividers, card borders |

### Typography
| Role | Font Family | Weights | Usage |
|------|-------------|---------|-------|
| **Display** | `Playfair Display` | 400, 600, 800 | Large headings (H1, H2), Section Titles |
| **Body** | `Inter` | 200, 300, 400, 500 | UI elements, paragraphs, inputs, chat text |
| **Accent** | `Cormorant Garamond` | 400 Italic, 600 | Pull quotes, emphasis, dates, "handwritten" feel |

### Effects & Textures
-   **Grain Overlay**: A fixed, full-screen SVG noise overlay at 4% opacity to add filmic texture.
-   **Glassmorphism**: `background: rgba(20, 20, 20, 0.4)`, `backdrop-filter: blur(20px)`, `border: 1px solid rgba(255, 255, 255, 0.05)`.
-   **Gold Gradient Text**: `linear-gradient(135deg, #fbf5b7 0%, #bf953f 50%, #b38728 100%)`.

---

## 2. Component Guidelines

### A. Chat Interface (Smart Onboarding)
The chat should feel intimate and premium, not like a support bot.

-   **Container**: Glassmorphic panel floating over the void background.
-   **AI Bubbles**:
    -   Background: `rgba(255, 255, 255, 0.03)`
    -   Border: `1px solid var(--border-subtle)`
    -   Text: `Inter` Light (300), `text-primary`
    -   Avatar: Minimalist gold icon or abstract shape.
-   **User Bubbles**:
    -   Background: `rgba(212, 175, 55, 0.1)` (Low opacity gold)
    -   Border: `1px solid var(--accent-gold-dim)`
    -   Text: `Inter` Regular (400), `text-white`
-   **Input Area**:
    -   Background: Transparent
    -   Border-top: `1px solid var(--border-subtle)`
    -   Typography: `Cormorant Garamond` Italic for placeholder text ("Tell me about your childhood...").

### B. Life Timeline
A vertical or horizontal journey that feels like browsing a museum exhibit.

-   **Line**: A thin, vertical line in `var(--border-subtle)` that lights up with a gold gradient as you scroll.
-   **Nodes (Events)**:
    -   Default: Small gold dots (`6px`).
    -   Major Events: Large glass circles with icons.
    -   Hover: Glow effect `box-shadow: 0 0 15px var(--accent-gold-dim)`.
-   **Cards**:
    -   Style: Glassmorphic cards.
    -   Date: `Cormorant Garamond` Italic, `text-gold`.
    -   Title: `Playfair Display`, `text-white`.
    -   Media: Grayscale images that become color on hover.

### C. Life Chapters Dashboard
The overview of the user's autobiography.

-   **Grid**: Masonry or Bento-box style grid.
-   **Chapter Cards**:
    -   Large, cinematic typography for chapter numbers (e.g., "01", "02").
    -   Background: Deep gradients or subtle texture.
    -   Progress: Thin gold progress bars (`1px` height).
-   **Section Headers**: Centered, `Playfair Display`, with a small gold separator line below.

### D. Profile & Settings
Personal details and account management.

-   **Avatar**: Large circle with a gold border ring.
-   **Form Fields**:
    -   Background: Transparent or `rgba(255,255,255,0.02)`.
    -   Border: Bottom border only (`1px solid var(--border-subtle)`).
    -   Focus: Border color transitions to `var(--accent-gold)`.
    -   Label: `Inter` Uppercase, tracking-widest (letter-spacing `0.1em`), `text-secondary`, small size (`0.75rem`).

---

## 3. Implementation Steps

1.  **Tailwind Config**: Add custom colors and font families.
2.  **Global CSS**:
    -   Import fonts from Google Fonts.
    -   Set root variables.
    -   Add `.grain-overlay` utility.
    -   Set default background and text colors.
3.  **Components**: Refactor existing components to use new utility classes (e.g., `bg-void`, `font-serif-display`).
