# NEXT CHAT HANDOFF – Channelpoints / Sound / Media

Stand: 2026-05-27

## Wichtigster aktueller Stand

Aktueller gültiger Channelpoints-Step:

```text
STEP527_CHANNELPOINTS_CREATE_SAVE_TWITCH_INACTIVE_DEFAULT_v0.9.13
```

Der vorige STEP526 hat den Startfehler behoben, STEP527 enthält zusätzlich das gewünschte neue Verhalten für neue Rewards.

## Nicht verwenden

```text
STEP524_MEDIA_ASSET_FILENAME_ENCODING_CLEANUP_v0.1.0
STEP525_CHANNELPOINTS_SAVE_ACTIVE_SYNCS_TWITCH_v0.9.11
STEP525_CHANNELPOINTS_SIMPLIFIED_TWITCH_ACTIVATION_FLOW_v0.9.11
```

STEP526 ist durch STEP527 ersetzt.

## Bedienkonzept Channelpoints

```text
Editor:
- kein Aktiv-Häkchen
- Speichern legt lokal an/ändert lokal
- Speichern erstellt/aktualisiert Twitch
- neuer Twitch-Reward standardmäßig inaktiv

Übersicht:
- Aktiv/Inaktiv-Schalter betrifft nur Twitch sichtbar/einlösbar
```

## Kritischer letzter Fehler

Beim Serverstart fehlte `channelpoints.js` in `/api/_status`, obwohl Datei existierte. Ursache im Log:

```text
[module] FAILED: channelpoints.js
deleteRewardFromTwitch is not defined
```

Nach STEP527 muss `/api/_status` `channelpoints.js` wieder in der Modulliste zeigen.

## Direkt nach Start prüfen

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/_status" | ConvertTo-Json -Depth 5
```

Dann:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/channelpoints/status" | ConvertTo-Json -Depth 6
Invoke-RestMethod "http://127.0.0.1:8080/api/channelpoints/twitch/manage/status" | ConvertTo-Json -Depth 6
```

## Bekannte Twitch-Sache

Wenn Twitch offline meldet, Reward könne nur während eines Streams eingelöst werden, `max_per_stream` prüfen. Bei `max_per_stream > 0` ist die Belohnung streamgebunden.

## Sound-System

Aktueller Standard:

```text
Channelpoints: Auto / Sound-System entscheidet
Sound-System: Device für Audio
Ziel: Stream + Discord
```

## Arbeitsregel

Vor jedem neuen Fix echte Dateien prüfen. Keine neuen ZIPs auf Basis von Annahmen. Wenn Dateien benötigt werden, konkret anfordern:

```text
Ich brauche genau diese Datei: [Pfad]
```


## Letzter Gesprächsstand nach Dokumentation

Channelpoints-Stand bleibt STEP527. Danach wurde kein neuer Code-Step umgesetzt.

Wichtige Klärung:

```text
Ein sichtbarer Twitch-Fehler mit Client-ID/Reward-ID kam von einem alten SoundAlerts-bezogenen Reward/Altbestand und war kein neuer Fehler im Channelpoints-System.
```

Geplanter nächster Arbeitsblock für morgen:

```text
STEP528_OVERLAY_HEALTH_AND_REFRESH_CONTROL
```

Ziel STEP528:

```text
- echte vorhandene Overlay-/OBS-/WebSocket-Dateien zuerst prüfen
- Overlay-Heartbeat planen/umsetzen
- Dashboard-Status: Overlay online/offline/letzter Kontakt
- Refresh-Aktionen für einzelne Overlays und Gruppen
- OBS-Browserquellen hart refreshen, wenn Browser Source hängt
- optional interne Overlay-Refresh-Nachricht via WebSocket
- optional Streamer.bot-kompatible GET-Route für Refresh
```

Warum STEP528:

```text
OBS macht aktuell Probleme bzw. es ist unklar, ob das Overlay selbst hängt oder OBS/Browserquelle nicht sauber rendert.
Das System soll unterscheidbar machen:
Overlay meldet Heartbeat -> Overlay lebt, Problem eher OBS/Browserquelle
Overlay meldet nichts -> Overlay/Browserquelle hängt, Refresh sinnvoll
OBS nicht verbunden -> Backend kann Quelle nicht refreshen, OBS-WebSocket/OBS prüfen
```

Vor STEP528 zwingend prüfen:

```text
backend/modules/obs.js
backend/modules/scene_control.js
backend/modules/overlay_data.js
backend/modules/sound_system.js
htdocs/ws-client.js
relevante Overlay-HTML/JS-Dateien in htdocs/overlays
```

Keine Implementierung ohne echte Dateiprüfung.
