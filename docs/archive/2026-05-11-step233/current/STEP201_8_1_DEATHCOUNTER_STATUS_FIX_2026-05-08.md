# STEP201.8.1 – Deathcounter V2 Status-Fix

`/api/deathcounter/v2/status` wurde stabilisiert.

Problem:
- 500 durch direkten Zugriff auf `config.getProjectRoot()`

Fix:
- sicherer Helper `getProjectRootSafe()`

Keine Funktionslogik des Deathcounters wurde geändert.
