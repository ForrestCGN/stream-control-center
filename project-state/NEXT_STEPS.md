# NEXT_STEPS

Stand: RDAP44B_ADMIN_NOTE_TARGET_USER_SELECTION_LIVE_CONFIRMED_DOCS  
Datum: 2026-06-26

## Naechster empfohlener Step

```text
RDAP45_REMOTE_AUTH_TWITCH_START_SAFETY_FIX_OR_DECISION
```

## Ziel RDAP45

```text
Beim RDAP44 Webserver-Deploy/Deploy-Script wurde ein OAuth-Safety-Befund sichtbar:
twitch/start HTTP 302
twitch/callback HTTP 403
Erwartet war 403/403.
```

RDAP45 soll klaeren:

```text
1. Warum /api/remote/auth/twitch/start HTTP 302 liefert.
2. Ob die Route absichtlich aktiv ist oder fuer den aktuellen Safety-Stand 403 liefern muss.
3. Ob der Deploy-Safety-Check veraltet ist oder die Route korrigiert werden muss.
4. Welche Aenderung noetig ist, ohne Admin-Notizen-UI, DB oder Permissions nebenbei anzufassen.
```

## Vor RDAP45 zuerst echte Dateien pruefen

```text
docs/current/MASTER_PROMPT_stream_control_center_CLEAN_2026-06-21.txt
docs/current/RDAP_EXAKTE_ARBEITSWEISE_2026-06-25_RDAP28_WORKFLOW.md
docs/current/RDAP44B_ADMIN_NOTE_TARGET_USER_SELECTION_LIVE_CONFIRMED_DOCS.md
remote-modboard/backend/src/app.js
remote-modboard/backend/src/routes/routes.routes.js
remote-modboard/backend/src/routes/*auth*.js
remote-modboard/backend/src/services/*auth*.service.js
tools/remote-modboard-deploy.sh
```

Falls die Auth-Dateien anders heissen, zuerst GitHub/dev durchsuchen und nicht raten.

## Nicht in RDAP45 aendern

```text
Keine Admin-Notizen-UI-Aenderung.
Keine Admin-Note Update-Funktion.
Keine Admin-Note Deactivate-Funktion.
Kein Delete.
Keine Permission-Verwaltung.
Keine DB-Migration.
Keine Agent-/OBS-/Sound-/Overlay-/Command-Steuerung.
Keine neuen produktiven Writes.
```

## RDAP44 ist abgeschlossen

```text
Admin-Notizen haben jetzt Zieluser-Auswahl.
Default bleibt ForrestCGN / tw:127709954.
Read/Create nutzen den ausgewaehlten Zieluser.
RDAP44 ist live funktional bestaetigt.
```
