# CURRENT_REMOTE_MODBOARD_STATE

Stand: RDAP116B_REFRESH_BEHAVIOR_CLEANUP  
Datum: 2026-06-27

## Navigation

```text
System:
- Übersicht
- Diagnose

Admin:
- Benutzerverwaltung
- Admin-Notizen
- Verbindungen
- Doku / Details
```

## Refresh-Regel

```text
- Live-/Statusseiten duerfen automatisch aktualisieren.
- Doku / Details und statische Read-only-Seiten zeigen keinen sichtbaren Auto-Refresh.
- Der alte Footer mit Auto-Refresh/Neu laden ist nicht mehr sichtbar.
- Manuelles Neu laden ist oben/dezent oder in seitenlokalen Aktionen vorgesehen.
- Nach spaeteren Schreibaktionen gilt: automatischer Readback/Refresh direkt nach Erfolg.
```

## Sicherheit

```text
Keine Backend-Aenderung.
Keine DB-Migration.
Keine Agent-Actions.
Keine neuen Writes.
```
