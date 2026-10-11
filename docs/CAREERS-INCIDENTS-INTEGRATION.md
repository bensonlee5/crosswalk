# Careers, recovery and everyday incidents

This successor combines venue employment, timed training, recoverable household arrears, and small chance incidents for ordinary activities. The current frontend explicitly opts newly created rooms into both rule families. Resuming a room never adds these mechanics.

## Compatibility contract

- New create fields are `careerMode: 'venue'` and `actionIncidents: true`. They remain independent engine options; omitted fields retain earlier rules.
- Current clients declare the supported rule families on full room reads and mutations. Unknown version markers, missing capabilities and malformed declarations produce a refresh-required response before returning new-rule state or mutating it.
- Saved-room listings and guest ownership remain intact. Home retains its last confirmed room and pending request when a refresh is required. A reload retries the same request ID, expected version and feature choices with current capability metadata.
- The refresh-required UI stays locked until an actual reload or leaving the room; an older polling response cannot clear it.
- Capability metadata is excluded from semantic request fingerprints. It does not replace authentication or seat ownership.
- Production uses the Supabase service. The retained D1 route is covered separately for the same opt-in, compatibility and private-state guarantees.

## Authoritative action ordering

The engine captures the pre-action familiarity and ordinary-incident context, executes the base action, and checks that it actually changed state. Career evidence uses that confirmed action and its exact persisted interaction receipt. Only then is an eligible ordinary incident resolved. An incidental speaker can affect remembered familiarity, but cannot turn the passing exchange into a job reference.

Every private view composes cast, shared-commitment, familiarity, incident, career and finance redaction. Server incident RNG state is never included in room views. Career lead notices stay on the receiving player's private state and are shown only alongside their exact confirmed source interaction.

## Player-facing scope

- Four venue career ladders, entry applications, separate offer acceptance, fixed commitments, relevant work experience and timed paid/free preparation.
- Cross-venue and cross-town leads grounded in specific people. References require relevant shared work and an eligible later exchange; pressure, refusal, strain and repair-only choices do not grant one.
- Financial recovery follows repeated unpaid settlements. Exact bills, arrears, wage repayments, restrictions and recovery steps are disclosed. This is a fictional game system, not a legal bankruptcy or financial advice tool.
- Small incidents apply to a bounded ordinary-action catalog. Direct character choices retain their authored consequences. The first incident layer does not randomly remove a job.
- Work & learning opens reviewable choices; navigation never applies, accepts or works automatically.
- Existing recorded action sounds and sound controls are retained. Text dialogue is not presented as recorded speech.

## Verification

Final combined source, test counts, exact backend bundle and deployment evidence are recorded with the release checkpoint. Focused feature-branch results are not substitutes for that combined gate. Native UI harnesses are not browser or iOS device tests.
