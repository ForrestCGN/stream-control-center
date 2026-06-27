# NEXT_CHAT_PROMPT_RDAP_AFTER_RDAP45B

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
11. Bei Backend/UI/Script-Code danach Webserver-Deploy aus frischem GitHub/dev-Clone unter /opt/stream-control-center/_deploy_tmp.
12. Fuer RDAP-Webserver-Deploys den kurzen relativen _deploy_tmp-Stil verwenden.
13. Doku-only braucht keinen Webserver-Deploy.
```

## Zuerst lesen

```text
docs/current/MASTER_PROMPT_stream_control_center_CLEAN_2026-06-21.txt
docs/current/RDAP_EXAKTE_ARBEITSWEISE_2026-06-25_RDAP28_WORKFLOW.md
docs/current/RDAP45B_REMOTE_AUTH_DEPLOY_SAFETY_LOGIN_ACTIVE_FIX_PREPARED.md
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
RDAP44: Zieluser-Auswahl in Admin-Notizen-UI umgesetzt und live bestaetigt.
RDAP44B: RDAP44 Live-Bestaetigung dokumentiert.
RDAP45: Twitch-OAuth-Start bekam explizites Release-Gate RDAP_TWITCH_OAUTH_START_RELEASED=true.
RDAP45B: Deploy-Safety wurde fuer aktiv genutzten Login korrigiert.
```

## RDAP45/RDAP45B Auth-Befund

```text
Login wird live genutzt.
Mit RDAP_TWITCH_OAUTH_START_RELEASED=true liefert /api/remote/auth/twitch/start HTTP 302.
/api/remote/auth/twitch/callback liefert ohne gueltigen OAuth-State HTTP 403.
```

Korrekte Semantik:

```text
twitch/start HTTP 302 = ok, wenn Login/OAuth bewusst aktiv/freigegeben ist.
twitch/start HTTP 403 = ok, wenn Login/OAuth gesperrt ist.
twitch/callback HTTP 403 ohne State = Pflicht.
```

Wichtig:

```text
Aktiver Login/OAuth-Session-Scope ist nicht gleich Remote-Writes.
Remote-Writes/Agent/OBS/Sound/Overlay/Commands bleiben gesperrt.
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
RDAP45B Webserver-Deploy und Live-Bestaetigung
```

Ziel:

```text
Deploy-Script soll bei aktivem Login mit twitch/start HTTP 302 nicht mehr fehlschlagen.
Callback ohne gueltigen OAuth-State muss 403 bleiben.
Dashboard-Login muss weiter funktionieren.
RDAP44 Admin-Notizen-Zieluser-Auswahl muss unveraendert sichtbar bleiben.
```

Nach erfolgreichem Live-Test:

```text
RDAP45C_REMOTE_AUTH_DEPLOY_SAFETY_LOGIN_ACTIVE_LIVE_CONFIRMED_DOCS
```
