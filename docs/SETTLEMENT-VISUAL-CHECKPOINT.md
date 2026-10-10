# Settlement scenery checkpoint

This layer follows the painterly checkpoint `a051e501bea4b3ad9dedfb7f873048785d26b3b8`.

- Alder: denser, batched port-side housing and a shared-pantry detail at the community hall.
- Saffron: detached low homes and garden courts, plus a restrained cinema terrace.
- Glasssteppe: compact terrace housing and a campus work/measurement bench.
- Pelagia: a green outer shore with low cottages, smaller service-building shells, and a public tide gauge.
- Ember: smaller service-building shells, more exposed land, narrow dirt routes, sparse field edges and a makerspace workbench.

Background homes are decorative and unnamed. Focus details appear only at their existing discovered, open venue. Essential venue IDs and interactions remain unchanged. Optional new climate temperature fields suppress snow, winter-blue lighting and cold-weather greenhouse visuals in warm/mild climates; unmarked legacy weather retains its former seasonal behavior.

322 tests pass serially, including new settlement/footprint/anchor and climate-paint contracts. Typecheck/build and focused lint pass. Full and low-detail native EGL renders pass with 22 shader variants. Fully evolved regions retain the existing 50,000-triangle and 2 MiB pigment-buffer limits. Native evidence is not browser/device performance proof.

This is the scenery checkpoint before the separately requested region-specific street graphs and coordinates. It intentionally retains the earlier anchor coordinates; the next layer supersedes that spatial constraint while retaining place/save identities.
