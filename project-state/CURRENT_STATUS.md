# CURRENT_STATUS

Stand: RDAP78_ADMIN_NOTES_SELECTED_USER_RELOAD_AND_COUNT_FIX  
Datum: 2026-06-26  
Projekt: `stream-control-center` / Remote-Modboard / RDAP

## Aktuell bestaetigt

```text
RDAP76D: Admin-Modul-/Page-Registry-Zielstruktur dokumentiert; Doku-only.
RDAP77B: Modul-/Page-Registry mit exklusiver Panel-Sichtbarkeit fuer Admin-Unterseiten getestet.
RDAP78: Admin-Notes Zieluser-/Count-/Reload-Kontext vorbereitet.
```

## Strukturstand

```text
remote-modboard.js fuehrt Haupt-Router und Frontend-Registry.
Admin wird als Obermodul registriert.
Admin-Notizen und User-Detail sind Admin-Pages.
Inaktive Panels werden konsequent versteckt.
```

## Admin-Notes Kontextstand

```text
Userwechsel setzt alte Liste/Count zurueck.
Read-Request nutzt den aktuell ausgewaehlten Zieluser.
Verspaetete Antworten fuer alte Zieluser werden ignoriert.
Count/Notice nennen den aktuellen Zieluser.
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
RDAP79_ADMIN_NOTES_UI_POLISH_AFTER_STATE_FIX
```
