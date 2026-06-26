# NEXT_CHAT_PROMPT_RDAP_AFTER_RDAP47B

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
14. Leitlinie von Forrest: so klein wie noetig, so gross wie moeglich.
```

## Zuerst lesen

```text
docs/current/MASTER_PROMPT_stream_control_center_CLEAN_2026-06-21.txt
docs/current/RDAP_EXAKTE_ARBEITSWEISE_2026-06-25_RDAP28_WORKFLOW.md
docs/current/RDAP47B_ADMIN_NOTE_TARGET_USER_SEARCH_COMFORT_LIVE_CONFIRMED_DOCS.md
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
RDAP45B: Deploy-Safety an aktiv genutzten Login angepasst.
RDAP45C: RDAP45B Live-Bestaetigung dokumentiert.
RDAP46: naechsten kleinen Admin-Notizen-Step geplant.
RDAP47: Zieluser-Suche/Filter in Admin-Notizen umgesetzt.
RDAP47B: RDAP47 Live-Bestaetigung dokumentiert.
```

## RDAP47B Live-Befund

```text
Admin -> Admin-Notizen
- Suchfeld sichtbar.
- Suche nach "Forrest" funktioniert.
- Trefferanzeige 1 / 2.
- Dropdown bleibt nutzbar.
- Button User neu laden sichtbar.
- Button Suche leeren sichtbar.
- Zieluser ForrestCGN / tw:127709954 bleibt ausgewaehlt.
- Read true.
- Write true.
- 3 Admin-Notizen geladen.
- Create-Form nutzt weiter Zieluser tw:127709954.
```

## Auth-/Login-Safety bleibt

```text
Twitch-Login aktiv/freigegeben.
twitch/start HTTP 302 ist korrekt.
twitch/callback HTTP 403 ohne gueltigen OAuth-State ist Pflicht.
Aktiver Login bedeutet nur Auth-/Session-Scope.
Keine Freigabe fuer Remote-Writes, Agent-Actions, OBS, Sound, Overlay, Commands oder Channelpoints.
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
RDAP48_ADMIN_USER_DETAIL_READONLY_PLAN
```

Empfohlene Richtung:

```text
Jetzt nicht direkt Admin-Note Update/Delete bauen.
Sinnvoller naechster sichtbarer Schritt ist eine echte Admin-User-Detailseite als read-only Plan:
- Welche Daten sollen auf die Detailseite?
- Welche bestehenden Routen/Services liefern diese Daten schon?
- Welche Rechte sind noetig?
- Was bleibt deaktiviert?
- Wie werden Admin-Notizen dort eingebunden?
```

Danach moeglich:

```text
RDAP49_ADMIN_USER_DETAIL_READONLY_PREPARED
```

Nicht blind direkt Update/Delete/Permission-UI bauen.
