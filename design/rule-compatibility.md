# Compatible clients and explicit new-room rules

New feature families are independent: only create input `actionIncidents: true` enables `actionIncidentsVersion: 1`; the career implementation separately uses `careerMode: 'venue'` for its career/recovery markers. Omitted inputs keep the old rules. `actionIncidents: false` is accepted; non-boolean supplied values are rejected. Client capability declarations never enable or migrate a feature themselves.

## Wire contract

The common registry is `lib/rule-compatibility.ts`. A client implementing both rule families declares `supportedRules: ['action-incidents-v1', 'venue-careers-v1']` in create, join, start and move JSON. Room lookup/restore uses one non-secret query value: `supportedRules=action-incidents-v1,venue-careers-v1`. Normal URL encoding is fine. Duplicate query fields, unknown capability names, wrong types and oversized arrays are rejected. Only advertise features the compiled client actually presents.

Required rules derive from the saved room's server-authored markers. Marked rooms reject incompatible full-state reads, joins, starts, moves and receipt-state responses with status 409, `refreshRequired: true`, and an instruction to open the latest Crosswalk page. The rejection does not mutate the room, membership, request receipt, resource, random state or ownership. It never returns a fake unowned-room envelope. Legacy rooms and saved-room history remain accessible without capabilities. Compatible member/public room views include `requiredRules` for the client to check defensively.

Malformed declarations return status 400 with `refreshRequired: true`. Authentication and identity checks are unchanged. Capabilities are a compatibility signal, not proof of identity or authority. No auth settings, CORS policy, new secrets or persistent permissions are introduced.

## Pending command recovery

Capabilities are excluded from semantic request fingerprints. A newer client can reattach its current capabilities to a preserved pending command without changing the command's meaning or ID. Keep the original owner, request ID, saved version, action, destination and explicit create feature choices. A request applied previously still replays once after a compatible refresh; it never takes another chance draw.

`SaveRequest`/`pendingSaves` preserve `actionIncidents` and `supportedRules`; the career patch adds preservation of `careerMode`. Old pending creates receive no new feature opt-in. The main Home integration must handle `refreshRequired` BEFORE the generic 4xx `clearPending` branch: preserve the pending intent and latest confirmed room, show the refresh message, and do not mark this as an identity mismatch. The current client must add the GET capability query to polling/restore and reattach current capabilities to retry writes. These Home changes belong to the release owner and are not included in this engine patch.

## Checks

The core incident commit passed all 524 serial tests, types, engine parity, Deno and build before this rollout adjustment. The final rollout follow-up passed frontend/backend types, Deno, parity and 45 focused tests, including 27 actual PostgreSQL tests. Coverage includes old client to old room, old client to new room, refreshed client to both, independent capability requirements, missing/tampered declarations, incompatible GET without a misleading state envelope, unchanged ownership/history, preserved create flags, and retry after refresh with the same semantic fingerprint. The transport/persistence test preserves a pending command and confirmed room on a refresh-required response; release integration must additionally exercise the actual Home branch.
