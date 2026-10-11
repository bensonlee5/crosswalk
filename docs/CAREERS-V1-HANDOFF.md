# Venue careers and recovery handoff

Implementation checkpoint, 2026-10-11. No publication performed.

## Delivered rules

- Four actual venue ladders: café service, workroom technical, makerspace practical, community civic. Each town uses its existing named venues and employer wage adjustment. Fixed postings and independent commitments cover other existing paid work; shared supper and story gigs retain their own consent and accounting.
- Entry needs no earlier job/contact. Application costs 1 block/$0 and shows the expected evaluation. An offer requires separate free acceptance. No employment or wage is committed by navigation. A shorter paid commitment is available after acceptance; there is no separate probation mechanic.
- Main work: 160 paid hours/2 blocks, or 40/1, or 200/3. All paid channels share the 200-hour monthly cap. Work requires its employer's actual region and venue. Main contracts persist; fixed agreements expire at month end.
- Skilled roles need relevant paid work and foundation preparation; lead roles need sustained experience, actual skilled-role work and advanced preparation or the stated longer reference route. Fields do not substitute for one another. Practical foundation training cannot be skipped through friendship.
- Foundation: Campus 2 blocks/$600 or Library 3/$0. Advanced: Campus 3/$900 or Library 4/$0, after foundation and relevant entry experience. Preparation awards once.
- Leads come from specific people's authored networks. References require actual same-field shared work and a later eligible conversation. Exact persisted receipt semantics exclude refusal, pressure, strain, withdrawal and repair-only actions; a later friendly exchange can qualify. Capped relationship values remain valid. Per-field colleague evidence preserves multi-field work. Historical references are not silently revoked.
- New private CareerNotice records announce newly earned leads/references in the triggering NPC scene. Routes, travel, applications and acceptance remain separate choices. Replay and reload preserve notices and deterministic career-response familiarity variants.
- Unpaid household bills become arrears. The second consecutive missed settlement starts recovery: shared housing without refund, one administration block/month, paid tuition/studio upgrades paused, and 20% of take-home wages repaying arrears. Free learning, entry applications, relationships and work remain accessible. Restructuring to two shared bills is explicit; the ceiling stays fixed through that recovery. Exit requires zero arrears and two on-time bills. Explicit extra repayment protects the current household bill.

## Compatibility and integration

Base: 5b3c992, plus legacy board checkpoint 85e2e4c. New mode is explicit create input `careerMode:'venue'`; omitted input is legacy and other values reject. New rooms receive careerVersion=1 and financialRecoveryVersion=1 together. No resume migration. Player.job remains an unused legacy compatibility field in this mode.

The release owner merges independent incidents/capability commits. Preserve `careerMode`, `actionIncidents`, and `supportedRules` in pending saves. Set career/finance markers before the shared capability check. Direct createGame fixtures in careers, financial-recovery, and venue-board tests need supportedRules after that merge; do not weaken the capability gate.

New UI: default export VenueCareerBoard. Props: g,p,disabled,onAction(id):Promise<unknown>,onVisit(place,careerActionId?), optional onWorldChoice(choiceId),onSharedOpportunity(actionId),focusActionId. onVisit navigates/focuses only. Use the legacy CareerBoard in unmarked rooms. GameScreen/Home routing and help are the integrator's work.

Domain exports: careersEnabled, careerChoices, careerView, careerCurrentRole, careerNoticesForAction. A fresh player has no contract. Life and score adapters use actual field work, including the first paid-gig foothold.

CareerNotice: {id,actionId,actorId,round,kind:'lead'|'reference',leadId,region,place,employer,regionName,speech}. Stored only under private p.career.notices. Match action/actor/round in the confirmed person receipt. An action can yield both its first lead and a reference. Do not append notices to public journals or logs.

Successful move wrapper captures paid hours before moveCore, then records exact-action career evidence after success, refreshes venue-mode life progress, and records familiarity once. Preserve the incident owner's pre-action capture and after-success commit ordering during merge.

## Economic evidence

The actual complete recurring cycle was exercised for all 25 home/employer pairs across 8 seasonal rounds: home → employer → work → home → free rest → settlement, with real map fares/blocks, weather and administration. Application time is disclosed separately from this recurring cycle.

Worst case: Pelagia home / Ember Mesa entry employer: $2,253 after wage repayment, $2,250 household bill, $1,200 round-trip fares = −$1,197/month. The application and offer warn before acceptance and show a home-town alternative. Not every cross-town commute is viable.

Local entry margins after repayment and shared bills: Alder $608, Saffron $655, Glasssteppe $890, Pelagia $515, Ember Mesa $753. All five zero-cash households recovered after two missed bills by month 6 or earlier through reachable local entry work, free rest, and explicit bill-safe surplus repayments. No wage/bill numerical patches were introduced.

## Validation and limits

- Full serial aggregate: 571/571 passed before the final narrow review corrections.
- Final source: 69 focused engine/finance/story/UI/compatibility tests; 28 exact-bundle PostgreSQL tests passed.
- Final frontend/backend types, targeted lint, engine mirror parity, Deno edge check and production build passed.
- Exact final engine bundle: 706452 bytes, SHA-256 223ce520283d5fc9cf5e2d71f7b6080eb2317b4e38141ec19cce00e750ab2234.
- Durable logs and exact bundle: ../crosswalk-career-validation-20261011/. The final combined aggregate remains the release owner's gate after adjacent UI/capability/incident merges.
- Native SSR and real-handler tests cover navigation-only callbacks, private/disabled guards, responsive CSS and confirmation state. These are not browser/mobile playtests. No localhost browser fallback or deployment was used.
