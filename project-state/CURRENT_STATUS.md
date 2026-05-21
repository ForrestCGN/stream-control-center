# Current Status – stream-control-center

## STEP272D1 - Sound-Pegel Defaults vollständig auf 80

- `Sound-Pegel -> Config -> Defaults anwenden` schreibt jetzt nicht nur `sound_settings.output`, sondern auch `sound_settings.targets` und `sound_settings.defaults`.
- Dadurch werden diese Runtime-Felder nach Reload ebenfalls auf 80 gesetzt:
  - `config.targets.stream.defaultVolume`
  - `config.targets.discord.defaultVolume`
  - `config.targets.both.defaultVolume`
  - `config.defaults.volume`
- Ziel: zentrale Default-Playback-Lautstärke wirkt an allen Sound-System-Fallback-Stellen einheitlich.
- Keine Sounddateien und keine bestehenden Alert-/SoundAlert-/VIP-Einzelregeln werden überschrieben.

# Current Status – stream-control-center

## STEP272D - Sound-Pegel Upload-/Playback-Defaults anwenden

- `Sound-Pegel -> Config` kann die gespeicherten Standardwerte jetzt per Preview/Apply in relevante DB-Settings übernehmen.
- `sound_settings.output.targets.*.defaultVolume` wird auf `defaultPlaybackVolume` gesetzt.
- `soundalerts_bridge_settings.soundSystem.defaultVolume` wird auf `uploadDefaultVolume` gesetzt.
- `vip_sound_settings.soundSystemVolume` wird auf `uploadDefaultVolume` gesetzt.
- VIP-/Mod-Sounds nutzen jetzt `soundSystemVolume` statt hartem `85` im Sound-System-Payload.
- Weiterhin keine Massenänderung vorhandener Einzel-Sounds und keine Dateiänderung.


Stand: 2026-05-21

## STEP272B3 - Sound-Pegel Referenz-Ausgabeweg waehlbar

Der Referenzbereich im Sound-Pegel-Modul kann Referenzsound und Test-Ton jetzt ueber verschiedene Ausgabewege starten.

Aktueller funktionaler Stand:

- Neuer Select im Referenz-Tab: Ausgabeweg.
- Optionen:
  - OBS/Overlay
  - Audiogeraet
  - OBS + Audiogeraet
- `play-reference` und `play-reference-test` nutzen den gewaehlten `outputTarget`.
- Der Wert wird lokal im Browser gespeichert.

Nicht geaendert:

```text
backend/modules/sound_system.js
backend/modules/sound_loudness_scanner.js
app.sqlite
config/**
Sound-Dateien
Sound-Queue
Discord-Routing
Alert-Bundle-Lock
TTS-System
```

# Current Status – stream-control-center

Stand: 2026-05-21


## STEP272B2 - Sound-Pegel Testton als echte Sound-Datei

Der technische Referenz-Testton wird jetzt fuer OBS als echte Sound-Datei erzeugt und danach ueber das Sound-System abgespielt.

Aktueller funktionaler Stand:

- Neuer Endpoint `GET/POST /api/sound/loudness/reference/test-file`.
- Erzeugt/aktualisiert `htdocs/assets/sounds/generated/reference_test.wav`.
- Dashboard-Button `Test-Ton über OBS` erzeugt die Datei und startet danach `/api/sound/play?file=generated/reference_test.wav`.
- Referenzsound bleibt unveraendert ein echter vorhandener Sound.

Nicht geaendert:

```text
backend/modules/sound_system.js
app.sqlite ersetzt/neu gebaut: nein
config/**
Sound-Dateien ausser generated/reference_test.wav
Sound-Queue
Discord-Routing
Alert-Bundle-Lock
TTS-System
```

## STEP272B1 - Sound-Pegel Test-Ton ueber OBS/Sound-System

- Der technische Referenz-Testton im Sound-Pegel-Dashboard wird jetzt ueber das Sound-System abgespielt.
- Button im Referenz-Tab: `Test-Ton ueber OBS`.
- Technisch wird `/api/sound/play` mit `type=generated_beep`, `outputTarget=overlay`, `target=stream` genutzt.
- Dadurch laeuft der Test-Ton ueber den OBS-Overlay-Pfad statt nur direkt als Browser-Audio.
- Der Link `Test-WAV oeffnen` bleibt als reine Gegenhoer-Option erhalten.
- Keine Aenderung an Backend, Queue, Discord-Routing, Alert-Bundle-Lock, TTS, Sound-Dateien, `config/**` oder `app.sqlite`.

# Current Status – stream-control-center

Stand: 2026-05-21

## STEP272B - Sound-Pegel Auto-Referenz + Referenzsound

Sound-Pegel hat jetzt einen eigenen Referenzbereich.

Aktueller funktionaler Stand:

- `GET /api/sound/loudness/reference` berechnet eine Auto-Referenz aus gespeicherten Pegel-Scan-Ergebnissen.
- Berechnung nutzt Median-LUFS aus gueltigen Nicht-TTS-Sounds.
- Das System schlaegt einen echten vorhandenen Referenzsound nahe am typischen Pegel vor.
- `GET /api/sound/loudness/reference/test.wav` stellt einen technischen Test-Sound als WAV bereit.
- Dashboard `System -> Sound-Pegel -> Referenz` zeigt Referenzwert, Toleranz, Verteilung und Abspielaktionen.

Nicht geaendert:

```text
backend/modules/sound_system.js
Sound-Queue
Discord-Routing
Alert-Bundle-Lock
TTS-System
Sound-Dateien
config/**
```

# Current Status – stream-control-center

Stand: 2026-05-21

## STEP272A - Sound-Pegel Unterbereiche/Tabs

Sound-Pegel ist jetzt innerhalb des eigenen Dashboard-Moduls aufgeraeumt.

Aktueller funktionaler Stand:

- `sound_level` bleibt eigenes Dashboard-Modul unter `System -> Sound-Pegel`.
- Die Seite ist in Unterbereiche/Tabs getrennt:
  - Übersicht: Status, Kurzstatistik, letzte Scan-Daten
  - Scan: Scan starten, Limits, Fortschritt
  - Ergebnisse: Filter, Suche, Tabelle, Vorschau-Spalte
  - Korrektur: Playback-Korrektur-Settings und Vorschau
  - Kopien: vorbereitete Normalisierungs-/Export-Einstellungen
- Backend-API bleibt unveraendert unter `/api/sound/loudness/*`.

Nicht geaendert:

```text
backend/modules/sound_system.js
backend/modules/sound_loudness_scanner.js
app.sqlite
config/**
Sound-Dateien
Sound-Queue
Discord-Routing
Alert-Bundle-Lock
TTS-System
```

## STEP271 - Sound-Pegel eigenes Dashboard-Modul

Der Pegel-Scan ist jetzt kein Unter-Tab des Sound-Systems mehr, sondern ein eigenes Dashboard-Modul unter `System -> Sound-Pegel`.

Aktueller funktionaler Stand:

- `htdocs/dashboard/index.html` enthaelt ein eigenes Panel `soundLevelModule`.
- `htdocs/dashboard/modules/sound_levelscan.js` registriert `sound_level` dynamisch im Dashboard.
- System-Uebersicht zeigt `Sound-Pegel` als eigenes Modul.
- Backend-Routen bleiben unveraendert unter `/api/sound/loudness/*`.
- Korrektur-Vorschau, Fortschritt, TTS-Ausschluss und vorbereitete Playback-Korrektur bleiben erhalten.

Nicht geaendert:

```text
backend/modules/sound_system.js
backend/modules/sound_loudness_scanner.js
app.sqlite
config/**
Sound-Dateien
Sound-Queue/Discord/Bundle-Logik
```


## STEP270G1 - Pegel-Playback-Korrektur Safe-Tuning

- Optionale Playback-Korrektur bleibt abschaltbar, wurde aber sicherer abgestimmt.
- Korrektur wird nur anteilig angewendet (`strengthPercent`, Standard 50%).
- Automatische Absenkung hat eine Mindestlautstärke (`minPlaybackVolume`, Standard 35%).
- `maxCutDb` ist auf maximal 12 dB begrenzt, damit kurze SFX wie Airhorn nicht brutal zu leise werden.
- Keine Sound-Dateien, keine Queue, kein Discord-Routing, keine Alert-/TTS-Logik und kein `config/**` geaendert.

## STEP270G - Sound Pegel-Playback-Korrektur optional

- Pegel-Korrektur kann jetzt optional zentral im Sound-System angewendet werden.
- Standard bleibt AUS. Aktiv wird sie nur ueber Dashboard/Settings mit `enabled=true` und `mode=ready`.
- `sound_system.js` liest die letzte Messung aus `sound_loudness_files` und passt nur `item.volume` an.
- Originaldateien, normalisierte Kopien, Queue, Prioritaeten, Alert-Bundle-Lock, Discord-Routing und TTS bleiben unveraendert.
- Dashboard `Pegel-Scan` hat einen Schalter `Playback-Korrektur aktivieren`.
- Status/Items zeigen `levelCorrection`, Sound-Stats enthalten `levelCorrected` und `levelCorrectionSkipped`.


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


## STEP270F - Pegel-Korrektur Vorschau-Einstellungen

- Pegel-Scan kann jetzt inaktive Korrektur-Einstellungen speichern.
- Dashboard zeigt Ziel-LUFS, True-Peak-Limit, Max Volume, Max Boost/Max Cut und True-Peak-Schutz.
- `/api/sound/loudness/correction/preview` liefert eine Vorschau nach gespeicherten Einstellungen.
- Normalisierte Kopien sind als spaetere Option sichtbar vorbereitet, aber noch nicht implementiert.
- Playback, Sound-Dateien, Queue, Discord-Routing, Alerts und TTS bleiben unveraendert.


## STEP272C - Sound-Pegel Config-Seite

- Sound-Pegel hat jetzt einen eigenen Tab `Config`.
- Zentrale Defaults werden in SQLite gespeichert (`sound_loudness_settings`, Key `level_config`).
- Einstellbar vorbereitet:
  - Default Playback Volume
  - Max Playback Volume
  - Upload Default Volume
  - Referenz-Toleranz
  - Standard Scan-/Ergebnis-Limits
  - Standard-Ausgabeweg fuer Referenz/Test-Ton
  - Upload-Defaults fuer Alerts, SoundAlerts/Kanalpunkte, VIP-/Mod und Sound-Presets
  - Massenaktion fuer vorhandene Sounds als Preview-/Planungsbereich
- Bestehende Sounds, Alert-Regeln, VIP-/Mod-Daten, SoundAlerts und Config-Dateien werden nicht umgeschrieben.


## STEP272E - Sound-Pegel bestehende Volume-Preview
- Neue Read-only API `GET /api/sound/loudness/config/mass-volume-preview`.
- Dashboard `System -> Sound-Pegel -> Config` zeigt eine Volume-Preview fuer bestehende Alert-/SoundAlert-/VIP-Daten.
- Pegel-Scan-Bewertung markiert Kandidaten fuer Boost-Kopie oder Runtime-Absenkung.
- Keine Massenänderung, keine Sounddatei-Änderung, keine config/**-Änderung.


## STEP272F - Sound-Pegel Alert-Missing-Volumes Apply

- Neue Route `POST /api/sound/loudness/config/mass-volume-apply/alerts-missing`.
- Dashboard-Button im Sound-Pegel Config/Volume-Preview Bereich: `Alert-Missing auf 80 setzen`.
- Setzt nur fehlende/ungültige `alert_rules.sound_volume` auf den aktuellen Default, aktuell 80.
- Überschreibt keine expliziten Alert-Volumes und lässt SoundAlerts/Kanalpunkte mit 100 unverändert.


## STEP272G Status

Sound-Pegel kann jetzt Boost-Kopien als Einzeldatei-Test vorbereiten. Kopien landen unter `htdocs/assets/sounds/normalized/` und können über das Sound-System getestet werden. Keine automatische Massenanwendung.

## STEP272G1 - Sound-Pegel Boost-Ziel aus Referenz
- Status: vorbereitet.
- Boost-Kopien werden weiterhin nur einzeln erzeugt.
- Neu: Ziel-LUFS fuer Boost-Kopien ist konfigurierbar und kann aus der Auto-Referenz minus Sicherheitsabstand übernommen werden.
- Ziel: zu leise Dateien wie `alerts/follow.mp3` näher an den eingepegelten Referenzpegel bringen, ohne Originale zu überschreiben.


## STEP272H - Sound-Pegel Boost-Kopie übernehmen mit Backup

- Boost-Kopien können jetzt bewusst neu erzeugt werden (`overwrite` für `normalized/...`).
- Neue Promote-Logik: vorhandene Boost-Kopie kann an die Originalstelle kopiert werden.
- Vor dem Ersetzen wird automatisch ein Backup unter `htdocs/assets/sounds/_backup_loudness/<timestamp>/...` erstellt.
- Promote-/Rollback-Historie wird in SQLite `sound_loudness_promotions` gespeichert.
- Bestehende Alert-/SoundAlert-/VIP-Konfigurationen müssen dadurch nicht auf `normalized/...` umgestellt werden.
- Keine Originaldatei wird ohne Backup überschrieben.


## STEP272I – Aktueller Sound-Pegel-Stand

Der Boost-Kopien-Bereich unterstützt jetzt einen pro Datei einstellbaren Boost-Workflow mit Slider, Presets und serverseitiger Sicherheitsprüfung. Dateien werden weiterhin erst als Kopie unter `htdocs/assets/sounds/normalized/` erzeugt und nur per separatem Promote mit Backup an die Originalstelle übernommen.


## STEP272I1 – Aktueller Sound-Pegel-Stand

Der Dashboard-Workflow für Boost-Kopien unterstützt jetzt direktes Test-Abspielen von Original und Boost-Testkopie mit wählbarem Ausgabeweg. Wenn eine Boost-Kopie als neues Original übernommen wurde, wird die Datei im Dashboard markiert und backendseitig gegen normales Überschreiben geschützt. Änderungen am echten Originalpfad passieren weiterhin nur über Promote mit Backup.
