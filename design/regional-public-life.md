# Settlement and public life

This small rule layer is automatic for newly created games. Earlier rooms, including rooms with climate gameplay but without this layer, retain their original exploration and participation rules.

## Settlement choices

Ordinary map navigation is still free. The deliberate **Explore** activity always costs one priority block and no cash; its route reflects how a place is built.

- Alder Quay, a compact working port: covered lanes can reveal two nearby services, with no outdoor exposure adjustment.
- Glasssteppe, a compact railway city: sheltered station galleries can reveal two nearby services, with no outdoor exposure adjustment.
- Saffron Reach, a spacious coastal suburb: open courtyard routes reveal one service and provide 6 base energy recovery.
- Pelagia, a small harbor town with hinterland: raised paths and outer gardens reveal one service and provide 6 base energy recovery.
- Ember Mesa, a dispersed rural settlement: longer open-land visits reveal one service and provide 10 base energy recovery.

The three open-route types receive the existing climate adjustment. Even in harsh weather, their recovery remains positive when starting at zero energy. At the energy ceiling, the normal resource clamp applies. Urban routes trade restoration for efficient service discovery and shelter. All routes stop when every open service is known; a city with only one remaining service reveals that one. Closed venues, unknown place IDs and shared-world closures are excluded by the existing discovery filters.

There are no new navigation fees, recurring charges, rent changes, wage changes or mandatory journeys. Essential arrival places and home recovery remain available.

## Local participation

The following public activities support authored regional interests without changing anybody’s individual personality:

- Alder: volunteering, community setup and shared skills.
- Saffron: café company, open mic, film groups and creative practice.
- Glasssteppe: reading, study and practical workshop learning or repair.
- Pelagia: garden care, public repair, ordinary-lives archiving and community setup.
- Ember: making, repair, gardening, reading outdoors and shared skills.

A visible, legal activity from the current region’s group can give one modest participation benefit each month: up to 2 additional happiness. The exact preview includes it. Its resource clamp runs after the base activity and weather bonus, so happiness never exceeds 100. No benefit is consumed if none can be received; a partial received benefit counts as that month’s participation. The per-player receipt persists across reload and travel, and cannot be farmed by moving between regions. Other players have their own receipt. Activities remain available after the benefit has been used.

The Places menu shows one legal local invitation alongside the existing story spotlight. It opens the normal activity preview without spending time or performing the activity. Busy, inactive, offline and moving states keep it disabled. The underlying invitation selector also retains urgent recovery and income needs. Normal prose describes community life and personal choice without internal thresholds, meters or counters. Extra happiness appears only in the optional exact-effects detail, already included in the total. Cash, social, skill and craft effects are unchanged.

## Implementation and checks

The automatic new-room marker is `regionalLifeVersion: 1`; missing and unknown markers are inert. Participation uses additive `Player.regionalLifeUsage`, keyed to the current month. Client/server modules and the generated engine manifest include `regional-life.ts`.

Regression tests cover all five regions, mild/hot/cold periods, zero/near-full/full energy, efficient and partial discoveries, shared closures, mapped-out routes, authoritative preview parity, duplicate receipts, ordinary navigation, essential alternatives, money invariants, visible activity gates, per-player ownership, serialized member snapshots, reload/travel caps, partial/full happiness and legal distinct invitations.
