# Current System Status – stream-control-center

Stand: 2026-05-21

## STEP272B3 - Sound-Pegel Referenz-Ausgabeweg waehlbar

- Sound-Pegel Referenz-Tab hat jetzt einen waehlbaren Ausgabeweg fuer Referenzsound und Test-Ton.
- Optionen: `OBS/Overlay`, `Audiogeraet`, `OBS + Audiogeraet`.
- Referenzsound und technischer Test-Ton geben den gewaehlten `outputTarget` an `/api/sound/play` weiter.
- Der gewaehlte Ausgabeweg wird im Browser per LocalStorage gemerkt.
- Keine Backend-Module, keine Sound-Queue, kein Discord-Routing, kein Alert-System, kein TTS-System und keine Sound-Dateien geaendert.

# Current System Status – stream-control-center

Stand: 2026-05-21


## STEP272B2 - Sound-Pegel Testton als echte Sound-Datei

- Sound-Pegel Referenz-Testton kann jetzt als echte Datei unter `htdocs/assets/sounds/generated/reference_test.wav` erzeugt werden.
- Dashboard-Button `Test-Ton über OBS` nutzt danach `/api/sound/play` mit `file=generated/reference_test.wav`.
- Dadurch laeuft der technische Testton ueber denselben Sound-System-/OBS-Overlay-Pfad wie normale Sound-Dateien.
- Keine Original-Sounddateien, keine Sound-Queue, kein Discord-Routing, kein Alert-System und kein TTS-System geaendert.

## STEP272B1 - Sound-Pegel Test-Ton ueber OBS/Sound-System

Aktueller Zusatzstand:

- Sound-Pegel ist eigenes Dashboard-Modul unter System.
- Referenz-Tab enthaelt Auto-Referenz und empfohlenen echten Referenzsound.
- Technischer Test-Ton wird jetzt ueber Sound-System/OBS-Overlay gestartet.
- Direkter WAV-Link bleibt nur zum Gegenhoeren.
- Backend, Sound-System-Queue, Discord-Routing, Alerts, TTS, Config und Sound-Dateien bleiben unveraendert.

# Current System Status – stream-control-center

Stand: 2026-05-21

## STEP272B - Sound-Pegel Auto-Referenz + Referenzsound

- Sound-Pegel besitzt jetzt einen eigenen Unterbereich `Referenz`.
- Auto-Referenz wird aus gespeicherten Nicht-TTS-Scan-Ergebnissen berechnet.
- Berechnung nutzt Median-LUFS statt einfachem Durchschnitt, um Ausreisser weniger stark zu gewichten.
- Ein echter vorhandener Sound nahe am Referenzwert wird als Referenzsound vorgeschlagen.
- Ein technischer Test-Sound ist als `/api/sound/loudness/reference/test.wav` verfuegbar.
- Keine Sound-Dateien, keine Playback-Queue, kein Discord-Routing, keine Alerts, kein TTS und kein `config/**` wurden geaendert.

# Current System Status – stream-control-center

Stand: 2026-05-21

## STEP272A - Sound-Pegel Dashboard intern aufgeteilt

Aktueller Zusatzstand:

- Das eigene Dashboard-Modul `sound_level` ist intern in Tabs aufgeteilt.
- Bereiche: Übersicht, Scan, Ergebnisse, Korrektur, Kopien.
- Die bisherige Ein-Seiten-Ansicht wurde dadurch uebersichtlicher.
- Backend bleibt unveraendert unter `/api/sound/loudness/*`.
- Sound-System Playback, Queue, Discord-Routing, Alert-Bundle-Lock, TTS und Sound-Dateien bleiben unveraendert.

## STEP271 - Sound-Pegel als eigenes Dashboard-Modul

Aktueller Zusatzstand:

- Sound-Pegel ist im Dashboard ein eigenes System-Modul (`sound_level`).
- Anzeige erfolgt unter `System -> Sound-Pegel`.
- Pegel-Scan, Fortschrittsanzeige, Korrektur-Vorschau und vorbereitete Normalisierung sind nicht mehr als Untertab im Sound-System versteckt.
- Backend bleibt unveraendert unter `/api/sound/loudness/*`.
- Sound-System Playback, Queue, Discord-Routing, Alert-Bundle-Lock und TTS bleiben unveraendert.


## STEP270G1 - Pegel-Playback-Korrektur Safe-Tuning

- Optionale Playback-Korrektur bleibt abschaltbar, wurde aber sicherer abgestimmt.
- Korrektur wird nur anteilig angewendet (`strengthPercent`, Standard 50%).
- Automatische Absenkung hat eine Mindestlautstärke (`minPlaybackVolume`, Standard 35%).
- `maxCutDb` ist auf maximal 12 dB begrenzt, damit kurze SFX wie Airhorn nicht brutal zu leise werden.
- Keine Sound-Dateien, keine Queue, kein Discord-Routing, keine Alert-/TTS-Logik und kein `config/**` geaendert.

## STEP270G - Sound Pegel-Playback-Korrektur optional

Aktueller Zusatzstand:

- Pegel-Korrektur kann optional zentral im Sound-System angewendet werden.
- Standard ist AUS. Aktiv nur bei `enabled=true` und `mode=ready`.
- Korrektur nutzt die gespeicherten Pegel-Scan-Werte aus `sound_loudness_files`.
- Nur die Playback-Volume des Sound-Items wird angepasst.
- Originaldateien werden nicht veraendert.
- TTS-/Speech-Dateien bleiben bei aktivem `excludeTts` ausgeschlossen.
- Video-Items und generierte Beeps werden nicht korrigiert.
- Dashboard `Pegel-Scan` enthaelt jetzt den Schalter `Playback-Korrektur aktivieren`.

Bewusst unveraendert:

```text
Sound-Dateien
Normalisierte Kopien
config/**
Sound-System Queue-/Prioritaetslogik
Alert-Bundle-Lock
Discord-Routing
TTS-System
Streamer.bot-Flows
Overlay-HTML
```


## STEP270E - Sound Pegel-Scan Fortschrittsanzeige

- Pegel-Scan unterstuetzt jetzt asynchronen Scan-Modus mit Fortschritt im Status-Endpoint.
- `POST /api/sound/loudness/scan` kann mit `async=true` gestartet werden.
- `GET /api/sound/loudness/status` liefert `progress` mit Scan-ID, Status, Prozent, aktueller Datei, Zaehlwerten fuer OK/Warnung/Fehler.
- Dashboard zeigt Fortschrittsbalken, aktuelle Datei und Live-Zaehler.
- Weiterhin read-only: keine Sound-Dateien, keine Playback-Korrektur, keine Queue-/Discord-/Alert-/TTS-Aenderung.

## STEP270D1 - Pegel-Scan TTS-Dateien ausgeschlossen

Aktueller Zusatzstand:

- Der Pegel-Scan schliesst TTS-/Speech-Dateien standardmaessig aus.
- Neue Scans ignorieren typische TTS-Pfade wie `tts`, `tts_system`, `alert_tts`, `generated_tts`, `temp_tts` und `tts_cache`.
- Die Results-Route blendet diese TTS-/Speech-Dateien standardmaessig ebenfalls aus, damit alte gespeicherte TTS-Messungen die Dashboard-Auswertung nicht weiter verfaelschen.
- Das Dashboard zeigt im Pegel-Scan klar an, dass TTS ausgeschlossen ist.
- Weiterhin read-only: keine Korrektur wird angewendet und keine Sound-Datei wird geaendert.

Bewusst unveraendert:

```text
app.sqlite
config/**
backend/modules/sound_system.js
Sound-System Queue-/Prioritaetslogik
Discord-Routing
Alert-Bundle-Lock-Logik
Sound-Dateien
```


## STEP270D - Pegel-Scan Korrektur-Vorschau

Aktueller Zusatzstand:

- Der Dashboard-Tab `Pegel-Scan` zeigt jetzt eine reine Korrektur-Vorschau.
- Die Vorschau fasst zusammen, wie viele Sounds später leiser, lauter, nahe am Ziel, am Volume-Cap oder wegen True Peak zu prüfen wären.
- Die Tabelle kann eine zusätzliche Spalte `Vorschau` anzeigen.
- Pro Datei wird angezeigt, welche Playback-Lautstärke bzw. welcher Gain-Wert später empfohlen wäre.
- Mouseover-Hinweise erklären, warum eine Datei unkritisch, auffällig oder manuell prüfenswert ist.
- Weiterhin read-only: keine Korrektur wird angewendet und keine Sound-Datei wird geändert.

Bewusst unveraendert:

```text
app.sqlite
config/**
backend/modules/sound_system.js
backend/modules/sound_loudness_scanner.js
Sound-System Queue-/Prioritaetslogik
Discord-Routing
Alert-Bundle-Lock-Logik
Sound-Dateien
```


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


## STEP270F - Pegel-Korrektur Vorschau-Einstellungen

- Sound Pegel-Scan besitzt jetzt vorbereitete, inaktive Korrektur-Einstellungen.
- Dashboard kann Ziel-LUFS, True-Peak-Limit, Max Volume, Max Boost/Max Cut und True-Peak-Schutz anzeigen/speichern.
- Korrektur-Vorschau bleibt read-only und greift nicht in `sound_system.js` ein.
- Normalisierte Kopien sind als spaetere separate Option vorbereitet; es werden noch keine Dateien erzeugt.
