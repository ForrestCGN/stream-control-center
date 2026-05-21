# Current System Status – stream-control-center

Stand: 2026-05-21

## STEP270C - Pegel-Scan UI-Erklärungen und Übersicht

Aktueller Zusatzstand:

- Der Dashboard-Tab `Pegel-Scan` wurde übersichtlicher aufgebaut.
- Neue Kurzstatistik zeigt direkt OK, Warnungen, Peak zu hoch, zu laut und zu leise.
- Werte wie LUFS, True Peak, Gain, Volume, Dauer und Warnungen haben Mouseover-Hinweise.
- Eine kleine Erklärungskarte beschreibt die wichtigsten Messwerte direkt im Dashboard.
- Neue Schnellfilter/Sortieraktionen: `Problematische zuerst`, `Lauteste zuerst`, `Leiseste zuerst`.
- Weiterhin read-only: keine Sound-Datei wird geändert, keine Playback-Korrektur wird aktiviert.

Bewusst unveraendert:

```text
app.sqlite
config/**
backend/modules/sound_system.js
backend/modules/sound_loudness_scanner.js
Sound-System Queue-/Prioritaetslogik
Discord-Routing
Alert-Bundle-Lock-Logik
```

## STEP270B - Sound Pegel-Scan Dashboard View

Aktueller Zusatzstand:

- Das Sound-Dashboard hat einen neuen Tab `Pegel-Scan`.
- Der Tab nutzt die bestehenden Read-only-Routen aus STEP270A/STEP270A1:
  - `GET /api/sound/loudness/status`
  - `POST /api/sound/loudness/scan`
  - `GET /api/sound/loudness/results`
- Der Dashboard-Tab kann Scans starten, Ergebnisse laden, sortieren, filtern und durchsuchen.
- Angezeigt werden unter anderem LUFS, True Peak, empfohlener Gain, empfohlenes Volume, Dauer und Warnungen.
- Die UI ist bewusst read-only: Es werden keine Sound-Dateien normalisiert, überschrieben oder automatisch im Sound-System verändert.

Bewusst unveraendert:

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

- Backend-Modul `sound_loudness_scanner.js` ist vorhanden.
- Results-Route wurde in STEP270A1 repariert.
- Bestaetigter Test:
  - `/api/sound/loudness/status` funktioniert.
  - `/api/sound/loudness/routes` funktioniert.
  - Scan mit Limit 20 funktioniert.
  - `/api/sound/loudness/results?limit=50&order=recommended_gain_db&dir=desc` funktioniert.
- Erste Messung zeigte mehrere deutlich zu laute Alert-Sounds und mindestens eine sehr leise Datei.

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
