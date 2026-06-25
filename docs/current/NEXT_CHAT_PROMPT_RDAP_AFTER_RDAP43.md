# NEXT_CHAT_PROMPT_RDAP_AFTER_RDAP43

Du bist im Projekt `stream-control-center` / Remote-Modboard / RDAP.

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
11. Bei Backend/UI-Code danach Webserver-Deploy aus frischem GitHub/dev-Clone unter /opt/stream-control-center/_deploy_tmp/STEP_NAME.
12. Nach Restart/Deploy Readiness abwarten.
13. Doku-only braucht keinen Webserver-Deploy.
```

## Zuerst lesen

```text
docs/current/MASTER_PROMPT_stream_control_center_CLEAN_2026-06-21.txt
docs/current/RDAP_EXAKTE_ARBEITSWEISE_2026-06-25_RDAP28_WORKFLOW.md
docs/current/RDAP43_ADMIN_USER_DETAIL_NOTES_TARGET_SELECTION_PLAN.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
project-state/CHANGELOG.md
```

## Aktueller bestaetigter Stand

```text
RDAP39C: Admin-Note Read-Route wiederhergestellt und live bestaetigt.
RDAP40: Admin-Note Create-UI live bestaetigt.
RDAP42: Status-/Routes-Semantik bereinigt und live bestaetigt.
RDAP43: Admin-User-Detail/Zieluser-Auswahl geplant, Doku-only.
```

## Wichtig: Aktuelle Admin-Notizen-Basis

```text
Read funktioniert.
Create funktioniert.
Create-Button ist nur fuer write-berechtigte Admins sichtbar.
Status-Summary ist seit RDAP42 semantisch sauber.
Update/Deactivate/Delete bleiben deaktiviert.
Community-Seiten duerfen Admin-Notizen nicht lesen.
```

## Naechster empfohlener Step

```text
RDAP44_ADMIN_NOTE_TARGET_USER_SELECTION_PREPARED
```

Ziel:

```text
- Admin-Notizen nicht mehr nur fuer festes tw:127709954 anzeigen.
- Zieluser-Auswahl vorbereiten oder in vorhandener Admin-Benutzerverwaltung anbinden.
- Read/Create weiter ueber bestehende Routen nutzen.
- Kein Update.
- Kein Deactivate.
- Kein Delete.
- Keine Permission-Verwaltung in diesem Step.
```

## Vor RDAP44-Code unbedingt echte Dateien pruefen

```text
remote-modboard/backend/public/assets/remote-modboard.js
remote-modboard/backend/public/assets/rdap28-admin-notes.js
remote-modboard/backend/public/index.html
remote-modboard/backend/src/routes/admin-users.routes.js
remote-modboard/backend/src/services/admin-user-admin-note-real-read-authed.service.js
remote-modboard/backend/src/services/admin-user-admin-note-write-confirmed.service.js
remote-modboard/backend/src/routes/routes.routes.js
remote-modboard/backend/src/routes/status.routes.js
```

## RDAP44-Empfehlung

Kleiner, sichtbarer UI-Step statt zu grosser Umbau:

```text
Admin-Notizen-Seite bekommt Zieluser-Auswahl aus vorhandener Benutzer-/Dashboard-Datenquelle.
Der fest verdrahtete Zieluser tw:127709954 wird durch den ausgewaehlten Zieluser ersetzt.
Read/Create bleiben dieselben Backend-Routen.
```
