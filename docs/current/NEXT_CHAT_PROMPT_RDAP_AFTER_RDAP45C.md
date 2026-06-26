# NEXT_CHAT_PROMPT_RDAP_AFTER_RDAP45C

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
docs/current/RDAP45C_REMOTE_AUTH_DEPLOY_SAFETY_LOGIN_ACTIVE_LIVE_CONFIRMED_DOCS.md
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
RDAP45: Twitch-OAuth-Start-Gate vorbereitet.
RDAP45B: Deploy-Safety an aktiv genutzten Login angepasst.
RDAP45C: RDAP45B Live-Bestaetigung dokumentiert.
```

## RDAP45B/RDAP45C Live-Befund

```text
twitch/start HTTP 302
twitch/callback HTTP 403
Login funktioniert wieder.
```

Richtige Einordnung:

```text
Twitch-Login ist aktiv/freigegeben.
twitch/start HTTP 302 ist bei aktivem Login korrekt.
twitch/callback HTTP 403 ohne gueltigen OAuth-State bleibt Safety-Pflicht.
```

Live-Env-Hinweis:

```text
RDAP_TWITCH_OAUTH_START_RELEASED=true
```

Wichtig:

```text
Aktiver Twitch-Login bedeutet nur Auth-/Session-Scope.
Das ist keine Freigabe fuer Remote-Writes, Agent-Actions, OBS, Sound, Overlay, Commands, Channelpoints oder freie Ausfuehrung.
```

## RDAP44 bleibt bestaetigt

```text
Admin -> Admin-Notizen
- Zieluser-Auswahl sichtbar.
- Dropdown sichtbar.
- Default ForrestCGN @forrestcgn / tw:127709954.
- Read true.
- Write true.
- Create-Form nutzt den ausgewaehlten Zieluser.
```

Asset-Befund:

```text
DEFAULT_TARGET_USER vorhanden
adminNotesTargetSelect vorhanden
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

## Naechster empfohlener Step

```text
RDAP46_ADMIN_NOTE_NEXT_SMALL_STEP_PLAN
```

Empfohlene Richtung:

```text
Erst klaeren, was als naechster Admin-Notizen-/Admin-User-Schritt sinnvoll ist.
Moegliche naechste Schritte:
1. Admin-Notizen Zieluser-Auswahl komfortabler machen.
2. Echte Admin-User-Detailseite planen.
3. Admin-Note Update/Deactivate separat planen, aber nur mit Audit/Lock/Backup/Confirm.
4. Permission-Verwaltung separat planen, nicht mit Admin-Notizen vermischen.
```

Nicht blind direkt Update/Delete bauen.
