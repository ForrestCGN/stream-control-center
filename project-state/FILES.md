# FILES - stream-control-center

## STEP272D1 - Sound-Pegel Defaults vollständig auf 80

Geaendert:

```text
backend/modules/sound_loudness_scanner.js
docs/current/CURRENT_SYSTEM_STATUS.md
project-state/CURRENT_STATUS.md
project-state/CHANGELOG.md
project-state/FILES.md
project-state/NEXT_STEPS.md
project-state/STEP272D1_SOUND_PEGEL_DEFAULTS_COMPLETE.md
```

Nicht geaendert:

```text
backend/modules/sound_system.js
backend/modules/vip_sound_overlay.js
htdocs/dashboard/modules/sound_levelscan.js
htdocs/dashboard/modules/sound_levelscan.css
Sound-Dateien
config/**
Alert-Regeln massenhaft
SoundAlert-Entries massenhaft
Sound-Queue
Discord-Routing
TTS-System
```

# FILES - stream-control-center

## STEP272D - Sound-Pegel Upload-/Playback-Defaults anwenden

Geaendert:

```text
backend/modules/sound_loudness_scanner.js
backend/modules/vip_sound_overlay.js
htdocs/dashboard/modules/sound_levelscan.js
htdocs/dashboard/modules/sound_levelscan.css
docs/current/CURRENT_SYSTEM_STATUS.md
project-state/CURRENT_STATUS.md
project-state/CHANGELOG.md
project-state/FILES.md
project-state/NEXT_STEPS.md
project-state/STEP272D_SOUND_PEGEL_UPLOAD_DEFAULTS_APPLY.md
```

Nicht geaendert:

```text
Sound-Dateien
config/**
Alert-Regeln massenhaft
SoundAlert-Entries massenhaft
Sound-Queue
Discord-Routing
TTS-System
```


Stand: 2026-05-21

## STEP272B3 - Sound-Pegel Referenz-Ausgabeweg waehlbar

Geaendert:

```text
htdocs/dashboard/modules/sound_levelscan.js
htdocs/dashboard/modules/sound_levelscan.css
docs/current/CURRENT_SYSTEM_STATUS.md
project-state/CURRENT_STATUS.md
project-state/CHANGELOG.md
project-state/FILES.md
project-state/NEXT_STEPS.md
project-state/STEP272B3_SOUND_PEGEL_REFERENZ_AUSGABEWEG.md
```

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

# FILES - stream-control-center

Stand: 2026-05-21


## STEP272B2 - Sound-Pegel Testton als echte Sound-Datei

Geaendert:

```text
backend/modules/sound_loudness_scanner.js
htdocs/dashboard/modules/sound_levelscan.js
docs/current/CURRENT_SYSTEM_STATUS.md
project-state/CURRENT_STATUS.md
project-state/CHANGELOG.md
project-state/FILES.md
project-state/NEXT_STEPS.md
project-state/STEP272B2_SOUND_PEGEL_TESTTON_ECHTE_DATEI.md
```

Nicht geaendert:

```text
backend/modules/sound_system.js
app.sqlite ersetzt/neu gebaut: nein
config/**
Sound-Queue
Discord-Routing
Alert-Bundle-Lock
TTS-System
Streamer.bot-Flows
Overlay-HTML
```

Runtime-Hinweis:

```text
Bei Nutzung des Test-Ton-Buttons kann htdocs/assets/sounds/generated/reference_test.wav erzeugt/aktualisiert werden.
```

## STEP272B1 - Sound-Pegel Test-Ton ueber OBS/Sound-System

Geaendert:

```text
htdocs/dashboard/modules/sound_levelscan.js
project-state/STEP272B1_SOUND_PEGEL_TESTTON_OBS.md
```

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

# FILES - stream-control-center

Stand: 2026-05-21

## STEP272B - Sound-Pegel Auto-Referenz + Referenzsound

Geaendert:

```text
backend/modules/sound_loudness_scanner.js
htdocs/dashboard/modules/sound_levelscan.js
htdocs/dashboard/modules/sound_levelscan.css
docs/current/CURRENT_SYSTEM_STATUS.md
project-state/CURRENT_STATUS.md
project-state/CHANGELOG.md
project-state/FILES.md
project-state/NEXT_STEPS.md
project-state/STEP272B_SOUND_PEGEL_AUTO_REFERENZ.md
```

Nicht geaendert:

```text
backend/modules/sound_system.js
app.sqlite ersetzt/neu gebaut: nein
config/**
Sound-Dateien
Sound-Queue
Discord-Routing
Alert-Bundle-Lock
TTS-System
```

# FILES - stream-control-center

Stand: 2026-05-21

## STEP272A - Sound-Pegel Unterbereiche/Tabs

Geaendert:

```text
htdocs/dashboard/modules/sound_levelscan.js
htdocs/dashboard/modules/sound_levelscan.css
docs/current/CURRENT_SYSTEM_STATUS.md
project-state/CURRENT_STATUS.md
project-state/CHANGELOG.md
project-state/FILES.md
project-state/NEXT_STEPS.md
project-state/STEP272A_SOUND_PEGEL_UNTERBEREICHE_TABS.md
```

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

Geaendert:

```text
htdocs/dashboard/index.html
htdocs/dashboard/modules/sound_levelscan.js
htdocs/dashboard/modules/sound_levelscan.css
docs/current/CURRENT_SYSTEM_STATUS.md
project-state/CURRENT_STATUS.md
project-state/CHANGELOG.md
project-state/FILES.md
project-state/NEXT_STEPS.md
project-state/STEP271_SOUND_PEGEL_EIGENES_DASHBOARD_MODUL.md
```

Nicht geaendert:

```text
backend/modules/sound_system.js
backend/modules/sound_loudness_scanner.js
app.sqlite
config/**
Alert-/TTS-/Discord-Playback
Sound-Dateien
```

Hinweis:

```text
Sound-Pegel ist jetzt eigenes Dashboard-Modul `sound_level`, nutzt aber weiterhin die vorhandenen Backend-Routen `/api/sound/loudness/*`.
```


## STEP270G1 - Pegel-Playback-Korrektur Safe-Tuning

Geaendert:

```text
backend/modules/sound_system.js
backend/modules/sound_loudness_scanner.js
htdocs/dashboard/modules/sound_levelscan.js
docs/current/CURRENT_SYSTEM_STATUS.md
project-state/CURRENT_STATUS.md
project-state/CHANGELOG.md
project-state/FILES.md
project-state/NEXT_STEPS.md
project-state/STEP270G1_SOUND_PEGEL_PLAYBACK_CORRECTION_SAFE_TUNING.md
```

Nicht geaendert:

```text
Sound-Dateien
config/**
Sound-System Queue-/Bundle-/Discord-Logik
Alert-System
TTS-System
Streamer.bot-Flows
Overlay-HTML
```


## STEP270G - Pegel-Playback-Korrektur optional

Geaendert:

```text
backend/modules/sound_system.js
backend/modules/sound_loudness_scanner.js
htdocs/dashboard/modules/sound_levelscan.js
docs/current/CURRENT_SYSTEM_STATUS.md
project-state/CURRENT_STATUS.md
project-state/CHANGELOG.md
project-state/FILES.md
project-state/NEXT_STEPS.md
project-state/STEP270G_SOUND_PEGEL_PLAYBACK_CORRECTION_OPTIONAL.md
```

Nicht geaendert:

```text
Sound-Dateien
Normalisierte Kopien
config/**
app.sqlite neu gebaut/ersetzt: nein
Alert-System
TTS-System
Discord-Routing
Streamer.bot-Flows
Overlay-HTML
```

Hinweis:

```text
Die Pegel-Korrektur greift nur, wenn sie im Dashboard explizit aktiviert wird. Originaldateien bleiben unveraendert.
```

## STEP270D1 - Pegel-Scan TTS-Dateien ausgeschlossen

Geaendert:

```text
backend/modules/sound_loudness_scanner.js
htdocs/dashboard/modules/sound_levelscan.js
docs/current/CURRENT_SYSTEM_STATUS.md
project-state/CURRENT_STATUS.md
project-state/CHANGELOG.md
project-state/FILES.md
project-state/NEXT_STEPS.md
project-state/STEP270D1_SOUND_PEGEL_SCAN_EXCLUDE_TTS.md
```

Nicht geaendert:

```text
app.sqlite
config/**
backend/modules/sound_system.js
Alert-System
Discord-Routing
Sound-Dateien
```


## STEP270D - Pegel-Scan Korrektur-Vorschau

Geaendert:

```text
htdocs/dashboard/modules/sound_levelscan.js
htdocs/dashboard/modules/sound_levelscan.css
docs/current/CURRENT_SYSTEM_STATUS.md
project-state/CURRENT_STATUS.md
project-state/CHANGELOG.md
project-state/FILES.md
project-state/NEXT_STEPS.md
project-state/STEP270D_SOUND_PEGEL_SCAN_CORRECTION_PREVIEW.md
```

Nicht geaendert:

```text
app.sqlite
config/**
backend/modules/sound_system.js
backend/modules/sound_loudness_scanner.js
Alert-System
TTS
Discord-Routing
Sound-Dateien
```


## STEP270C - Pegel-Scan Dashboard UI verbessert

Geaendert:

```text
htdocs/dashboard/modules/sound_levelscan.js
htdocs/dashboard/modules/sound_levelscan.css
docs/current/CURRENT_SYSTEM_STATUS.md
project-state/CURRENT_STATUS.md
project-state/CHANGELOG.md
project-state/FILES.md
project-state/NEXT_STEPS.md
project-state/STEP270C_SOUND_PEGEL_SCAN_UI_EXPLANATIONS.md
```

Nicht geaendert:

```text
app.sqlite
config/**
backend/modules/sound_system.js
backend/modules/sound_loudness_scanner.js
Alert-System
TTS
Discord-Routing
Sound-Dateien
```

## STEP270B - Sound Pegel-Scan Dashboard View

Geaendert:

```text
htdocs/dashboard/index.html
htdocs/dashboard/modules/sound_levelscan.js
htdocs/dashboard/modules/sound_levelscan.css
docs/current/CURRENT_SYSTEM_STATUS.md
project-state/CURRENT_STATUS.md
project-state/CHANGELOG.md
project-state/FILES.md
project-state/NEXT_STEPS.md
project-state/STEP270B_SOUND_PEGEL_SCAN_DASHBOARD_VIEW.md
```

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
```

Hinweis:

```text
Pegel-Scan ist nur Dashboard-Anzeige und API-Client fuer den bestehenden Read-only-Scanner.
Keine Datei-Normalisierung und keine Playback-Korrektur in diesem STEP.
```

## STEP270A/STEP270A1 - Sound Loudness Scanner Read-only

Relevante Dateien:

```text
backend/modules/sound_loudness_scanner.js
project-state/STEP270A_SOUND_LOUDNESS_SCANNER_READONLY.md
project-state/STEP270A1_SOUND_LOUDNESS_RESULTS_ROUTE_FIX.md
```

## STEP269A-C - Sound/Discord Integration

Geaendert:

```text
backend/modules/sound_system.js
backend/modules/vip_sound_overlay.js
project-state/STEP269A_SOUND_SYSTEM_DISCORD_TARGET_PLAYBACK.md
project-state/STEP269B_SOUND_SYSTEM_DISCORD_AUTO_ROUTING.md
project-state/STEP269C_VIP_SOUND_SYSTEM_TARGET_BOTH.md
```

Doku aktualisiert in STEP269D:

```text
docs/current/CURRENT_SYSTEM_STATUS.md
project-state/CURRENT_STATUS.md
project-state/CHANGELOG.md
project-state/FILES.md
project-state/NEXT_STEPS.md
project-state/STEP269D_SOUND_DISCORD_INTEGRATION_CONFIRMED_2026-05-21.md
```

## Relevante Module

```text
backend/modules/sound_system.js
backend/modules/sound_loudness_scanner.js
backend/modules/discord.js
backend/modules/vip_sound_overlay.js
backend/modules/alert_system.js
backend/modules/soundalerts_bridge.js
backend/modules/tts_system.js
htdocs/dashboard/modules/sound.js
htdocs/dashboard/modules/sound_levelscan.js
htdocs/dashboard/modules/sound_levelscan.css
```

## STEP270E - Sound Pegel-Scan Fortschrittsanzeige

Geaendert:

```text
backend/modules/sound_loudness_scanner.js
htdocs/dashboard/modules/sound_levelscan.js
htdocs/dashboard/modules/sound_levelscan.css
docs/current/CURRENT_SYSTEM_STATUS.md
project-state/CURRENT_STATUS.md
project-state/CHANGELOG.md
project-state/FILES.md
project-state/NEXT_STEPS.md
project-state/STEP270E_SOUND_PEGEL_SCAN_PROGRESS.md
```

Nicht geaendert:

```text
app.sqlite
config/**
backend/modules/sound_system.js
Alert-System
TTS-System
Discord-Routing
Sound-Dateien
```


## STEP270F - Pegel-Korrektur Vorschau-Einstellungen

Geaendert:

```text
backend/modules/sound_loudness_scanner.js
htdocs/dashboard/modules/sound_levelscan.js
htdocs/dashboard/modules/sound_levelscan.css
project-state/STEP270F_SOUND_PEGEL_CORRECTION_SETTINGS_PREVIEW.md
```

Nicht geaendert:

```text
app.sqlite ersetzt/neu gebaut: nein
config/**
backend/modules/sound_system.js
Alert-/TTS-/Discord-Playback
Sound-Dateien
```


## STEP272C - Sound-Pegel Config-Seite

Geaendert:

```text
backend/modules/sound_loudness_scanner.js
htdocs/dashboard/modules/sound_levelscan.js
htdocs/dashboard/modules/sound_levelscan.css
docs/current/CURRENT_SYSTEM_STATUS.md
project-state/CURRENT_STATUS.md
project-state/CHANGELOG.md
project-state/FILES.md
project-state/NEXT_STEPS.md
project-state/STEP272C_SOUND_PEGEL_CONFIG_SEITE.md
```

Nicht geaendert:

```text
backend/modules/sound_system.js
app.sqlite ersetzt/neu gebaut: nein
config/**
Sound-Dateien
Alert-/VIP-/SoundAlert-Daten
Sound-Queue
Discord-Routing
TTS-System
```


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


## STEP272G Dateien

- `backend/modules/sound_loudness_scanner.js` - Boost-Preview und Einzeldatei-Erzeugung.
- `htdocs/dashboard/modules/sound_levelscan.js` - Dashboard-Bereich Boost-Kopien.
- `htdocs/dashboard/modules/sound_levelscan.css` - Darstellung Boost-Kopien.
- `project-state/STEP272G_SOUND_PEGEL_BOOST_COPY_PREVIEW.md` - Step-Dokumentation.

## STEP272G1 geänderte Dateien
- `backend/modules/sound_loudness_scanner.js` - Config-Felder, Referenz-Ziel-API, Boost-Kopie nutzt Ziel-LUFS aus SQLite.
- `htdocs/dashboard/modules/sound_levelscan.js` - Config-UI fuer Boost-Ziel, Sicherheitsabstand, Max-Boost und Referenz-Übernahme.
- `htdocs/dashboard/modules/sound_levelscan.css` - unverändert aus STEP272G enthalten.


## STEP272H geänderte Dateien

- `backend/modules/sound_loudness_scanner.js` - Overwrite für Boost-Kopien, Promote/Backup/Rollback-API, SQLite-Tabelle `sound_loudness_promotions`.
- `htdocs/dashboard/modules/sound_levelscan.js` - Checkbox für Boost-Overwrite, Button `Kopie übernehmen`, Promote-Historie und Rollback.
- `htdocs/dashboard/modules/sound_levelscan.css` - kleine Styles für Overwrite/Promote-Historie.
- `project-state/STEP272H_SOUND_PEGEL_PROMOTE_BACKUP.md` - Step-Dokumentation.


## STEP272I geänderte Dateien

- `backend/modules/sound_loudness_scanner.js` – Boost-Preview erweitert, manuelle `gainDb`-Erzeugung, Sicherheitsprüfung.
- `htdocs/dashboard/modules/sound_levelscan.js` – Boost-Workflow mit Slider/Dropdown pro Datei.
- `htdocs/dashboard/modules/sound_levelscan.css` – Styling für Boost-Regler.
- `project-state/STEP272I_SOUND_PEGEL_DASHBOARD_BOOST_WORKFLOW.md` – Step-Dokumentation.


## STEP272I1 geänderte Dateien

- `backend/modules/sound_loudness_scanner.js` – Promote-Status in Boost-Preview, Schutz für bereits übernommene Originale.
- `htdocs/dashboard/modules/sound_levelscan.js` – Test-Ausgabe-Auswahl, Original/Test-Kopie-Abspielen, Schutzstatus im Boost-Tab.
- `htdocs/dashboard/modules/sound_levelscan.css` – Styles für Test-Aktionen und geschützte Originale.
- `project-state/STEP272I1_SOUND_PEGEL_DASHBOARD_TESTPLAY_ORIGINAL_PROTECT.md` – Step-Dokumentation.

## STEP272I2 – Sound-Pegel Dashboard Verwendungsprüfung

- Boost-Kopien-Preview zeigt jetzt DB-Verwendung pro Datei.
- Backend ergänzt `/api/sound/loudness/usage/file?file=...`.
- Nutzung wird aus Alert-Regeln/Alert-Assets und SoundAlerts/Kanalpunkte-Einträgen gelesen.
- Dashboard markiert Dateien ohne aktive DB-Verwendung als mögliche Altdatei/Duplikat.
- `Als Original übernehmen` wird bei nicht verwendeten Dateien blockiert, damit nicht versehentlich die falsche Datei ersetzt wird.
- Keine Sounddateien, Regeln, `config/**`, Queue-, Discord- oder TTS-Logik geändert.

## STEP272I3 - Sound-Pegel Dashboard Dropdown-Auswahl
- Boost-Kandidaten werden nicht mehr als lange Liste untereinander angezeigt.
- Im Tab `Boost-Kopien` wählt man jetzt genau eine Datei per Dropdown aus.
- Die Auswahl bleibt nach Erzeugen/Testen/Übernehmen/Neu-Laden erhalten, solange die Datei weiter in der Preview vorkommt.
- Keine Backend-/Datei-/Config-Änderungen; nur Dashboard-Workflow/UX.

## STEP272I4 - Sound-Pegel Scan-Excludes

- Backup-/Test-/Generated-Ordner werden vom Sound-Pegel-Scan ausgeschlossen: `_backup_loudness`, `normalized`, `generated`.
- Zweck: Übernommene Original-Backups, Boost-Testkopien und Referenz-Testdateien tauchen nicht mehr als produktive Sounds in Scan-/Boost-Listen auf.
- Keine Sounddateien, Regeln, Queue, Discord-Routing, TTS oder `config/**` geändert.



## STEP272I5

- `backend/modules/sound_loudness_scanner.js` - Hotfix für `startedAt` im synchronen Scan.
- `project-state/STEP272I5_SOUND_PEGEL_SCAN_STARTEDAT_FIX.md` - Step-Doku.
