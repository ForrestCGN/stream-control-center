# NEXT STEPS

Stand: EVS-2 / Stream Events Backend Foundation
Datum: 2026-06-13

## Sofort nach Übernahme testen

```powershell
node -c .\backend\modules\stream_events.js
```

Server starten/neustarten und dann:

```powershell
$s = Invoke-RestMethod "http://127.0.0.1:8080/api/stream-events/status"
$s | Select-Object ok,module,moduleVersion,moduleBuild,routeCount,lastError
$s.diagnostics
```

Routen prüfen:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/stream-events/routes" | ConvertTo-Json -Depth 5
```

## Nächster fachlicher Arbeitsblock

### EVS-3 – Dashboard Skeleton

Ziel:

- `stream_events` im Dashboard sichtbar machen.
- Streamer-/modfreundliche Eventverwaltung vorbereiten.
- Keine technische Tabellenwand.
- Noch kein Chat/Playback/Overlay.

Vor Umsetzung echte Dateien prüfen:

```text
htdocs/dashboard/index.html
htdocs/dashboard/app.js
htdocs/dashboard/modules/loyalty_giveaways.js
htdocs/dashboard/modules/loyalty_giveaways.css
htdocs/dashboard/modules/loyalty_games.js
htdocs/dashboard/modules/loyalty_games.css
backend/modules/stream_events.js
```

Geplante Dateien:

```text
htdocs/dashboard/modules/stream_events.js
htdocs/dashboard/modules/stream_events.css
```

Mögliche Änderung an bestehender Datei, nur nach vollständiger Prüfung:

```text
htdocs/dashboard/index.html
```

Dashboard-Funktionen EVS-3:

- Eventliste
- Neues Event anlegen
- Sound/Text auswählen
- Startbarkeit/Validierung anzeigen
- Bearbeiten nur für Draft/Ready
- Start/Finish/Cancel mit klaren Buttons und Bestätigung
- Platzhalter/erste Dialogstruktur für Sound-/Text-Konfiguration

Nicht in EVS-3:

- Twitch-Chat-Auswertung
- Sound-/Video-Playback
- Overlay
- automatische Rundenlogik

## Danach

### EVS-4 – Sound-Spiel Backend

- Sound-Snippets als Event-Konfiguration
- Rotation
- erkannt/nicht erkannt Status
- Requeue/Remove-Regeln
- später Sound-System-Aufruf

### EVS-5 – Text-Spiel Backend

- Phrase-Hunt-Konfiguration
- Hinweis-Tokens
- Lösungserkennung
- Punktevergabe

### EVS-6 – Twitch-Chat Subscriber

- `twitch.chat.message` nur bei aktivem Event/Spiel auswerten
- keine dauerhafte unnötige Chatverarbeitung
- bestehende Command-/Twitch-Struktur nicht stören

### EVS-7 – Overlay/Playback

- zentrales Event-Overlay
- Sound/Video über vorhandenes Sound-/Media-System, soweit möglich

## StepDone

Nach erfolgreicher Übernahme von EVS-2:

```powershell
.\stepdone.cmd "EVS-2 Stream Events Backend Foundation"
```
