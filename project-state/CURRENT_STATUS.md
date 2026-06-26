# CURRENT_STATUS

Stand: RDAP78B_ADMIN_NOTES_READ_RESPONSE_USER_SCOPE_FIX  
Datum: 2026-06-26  
Projekt: `stream-control-center` / Remote-Modboard / RDAP

## Aktuell bestaetigt

```text
RDAP77B: Module Registry Panel Mount und Visibility Fix getestet.
RDAP78: Selected-User Reload/Count-Fix vorbereitet.
RDAP78B: Read-Response wird frontendseitig strikt auf aktuell ausgewaehlten Zieluser gescoped.
```

## Strukturstand

```text
remote-modboard.js fuehrt Haupt-Router und Frontend-Registry.
Admin wird als Obermodul registriert.
Admin-Notizen und User-Detail sind Admin-Pages.
Inaktive Panels werden per hidden und is-active-view konsequent versteckt.
```

## Admin-Notes Zieluser-Scope

```text
Read-Request nutzt targetUserUid.
Verspaetete Antworten werden ignoriert.
Count/Liste basieren nur noch auf Notizen, deren target_user_uid/targetUserUid zum aktuell ausgewaehlten Zieluser passt.
Fremde Antwort-Notizen werden ausgefiltert und nicht angezeigt.
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
Nach Browserbestaetigung entscheiden: UI-/Registry-Aufraeumstep oder Read-Response-Diagnose.
```
