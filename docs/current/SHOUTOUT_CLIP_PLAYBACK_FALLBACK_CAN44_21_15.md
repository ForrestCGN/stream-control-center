# CAN-44.21.15 – Shoutout Clip Playback Fallback

## Ziel

Das Shoutout-System nähert sich beim Clip-Handling wieder dem alten, stabilen Streamer.bot-Verhalten an: Es soll nicht nach einem einzelnen problematischen Clip sofort abbrechen.

## Geänderte Datei

- `backend/modules/clip_shoutout.js`

## Änderungen

- Modulversion auf `0.2.27` erhöht.
- Standard-Suchbereiche erweitert auf `90 / 365 / 730 / 1095 / all-time`.
- Die Clip-Suche bricht nicht mehr sofort beim ersten `fallback_duration`-Treffer ab, sondern sucht weiter nach passenden `duration_ok`-Clips in späteren Zeiträumen.
- Neuer Standardwert `clipPlaybackCandidateLimit: 8`.
- Bei Playback-Fehlern wird nicht mehr sofort der ganze Shoutout als fehlgeschlagen markiert.
- Das System testet mehrere Clip-Kandidaten und nutzt den ersten Clip, für den eine Playback-URL vorbereitet werden kann.
- `lastRun.playbackAttempts` dokumentiert getestete Clip-IDs, Titel, Dauer und Fehler.

## Nicht geändert

- Keine Datenbankmigration.
- Kein Dashboard-Umbau.
- Keine neuen produktiven Buttons.
- Keine Änderungen am offiziellen Twitch-Shoutout-Cooldown.
- Kein kompletter Browser-Embed-Umbau. Der alte Browser-Player-Weg bleibt ein möglicher nächster Schritt.

## Tests

```powershell
cd D:\Git\stream-control-center
node -c backend\modules\clip_shoutout.js
.\stepdone.cmd "CAN-44.21.15 Clip Playback Fallback"
```

Danach Backend/Node neu starten und prüfen:

```powershell
$s = Invoke-RestMethod "http://127.0.0.1:8080/api/clip-shoutout/status"
$s | Select-Object moduleVersion,lastError,lastRun | ConvertTo-Json -Depth 30
```

Erwartung:

```text
moduleVersion = 0.2.27
```

Live-Test:

```text
!so @pretos1 --force
!so @together_not_alone --force
```

Bei Fehlern prüfen:

```powershell
$s = Invoke-RestMethod "http://127.0.0.1:8080/api/clip-shoutout/status"
$s | Select-Object moduleVersion,lastError,lastRun,lastClipSearch | ConvertTo-Json -Depth 50
```

Wichtig sind dann `lastRun.playbackAttempts` und `lastClipSearch`.
