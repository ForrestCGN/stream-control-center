# NEXT_CHAT_PROMPT_RDAP_AFTER_RDAP44B

Du bist im Projekt `stream-control-center` / Remote-Modboard / RDAP fuer ForrestCGN.

## Wichtigste Arbeitsweise

```text
1. Immer zuerst GitHub/dev und echte Dateien pruefen.
2. Startdateien wirklich lesen.
3. Dann kurzen Plan nennen.
4. Auf Forrests explizites "go" warten.
5. Keine Funktionalitaet entfernen.
6. Keine parallelen Strukturen erfinden.
7. Fehlende Dateien exakt anfragen, nicht raten.
8. ZIPs immer mit echten Repo-Zielpfaden bauen.
9. Lokal: installstep -> Checks -> stepdone.
10. stepdone bedeutet Commit/Push nach GitHub/dev, nicht Webserver-Deploy.
11. Bei Backend/UI-Code danach Webserver-Deploy aus frischem GitHub/dev-Clone unter /opt/stream-control-center/_deploy_tmp.
12. Fuer RDAP-Webserver-Deploys den kurzen relativen _deploy_tmp-Stil verwenden.
13. Doku-only braucht keinen Webserver-Deploy.
```

## Zuerst lesen

```text
docs/current/MASTER_PROMPT_stream_control_center_CLEAN_2026-06-21.txt
docs/current/RDAP_EXAKTE_ARBEITSWEISE_2026-06-25_RDAP28_WORKFLOW.md
docs/current/RDAP44B_ADMIN_NOTE_TARGET_USER_SELECTION_LIVE_CONFIRMED_DOCS.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
project-state/CHANGELOG.md
```

## Aktueller bestaetigter Stand

```text
RDAP39: Admin-Note Create-Backend-Write live bestaetigt.
RDAP39C: Admin-Note Read-Route live bestaetigt.
RDAP40: Admin-Note Create-UI live bestaetigt.
RDAP42: Status-/Routes-Semantik bereinigt und live bestaetigt.
RDAP43: Zieluser-Auswahl/Admin-User-Detail fuer Admin-Notizen geplant.
RDAP44: Zieluser-Auswahl in Admin-Notizen-UI umgesetzt.
RDAP44B: RDAP44 Live-Bestaetigung dokumentiert.
```

## RDAP44 Live-Befund

```text
Admin -> Admin-Notizen
- Zieluser-Auswahl sichtbar.
- Dropdown sichtbar.
- Default ForrestCGN @forrestcgn / tw:127709954.
- Read true.
- Write true.
- 3 Notizen geladen.
- Tabelle true.
- Create-Form zeigt den ausgewaehlten Zieluser.
```

Bestaetigte Asset-Pruefung:

```text
DEFAULT_TARGET_USER vorhanden
adminNotesTargetSelect vorhanden
selectedTargetUser vorhanden
TARGET_USER_UID nicht mehr vorhanden
```

## Weiterhin deaktiviert

```text
Admin-Note Update
Admin-Note Deactivate
Physisches Delete
Permission-Verwaltung in der UI
Community-Seiten duerfen Admin-Notizen nicht lesen
Agent/OBS/Sound/Overlay/Command/Channelpoints-Control
freie Shell-/Datei-/Prozess-/URL-Ausfuehrung
```

## Offener separater Befund

Beim Deploy-Script wurde ein OAuth-Safety-Befund sichtbar:

```text
twitch/start HTTP 302
twitch/callback HTTP 403
Erwartet war 403/403.
```

Das ist ein separater Auth-/OAuth-Safety-Punkt und kein RDAP44-UI-Fehler.

## Naechster empfohlener Step

```text
RDAP45_REMOTE_AUTH_TWITCH_START_SAFETY_FIX_OR_DECISION
```

Ziel:

```text
Pruefen, warum /api/remote/auth/twitch/start HTTP 302 liefert.
Klaeren, ob die Route absichtlich aktiv ist oder der Safety-Check/Route korrigiert werden muss.
Keine Admin-Notizen-UI aendern.
Keine DB-Migration.
Keine produktiven neuen Writes.
Keine Permission-Verwaltung.
```

## Vor RDAP45 unbedingt echte Dateien pruefen

```text
remote-modboard/backend/src/routes/auth*.js
remote-modboard/backend/src/services/*auth*.service.js
remote-modboard/backend/src/app.js
remote-modboard/backend/src/routes/routes.routes.js
tools/remote-modboard-deploy.sh
project-state/CURRENT_STATUS.md
project-state/TODO.md
```

Falls die exakten Auth-Dateien im Repo anders heissen, zuerst per GitHub/dev suchen und nicht raten.
