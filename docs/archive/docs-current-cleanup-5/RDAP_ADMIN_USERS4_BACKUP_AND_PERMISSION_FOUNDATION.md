# RDAP_ADMIN_USERS4_BACKUP_AND_PERMISSION_FOUNDATION

Stand: 2026-06-24  
Scope: Doku / Backup- und Permission-Foundation, keine produktiven Admin-Writes

## Ziel

Dieser Step bereitet die spaetere Admin-Userverwaltung fuer `Admin -> User & Rollen` weiter vor.

Es wird weiterhin nichts produktiv gebaut:

- keine User-/Rollen-/Gruppen-/Session-Writes
- keine Admin-Write-Routen
- keine UI-Schreibbuttons
- keine DB-Migration
- keine SQL-Datei
- keine Remote-Agent-Actions
- keine OBS-/Sound-/Overlay-/Command-Steuerung
- keine Secrets im Repo, Frontend, Log oder Chat

## Ausgangslage

Aktuell bestaetigt:

- `mods.forrestcgn.de` laeuft.
- Twitch Login ist live.
- Dashboard-Zugriff wird serverseitig geprueft.
- ForrestCGN und EngelCGN sind sichtbar.
- Dashboard-v2/V13-Look ist portiert.
- Login-/Denied-Seite ist zentriert.
- Grid-/Spacing ist korrigiert.
- Avatar oben rechts wird angezeigt.
- Self-Profilpanel oben rechts ist vorhanden.
- `Profil aktualisieren` synchronisiert nur eigene Twitch-Daten.
- Profilpanel zeigt nur noch `Profil aktualisieren` und `Ausloggen`.
- Admin -> User & Rollen ist read-only sichtbar.
- Topbar hat keinen doppelten Ausloggen-Button mehr.
- `RDAP_ADMIN_USERS2_MANAGEMENT_PLAN` und `RDAP_ADMIN_USERS3_WRITE_FOUNDATION_PLAN` sind als Planungsgrundlage vorhanden.

## Gepruefte Tabellenbasis

Die aktuelle read-only Auth-/Admin-Uebersicht nutzt bzw. beschreibt folgende Tabellen als relevante Grundlage:

```text
dashboard_users
dashboard_identities
dashboard_roles
dashboard_user_roles
dashboard_groups
dashboard_user_groups
dashboard_permissions
dashboard_role_permissions
dashboard_module_permissions
dashboard_sessions
dashboard_locks
dashboard_audit_log
```

Wichtig: Diese Liste ist eine Planungsgrundlage aus dem vorhandenen Read-only-Modell. Vor jedem echten Write-Step muessen die tatsaechlichen Spalten, Constraints und Indizes direkt aus der produktiven DB bzw. aus dem echten Code geprueft werden.

## Backup-Regel fuer spaetere Write-Steps

Vor jedem produktiven DB-Write-Step gilt:

1. DB-Art und echte Env-Konfiguration pruefen.
2. Backup ausserhalb des Repos erzeugen.
3. Backup-Dateiname mit Datum/Uhrzeit und Step-Name.
4. Kein Secret im Chat, Repo oder Log ausgeben.
5. Backup-Erfolg vor dem Write pruefen.
6. Rollback-Hinweis dokumentieren.
7. Erst danach produktiven Write-Step ausfuehren.

### Remote-Backup-Vorlage

Nur als Muster fuer den spaeteren Admin-Write-Step. Vor Ausfuehrung muss die echte Server-Env geprueft werden.

```bash
sudo mkdir -p /opt/stream-control-center/_runtime_tmp/db_backups

set -a
. /etc/stream-control-center/remote-modboard.env
set +a

backup="/opt/stream-control-center/_runtime_tmp/db_backups/remote_modboard_before_RDAP_ADMIN_USERS_WRITE_$(date +%Y%m%d_%H%M%S).sql"

mysqldump \
  --host="$DB_HOST" \
  --port="$DB_PORT" \
  --user="$DB_USER" \
  --password="$DB_PASSWORD" \
  --single-transaction \
  --routines \
  --triggers \
  "$DB_NAME" > "$backup"

ls -lh "$backup"
```

Hinweis: Der Befehl darf keine Secrets ausgeben. Wenn die Umgebung anders aufgebaut ist, muss der Befehl angepasst werden.

## Rollback-Grundregel

Rollback ist kein Ratespiel.

Vor einem echten Write-Step muss dokumentiert werden:

- welche Tabellen betroffen sind
- welche Zeilen anhand welcher IDs betroffen sind
- welche alten Werte wiederherstellbar sein muessen
- ob ein kompletter DB-Restore oder ein gezielter Korrektur-Write vorgesehen ist
- welche Aktion im Audit als Rollback/Korrektur markiert wird

Fuer kleine Admin-Aenderungen ist ein gezielter Korrektur-Write meistens sinnvoller als ein kompletter DB-Restore. Ein kompletter Restore darf nur bewusst erfolgen, weil dadurch spaetere legitime Aenderungen verloren gehen koennen.

## Permission-Read-Modell

Vor jedem spaeteren Admin-Write muss serverseitig geprueft werden:

- eingeloggter User vorhanden
- Session gueltig
- User nicht gesperrt
- User hat Owner- oder Admin-Berechtigung fuer diese Aktion
- Actor darf Ziel-User bearbeiten
- Actor darf sich nicht selbst hoeherstufen
- Admin darf Owner/Admin-Sicherheitsgrenzen nicht aendern
- fehlende Permission ergibt `403`
- fehlende Session ergibt `401`
- UI-Rechte sind nur Komfort, nicht Sicherheit

### Owner

Owner darf spaeter sicherheitskritische Userverwaltung ausfuehren, aber nur mit Confirm-Write, Audit und Locking.

Geplante Owner-Aktionen:

```text
- User freigeben/sperren
- Admin-Rollen vergeben/entziehen
- Gruppen/Freigaben vergeben/entziehen
- Sessions widerrufen
- Lock übernehmen
- Rollback-/Korrekturaktionen auslösen
- Owner-/Admin-Sicherheitsgrenzen verwalten
```

### Admin

Admin darf spaeter normale Userverwaltung ausfuehren, aber keine Owner-/Security-Grenzen aendern.

Geplante Admin-Aktionen:

```text
- normale User freigeben/sperren
- nicht-kritische Gruppen/Freigaben verwalten, sofern erlaubt
- Userdetails lesen
- Audit-Verlauf pro User lesen, sofern erlaubt
- Sessions normaler User widerrufen, sofern erlaubt
```

Admin darf nicht:

```text
- Owner verwalten
- Owner-Rechte vergeben/entziehen
- eigene Sicherheitsrechte erhöhen
- Admin-Sicherheitsgrenzen umgehen
- Agent-/Systemaktionen freischalten
```

## Confirm-Write-Foundation

Jeder spaetere produktive Admin-Write braucht eine explizite Bestaetigung.

Mindeststandard:

- produktive Writes nur per `POST`, `PATCH` oder `DELETE`
- keine produktiven Writes per `GET`
- Request braucht `confirmWrite=true`
- bei kritischen Aktionen zusaetzlich Ziel-Aktion/Ziel-User im Body
- Backend prueft Confirm serverseitig
- fehlendes Confirm ergibt klare Fehlermeldung
- Diagnose-/Status-/Refresh-Routen duerfen niemals schreiben

Beispiel nur als spaeteres Zielbild:

```text
POST /api/remote/admin/users/:userId/actions/approve
Body:
{
  "confirmWrite": true,
  "reason": "Freigabe nach Prüfung"
}
```

Die konkrete Route wird erst im Implementierungs-Step gebaut.

## Audit-Foundation

Jeder spaetere Admin-Write muss auditiert werden.

Pflichtdaten:

```text
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
```

Nicht speichern:

```text
- Twitch-Tokens
- Session-Secrets
- Session-IDs im Klartext
- OAuth-State-Secrets
- Passwörter
- API-Secrets
```

Audit gilt auch fuer abgelehnte Admin-Writes, Lock-Overrides und Rollback-/Korrekturaktionen.

## Locking-Foundation

Admin-Userverwaltung braucht einen Schreib-Lock, bevor echte Writes aktiviert werden.

Geplantes Verhalten:

- Lock auf Ziel-User oder Userverwaltungsbereich
- Heartbeat
- Timeout
- andere User sehen weiter read-only
- Anzeige, wer gerade bearbeitet
- Owner/Admin kann abgelaufene Locks uebernehmen
- Lock-Override wird auditiert
- keine Massenbearbeitung ohne eigenes Lock-/Audit-Konzept

## Sound-Profi bleibt keine Systemrolle

`Sound-Profi` bleibt eine spaetere Gruppe/Freigabe, keine globale Owner-/Admin-Rolle.

Sound-Profi darf spaeter nur in freigegebenen Modulbereichen:

```text
- Media/Sounds hochladen
- Sounds bearbeiten
- Sounds testen
- Sounds Kategorien zuordnen
- ggf. Sound-Commands/Kanalpunkte-Zuordnung bearbeiten
```

Sound-Profi darf nicht:

```text
- User verwalten
- Rollen vergeben
- Admin-/Owner-Rechte ändern
- Secrets sehen
- Agent-Actions auslösen
- OBS/Shell/Dateisystem frei steuern
- Sicherheits-/Systemeinstellungen ändern
```

## Kleinster sinnvoller naechster Code-Step

Empfohlen nach diesem Doku-/Foundation-Step:

```text
RDAP_ADMIN_USERS5_PERMISSION_READ_DIAGNOSTIC
```

Ziel:

- echte Permission-Read-Logik fuer aktuell eingeloggten User pruefen
- Admin-/Owner-Erkennung serverseitig diagnostisch sichtbar machen
- keine produktiven User-/Rollen-Writes
- keine UI-Schreibbuttons
- keine DB-Migration
- keine Remote-Actions

Moegliche spaetere technische Bausteine erst nach erneuter Datei-/Codepruefung:

```text
remote-modboard/backend/src/services/admin-user-permission-read.service.js
remote-modboard/backend/src/routes/admin-users.routes.js
```

Wichtig: Beim echten Implementierungs-Step zuerst vorhandene Services pruefen. Neue Dateien nur bauen, wenn sie sinnvoller sind als Erweiterungen vorhandener Services. Keine Parallelstruktur erfinden.

## Harte Grenze dieses Steps

Nicht enthalten:

```text
remote-modboard/backend/public/index.html
remote-modboard/backend/public/assets/remote-modboard.js
remote-modboard/backend/public/assets/remote-modboard.css
remote-modboard/backend/src/routes/admin-users.routes.js
remote-modboard/backend/src/services/admin-user-permission-read.service.js
db/*
```

Kein Webserver-Deploy noetig, wenn nur diese Doku-Dateien geaendert werden.

## Webserver-Deploy-Regel fuer spaeter

`/opt/stream-control-center` ist kein Git-Repository. Nie dort `git pull` empfehlen.

Richtig:

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
