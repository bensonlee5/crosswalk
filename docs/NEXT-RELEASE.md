# Release procedure

1. Freeze a clean, reviewed source commit. Record its parent/base, source SHA and exact tree. Do not publish an untested working directory.
2. Run frontend/backend typechecks, current tests, real-PostgreSQL service tests, engine mirror verification, cached Edge check, guide checks and production build. Record any unrun stage explicitly.
3. Build the Edge bundle with `node scripts/build-edge-bundle.mjs <artifact-path>`. Run backend tests with `CROSSWALK_TEST_BUNDLE` pointing to that exact file. Record its SHA-256 and bytes.
4. Run `node scripts/package-release.mjs <outside-artifact-directory> <reviewed-base-sha>`. The package validates the approved portrait roster and all engine hashes, records deletions separately, and includes exact source/frontend/server inventories.
5. Save a recoverable source artifact before authorized publication. Publish the reviewed tree including deletions. Reconcile existing remote objects before retrying uncertain writes; never advance a ref to an unreviewed snapshot.
6. Deploy the matching backend with JWT verification and existing security configuration preserved, then publish the matching frontend. If the protocol changes, cached clients must receive a clear refresh response before any mutation or private state disclosure.
7. Verify the exact main commit, successful Pages run, public asset paths and live backend. Test a fresh life, accepted actions, repeat/reload, current careers, direct character responses and one authoritative incident path. Check unsupported saves get a clear fresh-start option without deletion.

CI's Pages workflow builds `dist/` with the `/crosswalk/` prefix. It does not deploy the Edge Function. Publishing code does not authorize changing database access, secrets, authentication settings or purging stored records.

Native/unit checks do not establish iOS touch behavior, actual audible sound, hosted email delivery or real multi-connection races. Record live-browser coverage and remaining limits separately.
