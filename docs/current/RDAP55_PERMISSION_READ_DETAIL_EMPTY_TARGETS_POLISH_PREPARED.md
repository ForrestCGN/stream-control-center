# RDAP55_PERMISSION_READ_DETAIL_EMPTY_TARGETS_POLISH_PREPARED

Datum: 2026-06-26
Projekt: `stream-control-center` / Remote-Modboard / RDAP

## Zweck

RDAP55 setzt den in RDAP54 geplanten kleinen Frontend-only Polish um.

Ausgangslage:

```text
Admin -> User-Detail zeigt RDAP53-read-only Karten.
Effektive Rollen-Rechte sind sichtbar.
Modulbezogene Rechte sind sichtbar.
Live liefert /api/remote/auth/model aktuell rolePermissions=21 und modulePermissions=0.
Die Anzeige `0 Targets` ist technisch korrekt, kann aber ohne Erklärung wie ein Fehler wirken.
```

## Umgesetzt

Geändert wurde nur:

```text
remote-modboard/backend/public/assets/rdap53-permission-read-detail.js
```

Die bestehende RDAP53-Datei wurde fachlich erweitert. Es wurde keine neue Parallelstruktur gebaut.

## UI-Polish

Bei leeren Module-/Targetrechten zeigt die Karte jetzt klarer:

```text
Keine Modul-/Targetrechte vorhanden.
Das Auth-Modell liefert aktuell 0 modulePermissions.
Rollenrechte werden separat unter `Effektive Rollen-Rechte` angezeigt.
Das ist kein Fehler und keine fehlgeschlagene Berechtigungsprüfung.
```

Zusätzlich wurde die Diagnose-Karte erweitert:

```text
rolePermissions gesamt
Effektive Rollenrechte
modulePermissions gesamt
passende Module-/Targets
Quelle: /api/remote/auth/model
```

## Technischer Scope

```text
Frontend-only.
Bestehendes /api/remote/auth/model wird weiterverwendet.
Keine Änderung an app.js.
Keine Änderung an index.html.
Keine neue Backend-Route.
Keine Service-Änderung.
Keine DB-Migration.
Keine Writes.
```

## Sicherheitsbewertung

RDAP55 ändert nur Anzeige-/Erklärungstexte.

```text
Keine Permission-/Rollen-/Gruppen-Schreibbuttons.
Keine Session-Revocation.
Kein Admin-Note Update.
Kein Admin-Note Deactivate.
Kein physisches Delete.
Keine Community-Read-Anbindung für Admin-Notizen.
Keine Agent-/OBS-/Sound-/Overlay-/Command-/Channelpoints-Steuerung.
```

## Test lokal

```powershell
node --check .\remote-modboard\backend\public\assets\rdap53-permission-read-detail.js
git status --short
git diff --stat
```

## Test live nach Deploy

```text
Admin -> User-Detail öffnen.
ForrestCGN auswählen.
Effektive Rollen-Rechte müssen sichtbar bleiben.
Modulbezogene Rechte müssen sichtbar bleiben.
Bei 0 modulePermissions muss erklärt werden, warum 0 Targets angezeigt werden.
Diagnose muss rolePermissions/modulePermissions zählen.
Keine Schreibbuttons sichtbar.
Admin-Notizen-Bridge bleibt unverändert funktionsfähig.
```

## Deploy-Hinweis

RDAP55 ändert eine Datei unter `remote-modboard/`.

Nach lokalem Test und `stepdone.cmd` ist ein Webserver-Deploy aus frischem GitHub/dev-Clone nötig:

```bash
cd /opt/stream-control-center/_deploy_tmp
rm -rf RDAP55_PERMISSION_READ_DETAIL_EMPTY_TARGETS_POLISH_PREPARED
git clone --branch dev --single-branch https://github.com/ForrestCGN/stream-control-center.git RDAP55_PERMISSION_READ_DETAIL_EMPTY_TARGETS_POLISH_PREPARED
cd RDAP55_PERMISSION_READ_DETAIL_EMPTY_TARGETS_POLISH_PREPARED
sudo bash tools/remote-modboard-deploy.sh RDAP55_PERMISSION_READ_DETAIL_EMPTY_TARGETS_POLISH_PREPARED dev
```

Kein zusätzlicher manueller `systemctl restart` nach dem Deploy-Script.
