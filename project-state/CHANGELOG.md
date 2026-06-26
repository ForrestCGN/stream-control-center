# CHANGELOG

## 2026-06-26 - RDAP76D_ADMIN_MODULE_REGISTRY_TARGET_PLAN

```text
- Admin-Modul-/Page-Registry-Zielstruktur dokumentiert.
- Strukturproblem festgehalten:
  - remote-modboard.js ist Haupt-Router/App-Shell.
  - rdap28-admin-notes.js injiziert aktuell Admin-Notizen und User-Detail nachtraeglich.
  - Dadurch konkurrieren Header-/Nav-/Panel-State.
- Zielbild festgelegt:
  - Module beschreiben sich selbst.
  - App-Shell ordnet Module/Pages automatisch ein.
  - Haupt-Router bleibt einzige Wahrheit.
  - Feature-Dateien rendern nur eigene Inhalte/Actions.
- Naechsten Code-Step RDAP77_ADMIN_MODULE_REGISTRY_FOUNDATION festgelegt.
- Doku-only.
- Kein Code.
- Kein Backend.
- Keine DB-Migration.
- Keine neue Permission.
- Kein Delete/Deactivate.
```
