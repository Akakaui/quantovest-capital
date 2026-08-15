# Quantovest Capital — Editorial Signal Design System

## Product posture

Quantovest is a premium copy-trading and investment platform with a public acquisition surface and two authenticated workspaces: a dark investor portal and a structurally separate dark admin console. The public experience should feel editorial and confident; authenticated experiences should feel operational, legible, and trustworthy.

## Color tokens

| Token | Value | Usage |
|---|---|---|
| Ink | `#0A0D0C` | Public dark canvas and high-emphasis surfaces |
| Panel | `#12161A` | Cards, ticker, and elevated dark surfaces |
| Panel raised | `#1A2528` | Hero device UI and active panels |
| Rule | `#263437` | Dark dividers and borders |
| Signal green | `#22C55E` | Primary action, positive movement, active state |
| Signal light | `#4ADE80` | Highlight text and chart peaks |
| Mist | `#A8ACB3` | Secondary text on dark backgrounds |
| Paper | `#F7F7F7` | Public light content sections only |
| Admin amber | `#F59E0B` | Admin-only operational identity and warnings |

Public light sections may use Paper and Ink when the section is explicitly editorial. Investor and admin routes must not fall back to white cards, light sidebars, or dark-on-dark unreadable text.

## Typography and layout

Use the existing sans family for navigation and explanatory copy, with the existing mono family for financial numbers, labels, tickers, and operational metadata. Headlines are large, tight, sentence-cased, and left-aligned. Prefer asymmetric two-column compositions over centered hero stacks. Use 8px spacing increments, 16–24px card radii, and restrained shadows.

## Icon rules

Use the existing Iconify icon set consistently at 16–20px for actions and 12–14px for metadata. Icons must support a visible label, never replace an essential label, and must not be emoji or decorative glyphs.

## Motion rules

Use opacity and transform transitions under 300ms for controls. The hero phone may drift subtly, but the real phone asset must remain legible and stable on mobile. Respect reduced motion by keeping the hero static and preserving all content and CTAs.

## Responsive contract

Desktop: two-column hero with copy on the left and phone composition on the right. Tablet: retain the two-column structure only when the copy remains readable; otherwise reduce device scale. Mobile: keep the copy left aligned, stack CTAs, and treat the phone as a cropped visual layer on the right without causing horizontal overflow.

## Accessibility contract

Maintain one h1 per page, visible focus rings, semantic buttons and links, descriptive image alt text, keyboard-accessible indicator controls, minimum 44px touch targets for primary actions, and sufficient contrast for body copy and financial values.

## Approved patterns

Use dark operational surfaces for authenticated routes, a single signal-green action hierarchy, clear status labels, and intentional section contrast. Avoid mixed light/dark cards inside one workspace, code-drawn device frames for the hero, decorative gradients that reduce text contrast, and testimonials or performance claims that are not user-supplied or verified.
