# Design System - MASA Travel App

This document outlines the visual identity, typography hierarchy, spacing systems, and component design tokens for the **MASA** travel website.

---

## 🎨 Colors

Our website uses a premium dark-themed glassmorphism aesthetic with subtle, flat purple and blue accents to maintain high readability.

*   **Primary:** `#9d4edd` (Accent Purple) - Used for primary buttons, active navigation indicators, and key highlighted icons.
*   **Secondary (Card):** `rgba(20, 22, 37, 0.45)` - Semi-transparent dark slate card background.
*   **Background:** `#090a0f` (Midnight Navy / Deep Space Dark) - Deep background color.
*   **Accent:** `#4ea8de` (Sky Blue) - Used for map indicators and coordinates labels.
*   **Success:** `#52b788` (Emerald Green) - Used for completed checklist items and positive budget statuses.
*   **Error / Alert:** `#ff70a6` (Soft Pink) - Used for budget overrun warnings, missing GPS EXIF warnings, and delete icons.
*   **Text Primary:** `#ffffff` (Pure White) - Main body text and titles.
*   **Text Secondary:** `#9499b7` (Muted Blue Slate) - Descriptions, tags, and timestamps.
*   **Text Muted:** `#5c607a` (Dark Slate Muted) - Disabled or secondary labels.

---

## 📁 Typography

We use **Outfit** as our primary font family to deliver a clean, modern aesthetic.

*   **Primary Font:** 'Outfit', sans-serif (imported from Google Fonts)
*   **Headings:** Bold weight, sizes `24px` to `32px`, Color: `#ffffff`.
*   **Body Text:** Regular weight, size `16px`, line-height `1.5`, Color: `#ffffff`.
*   **Captions / Labels:** Medium weight, size `12px` to `14px`, Color: `#9499b7`.

---

## 📏 Spacing & Geometry

Consistent grids maintain vertical alignment and visual order across all pages.

*   **Base Unit:** `8px` (margins, paddings, and gaps must be multiples of 8: `8px`, `16px`, `24px`, `32px`).
*   **Card Padding:** `16px` or `24px` (depending on screen density).
*   **Border Radius:** `16px` for cards, timeline posts, and popups; `10px` for navigation tabs and `8px` for secondary buttons.
*   **Gap between elements:** `16px` or `24px`.

---

## ⚙️ Components

### 1. Buttons
*   **Solid Primary:** Purple background (`#9d4edd`), rounded corners (`10px`), white bold text, with hover scaling effects.
*   **Secondary/Delete:** Muted backgrounds (`rgba(255,255,255,0.04)`), transitions to Pink border and text (`#ff70a6`) on hover.

### 2. Cards (Glassmorphism)
*   Background: `rgba(20, 22, 37, 0.45)`
*   Blur: `blur(20px) saturate(180%)`
*   Border: `1px solid rgba(255, 255, 255, 0.08)`
*   Highlight: `inset 0 1px 0 rgba(255, 255, 255, 0.1)`

### 3. Inputs
*   Frosted search bars and text inputs, displaying a thin purple border (`#9d4edd`) when in focus.

### 4. Navigation
*   **Top Navbar:** Extremely translucent, premium glassmorphism background (`blur(30px) saturate(240%)`), featuring a thin bottom border (`rgba(255, 255, 255, 0.08)`) and an inset specular glass highlight (`rgba(255, 255, 255, 0.18)`). Active links are emphasized with purple text and a subtle backdrop background (`rgba(157, 78, 221, 0.12)`).
