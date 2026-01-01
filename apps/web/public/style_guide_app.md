Style Guide: Nality "The Archive" Edition
Design Philosophy: "Cinematic Permanence."
The interface is designed to feel like a high-end physical object—a luxury watch or a leather-bound archive. It uses deep blacks, liquid gold accents, and typographic contrast to elevate mundane memories into significant artifacts.
Core Aesthetic Qualities:
The Void: Deep, near-black backgrounds (#050505) to reduce eye strain and focus attention.
Liquid Gold: Used sparingly to indicate value, action, and "current" states.
Editorial Typography: A mix of high-contrast display serifs and clean, tracked-out sans-serifs.
Tactility: Grain textures and glass blurs to give the digital space physical depth.
1. Foundations
1.1 Color Palette
We avoid pure black (#000) to maintain warmth. We use a "Gold & Stone" system.
Semantic Name	Hex Value	Tailwind Class	Usage
Void (Bg)	#050505	bg-[#050505]	Main app background.
Surface	#0A0A0A	bg-[#0A0A0A]	Cards, Headers, Sidebars.
Gold Primary	#D4AF37	text-[#D4AF37]	Primary Actions, Active States, Key Icons.
Gold Light	#FBF5B7	text-[#FBF5B7]	Gold Gradients, Highlights.
Gold Dim	#8A7020	text-[#8A7020]	Borders, Muted Gold accents.
Ink Light	#E5E5E5	text-stone-200	Primary reading text.
Ink Muted	#737373	text-stone-500	Metadata, timestamps, inactive icons.
Border	rgba(255,255,255,0.08)	border-white/10	Subtle separation lines.
Gradients
Gold Text: linear-gradient(135deg, #fbf5b7 0%, #D4AF37 50%, #b38728 100%)
Dark Fade: linear-gradient(180deg, rgba(20,20,20,0.6) 0%, rgba(20,20,20,0) 100%)
1.2 Typography
A Tri-Type System separates UI navigation from the Narrative content.
A. Display: Playfair Display
Used for Chapter Titles and "The Brand."
Usage: Large headers, "Nality" logo.
Style: font-display text-3xl tracking-wide
B. Narrative: Cormorant Garamond
Used strictly for Memories and Biography text. Gives a "book-like" feel.
Usage: Memory cards, The Book view.
Style: font-serif text-xl md:text-2xl leading-relaxed font-light
C. UI/Meta: Inter
Used for navigation, timestamps, buttons, and labels.
Usage: Sidebar, Dates, Buttons, Metadata.
Style: font-sans text-[10px] uppercase font-bold tracking-[0.2em]
1.3 Texture & Effects
The Grain Overlay
A fixed SVG noise filter applied over the entire viewport to reduce digital harshness.
code
CSS
.grain-overlay {
    position: fixed;
    opacity: 0.04;
    pointer-events: none;
    background-image: url("data:image/svg+xml,..."); /* SVG Noise */
}
Glassmorphism (The Lens)
Used for sticky headers and mobile navigation to blur content scrolling underneath.
backdrop-blur-md bg-[#050505]/90
2. Component Library
2.1 Buttons
The "Jewel" FAB (Primary Action)
The most prominent button on the screen.
Shape: Full Pill (rounded-full)
Fill: Solid Gold (bg-[#D4AF37])
Text: Black (text-black), Uppercase, Bold.
Shadow: Glow Effect (shadow-[0_0_30px_rgba(212,175,55,0.2)])
Hover: Scales up (scale-105), Shadow expands.
The "Ghost" Nav Item
Used in the sidebar and headers.
Default: text-stone-500
Hover: text-white or text-[#D4AF37] (Gold).
Active: bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20
The "Artifact" Action (Secondary)
Used for internal card actions (e.g., "View Memories").
Style: Text-only, Uppercase, Small.
Border: border-b border-transparent hover:border-gold
2.2 Cards (The Atoms)
The Memory Atom
Container: bg-gradient-to-b from-[#141414] to-transparent
Border: border border-white/10
Radius: rounded-sm (Sharp, precise corners).
Hover:
Border becomes border-gold/30
Background slightly lightens.
Content: Large Serif typography (text-stone-300).
The "Soft Trigger" (Emergent UI)
A special card that invites the user to take a new action (e.g., "Pattern Detected").
Background: bg-gradient-to-br from-[#D4AF37]/10 to-transparent
Border: border border-[#D4AF37]/20
Icon: Includes a large, decorative background icon at opacity-5.
2.3 The Timeline (Chapter Nodes)
Visualizing time in the "Chapters" view.
Connector Line: border-l border-white/10
Current Node:
Dot: bg-[#D4AF37] shadow-[0_0_15px_#D4AF37]
Card: bg-[#0A0A0A] border-gold/40
Past Node:
Dot: bg-[#1A1A1A] border border-stone-600
Card: opacity-70 hover:opacity-100
2.4 Modals (The Void)
The Compose Window
A distraction-free input mode.
Backdrop: bg-black/90 backdrop-blur-xl
Container: bg-[#0F0F0F] border border-white/10
Animation: Slides up from bottom (translate-y-20 → 0).
Input Field:
Huge Serif font (text-3xl).
Transparent background.
No border (focus:outline-none).
3. Iconography (Lucide React)
All icons are stroke-width: 1.5px to maintain elegance.
Icon	Concept	Usage	Color Style
BookOpen	Biography	Nav / Read Mode	Gold or Stone
LayoutGrid	Stream	Nav / Feed Mode	Gold or Stone
Network	Chapters	Nav / Patterns	Gold or Stone
Mic	Voice	Capture / Meta	Stone-500
Sparkles	AI Insight	Analysis / Magic	Gold
Plus	Capture	FAB Icon	Black (on Gold)
4. Layout & Spacing
4.1 The Golden Ratio
We use generous whitespace to create a feeling of luxury.
Margins: px-6 md:px-12 (Wide gutters).
Vertical Rhythm: Elements are often separated by mb-8 or mb-12.
Text Width: max-w-md (Stream) or max-w-2xl (Book) for optimal reading line length.
4.2 Sticky Headers
Headers are functional but unobtrusive.
Height: h-20
Background: Gradient Fade + Blur.
Interaction: Content flows under the header, blurring out as it exits the viewport.
5. View Specifics
5.1 The Book View (Export)
Paper: bg-[#050505] (Dark Mode Book).
Typography: Strict Cormorant Garamond.
Drop Caps:
float-left text-5xl text-[#D4AF37] font-display mr-3
Decoration: Center-aligned "Chapter" tags with wide tracking.
5.2 The Stream View (Feed)
Date Dividers:
text-[10px] font-bold uppercase text-[#D4AF37]
h-[1px] bg-gradient-to-r from-gold/20 to-transparent
6. Implementation Snippet (Tailwind Config)
Copy this configuration to ensure style consistency.
code
JavaScript
tailwind.config = {
    theme: {
        extend: {
            colors: {
                bg: '#050505',
                surface: '#0A0A0A',
                border: 'rgba(255, 255, 255, 0.08)',
                gold: { 
                    DEFAULT: '#D4AF37', 
                    dim: '#8a7020',
                    light: '#fbf5b7',
                    glow: 'rgba(212, 175, 55, 0.15)' 
                }
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                serif: ['Cormorant Garamond', 'serif'],
                display: ['Playfair Display', 'serif'],
            },
            backgroundImage: {
                'gold-gradient': 'linear-gradient(135deg, #fbf5b7 0%, #D4AF37 50%, #b38728 100%)',
                'dark-gradient': 'linear-gradient(180deg, rgba(20,20,20,0.6) 0%, rgba(20,20,20,0) 100%)',
            },
            animation: {
                'fade-in-up': 'fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
            },
            keyframes: {
                fadeInUp: {
                    '0%': { opacity: '0', transform: 'translateY(20px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                }
            }
        }
    }
}