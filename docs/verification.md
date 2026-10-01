# Verification

## Verified during the October 1, 2026 export

On Linux with Node 24.19.0 and npm 11.9.0:

- Locked dependency install: passed (704 packages)
- Rules tests: passed (60 activity previews, 24 bill previews, all location/resource gates, old saves, travel, stale-snapshot guard and eight-week finish)
- TypeScript: passed
- Production Worker/client build: passed
- Initial SQL applied to fresh local D1: passed
- Built Worker page and two-guest API smoke test: passed (create/join/start, persistence/reload, turn ownership, idempotency, stale-version rejection, rewards, turn handoff and filtering of private membership fields)

The restricted environment used writable npm cache and XDG configuration locations through local environment variables. Ordinary writable developer environments can use the README commands directly. The build reported a large-client-chunk advisory and Vinext's route-classification limitation; neither prevented the build or API checks. No fresh lint run or comprehensive dependency/security audit was performed. No GitHub workflow is configured.

After an execution-environment reset, source was recovered from the same exact release before publication; game implementation and dependency versions are unchanged.

## Earlier current-release QA

September 30 testing covered two online guests and all 15 destinations. Desktop (1180×757) and phone-sized (400×606 CSS pixels) browser QA covered scene rendering, building selection, orbit controls, Places travel, rewards and saved reload. The browser disabled WebGL, so those checks used Three.js SVGRenderer on the same meshes.

## Not yet verified

Hardware WebGL lighting/shadows/materials, real iPhone/Safari, physical touch/pinch, measured hardware framerate and battery behavior, load/abuse resistance, comprehensive accessibility, formal security review and a standalone Cloudflare production deployment.

The existing live deployment was not changed during repository publication.
