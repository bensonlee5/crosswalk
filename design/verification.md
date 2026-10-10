# Verification guide

[Design and development index](README.md)

Use the [development workflow](development.md#local-setup-and-checks) for the current checkout. Test commands and coverage descriptions moved out of the main README remain beside the systems they verify:

- [Monthly life](monthly-life.md#verification): versioned saves, economy, stories, previews, and campaign simulation.
- [Earlier reliability and balance](historical-editions.md#earlier-reliability-and-balance-update): interrupted requests, stale responses, old-save comparisons, and balance simulations.
- [Earlier gameplay checks](historical-editions.md#gameplay-checks-node-24): original previews, shared-world mechanics, and legacy route integration.
- [Presentation and interaction](presentation-and-interaction.md): audio, clock, seasonal rendering, action art, tutorial, and place invitations.
- [Current release handoff](../docs/NEXT-RELEASE.md), [cast simulation](../docs/CAST-SIMULATION.md), and [cast integration](../docs/CAST-INTEGRATION.md): integrated-release evidence, compatibility, and known limits.
- [Save and recovery contract](../docs/SAVE-RECOVERY.md): guest ownership and authentication verification requirements.

## Existing reports

The original report paths remain stable:

- [Gameplay and balance](../docs/GAMEPLAY-VERIFICATION.md)
- [Painted seasons](../docs/PAINTED-SEASONS-VERIFICATION.md)
- [Action artwork](../docs/ACTION-ART-VERIFICATION.md)
- [Earlier export verification](../docs/verification.md), a historical Cloudflare/D1 report

Automated engine/API checks, static rendering, and mock clients do not establish human enjoyment, real email delivery, production permissions, mobile gestures, or hardware WebGL performance. Use the evidence and date attached to each report; do not combine historical observations into a claim that the current deployment has passed every check.
