# Changelog

## 2026-05-21 - STEP272D1 Sound-Pegel Defaults vollständig auf 80

- `backend/modules/sound_loudness_scanner.js` erweitert.
- Apply-Defaults schreibt jetzt zusätzlich `sound_settings.targets`.
- Apply-Defaults schreibt jetzt zusätzlich `sound_settings.defaults.volume`.
- Damit werden neben Output-Defaults auch Legacy-Target-Defaults und Fallback-Default-Volume auf `defaultPlaybackVolume` gesetzt.
- Keine Sound-Dateien, keine bestehenden Einzelregeln, keine Queue-/Discord-/Alert-/TTS-Logik geändert.



## 2026-05-21 - STEP272D Sound-Pegel Upload-/Playback-Defaults anwenden

- `backend/modules/sound_loudness_scanner.js` erweitert.
- Neue API: `GET /api/sound/loudness/config/apply-defaults/preview`.
- Neue API: `POST /api/sound/loudness/config/apply-defaults`.
- Dashboard-Config um Preview/Apply-Bereich erweitert.
- Sound-System Output-Default-Volumes werden in `sound_settings` gespeichert.
- SoundAlerts Default-Volume wird in `soundalerts_bridge_settings` gespeichert.
- VIP-/Mod-Sounds bekommen neues DB-Setting `soundSystemVolume`, Standard 80.
- Keine Sound-Dateien und keine bestehenden Einzelregeln wurden überschrieben.


## 2026-05-21 - STEP272C Sound-Pegel Config-Seite

- `backend/modules/sound_loudness_scanner.js` um `GET/POST /api/sound/loudness/config` erweitert.
- Config wird in SQLite gespeichert, nicht in `config/**`.
- `htdocs/dashboard/modules/sound_levelscan.js` um Tab `Config` erweitert.
- `htdocs/dashboard/modules/sound_levelscan.css` um Config-Styles erweitert.
- Vorbereitet: Default Playback Volume, Upload Default Volume, Max Playback Volume, Referenz-Toleranz, Scan-/Result-Limits, Referenz-Ausgabeweg, Upload-Defaults und spaetere Massenaktion.
- Keine bestehenden Sound-/Alert-/VIP-/SoundAlert-Daten werden in diesem Step veraendert.

# Changelog

## 2026-05-21 - STEP272B3 Sound-Pegel Referenz-Ausgabeweg waehlbar

- `htdocs/dashboard/modules/sound_levelscan.js` erweitert.
- `htdocs/dashboard/modules/sound_levelscan.css` erweitert.
- Referenz-Tab hat jetzt einen Ausgabeweg-Select fuer Referenzsound und Test-Ton.
- Ausgabeweg wird an `/api/sound/play` als `outputTarget` uebergeben.
- Optionen: OBS/Overlay, Audiogeraet, OBS + Audiogeraet.
- Keine Backend-Module, keine Queue-/Discord-/Alert-/TTS-Logik und kein `config/**` geaendert.

# Changelog

## 2026-05-21 - STEP272B2 Sound-Pegel Testton als echte Sound-Datei

- `backend/modules/sound_loudness_scanner.js` erweitert.
- Neuer Endpoint `GET/POST /api/sound/loudness/reference/test-file` erzeugt `htdocs/assets/sounds/generated/reference_test.wav`.
- `htdocs/dashboard/modules/sound_levelscan.js` spielt den Test-Ton jetzt als normale Sound-Datei ueber `/api/sound/play`.
- Grund: OBS/Overlay spielt echte Sound-Dateien stabiler als die vorherige generierte API-WAV-URL.
- Keine Original-Sounds, keine Queue, kein Discord-Routing, kein Alert-System und kein TTS geaendert.


## 2026-05-21 - STEP272B1 Sound-Pegel Test-Ton ueber OBS/Sound-System

- `htdocs/dashboard/modules/sound_levelscan.js` angepasst.
- Der Referenz-Testton wird jetzt ueber `/api/sound/play` und damit ueber den Sound-System-/OBS-Overlay-Pfad gestartet.
- Der direkte Test-WAV-Link bleibt nur zum Gegenhoeren erhalten.
- Keine Backend-Module, keine Sound-Dateien, keine Queue-/Discord-/Alert-/TTS-Logik und kein `config/**` geaendert.

# Changelog

## 2026-05-21 - STEP272B Sound-Pegel Auto-Referenz + Referenzsound

- `backend/modules/sound_loudness_scanner.js` erweitert.
- Neue API `GET /api/sound/loudness/reference` berechnet Auto-Referenz aus Nicht-TTS-Scan-Ergebnissen.
- Neue API `GET /api/sound/loudness/reference/test.wav` liefert einen technischen Test-Sound als WAV.
- Dashboard-Unterbereich `Referenz` ergaenzt.
- Dashboard zeigt Auto-Referenz, Toleranz, Verteilung, empfohlenen echten Referenzsound und Test-Sound-Aktionen.
- Keine Sound-Dateien, keine Sound-Queue, kein Discord-Routing, keine Alerts, kein TTS und kein `config/**` geaendert.

# Changelog

## 2026-05-21 - STEP272A Sound-Pegel Unterbereiche/Tabs

- `htdocs/dashboard/modules/sound_levelscan.js` um interne Unterbereiche erweitert.
- Sound-Pegel ist weiterhin eigenes Dashboard-Modul, aber jetzt in Tabs aufgeteilt:
  - Übersicht
  - Scan
  - Ergebnisse
  - Korrektur
  - Kopien
- `htdocs/dashboard/modules/sound_levelscan.css` um Tab-/Layout-Stile erweitert.
- Backend, Sound-System-Playback, Queue, Discord-Routing, Alert-Bundle-Lock, TTS, `config/**` und Sound-Dateien bleiben unveraendert.

## 2026-05-21 - STEP271 Sound-Pegel als eigenes Dashboard-Modul

- `htdocs/dashboard/index.html` um eigenes Panel `soundLevelModule` erweitert.
- `htdocs/dashboard/modules/sound_levelscan.js` registriert sich jetzt als eigenes Dashboard-Modul `sound_level`.
- Sound-Pegel ist unter `System -> Sound-Pegel` erreichbar.
- Pegel-Scan/Korrektur-Vorschau bleibt fachlich unveraendert und nutzt weiter `/api/sound/loudness/*`.
- Sound-System-Tab wird dadurch wieder uebersichtlicher.
- Nicht geaendert: Backend-Playback, Sound-Queue, Discord-Routing, Alert-Bundle-Lock, TTS, `config/**`, Sound-Dateien.

## 2026-05-21 - STEP270G1 Pegel-Playback-Korrektur Safe-Tuning

- `backend/modules/sound_system.js` angepasst.
- Pegel-Korrektur wird im Safe-Modus weniger aggressiv angewendet.
- Neue Sicherheitswerte: `strengthPercent` und `minPlaybackVolume`.
- `maxCutDb` wird auf maximal 12 dB begrenzt.
- Dashboard-Einstellungen um Korrektur-Staerke und Mindest-Volume erweitert.
- Ziel: kurze SFX wie Airhorn werden nicht mehr zu stark heruntergezogen.
- Keine Sound-Dateien, keine Queue, kein Discord-Routing, keine Alerts, kein TTS und kein `config/**` geaendert.


## 2026-05-21 - STEP270G Pegel-Playback-Korrektur optional

- `backend/modules/sound_system.js` erweitert.
- Sound-System kann Pegel-Scan-Werte jetzt optional beim Abspielen nutzen.
- Die Korrektur ist standardmaessig AUS und wird nur bei `enabled=true` + `mode=ready` angewendet.
- Item-Volume wird zentral im Sound-System angepasst; Originaldateien bleiben unveraendert.
- Dashboard-Schalter `Playback-Korrektur aktivieren` im Pegel-Scan ergaenzt.
- `backend/modules/sound_loudness_scanner.js` Hinweise/Preview auf aktive Korrektur aktualisiert.
- Keine Normalisierung, keine Datei-Kopien, keine Queue-/Discord-/Alert-/TTS-Umbauten.

## 2026-05-21 - STEP270E Sound Pegel-Scan Fortschrittsanzeige

- `backend/modules/sound_loudness_scanner.js` erweitert.
- Asynchroner Scan-Modus via `async=true` ergaenzt.
- Status-Endpoint liefert Live-Fortschritt (`progressPercent`, `currentFile`, Zaehler).
- Dashboard zeigt Fortschrittsbalken und aktuelle Datei waehrend des Scans.
- Keine Sound-Dateien, keine Sound-Queue, kein Discord-Routing, keine Alerts, kein TTS und kein `config/**` geaendert.

## 2026-05-21 - STEP270D1 Pegel-Scan TTS-Dateien ausgeschlossen

- `backend/modules/sound_loudness_scanner.js` erweitert.
- TTS-/Speech-Dateien werden beim Scan standardmaessig ausgelassen.
- Results-Route blendet TTS-/Speech-Ergebnisse standardmaessig aus, damit alte Messwerte die Auswertung nicht verfaelschen.
- Dashboard-Hinweis `TTS raus` im Pegel-Scan ergaenzt.
- Keine automatische Playback-Korrektur, keine Normalisierung und keine Dateiänderung.

## 2026-05-21 - STEP270D Pegel-Scan Korrektur-Vorschau

- Pegel-Scan-Dashboard um eine reine Korrektur-Vorschau erweitert.
- Neue Vorschau-Kennzahlen:
  - würden leiser
  - würden lauter
  - nahe Ziel
  - Volume-Cap
  - Peak prüfen
- Neue optionale Tabellenspalte `Vorschau`.
- Pro Datei wird angezeigt, welches Playback-Volume bzw. welcher Gain später empfohlen wäre.
- Mouseover-Hinweise für Korrektur-Risiko und empfohlene Behandlung ergänzt.
- Keine automatische Playback-Korrektur, keine Normalisierung und keine Dateiänderung.

# Changelog

## 2026-05-21 - STEP270E Sound Pegel-Scan Fortschrittsanzeige

- `backend/modules/sound_loudness_scanner.js` erweitert.
- Asynchroner Scan-Modus via `async=true` ergaenzt.
- Status-Endpoint liefert Live-Fortschritt (`progressPercent`, `currentFile`, Zaehler).
- Dashboard zeigt Fortschrittsbalken und aktuelle Datei waehrend des Scans.
- Keine Sound-Dateien, keine Sound-Queue, kein Discord-Routing, keine Alerts, kein TTS und kein `config/**` geaendert.

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

## 2026-05-21 - STEP270F Pegel-Korrektur Vorschau-Einstellungen

- `backend/modules/sound_loudness_scanner.js` um inaktive Korrektur-Settings und Preview-API erweitert.
- `htdocs/dashboard/modules/sound_levelscan.js` und `.css` um Bereich fuer spaetere Pegel-Anpassung erweitert.
- Normalisierte Kopien als eigene spaetere Option im Dashboard vorbereitet.
- Keine Playback-Korrektur aktiviert, keine Sound-Dateien veraendert.


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


## STEP272G - Sound-Pegel Boost-Kopien Preview und Einzeldatei-Test

- Neue API-Routen `/api/sound/loudness/boost/preview` und `/api/sound/loudness/boost/create-one`.
- Dashboard-Bereich `Boost-Kopien` erzeugt nur einzelne verstärkte Kopien auf Knopfdruck.
- Originaldateien, SoundAlerts, Alert-Regeln, Queue, Discord-Routing und TTS bleiben unverändert.

## STEP272G1 - Sound-Pegel Boost-Ziel aus Referenz
- Sound-Pegel Config um Boost-Ziel-LUFS, Sicherheitsabstand und Max-Boost erweitert.
- Neue API `POST /api/sound/loudness/config/adopt-reference-target` berechnet Boost-Ziel aus Auto-Referenz minus Sicherheitsabstand und speichert es in SQLite.
- Boost-Kopie Einzeldatei nutzt nun den gespeicherten Boost-Zielwert statt festem -18-LUFS-Ziel.
- Dashboard zeigt Ziel-Gain fuer Boost-Kopien und bietet Button „Referenz als Boost-Ziel übernehmen“.
- Keine Originaldateien, SoundAlert-Einträge, Alert-Regeln, Queue, Discord-Routing oder `config/**` geändert.


## STEP272H - Sound-Pegel Boost-Kopie übernehmen mit Backup

- Boost-Kopien können jetzt bewusst neu erzeugt werden (`overwrite` für `normalized/...`).
- Neue Promote-Logik: vorhandene Boost-Kopie kann an die Originalstelle kopiert werden.
- Vor dem Ersetzen wird automatisch ein Backup unter `htdocs/assets/sounds/_backup_loudness/<timestamp>/...` erstellt.
- Promote-/Rollback-Historie wird in SQLite `sound_loudness_promotions` gespeichert.
- Bestehende Alert-/SoundAlert-/VIP-Konfigurationen müssen dadurch nicht auf `normalized/...` umgestellt werden.
- Keine Originaldatei wird ohne Backup überschrieben.


## STEP272I – Sound-Pegel Dashboard Boost-Workflow

- Boost-Kopien können im Dashboard pro Datei mit Schieberegler eingestellt werden.
- Backend liefert sichere Maximalerhöhung und geschätzten Peak nach Boost.
- `boost/create-one` akzeptiert nun `gainDb`/`boostGainDb` für manuelle Einzeltests.
- Originaldateien bleiben unverändert; Promote/Backup bleibt separater Schritt.


## STEP272I1 – Sound-Pegel Dashboard Testplay + Original-Schutz

- Boost-Kopien-Tab um Ausgabeweg-Auswahl für Tests erweitert.
- Pro Datei gibt es jetzt Buttons für `Original abspielen` und `Test-Kopie abspielen`.
- Boost-Preview markiert übernommene Dateien als `promotedOriginal`.
- Übernommene Originale werden backendseitig gegen versehentliches normales Re-Boost/Overwrite geschützt.
- Dashboard zeigt übernommene Dateien als `als neues Original aktiv` und verweist auf Backup/Rollback.

## STEP272I2 – Sound-Pegel Dashboard Verwendungsprüfung

- Boost-Kopien-Preview zeigt jetzt DB-Verwendung pro Datei.
- Backend ergänzt `/api/sound/loudness/usage/file?file=...`.
- Nutzung wird aus Alert-Regeln/Alert-Assets und SoundAlerts/Kanalpunkte-Einträgen gelesen.
- Dashboard markiert Dateien ohne aktive DB-Verwendung als mögliche Altdatei/Duplikat.
- `Als Original übernehmen` wird bei nicht verwendeten Dateien blockiert, damit nicht versehentlich die falsche Datei ersetzt wird.
- Keine Sounddateien, Regeln, `config/**`, Queue-, Discord- oder TTS-Logik geändert.
