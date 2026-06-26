# NEXT_CHAT_PROMPT_RDAP_AFTER_RDAP49

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
docs/current/RDAP49_ADMIN_USER_DETAIL_READONLY_PREPARED.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
project-state/CHANGELOG.md
```

## Aktueller Stand

```text
RDAP47B: Zieluser-Suche live bestaetigt.
RDAP48: Admin-User-Detailseite read-only geplant.
RDAP49: Admin-User-Detail read-only vorbereitet.
```

## RDAP49 Scope

```text
Frontend-only.
Geaendert: remote-modboard/backend/public/assets/rdap28-admin-notes.js.
Neue Ansicht: Admin -> User-Detail.
Nutzt vorhandenes GET /api/remote/auth/model.
Zeigt User-Kopf, Rollen, Gruppen und Sessions read-only.
Button Admin-Notizen oeffnen nutzt vorhandene RDAP44/RDAP47 Zieluser-Auswahl.
Keine Backend-/DB-/Permission-Aenderung.
```

## Nach RDAP49 lokal

```powershell
cd D:\Git\stream-control-center
node --check .\remote-modboard\backend\public\assets\rdap28-admin-notes.js
git status --short
git diff --stat
```

Wenn sauber:

```powershell
.\stepdone.cmd "RDAP49 vorbereitet: Admin-User-Detail read-only Frontend-only, auth/model genutzt, Rollen/Gruppen/Sessions angezeigt, Admin-Notizen-Link nutzt vorhandene Zieluser-Auswahl, keine Backend-/DB-/Permission-Aenderung"
```

## Danach Webserver-Deploy

```bash
cd /opt/stream-control-center/_deploy_tmp
rm -rf RDAP49_ADMIN_USER_DETAIL_READONLY_PREPARED
git clone --branch dev --single-branch https://github.com/ForrestCGN/stream-control-center.git RDAP49_ADMIN_USER_DETAIL_READONLY_PREPARED
cd RDAP49_ADMIN_USER_DETAIL_READONLY_PREPARED
sudo bash tools/remote-modboard-deploy.sh RDAP49_ADMIN_USER_DETAIL_READONLY_PREPARED dev
```

## Live-Test nach Deploy

```text
Admin -> User-Detail sichtbar.
ForrestCGN / tw:127709954 sichtbar.
Rollen/Gruppen/Sessions read-only sichtbar, soweit Daten vorhanden.
Admin-Notizen oeffnen setzt denselben User.
Admin-Notizen Read/Create bleiben unveraendert.
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
