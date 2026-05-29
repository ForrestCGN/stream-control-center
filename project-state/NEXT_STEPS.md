# NEXT_STEPS

Stand: 2026-05-27

## Sofort nach STEP527 prüfen

1. Server neu starten.
2. Prüfen, ob `channelpoints.js` geladen ist:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/_status" | ConvertTo-Json -Depth 5
```

3. Channelpoints-Routen prüfen:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/channelpoints/status" | ConvertTo-Json -Depth 6
Invoke-RestMethod "http://127.0.0.1:8080/api/channelpoints/twitch/manage/status" | ConvertTo-Json -Depth 6
```

4. Neuen Test-Reward anlegen:

```text
Speichern -> lokal angelegt + Twitch erstellt + Twitch inaktiv
```

5. Übersichtsschalter testen:

```text
Twitch aktivieren -> sichtbar/einlösbar
Twitch deaktivieren -> nicht sichtbar/einlösbar
```

## Danach offen

- UI-Polish für Twitch-Aktiv/Inaktiv-Schalter.
- Prüfen, ob Status-Badges eindeutig genug sind.
- Historie/Statistik für neue Rewards weiter testen.
- Redemptions im echten Live-Stream erneut end-to-end testen.
- EventBus-Statusmeldungen für Channelpoints ggf. ausbauen.
- Sound-System-Routing im Dashboard später zentraler steuerbar machen.

## Arbeitsregel für nächste Schritte

Vor jedem Fix echte Datei prüfen oder Upload anfordern. Keine ZIPs aus Annahmen bauen.


## Nächster geplanter Block: STEP528 Overlay Health + Refresh Control

Noch nicht umgesetzt. Erst im nächsten Chat starten.

Ziel:

```text
- Overlays sollen über das Control-Center/Backend refreshbar werden.
- Zusätzlich soll sichtbar werden, ob ein Overlay selbst noch lebt oder ob OBS/Browserquelle hängt.
```

Geplanter Funktionsumfang:

```text
1. Overlay-Heartbeat per WebSocket/Event an Backend
2. Dashboard-Anzeige pro Overlay: online/offline/letzter Kontakt
3. Refresh einzelner Overlays
4. Refresh vordefinierter Gruppen, z. B. all, sound, alerts, chat
5. OBS-Browserquelle über bestehende OBS-Verbindung neu laden
6. optional Quelle kurz aus/an als härtere Reparatur
7. optional GET-Endpunkte für Streamer.bot
```

Vor Umsetzung prüfen:

```text
backend/modules/obs.js
backend/modules/scene_control.js
backend/modules/overlay_data.js
backend/modules/sound_system.js
htdocs/ws-client.js
htdocs/overlays/*.html
Dashboard Control-Center Modulstruktur
```

Wichtig:

```text
Keine Parallelstruktur bauen. Bestehende OBS-/WebSocket-/Dashboard-Systeme wiederverwenden.
```
