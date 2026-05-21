# Current Status – stream-control-center

Stand: 2026-05-21


## STEP270E - Sound Pegel-Scan Fortschrittsanzeige

- Pegel-Scan unterstuetzt jetzt asynchronen Scan-Modus mit Fortschritt im Status-Endpoint.
- `POST /api/sound/loudness/scan` kann mit `async=true` gestartet werden.
- `GET /api/sound/loudness/status` liefert `progress` mit Scan-ID, Status, Prozent, aktueller Datei, Zaehlwerten fuer OK/Warnung/Fehler.
- Dashboard zeigt Fortschrittsbalken, aktuelle Datei und Live-Zaehler.
- Weiterhin read-only: keine Sound-Dateien, keine Playback-Korrektur, keine Queue-/Discord-/Alert-/TTS-Aenderung.

## STEP270D1 - Pegel-Scan ohne TTS-Dateien

Der Pegel-Scan filtert TTS-/Speech-Dateien jetzt standardmaessig heraus.

Aktueller funktionaler Stand:

- `backend/modules/sound_loudness_scanner.js` erweitert.
- Neue Scans lassen typische TTS-/Speech-Pfade aus.
- `GET /api/sound/loudness/results` blendet TTS-/Speech-Ergebnisse standardmaessig aus.
- `GET /api/sound/loudness/status` zeigt die Ausschlussregel in den Defaults.
- `htdocs/dashboard/modules/sound_levelscan.js` zeigt im Pegel-Scan den Hinweis `TTS raus`.

Nicht geaendert:

```text
app.sqlite
config/**
backend/modules/sound_system.js
Alert-System
Sound-System Queue/Discord/Bundle-Logik
Sound-Dateien
```


## STEP270D - Pegel-Scan Korrektur-Vorschau

Der Pegel-Scan zeigt jetzt zusätzlich eine Vorschau, welche Korrektur später möglich wäre.

Aktueller funktionaler Stand:

- `htdocs/dashboard/modules/sound_levelscan.js` erweitert.
- `htdocs/dashboard/modules/sound_levelscan.css` erweitert.
- Neue Korrektur-Vorschau im Pegel-Scan-Tab.
- Neue Vorschau-Kennzahlen:
  - würden leiser
  - würden lauter
  - nahe Ziel
  - Volume-Cap
  - Peak prüfen
- Option `Korrektur-Vorschau anzeigen`.
- Neue Tabellenspalte `Vorschau` mit empfohlenem Playback-Volume und Gain.

Nicht geaendert:

```text
app.sqlite
config/**
backend/modules/sound_system.js
backend/modules/sound_loudness_scanner.js
Alert-System
Sound-System Queue/Discord/Bundle-Logik
Sound-Dateien
```


## STEP270C - Pegel-Scan Dashboard UI verbessert

Der Pegel-Scan ist weiterhin read-only, aber im Dashboard besser nutzbar.

Aktueller funktionaler Stand:

- `htdocs/dashboard/modules/sound_levelscan.js` erweitert.
- `htdocs/dashboard/modules/sound_levelscan.css` erweitert.
- Übersichtskacheln für OK, Warnungen, Peak zu hoch, zu laut und zu leise.
- Mouseover-Hilfen per `title`/Hilfesymbol für LUFS, True Peak, Gain, Volume, Dauer, Status und Warnungen.
- Erklärungskarte `Werte kurz erklärt`.
- Schnellaktionen:
  - Problematische zuerst
  - Lauteste zuerst
  - Leiseste zuerst

Nicht geaendert:

```text
app.sqlite
config/**
backend/modules/sound_system.js
backend/modules/sound_loudness_scanner.js
Alert-System
Sound-System Queue/Discord/Bundle-Logik
```

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
