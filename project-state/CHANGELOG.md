# Changelog

## 2026-05-21 - STEP270C Pegel-Scan Dashboard UI verbessert

- Pegel-Scan-Dashboard übersichtlicher gestaltet.
- Übersichtskacheln für OK, Warnungen, Peak zu hoch, zu laut und zu leise ergänzt.
- Mouseover-Hilfen für zentrale Messwerte ergänzt:
  - LUFS
  - True Peak
  - Gain
  - Volume
  - Dauer
  - Status
  - Warnungen
- Erklärungskarte `Werte kurz erklärt` ergänzt.
- Schnellaktionen `Lauteste zuerst` und `Leiseste zuerst` ergänzt.
- Keine Änderung an Scanner-Backend, Sound-Dateien, Queue, Discord-Routing, Alerts oder TTS.

## 2026-05-21 - STEP270B Sound Pegel-Scan Dashboard View

- Bestehendes Sound-Dashboard um neuen Tab `Pegel-Scan` erweitert.
- Neue Datei `htdocs/dashboard/modules/sound_levelscan.js` ergaenzt.
- Neue Datei `htdocs/dashboard/modules/sound_levelscan.css` ergaenzt.
- `htdocs/dashboard/index.html` bindet die neue Pegel-Scan-JS/CSS-Datei ein.
- Der Tab nutzt die bestehenden Read-only-Routen des Sound Loudness Scanners.
- Funktionen:
  - Status und Zielwerte anzeigen
  - Scan starten
  - Ergebnisse laden
  - Statusfilter
  - Dateisuche
  - Sortierung nach Gain, LUFS, True Peak, Volume, Dateiname, Scan-Zeit
  - Warnungen lesbarer anzeigen
- Keine automatische Normalisierung, keine Dateiänderung, keine Änderung an Sound-Queue, Discord-Routing, Alerts oder TTS.

## 2026-05-21 - STEP270A1 Sound Loudness Results Route Fix

- Results-Route des Sound Loudness Scanners repariert.
- Ursache: `COUNT(*)`-Abfrage erhielt Parameter, die dort nicht verwendet wurden.
- Bestaetigt: `/api/sound/loudness/results?limit=50&order=recommended_gain_db&dir=desc` funktioniert.

## 2026-05-21 - STEP270A Sound Loudness Scanner Read-only

- Neues Backend-Modul `backend/modules/sound_loudness_scanner.js` ergaenzt.
- Read-only Scan fuer Sound-Dateien unter `htdocs/assets/sounds`.
- Messwerte: LUFS, True Peak, LRA, Threshold, empfohlener Gain, empfohlenes Volume.
- Ergebnisse werden in SQLite gespeichert, nur per `CREATE TABLE IF NOT EXISTS`.
- Keine Sound-Datei wird veraendert.
- Keine Änderung an Sound-System Queue, Discord, Alerts, TTS, Config oder Overlay.

## 2026-05-21 - STEP269D Sound/Discord Integration dokumentiert

- Abschlussdoku fuer STEP269A-C ergaenzt.
- Bestaetigter Status:
  - Sound-System spielt ueber Discord-Bridge.
  - Auto-Routing auf Discord funktioniert.
  - VIP-/Mod-Sounds kommen im Discord an.
  - Device-Ausgabe plus Discord ist bestaetigt.
- Neue/aktualisierte Doku:
  - `docs/current/CURRENT_SYSTEM_STATUS.md`
  - `project-state/CURRENT_STATUS.md`
  - `project-state/CHANGELOG.md`
  - `project-state/FILES.md`
  - `project-state/NEXT_STEPS.md`
  - `project-state/STEP269D_SOUND_DISCORD_INTEGRATION_CONFIRMED_2026-05-21.md`

## 2026-05-21 - STEP269C VIP-/Mod-Sounds auf Discord/Both

- `backend/modules/vip_sound_overlay.js` angepasst.
- Echte VIP-/Mod-Sounds setzen nicht mehr hart `target=stream`.
- Neues/erweitertes Setting `soundSystemTarget`, Standard `both`.
- Ursache fuer fehlende echte VIP-/Mod-Sounds im Discord war das harte `target=stream`.
- Nach Fix bestaetigt: VIP-/Mod-Sounds kommen im Discord an.
- Nicht geaendert: Sound-System Queue, Alert-System, SoundAlerts, TTS, app.sqlite, config, Overlays, Streamer.bot-Flows.

## 2026-05-21 - STEP269B Sound-System Discord Auto Routing

- `backend/modules/sound_system.js` erweitert.
- Automatisches Routing nach Discord zentral im Sound-System ergaenzt.
- Passende Kategorien/Quellen koennen automatisch `target=both` erhalten.
- Explizites `target=stream` wird bewusst respektiert.
- Test mit `category=vip` ohne explizites Target wurde automatisch nach `both` geroutet.
- Nicht geaendert: Alert-System, SoundAlerts, VIP-/Mod-Modul, TTS-Modul.

## 2026-05-21 - STEP269A Sound-System Discord Target Playback

- `backend/modules/sound_system.js` erweitert.
- Discord-Ausgabe als Ausgabeziel beim echten Sound-System-Item-Start ergaenzt.
- Neue Runtime-Felder:
  - `discord`
  - `stats.discordStarted`
  - `stats.discordFailed`
- Discord nutzt vorhandene Bridge `app.locals.discordBridge.enqueueSound(...)`.
- Discord-Fehler blockieren die Sound-System-Queue nicht.
- Nicht geaendert: Alert-Bundle-Lock, Queue-Prioritaeten, TTS, Overlays, Streamer.bot-Flows.
