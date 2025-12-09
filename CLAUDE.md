# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

This is the website for the 2026 Collaborative Journalism Summit (CJS2026), the 10th anniversary edition of the annual event hosted by the Center for Cooperative Media and INN (Institute for Nonprofit News). The summit will be held in North Carolina in June/July 2026.

## Architecture

The site is a single-page React application served as static files:

**web/index.html** - Entry point that loads:
- React 18 via CDN (unpkg)
- Tailwind CSS via CDN
- Custom CSS from index.css
- bundle.js (the compiled React app)

**web/index-new** - React source code (JSX) containing the App component with:
- Navbar, Hero, InfoSection, HistorySection, Footer components
- Countdown and email signup functionality
- Timeline visualization of past summit history (2017-2026)

**web/index.css** - Custom CSS for animations, accessibility, and component styling

The React app uses Lucide icons and Montserrat font (Google Fonts). Brand color is #CA3553 (red).

## Directory structure

- **branding/** - Logo files (PNG) and favicon/icon assets
- **history/** - HTML archives of past summit schedules (2018-2025)
- **web/** - Production website files
- **design/** - Design assets (currently empty)
- **planning/** - Meeting notes and transcripts from CJS 2026 planning sessions (Fathom AI summaries)

## Event details

The 2026 Collaborative Journalism Summit (CJS 2026) is the 10th anniversary edition, hosted June 8-9, 2026 at UNC Chapel Hill's Friday Center in North Carolina. Co-hosted with INN (Institute for Nonprofit News), whose INN Days conference follows June 9-11.

**Current status (December 9, 2024)**:
- Venue: UNC Friday Center — budget negotiations ongoing (~$30k quote is over budget)
- Launch: Simple NC state graphic approved; complex 10th anniversary artwork in development
- Sponsorship: Targeting $15k-$20k before holidays (RJI dinner $8k, safety kits $3k, sporks)
- Keynote: Pursuing Kara Swisher via Wallace House introduction

Key planning decisions from meeting notes:
- Schedule: Monday afternoon start (keynotes, lightning talks, dinner), Tuesday full day of workshops
- Art direction: Timeline concept featuring iconic buildings from each past summit city leading to NC
- Session format: Likely invitation-only model (vs open pitches) given limited slots (~6)
- Target attendance: 130-150 for CJS portion
- Theme: "From experiment to ecosystem" — celebrating 10 years of collaborative journalism

## Content files

- `planning/CJS-10th-anniversary-themes.md` - Comprehensive 10-year analysis and theme recommendations
- `web/content/timeline-data.json` - Structured JSON for React timeline component
- `web/content/history-copy.md` - Website copy for history/timeline section

## Development notes

Currently a static site served via CDN. The index-new file contains raw JSX source that needs to be compiled to bundle.js.

Current stack:
- React 18 via CDN (unpkg)
- Tailwind CSS via CDN
- No build system configured yet (no package.json)

## Brand guidelines

- Primary color: #CA3553 (brand-red)
- Font: Montserrat for headings, Arial for body
- Dark theme: slate-900/slate-950 backgrounds
- Follow CCM style: sentence case for headlines, never title case
