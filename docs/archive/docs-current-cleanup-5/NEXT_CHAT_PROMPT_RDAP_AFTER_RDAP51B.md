# NEXT_CHAT_PROMPT_RDAP_AFTER_RDAP51B

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
docs/current/RDAP51B_ADMIN_USER_DETAIL_NOTES_BRIDGE_POLISH_LIVE_CONFIRMED_DOCS.md
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
RDAP44: Zieluser-Auswahl in Admin-Notizen-UI umgesetzt und live bestaetigt.
RDAP45B/RDAP45C: Deploy-Safety an aktiv genutzten Login angepasst und dokumentiert.
RDAP47/RDAP47B: Zieluser-Suche/Filter in Admin-Notizen umgesetzt und live dokumentiert.
RDAP48: Admin-User-Detailseite read-only geplant.
RDAP49/RDAP49B: Admin-User-Detail read-only umgesetzt und live dokumentiert.
RDAP50: Bruecke User-Detail -> Admin-Notizen geplant.
RDAP51/RDAP51B: Bruecke User-Detail -> Admin-Notizen umgesetzt und live dokumentiert.
```

## RDAP51B Live-Befund

```text
Admin -> User-Detail -> Admin-Notizen oeffnen
- Admin-Notizen oeffnet sich.
- Kontext-Hinweis sichtbar: Aus User-Detail geoeffnet.
- ForrestCGN @forrestcgn / tw:127709954 korrekt uebernommen.
- Hinweis sagt: Read/Create verwenden weiterhin exakt diesen Zieluser.
- Button Zurueck zum User-Detail sichtbar.
- Button Hinweis ausblenden sichtbar.
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
Rollen-/Gruppen-Schreibverwaltung
Session-Revocation in der UI
Community-Seiten duerfen Admin-Notizen nicht lesen
Agent/OBS/Sound/Overlay/Command/Channelpoints-Control
freie Shell-/Datei-/Prozess-/URL-Ausfuehrung
```

## Naechster empfohlener Step

```text
RDAP52_PERMISSION_READ_DETAIL_POLISH_PLAN
```

Empfohlene Richtung:

```text
Jetzt nicht direkt Permission-Write oder Admin-Note Update/Delete bauen.
Sinnvoller naechster Schritt ist ein Plan fuer bessere read-only Permission-/Rollen-Details:
- Welche Rechte kommen aus Rollen?
- Welche Rechte kommen aus Gruppen/Modul-Permissions?
- Wie werden effektive Rechte read-only angezeigt?
- Keine Vergabe/Entzug von Rollen oder Permissions.
- Keine neue Backend-Route, wenn vorhandenes /api/remote/auth/model reicht.
```

Nicht blind tun:

```text
Nicht direkt Admin-Note Update/Delete bauen.
Nicht direkt Permission-UI mit Schreibfunktion bauen.
Nicht neue Backend-Route bauen, wenn vorhandene Daten reichen.
Keine parallele Admin-Notizen-Implementierung bauen.
```
