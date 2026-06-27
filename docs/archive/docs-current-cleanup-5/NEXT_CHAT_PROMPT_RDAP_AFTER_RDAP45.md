# NEXT_CHAT_PROMPT_RDAP_AFTER_RDAP45

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
docs/current/RDAP45_REMOTE_AUTH_TWITCH_START_SAFETY_FIX_PREPARED.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
project-state/CHANGELOG.md
```

## Aktueller Stand

```text
RDAP44/RDAP44B: Admin-Notizen-Zieluser-Auswahl ist live bestätigt.
RDAP45: Twitch-OAuth-Start-Safety-Fix ist vorbereitet.
```

## RDAP45 Änderung

```text
remote-modboard/backend/src/services/auth-twitch-oauth.service.js
```

RDAP45 ergänzt ein explizites Release-Gate:

```text
RDAP_TWITCH_OAUTH_START_RELEASED=true
```

Ohne dieses Gate muss `/api/remote/auth/twitch/start` HTTP 403 liefern.

## Weiterhin deaktiviert / nicht geändert

```text
Admin-Note Update
Admin-Note Deactivate
Physisches Delete
Permission-Verwaltung in der UI
Community-Seiten duerfen Admin-Notizen nicht lesen
Agent/OBS/Sound/Overlay/Command/Channelpoints-Control
freie Shell-/Datei-/Prozess-/URL-Ausfuehrung
```

## Naechster empfohlener Schritt

Wenn RDAP45 bereits lokal per stepdone nach GitHub/dev gebracht wurde:

```text
Webserver-Deploy aus frischem GitHub/dev-Clone.
Danach pruefen:
- twitch/start -> 403
- twitch/callback -> 403
- Deploy-Script laeuft ohne OAuth-Safety-Fehler
- RDAP44 Admin-Notizen-UI bleibt sichtbar
```

Wenn live bestätigt:

```text
RDAP45B_REMOTE_AUTH_TWITCH_START_SAFETY_LIVE_CONFIRMED_DOCS
```
