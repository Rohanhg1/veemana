---
name: ClearLedger
colors:
  surface: '#041329'
  surface-dim: '#041329'
  surface-bright: '#2c3951'
  surface-container-lowest: '#010e24'
  surface-container-low: '#0d1c32'
  surface-container: '#112036'
  surface-container-high: '#1c2a41'
  surface-container-highest: '#27354c'
  on-surface: '#d6e3ff'
  on-surface-variant: '#c2c6d2'
  inverse-surface: '#d6e3ff'
  inverse-on-surface: '#233148'
  outline: '#8c919c'
  outline-variant: '#424751'
  surface-tint: '#a4c9ff'
  primary: '#a4c9ff'
  on-primary: '#00315d'
  primary-container: '#185fa5'
  on-primary-container: '#c1d9ff'
  inverse-primary: '#1960a6'
  secondary: '#a6e6ff'
  on-secondary: '#003543'
  secondary-container: '#14d1ff'
  on-secondary-container: '#00566b'
  tertiary: '#4ae183'
  on-tertiary: '#003919'
  tertiary-container: '#006c36'
  on-tertiary-container: '#5ef292'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#d4e3ff'
  primary-fixed-dim: '#a4c9ff'
  on-primary-fixed: '#001c39'
  on-primary-fixed-variant: '#004883'
  secondary-fixed: '#b7eaff'
  secondary-fixed-dim: '#4cd6ff'
  on-secondary-fixed: '#001f28'
  on-secondary-fixed-variant: '#004e60'
  tertiary-fixed: '#6bfe9c'
  tertiary-fixed-dim: '#4ae183'
  on-tertiary-fixed: '#00210c'
  on-tertiary-fixed-variant: '#005228'
  background: '#041329'
  on-background: '#d6e3ff'
  surface-variant: '#27354c'
typography:
  h1:
    fontFamily: Public Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  h2:
    fontFamily: Public Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
    letterSpacing: -0.01em
  h3:
    fontFamily: Public Sans
    fontSize: 18px
    fontWeight: '600'
    lineHeight: '1.4'
  body-md:
    fontFamily: Public Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.6'
  data-tabular:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '500'
    lineHeight: '1.4'
    letterSpacing: 0.01em
  label-caps:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '700'
    lineHeight: '1'
    letterSpacing: 0.06em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 40px
  container-margin: 32px
  gutter: 20px
---

## Brand & Style

The design system is engineered to project an aura of absolute transparency, institutional authority, and technological precision. It targets government officials, auditors, and the Indian citizenry, requiring a visual language that balances the gravity of public finance with the modern efficiency of blockchain technology. 

The aesthetic is defined as **Corporate Glassmorphism**. It utilizes a sophisticated dark environment to reduce eye strain during long-form data analysis while using translucent "glass" layers to represent the "clear" nature of the ledger. The style is unapologetically data-dense, prioritizing information throughput and legibility over decorative whitespace. Every element must feel "government-grade"—stable, secure, and permanent.

## Colors

The palette is anchored in a deep Navy (#050B18), providing a high-contrast foundation for data visualization. The **Primary Accent (#185FA5)** is a traditional, trustworthy blue associated with Indian administrative excellence. 

Functional colors are critical for status reporting:
- **Success:** A vibrant Mint Green (#2ECC71) used for verified transactions and active schemes.
- **Alert:** A sharp Crimson (#E74C3C) for fund discrepancies or pending audits.
- **Surface Strategy:** Layers are built using varying opacities of white over the navy base, creating a sense of depth without moving away from the professional dark theme.

## Typography

This design system utilizes **Public Sans** for its institutional clarity and neutral tone, making it ideal for government contexts. To handle high data density, a secondary scale using **Inter** is implemented for tabular data and technical labels, benefiting from its superior legibility at small sizes.

Typography is treated with a strict hierarchy. Headlines are bold and compact, while body text maintains a generous line height (1.6) to ensure long audit reports remain readable. Monospaced numeric variants should be used for all currency and blockchain hash displays to ensure vertical alignment in tables.

## Layout & Spacing

The system employs a **12-column fluid grid** designed for desktop-first administration dashboards. Spacing is governed by a strict **4px baseline grid** to maintain high information density without feeling cluttered.

- **Dashboard Layout:** A fixed left-hand navigation (240px) with a fluid content area.
- **Data Density:** Gutters are kept tight (20px) to maximize horizontal space for complex tables containing scheme names, disbursement dates, and transaction IDs. 
- **Information Blocks:** Content is grouped into logical "Modules" with 24px internal padding, ensuring that even with high density, the relationships between data points are clear.

## Elevation & Depth

Depth is achieved through **Glassmorphism** rather than traditional drop shadows, symbolizing the transparency of the blockchain ledger.

1.  **Level 0 (Base):** Deep Navy (#050B18).
2.  **Level 1 (Cards):** Backdrop blur of 16px-20px with a subtle `rgba(255, 255, 255, 0.03)` fill and a 1px solid `rgba(255, 255, 255, 0.1)` border.
3.  **Level 2 (Modals/Popovers):** Higher blur (30px) and a slightly brighter border to pull the element forward.

This system avoids heavy shadows, opting instead for "light-leak" borders (top and left borders slightly brighter than bottom and right) to simulate a subtle light source from the top-left.

## Shapes

The shape language is **Professional and Controlled**. A corner radius of **4px (Soft)** is the standard for cards, buttons, and input fields. This sharp-yet-refined radius communicates precision and aligns with the geometric nature of data grids. 

Status badges and tags utilize a slightly more rounded profile (12px or full pill) to distinguish them from structural UI elements. All icons are contained within a square 24px bounding box with 2px stroke weights.

## Components

### Status Indicators
- **Live Pulse:** Active fund transfers are indicated by a 12px Mint Green dot with a concentric, expanding pulse animation (50% opacity).
- **Verification Badges:** Small 20px circular icons with a checkmark, utilizing the Primary Blue to indicate a transaction has been confirmed on the blockchain.

### Data Tables
- **Header:** Darker than the row background, using the `label-caps` typography style.
- **Rows:** Subtle hover state change (increase background opacity to 0.08). 1px border-bottom separators only.

### Glass Cards
- Used for scheme overviews (e.g., MGNREGA Total Spend).
- Must include a subtle top-inner-glow to enhance the glass effect.

### Buttons
- **Primary:** Solid #185FA5 with white text. No gradients.
- **Secondary:** Ghost style with the `border_glass` and white text.

### Inputs
- Dark-filled, low-contrast borders. On focus, the border transitions to Primary Blue with a 2px outer glow (glow color: #185FA5 at 20% opacity).