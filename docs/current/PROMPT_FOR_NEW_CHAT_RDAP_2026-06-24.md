# Prompt for new Chat - RDAP / Remote Modboard - 2026-06-24

Nutze diesen Prompt im neuen Chat, bevor weitergearbeitet wird.

```text
Du arbeitest im Projekt `stream-control-center` von ForrestCGN.
Sprache: Deutsch.
Arbeitsweise: erst echte Dateien/Repo prüfen, dann Plan nennen, dann auf mein `go` warten. Keine Annahmen, nicht raten, fehlende Dateien gezielt anfordern.

Single Source of Truth:
- GitHub: https://github.com/ForrestCGN/stream-control-center
- Branch: dev
- Lokales Repo: D:\Git\stream-control-center
- Lokales Live-Ziel: D:\Streaming\stramAssets
- Webserver: /opt/stream-control-center
- Remote-Modboard: /opt/stream-control-center/remote-modboard
- Public URL: https://mods.forrestcgn.de/
- Service: scc-remote-modboard.service

Wichtige Start-Dateien zuerst lesen:
- docs/current/START_HERE_FOR_NEW_CHAT.md
- docs/current/MASTER_PROMPT_stream_control_center_CLEAN_2026-06-21.txt
- docs/current/MASTER_PROMPT_RDAP_WORKFLOW_ADDENDUM_2026-06-24.md
- docs/current/RDAP_CURRENT_HANDOFF_2026-06-24.md
- docs/current/RDAP_USERMENU2_CLEAN_PROFILE_ACTIONS.md
- docs/current/RDAP_AUTH4_CURRENT_STATE_2026-06-24.md
- docs/current/RDAP_ADMIN_USERS1_READONLY_OVERVIEW.md
- project-state/CURRENT_STATUS.md
- project-state/NEXT_STEPS.md
- project-state/TODO.md
- project-state/FILES.md
- project-state/CHANGELOG.md

Aktueller RDAP-Stand:
- `mods.forrestcgn.de` läuft.
- Twitch Login ist live.
- Dashboard-Zugriff wird serverseitig geprüft.
- ForrestCGN und EngelCGN sind sichtbar.
- Dashboard-v2/V13-Look ist portiert.
- Login-/Denied-Seite ist zentriert.
- Grid-/Spacing ist korrigiert.
- Avatar oben rechts wird angezeigt.
- Profilpanel oben rechts ist Self-Service.
- `Profil aktualisieren` synchronisiert eigene Twitch-Daten.
- Profilpanel zeigt nur noch `Profil aktualisieren` und `Ausloggen`.
- Admin -> User & Rollen ist read-only sichtbar.
- Topbar hat keinen doppelten Ausloggen-Button mehr.

Wichtige Regeln:
- Keine Funktionalität entfernen.
- Keine Remote-Writes außerhalb explizit freigegebenem Scope.
- Keine Agent-Actions.
- Keine OBS-/Sound-/Overlay-/Command-Steuerung.
- Keine DB-Migration ohne Backup/Rollback/Go.
- Keine Secrets ins Repo, Frontend, Logs oder Chat.
- Keine User-/Rollen-Writes ohne eigenen Admin-Step mit Permission, Confirm-Write, Audit und Locking.
- Alles streamer-/modfreundlich halten.
- Bestehende Systeme nutzen, keine Parallelstruktur erfinden.

Lokaler Standard:
```powershell
cd D:\Git\stream-control-center
```

ZIP-/Step-Workflow:
1. ZIP mit echten Zielpfaden bauen.
2. Ich lade ZIP in Downloads.
3. Ich führe `installstep.cmd` aus.
4. Ich teste lokal.
5. Bei Erfolg `stepdone.cmd`.
6. Erst danach Webserver-Deploy.
7. Bei Fehler `stepundo.cmd`.

Webserver-Deploy-Regel:
`/opt/stream-control-center` ist kein Git-Repository. Nie dort `git pull` empfehlen.
Richtig ist:
```bash
cd /opt/stream-control-center/_deploy_tmp
rm -rf STEP_NAME
git clone --branch dev --single-branch https://github.com/ForrestCGN/stream-control-center.git STEP_NAME
cd STEP_NAME
sudo bash tools/remote-modboard-deploy.sh STEP_NAME dev
```

Nach Restart immer Readiness abwarten:
```bash
systemctl restart scc-remote-modboard.service
for i in $(seq 1 30); do
  if curl -fsS http://127.0.0.1:3010/api/remote/status >/dev/null; then
    echo "ready_after=${i}s"
    break
  fi
  sleep 1
done
```

Nächste mögliche Planung:
- Erst aktuellen Status aus GitHub/dev und Docs lesen.
- Dann entscheiden, ob als nächstes echte Admin-Userverwaltung geplant wird.
- Admin-Writes nur mit Owner/Admin-Permission, Confirm-Write, Audit-Log, Locking und Rollback.
```
