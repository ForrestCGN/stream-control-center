# Current Status – stream-control-center

Stand: 2026-05-21

## STEP270B - Sound Pegel-Scan Dashboard View

Der Read-only Pegel-Scanner ist jetzt im Sound-Dashboard sichtbar.

Aktueller funktionaler Stand:

- Neuer Dashboard-Tab `Pegel-Scan` im bestehenden Sound-System-Modul.
- Keine neue Hauptnavigation und keine Parallel-UI.
- Neue Dateien:
  - `htdocs/dashboard/modules/sound_levelscan.js`
  - `htdocs/dashboard/modules/sound_levelscan.css`
- `htdocs/dashboard/index.html` bindet JS/CSS ein.
- Die UI nutzt ausschließlich Backend-APIs:
  - `GET /api/sound/loudness/status`
  - `POST /api/sound/loudness/scan`
  - `GET /api/sound/loudness/results`
- Der Tab zeigt Zielwerte, letzten Scan, Ergebniszahlen, LUFS, True Peak, empfohlenen Gain, empfohlenes Volume und Warnungen.
- Filter und Sortierung sind vorbereitet:
  - Status: alle/ok/warning/error
  - Suche nach Dateipfad
  - Sortierung nach Gain, LUFS, True Peak, Volume, Dateiname, Scan-Zeit

Nicht geaendert:

```text
app.sqlite
config/**
backend/modules/sound_system.js
backend/modules/sound_loudness_scanner.js
backend/modules/alert_system.js
backend/modules/soundalerts_bridge.js
backend/modules/tts_system.js
Streamer.bot-Flows
Overlay-HTML
Sound-System Queue-/Prioritaetslogik
Discord-Routing
Alert-Bundle-Lock-Logik
```

## STEP270A/STEP270A1 - Sound Loudness Scanner Read-only

- Backend-Scanner ist read-only vorhanden.
- STEP270A1 hat die Results-Route repariert.
- Bestaetigt:
  - Statusroute funktioniert.
  - Routesroute funktioniert.
  - Scan mit Limit 20 funktioniert.
  - Resultsroute funktioniert.

## STEP269A-C - Sound/Discord Integration STABLE

Der Sound-/Discord-Stand ist nach manuellen Tests stabil.

Bestaetigt:

```text
STEP269A - Sound-System Discord Target Playback
STEP269B - Sound-System Discord Auto Routing
STEP269C - VIP-/Mod-Sounds auf target=both
```

Aktueller funktionaler Stand:

- Sound-System ist Master fuer Queue, Prioritaeten, Bundle-Lock und Startzeitpunkt.
- Discord-Ausgabe haengt am echten Sound-System-Item-Start.
- Discord nutzt die vorhandene Bridge aus `backend/modules/discord.js`.
- `backend/modules/sound_system.js` fuehrt Discord-Playback ueber `app.locals.discordBridge.enqueueSound(...)` aus.
- `backend/modules/vip_sound_overlay.js` setzt fuer echte VIP-/Mod-Sounds nicht mehr hart `target=stream`.
- VIP-/Mod-Sounds nutzen jetzt konfigurierbares `soundSystemTarget`, Standard `both`.

Offen:

- Echter SoundAlert/Kanalpunkte-Ablauf beobachten.
- Echter Alert + Alert-TTS Ablauf beobachten.
- Normales Chat-TTS nur anfassen, wenn Discord-Ausgabe dort fehlt.
- Optional: MP3s mit eingebettetem Cover/Artwork nicht als Video behandeln, wenn nur Audio gewuenscht ist.
