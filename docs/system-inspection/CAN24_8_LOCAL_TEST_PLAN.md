# CAN-24.8 - Lokaler Testplan fuer Sound Shadow-DryRun

## Zweck

CAN-24.8 ist kein weiterer Umbau. Dieser Schritt legt einen lokalen Testplan an, damit der aktuelle CAN-24.7 Stand wirklich auf dem Live-System geprueft werden kann.

## Wichtig

Bisher wurden nur Syntaxchecks gemacht:

```bat
node -c backend\modules\channelpoints.js
node -c backend\modules\overlay_monitor.js
node -c backend\modules\vip_sound_overlay.js
node -c backend\modules\alert_system.js
node -c backend\modules\sound_system.js
node -c backend\modules\bus_integration_matrix.js
node -c htdocs\dashboard\modules\bus_diagnostics.js
```

Das beweist nur, dass Node die Dateien parsen kann. Es beweist nicht, dass die Routen im laufenden Backend erreichbar sind.

## Testziel

Pruefen, ob folgende Dinge wirklich laufen:

```text
Backend startet
Bus-Matrix Route erreichbar
Channelpoints Kandidatenroute erreichbar
Candidate DryRun Route erreichbar
Shadow Status erreichbar
Shadow Evaluation erreichbar
Shadow Auto Status erreichbar
Dashboard Bus-Matrix zeigt die CAN24 Card
```

## Schritt 1 - ZIP entpacken

ZIP nach Repo-Root entpacken:

```text
D:\Git\stream-control-center
```

Danach:

```bat
.\stepdone.cmd "CAN-24.8 Local Route Test Plan"
```

## Schritt 2 - Deploy / Live aktualisieren

Wie gewohnt mit deinem bestehenden Workflow:

```bat
01_LIVE_AKTUALISIEREN_VON_GITHUB.cmd
```

oder falls du lokal direkt testest, darauf achten, dass der Backend-Stand wirklich im laufenden Ziel liegt.

## Schritt 3 - Node neu starten

Backend neu starten, damit neue Routen geladen werden.

## Schritt 4 - Route-Test ausfuehren

Im Repo-Root:

```bat
tools\can24_8_check_routes.cmd
```

Erwartung:

```text
HTTP 200 fuer die Diagnose-/Statusrouten
```

## Schritt 5 - Manuelle URLs pruefen

Im Browser oder per curl:

```text
http://127.0.0.1:8080/api/bus-integration-matrix/status
http://127.0.0.1:8080/api/channelpoints/bus/sound-migration-candidates
http://127.0.0.1:8080/api/channelpoints/bus/sound-migration-candidates/dry-run
http://127.0.0.1:8080/api/channelpoints/bus/sound-shadow-dry-run/status
http://127.0.0.1:8080/api/channelpoints/bus/sound-shadow-dry-run/evaluation
http://127.0.0.1:8080/api/channelpoints/bus/sound-shadow-dry-run/auto-status
```

## Schritt 6 - Dashboard pruefen

Dashboard oeffnen:

```text
http://127.0.0.1:8080/dashboard/
```

Dann:

```text
Bus-Diagnostics -> Bus-Matrix
```

Pruefen:

```text
CAN24 Sound-Migration Kandidat Card sichtbar
Kandidatenzahl sichtbar
Reward-Key sichtbar
Payload sichtbar
DryRun Ergebnis sichtbar
Shadow safe sichtbar
Auto-Prep/Hook Status sichtbar
```

## Schritt 7 - Sicherheitspruefung

Es darf weiterhin NICHT passieren:

```text
kein Sound-Play
keine Queue-Aktion
keine Reward-Ausfuehrung ueber Bus
keine Redemption-Aenderung
keine Twitch-Aktion
kein automatischer Hook in EventSub/Execute
```

## Fehlerbilder

### HTTP 404

```text
Node laeuft mit altem Stand
Dateien nicht deployed
Route nicht registriert
Backend nicht neu gestartet
```

### HTTP 500

```text
Runtime-Fehler im Modul
Log im Backend pruefen
```

### Dashboard zeigt Karte nicht

```text
Browser Cache
Dashboard JS nicht aktualisiert
Bus-Matrix Route nicht erreichbar
Backend nicht neu gestartet
```

## Nach dem Test

Erst wenn diese Punkte lokal geprueft sind, lohnt sich der naechste technische Schritt.

## Naechster Schritt nach erfolgreichem Test

```text
CAN-24.9: Testergebnis dokumentieren und erst dann entscheiden, ob ein streng begrenzter Live-Hook fuer genau einen Reward gebaut wird.
```
