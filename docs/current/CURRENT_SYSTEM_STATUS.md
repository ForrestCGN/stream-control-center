# Current System Status – stream-control-center

Stand: 2026-05-21

## STEP270A1 - Sound Loudness Results Route Fix

- Live-Test zeigte, dass Status, Routes und Scan funktionieren.
- Die Results-Route hatte einen Parameterfehler: `Unknown named parameter 'limit'`.
- Fix: Count- und Listenabfrage nutzen getrennte SQL-Parameter.
- Modulversion: `0.1.1-step270a-fix`.
- Keine Aenderung an Sound-Dateien, Sound-System Queue, Discord-Routing, Alert-System, TTS, Config oder Dashboard.

## STEP270A - Sound Loudness Scanner Read-only

Aktueller Zusatzstand:

- Ein read-only Backend-Scanner fuer Sound-Lautheit ist vorbereitet.
- Neues Modul: `backend/modules/sound_loudness_scanner.js`.
- Standard-Scanbasis: `htdocs/assets/sounds`.
- Messung erfolgt ueber `ffmpeg` + `loudnorm`.
- Ergebnisse werden in neuen DB-Tabellen gespeichert:
  - `sound_loudness_scans`
  - `sound_loudness_files`
- Die bestehenden Sound-Dateien werden nicht veraendert.
- Der Scanner greift nicht in Sound-System Queue, Prioritaeten, Bundle-Lock, Discord-Routing, Alert-System oder TTS ein.

Neue API-Routen:

```text
GET  /api/sound/loudness/status
POST /api/sound/loudness/scan
GET  /api/sound/loudness/results
GET  /api/sound/loudness/file?file=relative/path.mp3
GET  /api/sound/loudness/routes
```

Bewusst unveraendert:

```text
app.sqlite bestehende Daten
config/**
backend/modules/sound_system.js
backend/modules/discord.js
backend/modules/alert_system.js
backend/modules/soundalerts_bridge.js
backend/modules/tts_system.js
Streamer.bot-Flows
Overlay-HTML
Dashboard-UI
```

Offen / naechster Schritt:

```text
STEP270B Dashboard-Seite fuer Sound-Lautheit bauen.
Danach erst entscheiden, ob Playback-Gain pro Datei/Kategorie aktivierbar wird.
Originaldateien weiterhin nicht automatisch ueberschreiben.
```

## STEP269A-C - Sound-System Discord Output Integration

Aktueller stabiler Zusatzstand:

- Sound-System kann Sounds ueber die vorhandene Discord-Bridge im Discord Voice Channel abspielen.
- Discord ist kein zweites Queue-System; Sound-System bleibt Master fuer Reihenfolge, Prioritaeten und Bundle-Lock.
- `target=discord` und `target=both` werden vom Sound-System unterstuetzt.
- Automatisches Discord-Routing ist zentral im Sound-System konfigurierbar.
- Kategorien/Quellen wie `alert`, `alert_critical`, `channel_reward`, `vip`, `crew`, `special`, `tts`, `alert_system`, `alert_tts`, `soundalerts`, `vip_mod`, `tts_system` koennen automatisch nach Discord geroutet werden.
- VIP-/Mod-Sounds setzen nicht mehr hart `target=stream`, sondern nutzen `soundSystemTarget`, aktuell Standard `both`.
- Bestaetigt:
  - Test-Sound ueber Sound-System kam im Discord an.
  - `category=vip` ohne explizites Target wurde auf `target=both` geroutet.
  - Device-Test mit `nichtfluchen.mp3`, `target=both`, `outputTarget=device`, `source=vip_mod` kam im Discord an.
  - Echte VIP-/Mod-Sounds kommen im Discord an.
- Neue Runtime-Felder im Sound-System:
  - `discord.lastOk`
  - `discord.lastAt`
  - `discord.lastError`
  - `discord.lastResult`
  - `stats.discordStarted`
  - `stats.discordFailed`

Bewusst unveraendert:

```text
app.sqlite
config/**
Streamer.bot-Flows
Overlay-HTML
Alert-Bundle-Lock-Logik
Sound-System Queue-/Prioritaetslogik
```

Offen / beobachten:

```text
Echter SoundAlert/Kanalpunkte-Sound
Echter Alert mit Hauptsound + Alert-TTS
Normales Chat-TTS, falls Discord-Ausgabe gewuenscht ist
MP3-Cover/Artwork-Erkennung als optionaler spaeterer Mini-Fix
```

## STEP268C - Active Bundle Lock Direct Start Guard

- Sound-System Bundle-Lock ist stabilisiert.
- Fremde Sounds duerfen bei aktivem Alert-Bundle-Lock nicht direkt zwischen Alert-Hauptsound und Alert-TTS starten.
- V5-Real-Mod-Test bestaetigte: Alert-Sound und passende Alert-TTS blieben zusammen.
- Aktuelle Prioritaet:
  - Alert-Bundles
  - SoundAlert/Kanalpunkte
  - Mod/VIP
  - normales Chat-TTS

## STEP268B - Alert Bundle Dedupe Bypass Robust

- Alert-Bundle-Items umgehen Same-Sound-/Same-User-Dedupe.
- Gleiche Alert-Hauptsounds werden nicht mehr durch `cooldown_same_sound` gedroppt.
- TTS bleibt beim passenden Alert-Bundle.

## STEP266B - Alert Immediate Bundle Prequeue Self-Block Fix

- Immediate-Prequeue blockiert sich nicht mehr selbst.
- Alert-System laeuft wieder mit Sound-System-Bundles.
- TTS bleibt beim passenden Alert.
