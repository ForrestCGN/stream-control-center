Du bist im Projekt `stream-control-center` / Remote-Modboard / RDAP fuer ForrestCGN.

WICHTIG:
Halte dich strikt an die Arbeitsweise. Nicht raten, nicht blind bauen, keine parallelen Strukturen erfinden.

## Verbindliche Arbeitsweise

1. Immer zuerst GitHub/dev und echte Dateien pruefen.
2. Startdateien wirklich lesen, nicht nur erwaehnen.
3. Danach kurzen Plan nennen.
4. Auf Forrests explizites `go` warten.
5. Keine Funktionalitaet entfernen.
6. Bestehende Module/Services/Dateien erweitern, wenn es fachlich passt.
7. Neue Module nur erstellen, wenn bestehende Struktur wirklich nicht passt.
8. Keine Patch-/Regex-/Set-Content-Anweisungen liefern.
9. ZIPs immer mit echten Repo-Zielpfaden bauen.
10. Forrest laedt ZIPs in den Downloads-Ordner.
11. Lokal immer:
    - `installstep.cmd`
    - Checks
    - `git status`
    - `stepdone.cmd`
12. `stepdone.cmd` bedeutet Commit/Push nach GitHub/dev, nicht Webserver-Deploy.
13. Bei Backend-/Frontend-Code danach Webserver-Deploy aus frischem GitHub/dev-Clone:
    cd /opt/stream-control-center/_deploy_tmp
    rm -rf STEP_NAME
    git clone --branch dev --single-branch https://github.com/ForrestCGN/stream-control-center.git STEP_NAME
    cd STEP_NAME
    sudo bash tools/remote-modboard-deploy.sh STEP_NAME dev
14. Kein zusaetzlicher manueller `systemctl restart` nach Deploy, das Deploy-Script macht Restart/Readiness.
15. Doku-only braucht keinen Webserver-Deploy.
16. `/opt/stream-control-center` ist kein Git-Repo.
17. Deploy-Script kopiert nur `remote-modboard/` live.
18. Leitlinie: so klein wie noetig, so gross wie moeglich.

## Zuerst lesen

Bitte zu Beginn wirklich aus GitHub/dev lesen:

```text
docs/current/MASTER_PROMPT_stream_control_center_CLEAN_2026-06-21.txt
docs/current/RDAP_EXAKTE_ARBEITSWEISE_2026-06-25_RDAP28_WORKFLOW.md
docs/current/NEXT_CHAT_PROMPT_RDAP_AFTER_RDAP58.md
docs/current/RDAP57B_PERMISSION_READ_DETAIL_CATEGORIES_POLISH_LIVE_CONFIRMED_DOCS.md
docs/current/RDAP58_PERMISSION_READ_DETAIL_WRAPUP_OR_NEXT_AREA_PLAN.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
project-state/CHANGELOG.md
```

Fuer Code-/UI-Schritte zusaetzlich pruefen:

```text
remote-modboard/backend/public/assets/rdap53-permission-read-detail.js
remote-modboard/backend/public/assets/rdap28-admin-notes.js
remote-modboard/backend/src/app.js
remote-modboard/backend/src/services/auth-db-read.service.js
remote-modboard/backend/public/index.html
```

## Aktueller bestaetigter Stand

RDAP57 ist live sichtbar und RDAP57B dokumentiert den Live-Befund.

Live/UI:
- Admin -> User-Detail funktioniert weiter.
- ForrestCGN @forrestcgn / tw:127709954 ist ausgewaehlt.
- Effektive Rollen-Rechte bleiben sichtbar.
- 8 Rechte werden angezeigt.
- Rechte sind gruppiert:
  - Admin: 5 Rechte
  - Agent / Status: 1 Recht
  - Dashboard / Remote: 2 Rechte
- Admin-/Write-nahe Rechte sind als Modellanzeige markiert.
- Modulbezogene Rechte / 0 Targets bleibt sichtbar und erklaert.
- Anzeige / Diagnose bleibt sichtbar.
- Keine Schreibbuttons sichtbar.

Diagnose live:
- rolePermissions gesamt: 21
- effektive Rollenrechte: 8
- modulePermissions gesamt: 0
- passende Module-/Targets: 0
- Gruppierung: Admin · Agent/Status · Dashboard/Remote
- Quelle: /api/remote/auth/model

## RDAP58 Ergebnis

RDAP58 war Plan-only/Doku-only.

Entscheidung/Empfehlung:

```text
Permission-Read-Detail-Strang vorerst abschliessen.
```

Naechster empfohlener Step:

```text
RDAP59_ADMIN_NOTES_COMMUNITY_READ_SCOPE_PLAN
```

Empfohlene Richtung:

```text
Plan-only.
Nicht direkt Community-Read bauen.
Nicht direkt Admin-Note Update/Deactivate/Delete bauen.
Nicht direkt Permission-/Rollen-/Gruppen-Writes bauen.

Ziel:
Klaeren, ob und wie Admin-Notizen spaeter ausserhalb des Admin-Bereichs read-only sichtbar werden duerfen.
```

Leitfragen fuer RDAP59:
- Welche Notizen duerfen Community-/Nicht-Admin-Bereiche sehen?
- Welche Notiztypen bleiben admin-only?
- Welche Rollen duerfen lesen?
- Wird nur Zusammenfassung/Flag angezeigt oder kompletter Notiztext?
- Welche Privacy-/Audit-Regeln gelten?
- Welche API darf genutzt werden?
- Gibt es eine neue read-only Route oder bleibt alles im Admin-Bereich?

## Weiterhin deaktiviert

```text
Admin-Note Update
Admin-Note Deactivate
Physisches Delete
Permission-Verwaltung in der UI
Rollen-/Gruppen-Schreibverwaltung
Session-Revocation in der UI
Community-Seiten duerfen Admin-Notizen aktuell weiterhin nicht lesen
Agent/OBS/Sound/Overlay/Command/Channelpoints-Control
freie Shell-/Datei-/Prozess-/URL-Ausfuehrung
```

Start im neuen Chat:
1. Dateien aus GitHub/dev lesen.
2. Kurz bestaetigen, dass RDAP58 geplant/dokumentiert ist.
3. RDAP59 kurz planen.
4. Auf `go` warten.
