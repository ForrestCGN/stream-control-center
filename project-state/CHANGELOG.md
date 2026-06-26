# CHANGELOG

## 2026-06-26 - RDAP76C_ADMIN_NOTES_INITIAL_RESTORE_STATE_FIX

```text
- Korrekturstep nach RDAP76 erstellt.
- RDAP76 hatte den Klickpfad Admin-Notizen korrekt synchronisiert, aber beim Initial-/Restore-State konnte User-Detail im Haupt-Header/Navigation aktiv bleiben, obwohl Admin-Notizen sichtbar war.
- restoreInjectedAdminPanelVisibility() bewertet jetzt sichtbare injizierte Panels vor alter aktiver Navigation.
- Neuer verzögerter Restore-Repair prüft nach DOMContentLoaded, ob sichtbares Panel, Haupt-Header, aktive Navigation und Haupt-Router auseinanderlaufen.
- Bei State-Split wird der bestehende Haupt-Router erneut auf admin-notes oder admin-user-detail gesetzt.
- Frontend-only.
- Kein Backend.
- Keine DB-Migration.
- Keine neue Permission.
- Kein Delete/Deactivate.
- Keine neuen Schreibbuttons.
```
