# Manual canon in the game

## Scope and save contract

New rooms receive `characterCanonVersion: 1` in both supported creation paths. The marker is never added while reading, joining, or resuming a room. Existing character IDs, bonds, promises, story decisions, climate rules, economy rules and recorded prose keep their meaning. Historical receipts remain stored text; current characterization does not regenerate them.

The complete authored world contains 68 people: 57 adults, 5 adolescents, 5 children and one toddler. The game keeps its 26 established motive-bearing characters. Thirteen local cameos extend the onstage cast to 39, with small rotating subsets rather than 68 simultaneous actors:

- Alder: Celia Baptiste; Asha with Eli; Nico with Tess
- Saffron: Farah Hussain
- Glasssteppe: Liang Chen, Mei Chen and Hana Mori rotate; Jian Wu visits a public drawing table
- Pelagia: Yuna Park and Ravi Desai rotate; Lin appears with Mara in the community room
- Ember Mesa: Esperanza Vega; Bea appears only when Kit is locally present at a safe café/community venue

The other 29 people remain background residents of the authored world. They can matter through a family reference without being manufactured as active NPCs. No relationship is inferred from surnames, ethnicity, art or a personality type.

## Behavior, not a personality meter

Each established adult has distinct help, refusal, repair, reciprocal-support and smaller-offer voice. Current regional conversations and cast choices use those authored lines. Optional family conversations connect relevant relatives while keeping each person’s decisions their own. Existing support/commitment mechanics retain their numerical implementation, but ordinary UI stays qualitative.

Cameos have two meaningful local branches and remember the branch actually chosen. Adult drop-ins cost one priority block without adding a reward or promise track. Child moments are brief, free of resource rewards, and have no adult work, romantic, support, caregiving, favor or trust progression. They cannot be reached remotely. Their UI says “What fits today” and “Moments you remember”; it does not attribute adult projects or autobiographical recall to a toddler.

MBTI and OCEAN are authoring aids in the development snapshot, not assessments, scores or behavioral formulas. Child traits are provisional; Bea has no MBTI type. The runtime uses manually written responses aligned with the biographies. It does not turn type, ancestry or age into a willingness-to-help score.

## Reconciled discrepancies

- Oren is 57, has lymphoma and is receiving chemotherapy. His current portrait, introduction, choice of rest, flexible rehearsal and support limits reflect this. Treatment-related fatigue is distinguished from fear of finishing. Trust/contribution totals cannot buy more capacity. Authored short-visit moments are not a treatment calendar or prognosis.
- Family identities include explicit biological, adoptive, step, marital and chosen ties in the canonical graph. Human-readable original labels such as “Mother” may be less specific than the graph’s “biological parent”; tests verify the authored reciprocal identity without guessing from a generic label.
- Sora’s family references include adopted daughter Natsumi; Ravi’s include spouse Mara, biological child Nila and stepchild Lin; Hugo’s chosen brother Jonah is not mislabeled as a blood relative.
- Priya’s Pelagian family, Oren/Miro’s shared highland upbringing, Yuna’s move to Pelagia, and the distinct homes of Jo/Kit/Bea remain consistent with current residence.
- New-room location descriptions match the latest cool/wet urban Alder, Mediterranean low-rise Saffron, cold rail-city Glasssteppe, warm-monsoon harbor/rural Pelagia and arid rural Ember direction. These are presentation corrections, not changes to the tested climate engine.
- All 68 runtime portraits are reviewed art. A personality-led audit revised 11 default expressions and retained 57; canonical faces, family resemblance and biography facts stay intact. Default portrait URLs carry content revisions so a changed expression does not reuse a stale browser image. Mina, Eli and Jo now use face-aligned WebP expression sheets, roughly 84% smaller than their original PNG sources, preserved in the separate recovery art package; Mina’s four direct emotion portraits are aligned too. Scene emotion cues remain tied to visible story choices, never hidden personality numbers.
- Cross-region family facts name each person’s actual home in the public character disclosure. Traveling Nell is described as traveling; a visit does not relocate anyone. Jo/Kit/Bea, Oren/Miro, the Arul and Park branches and the traveling Harper connection remain geographically distinct.
- Newly added child cameos never use the generic adult promise/contact copy. Lin’s play takes place away from machinery and working water; Bea requires Kit’s actual local presence.

## Evidence and boundaries

The reviewed source snapshots and exact hashes are under `docs/character-canon/`. Public biographies/family facts can be republished in the player guide; authoring profile ratings and future story internals do not belong in ordinary player UI.

`tests/character-canon.test.mjs` checks source parity, the 68-ID roster, age distribution, reciprocal families, new/old save gating, local placement, child constraints, exact retries, distinctive adult responses, treatment capacity, current portraits and owner privacy. `tests/character-canon-ui.test.mjs` renders all 13 cameo dialogs. Existing frozen legacy campaign hashes remain authoritative compatibility evidence. Client/server engine copies are regenerated and verified together.

The full release owner must rerun aggregate checks after merging the renderer, guide and aligned expression assets. No deployment or publication is performed by this character integration branch.
