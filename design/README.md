# Crosswalk design and development

[Play Crosswalk](https://bensonlee5.github.io/crosswalk/) · [Player guide](https://bensonlee5.github.io/crosswalk/guide/) · [Main README](../README.md)

This is the developer and design reference. It includes detailed mechanics and story spoilers. The main README is for players; existing source documents stay at their original `docs/` paths so links remain stable.

## Start here

- [Monthly life design](monthly-life.md): story structure, regions, economy, habits, and lasting achievements.
- [Presentation and interaction](presentation-and-interaction.md): sound, architecture, clock, paintings, seasons, tutorial, and activity invitations.
- [Historical editions and compatibility](historical-editions.md): earlier scoring, weekly balance, reliability work, and save-version context.
- [Architecture, development, and deployment](development.md): local setup, Vite/React frontend, Supabase backend, GitHub Pages, configuration, and save ownership.
- [Verification guide](verification.md): checks, report links, and limits of the evidence.

## Deeper references

### People and game systems

- [Cast relationships](../docs/CAST-RELATIONSHIPS.md), [character histories](../docs/CHARACTER-HISTORIES.md), [cast integration](../docs/CAST-INTEGRATION.md), and [cast simulation](../docs/CAST-SIMULATION.md)
- [Earlier life-story design research](../docs/LIFE-STORIES-DESIGN.md)
- [Earlier gameplay improvement plan](../docs/GAMEPLAY-IMPROVEMENT-PLAN.md)

### Client, assets, and operations

- [GitHub Pages frontend](../docs/github-pages-frontend.md), [Supabase backend](../docs/SUPABASE-BACKEND.md), and [save/recovery contract](../docs/SAVE-RECOVERY.md)
- [Coordinated release handoff](../docs/NEXT-RELEASE.md) and [backend migration manifest](../docs/SUPABASE-MERGE-MANIFEST.md)
- [3D client architecture](../docs/game-client-architecture.md): original renderer rationale and implementation; its D1/API and activity-count references describe the earlier release
- [Asset inventory](../docs/assets.md), [town provenance](../docs/town-art-provenance.txt), [location provenance](../docs/location-art-provenance.txt), and [Westside provenance](../docs/westside-art-provenance.txt)
- [Usage-count design](../docs/USAGE-COUNT.md)
- [Historical Cloudflare deployment](../docs/deployment.md): reference only; use the current development guide for GitHub Pages/Supabase

## Where the old README content went

- The Play link, premise, getting started, controls, and essential save caveats remain in the [main README](../README.md).
- “Monthly life stories edition,” including its verification subsection and research link, moved to [monthly life](monthly-life.md).
- “Earlier reliability and balance update” and “Earlier neighborhood gameplay update,” including gameplay checks, moved to [historical editions](historical-editions.md).
- “Sound, architecture, and action-time clock” and “Painted seasons redesign,” including illustrated choices, tutorial, and place invitations, moved to [presentation and interaction](presentation-and-interaction.md).
- “Framework and deployment,” including deployment status, existing games, local setup, public variables, setup checklist, and official references, moved to [development](development.md).
- The [verification guide](verification.md) links the preserved checks and reports in one place.

No original `docs/` file was removed or relocated. Hosting text reflects the public GitHub Pages release and guest-only access; email verification/recovery still needs provider checks. Earlier weekly rules and historical test limitations are explicitly labeled, rather than presented as today's player instructions.
