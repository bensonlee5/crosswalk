# Venue employment, learning and job leads

Status: approved follow-on scope; implementation is separate from the existing audio, people, shared-work and familiarity release. No deployment is authorized by this document.

## What the player can do

- Visit a workplace as a visitor, talk to its people, or open its work desk.
- Apply to a specific role at that employer. The first entry role needs no experience or contacts. Applying costs one priority block and no money; accepting an offer costs neither. Acceptance is a separate choice and clearly states whether it replaces an existing main contract.
- Work only at the accepted role's physical venue. Regular and shorter commitments consume the same real monthly paid-hours budget as all other paid work. A contract never charges time or pays wages automatically.
- Build relevant experience by completing paid work. Experience is field-specific; public labels describe actual stages rather than numerical points.
- Attend a named class for a selected field at Campus, or use a longer free preparation option at the Library. Classes cost real time, and paid classes disclose tuition. A course completes once; clicking it again cannot farm a credential.
- Hear an actual person's lead or reference, sometimes to another venue or town. A lead is information; a reference is evidence; an offer is a separate employer decision; accepting is the player's decision.

## Bounded first release

Four employer ladders, using existing place IDs and canonical regional venue names:

| Field | Main workplace | Roles |
| --- | --- | --- |
| Service | Corner café | Café crew → barista → shift lead |
| Technical | Workrooms | Support assistant → technical specialist → project lead |
| Practical / creative | Makerspace | Workshop assistant → repair maker → workshop lead |
| Civic | Community hall | Pantry assistant → community coordinator → programme lead |

The five towns reuse these rules and their own named venues and wage adjustments. They do not get 75 separate invented economies. Actual regional hosts and existing work content remain distinct.

Other paid venues receive explicit fixed-term postings: market stall, fitness desk, cinema usher, arcade desk, library digitization, campus tutoring, transit courier/repair, and garden harvest. These build relevant field experience but do not imply an authored senior ladder at every small venue. Independent pop-ups and commissions remain clearly labeled self-directed or commissioned work. Shared meal preparation and local-opening stipends remain bounded gigs, with their existing public eligibility and receipt rules.

All ordinary paid action IDs need an explicit mapping or a deliberate independent-gig exemption in the new rules. The old generic WORK shifts and APPLY must not silently bypass contracts.

## Hiring and advancement

- Entry: a public opening, no earlier job, no friendship gate. An affordable first application plus a regular commitment fits the first month's six priority blocks. After accepting an entry role, a paid short commitment provides a smaller start; there is no separate probation or unpaid trial mechanic.
- Skilled: relevant paid work plus field preparation. A grounded professional reference can replace one preparation condition where the posting explicitly permits it; it cannot replace all experience and cannot bypass safety-related practical training.
- Lead: sustained relevant work plus advanced training, or a longer workplace-learning route and an earned professional reference. Each posting shows every unmet condition and an actionable next step.
- Repeated conversation text, canceled previews, failed actions and request retries never build evidence. One witnessed achievement or conversation produces one durable lead/reference ID.
- Changing fields preserves past experience and training, but advanced experience in one field does not automatically qualify someone to lead another.
- Applications return an offer or a not-yet-qualified response. A rejection consumes only the disclosed application time and gives a useful route forward. Pure previews show the expected evaluation first, so players need not pay time to discover a hidden gate.
- A contact is not automatically the employer. NPC hiring dialogue is used only where the person's authored role supports it; otherwise the employer sends a written desk response. No imaginary interviewer or forced NPC presence is introduced.

## Canon-grounded leads

Initial examples to implement against accepted interactions:

- Tess can point from café work to Alder's ferry/transit rota; she is both café owner and evening ferry dispatcher.
- Neri can introduce a prepared applicant to Esme's archive in Pelagia; their previous archive placement is already part of both characters' histories.
- Tomas and Leila can point to each other's repair and market work in Saffron Reach; they are siblings with a documented working relationship.
- June can point to Inez's local library/garden work; their joint projects are in the existing histories.
- Jo and Oren's reciprocal repair work can ground a bounded theatre/stage or making opportunity, rather than a generic friendship reward.

A new lead can reveal a destination and its contact, but it never moves the player, pays travel, submits an application, accepts an offer, or promises hiring.

## Version and save contract

New rooms alone receive Game.careerVersion = 1. On explicit room/player creation only, create:

Player.career = {
  version: 1,
  revision: 0,
  experience: {},
  training: {},
  leads: {},
  offers: {},
  contracts: [],
  receipts: []
}

No marker means the existing job ladder and exact existing action/pay behavior. The legacy board remains available there. Reads never add a marker, reset a job, award historical experience, or infer credentials from old point totals. Existing rooms are not silently migrated. New career play requires a new room in this first release.

The existing Player.job remains a legacy compatibility field. New-career UI must derive current work from accepted contracts, not display an unrelated café/IT/UX title. Shared life summaries and milestones need a narrow new-version adapter before release; no new role may accidentally be described as a legacy technical promotion.

Experience, application reasons, referrals and private receipts are owner-only. An optional public employment summary may contain accepted role and workplace only. Public views must not derive eligibility from redacted state.

## Authoritative command contract

New independent modules: career-content.ts (roles, postings, courses and leads), careers.ts (pure views, eligibility, quotes and authoritative resolvers), and new-career UI/helper/tests. Existing board remains a legacy rendering branch.

Commands are revision-bound: career:<round>:<careerRevision>:<verb>:<target>. The resolver requires the current authenticated player, active turn, correct region and physical venue, current revision, resources and unmet/fulfilled hiring conditions. Validate everything before changing state. Every accepted command records an exact receipt; replay returns the prior result with no additional cash, hours, training, offers or experience.

Integration hooks, owned by the release integrator after the shared-engine freeze:

1. Game/Player type fields and explicit new-room initialization in authoritative service and legacy test route.
2. Career command dispatch and ordinary paid-action gating, before mutation.
3. A post-success evidence hook using the already captured accepted action context and actor IDs. Read-only previews and failed/replayed commands do not reach it.
4. Privacy projection and response-shape tests for online observers.
5. Shared-engine source parity manifest.
6. Venue visitor/work/class entry points and receipt presentation. Host scenes use the existing confirmed-success presenter; unconfirmed requests never show an offer, paycheck, expression or sound.
7. New-version current-role and life-progress adapters.

## Verification before merging

- First paid role without prior experience, contacts, unaffordable tuition or a circular prerequisite.
- Actual application, separate acceptance, correct-venue work and exact pay/time/paid-hour accounting.
- Each ladder's real skilled/lead requirements, cross-field changes and useful rejection paths.
- Courses, free preparation, time competition and no credential/repeat farming.
- Conversation-triggered cross-venue and cross-town leads; no generic relationship-point guarantee.
- Replay, stale revisions, two-request races, privacy, region travel, employer identity and role replacement consent.
- Every old paid action classified, no contract bypass, no duplicated experience from the compatibility hook.
- Old-room serialized fixtures unchanged and full engine-copy/backend parity.
- Eight-month budgets for each field, training-heavy and travel-heavy runs, versus monthly bills.
- UI keyboard/mobile/close/reopen/back/disabled flows through the supported test workflow. Static markup and native handler tests are explicitly not browser/mobile playtesting.

## Approved financial-recovery extension

The existing game allows negative cash indefinitely and applies only a mood consequence at month-end. Explicit venue-careers new rooms opt into financialRecoveryVersion = 1 alongside careerVersion = 1; old saves remain unchanged.

- Household bills use available cash; the unpaid amount becomes visible arrears, never new spendable money.
- A second consecutive unpaid settlement starts financial recovery. Its preview warns before the player ends the month.
- A studio returns to shared housing with no invented deposit refund. One priority block each month is reserved for administration, at most once. Studio upgrades and tuition-funded classes pause; free study, applications, work, recovery and relationships remain open.
- During recovery, twenty percent of take-home pay repays arrears. It is shown separately from gross withholding and materials in every affected quote, and committed exactly once.
- At recovery entry, arrears are explicitly restructured to a ceiling of two shared-home monthly bills. The ceiling stays fixed during that recovery, so moving between towns cannot repeatedly lower it for a windfall. Further restructuring is explicitly recorded, and continuing missed bills keep the restrictions active.
- Recovery ends when arrears are paid and two household bills are settled on time.
- Administrative time cannot compound during the same month. Housing surrender, tuition restrictions and absence of any cash refund prevent a buy-upgrade/default/refund loop.
- All five regions, each weather condition, entry employment, free preparation, grants, independent work, shared gigs, exact retries and repeated-default cases need verification. The minimum entry wage after repayment must cover actual shared bills; no untested wage/bill patch is authorized by this design.

Current draft domain functions are in financial-recovery.ts. Integration must adapt every paid preview and resolver together; a generic post-action hidden deduction would be incorrect. Existing story/life paid choices and shared meal preparation are part of that accounting, while refunds, grants and stipends that are not wages must not be automatically treated as paychecks.

## Integration and player-facing guide delta

- Explicit creation command: `careerMode: 'venue'`. Omission keeps original careers and finances; other values are rejected. Join initializes only a marked new lobby; reads/resume never migrate. The new client must preserve this field in pending-create retries.
- `VenueCareerBoard` receives `g`, `p`, `disabled`, `onAction`, `onVisit`, optional `onWorldChoice`, `onSharedOpportunity`, and `focusActionId`. Navigation only opens a preview. The shared confirmed-receipt controller owns execution; a real NPC is shown only when the committed receipt captured local presence. Otherwise the employer reply is written correspondence.
- Add a Work & learning entry, and a venue work-desk route. Keep the legacy `CareerBoard` for unmarked rooms. Display `careerCurrentRole(p)` rather than legacy `p.job` in venue mode. A new player has no contract yet.
- New careers use four field-specific ladders. Classes and free study cost actual priority blocks. Paid commitment hours, gross pay, withholding, materials, arrears repayment and resulting cash stay separate. No numeric experience/relationship score is needed in the board.
- Leads are information; professional references require having worked together; neither accepts an offer on the player’s behalf. Some leads point to a different town. Fixed commitments expire at the player’s month end; main contracts remain at their employer’s venue and region.
- One-off shared supper preparation and story/life gigs retain their own explicit offers and actual paid-hour accounting. They build relevant experience but do not silently replace the main contract.
- Recovery warning belongs in the end-month confirmation as well as the work board. `weekPreview` includes an optional exact `settlement`. A voluntary extra arrears payment uses only cash above the current household bill, addressing a single missed bill without forcing another default.
- Wage-minus-bill arithmetic is not a commute budget. A foreign employer’s application and offer show the actual map’s outbound + return fares/blocks, home bills, and a free rest block, with a warning for a deficit and a home-town alternative. The UI never automatically travels or relocates the player.
- Capability negotiation for both new careers and incidents is owned by the incident/release integration, not duplicated in this branch. Supported token for careers is `venue-careers-v1`.

Validation is engine/native SSR/handler coverage until the release owner integrates navigation and performs a supported browser pass. It is not browser/mobile playtesting.

- Career acknowledgments record deterministic familiarity stage and last-variant metadata on the authoritative receipt. Returning to the same role changes the written acknowledgment and actual host dialogue without altering pay, requirements or consent. Replay and reload preserve the exact recorded response.

## Final review corrections

References use the exact persisted interaction response, not a conversation namespace. Refusal, pressure, strain, withdrawal and repair-only actions award neither a new lead nor reference. Positive friendly semantics remain valid at a relationship cap, with authored per-person intent stored on venue-mode story receipts. Colleague evidence retains every field. Newly granted leads/references have private, exact-action notices for the confirmed person presenter. Paid public/shared gigs count toward the first field-work milestone immediately.
