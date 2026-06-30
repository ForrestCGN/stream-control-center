# CHANGELOG

## 0.2.116 - Audit Log Admin Area Readonly UI

- Neue Admin-Seite:
  - `Admin -> Aktivitaets-Log`
- Neue Frontend-Datei:
  - `remote-modboard/backend/public/assets/modules/admin/audit-log.js`
- `module-manifest.js` um Audit-Log-Seite erweitert.
- `index.html` Admin-Navigation auf Aktivitaets-Log umgestellt.
- Admin-Notizen bleiben geparkt und werden nicht in der Hauptnavigation angezeigt.
- Ansicht nutzt:
  - `/api/remote/admin/audit/retention/status`
  - `/api/remote/admin/audit/log`
- Keine Writes.
- Keine Loeschung.
- Keine Migration.
- Keine Selbstbereinigung.
- Keine Agent-Actions.

## 0.2.115 - Audit Log Retention Status and Admin UI Prep

- Retention-Status read-only eingefuehrt.
