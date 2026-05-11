# CHANGELOG Append – STEP201.8.1 Deathcounter V2

## 2026-05-08

- Fixed `/api/deathcounter/v2/status` 500 caused by unsafe `config.getProjectRoot()` access.
- Added safe project-root fallback.
- No deathcounter runtime, counter or overlay behavior changed.
