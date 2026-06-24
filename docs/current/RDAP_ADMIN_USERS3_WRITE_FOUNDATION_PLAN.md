# RDAP_ADMIN_USERS3_WRITE_FOUNDATION_PLAN

Stand: 2026-06-24  
Scope: Planung/Dokumentation, keine produktive Umsetzung

## Ziel

Dieser Step konkretisiert die spätere Write-Grundlage für `Admin -> User & Rollen` im Remote-Modboard.

Es wird weiterhin nichts produktiv gebaut:

- keine User-/Rollen-/Gruppen-/Session-Writes
- keine DB-Migration
- keine neuen Admin-Write-Routen
- keine UI-Schreibfunktionen
- keine Remote-Agent-Actions
- keine OBS-/Sound-/Overlay-/Command-Steuerung
- keine Secrets im Repo, Frontend, Log oder Chat

## Ausgangslage

Aktuell gilt:

- `mods.forrestcgn.de` läuft.
- Twitch Login ist live.
- Dashboard-Zugriff wird serverseitig geprüft.
- Self-Profil oben rechts ist vorhanden.
- `Profil aktualisieren` synchronisiert nur eigene Twitch-Daten.
- `Ausloggen` liegt im Profilpanel.
- Topbar hat keinen doppelten Logout-Button mehr.
- `Admin -> User & Rollen` ist read-only sichtbar.
- `RDAP_ADMIN_USERS2_MANAGEMENT_PLAN` hat die Grundregeln für spätere Userverwaltung geplant.

## Harte Grenze dieses Steps

Dieser Step ist ausschließlich eine Foundation-Planung.

Nicht enthalten:

- keine Änderung an `remote-modboard/backend/public/index.html`
- keine Änderung an `remote-modboard/backend/public/assets/remote-modboard.js`
- keine Änderung an `remote-modboard/backend/public/assets/remote-modboard.css`
- keine Änderung an Backend-Routen
- keine Änderung an Auth-/Profil-/Session-Services
- keine DB-Schemaänderung
- keine SQL-Datei
- kein Webserver-Deploy

## Trennung Self-Profil vs. Admin-Verwaltung

### Self-Profil

Das Profilpanel oben rechts bleibt nur Self-Service:

- eigene Twitch-Daten aktualisieren
- ausloggen

Dort gehören keine Admin-Aktionen hin.

### Admin-Verwaltung

Alle späteren Verwaltungsfunktionen gehören ausschließlich unter:

```text
Admin -> User & Rollen
```

Dort darf später geschrieben werden, aber nur mit:

- serverseitiger Permission-Prüfung
- Confirm-Write
- Audit
- Locking
- Backup-/Rollback-Regel

## Permission-Modell für spätere Writes

### Owner

Owner darf später grundsätzlich sicherheitskritische Userverwaltung ausführen, sofern Confirm-Write, Audit und Locking aktiv sind.

Geplante Owner-Aktionen:

- User freigeben/sperren
- Admin-Rollen vergeben/entziehen
- Gruppen/Freigaben vergeben/entziehen
- Sessions widerrufen
- Lock übernehmen
- Rollback-/Korrekturaktionen auslösen
- Owner-/Admin-Sicherheitsgrenzen verwalten

### Admin

Admin darf später normale Userverwaltung ausführen, aber keine Owner-/Security-Grenzen ändern.

Geplante Admin-Aktionen:

- normale User freigeben/sperren
- nicht-kritische Gruppen/Freigaben verwalten, sofern erlaubt
- Userdetails lesen
- Audit-Verlauf pro User lesen, sofern erlaubt
- Sessions normaler User widerrufen, sofern erlaubt

Admin darf nicht:

- Owner verwalten
- Owner-Rechte vergeben/entziehen
- eigene Sicherheitsrechte erhöhen
- Admin-Sicherheitsgrenzen umgehen
- Agent-/Systemaktionen freischalten

## Sound-Profi-Definition

`Sound-Profi` bleibt keine globale Systemrolle.

Geplant ist eine spätere Gruppe/Freigabe für konkrete Module.

Sound-Profi darf später nur in freigegebenen Modulbereichen:

- Media/Sounds hochladen
- Sounds bearbeiten
- Sounds testen
- Sounds Kategorien zuordnen
- ggf. Sound-Commands/Kanalpunkte-Zuordnung bearbeiten

Sound-Profi darf nicht:

- User verwalten
- Rollen vergeben
- Admin-/Owner-Rechte ändern
- Secrets sehen
- Agent-Actions auslösen
- OBS/Shell/Dateisystem frei steuern
- Sicherheits-/Systemeinstellungen ändern

## Confirm-Write-Regel

Jede spätere produktive Admin-Schreibaktion braucht eine explizite Bestätigung.

Mindestregel:

- produktive Admin-Writes nur per `POST`, `PATCH` oder `DELETE`
- keine produktiven Writes per `GET`
- Request braucht `confirmWrite=true` oder äquivalentes explizites Confirm-Feld
- Backend prüft Confirm serverseitig
- UI muss Aktion, Ziel-User und Wirkung klar anzeigen
- fehlendes Confirm ergibt verständliche Fehlermeldung
- Diagnose-/Status-/Refresh-Routen dürfen niemals schreiben

Beispiel nur als spätere Zielrichtung:

```text
POST /api/remote/admin/users/:userId/actions/approve
Body: { "confirmWrite": true, "reason": "..." }
```

Die konkrete Route wird erst im Implementierungs-Step festgelegt.

## Audit-Write-Pflicht

Jeder spätere Admin-Write muss auditiert werden.

Pflichtfelder:

- Zeitpunkt
- Actor/User
- Actor-Rolle/Rechte zum Zeitpunkt der Aktion
- Ziel-User
- Aktionstyp
- alter Wert
- neuer Wert
- Ergebnis: success / failed / denied
- Grund oder Quelle: dashboard/admin-ui/api
- Request-Kontext ohne Secrets

Nicht speichern:

- Twitch-Tokens
- Session-Secrets
- Session-IDs im Klartext
- OAuth-State-Secrets
- Passwörter
- API-Secrets

Fehler dürfen verständlich sein, aber keine sensiblen Details leaken.

## Locking-Regel

Admin-Userverwaltung braucht einen Schreib-Lock.

Geplantes Verhalten:

- Bearbeiten öffnet Lock auf Userverwaltung oder Ziel-User.
- Lock hat Heartbeat und Timeout.
- Andere sehen die Daten weiter read-only.
- Anzeige zeigt, wer bearbeitet.
- Owner/Admin kann abgelaufene Locks übernehmen.
- Lock-Override wird auditiert.
- Keine Massenbearbeitung ohne eigenes Lock-/Audit-Konzept.

## Backup-/Rollback-Scope

Vor dem ersten echten Write-Step muss geprüft und dokumentiert werden:

- welche Tabellen wirklich betroffen sind
- welche Spalten geschrieben werden
- wie ein DB-Backup erstellt wird
- wie einzelne Fehländerungen rückgängig gemacht werden
- wie falsche Rollen-/Gruppen-Zuweisungen korrigiert werden
- welche Daten niemals überschrieben/gelöscht werden dürfen

Für DB-Migrationen bleibt verbindlich:

- kein produktiver Schema-Change ohne Backup
- kein Schema-Change ohne Rollback-Hinweis
- nur sanfte Migrationen
- keine bestehenden Daten löschen oder überschreiben
- kein Secret-Dump in Doku, Chat oder Repo

## Zielbild späterer technischer Bausteine

Nur Zielbild, noch nicht bauen.

Mögliche spätere Bausteine:

```text
remote-modboard/backend/src/routes/admin-users.routes.js
remote-modboard/backend/src/services/admin-user-permission.service.js
remote-modboard/backend/src/services/admin-user-confirm.service.js
remote-modboard/backend/src/services/admin-user-audit.service.js
remote-modboard/backend/src/services/admin-user-lock.service.js
```

Wichtig: Beim echten Implementierungs-Step zuerst vorhandene Services prüfen. Neue Dateien nur bauen, wenn sie sinnvoller sind als Erweiterungen vorhandener Services. Keine Parallelstruktur erfinden.

## Betroffene vorhandene Dateien für spätere Prüfung

Vor Umsetzung gezielt prüfen:

```text
remote-modboard/backend/src/services/auth-db-read.service.js
remote-modboard/backend/src/services/auth-profile-sync.service.js
remote-modboard/backend/src/routes/auth-status.routes.js
remote-modboard/backend/src/routes/routes.routes.js
remote-modboard/backend/public/index.html
remote-modboard/backend/public/assets/remote-modboard.js
remote-modboard/backend/public/assets/remote-modboard.css
```

Zusätzlich relevante Doku:

```text
docs/current/RDAP_ADMIN_USERS1_READONLY_OVERVIEW.md
docs/current/RDAP_ADMIN_USERS2_MANAGEMENT_PLAN.md
docs/current/RDAP_AUTH4_CURRENT_STATE_2026-06-24.md
```

## Kleinster sicherer nächster echter Step

Empfohlener nächster Step nach dieser Planung:

```text
RDAP_ADMIN_USERS4_BACKUP_AND_PERMISSION_FOUNDATION
```

Ziel von RDAP_ADMIN_USERS4:

- echte Tabellen/Spalten prüfen
- Backup-Befehl dokumentieren
- Rollback-Befehl dokumentieren
- Permission-Read prüfen
- Confirm-Write-Helfer planen oder minimal vorbereiten
- Audit-Ziel prüfen
- weiterhin keine großen User-/Rollen-Writes bauen

## Lokale Testreihenfolge für spätere Write-Foundation

Wenn später Code gebaut wird:

1. ZIP lokal einspielen.
2. Service lokal starten/neustarten, falls nötig.
3. Read-only Status prüfen.
4. Permission-Status prüfen.
5. Confirm-Write-Negativtest: ohne Confirm muss Aktion abgelehnt werden.
6. Audit-Negativ-/Read-Test prüfen.
7. `git status` prüfen.
8. Bei Erfolg `stepdone.cmd`.
9. Erst danach Webserver-Deploy.

## Webserver-Deploy-Grenze

Für diesen Plan-Step ist kein Webserver-Deploy nötig, weil keine produktiven Dateien für den Server geändert werden.

Wenn später deployt wird, gilt weiter:

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
