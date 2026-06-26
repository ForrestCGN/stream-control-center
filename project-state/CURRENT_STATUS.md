# CURRENT_STATUS

Stand: RDAP78C_ADMIN_NOTES_NOTICE_HUMANIZER_STALE_COUNT_FIX  
Datum: 2026-06-26  
Projekt: `stream-control-center` / Remote-Modboard / RDAP

## Aktuell bestaetigt / vorbereitet

```text
RDAP77B: Module Registry / Admin-Unterseiten sichtbar exklusiv getestet.
RDAP78: Selected-User Reload/Count-Kontext vorbereitet.
RDAP78B: Read-Response-User-Scope Filter vorbereitet.
RDAP78C: Stale Notice-Humanizer Count in remote-modboard.js korrigiert.
```

## Strukturstand

```text
remote-modboard.js fuehrt Haupt-Router und Frontend-Registry.
Admin wird als Obermodul registriert.
Admin-Notizen und User-Detail sind Admin-Pages.
Inaktive Panels werden per hidden und is-active-view konsequent versteckt.
```

## Admin-Notes aktueller Backend-Stand

```text
GET  /api/remote/admin/users/admin-notes/read
POST /api/remote/admin/users/admin-notes/create
POST /api/remote/admin/users/admin-notes/update      -> Backend confirmed aktiv
POST /api/remote/admin/users/admin-notes/deactivate  -> disabled
```

## Aktueller Frontend-Fix

```text
simplifyAdminNotesNotice nutzt keinen alten dataset.rdap73OriginalText mehr als Quelle.
Count wird nur noch aus aktuellem Notice-Text humanisiert.
Keine-Notizen-Texte werden nicht mehr durch alten Count ueberschrieben.
```

## Weiterhin deaktiviert/verboten

```text
Admin-Note Deactivate
Physisches Delete
Community-Read fuer Admin-Notizen
Permission-Verwaltung in der UI
Rollen-/Gruppen-Schreibverwaltung
Session-Revocation in der UI
Agent/OBS/Sound/Overlay/Command/Channelpoints-Control
freie Shell-/Datei-/Prozess-/URL-Ausfuehrung
```

## Naechster empfohlener Step

```text
RDAP79_ADMIN_NOTES_CONTEXT_FINAL_BROWSER_VERIFICATION_AND_DOCS
```
