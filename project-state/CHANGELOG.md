# CHANGELOG

## STEP351 – Doku-/Handoff-Aktualisierung – 2026-05-24

- Projektstatus nach bestätigtem STEP350-Test aktualisiert.
- Neuer kompletter Prompt für einen neuen Chat erstellt.
- Handoff-Dokument für Kommunikations-/Sound-/Alert-Stand erstellt.
- Keine Codeänderungen.

## STEP350 – Alert Dashboard Control + Bus Correlation View – 2026-05-24

- Alert-Dashboard um Tab `Bus / Sync` erweitert.
- Alert-Output-Modus, Legacy-/Bus-Status, Watchdog und Alert/SoundBundle-Korrelation sichtbar gemacht.
- Output-Modi `legacy`, `legacy_and_bus`, `bus_first`, `bus_only` im Dashboard steuerbar gemacht.
- `bus_only` mit zusätzlicher Bestätigung geschützt.
- STEP350 nach Test bestätigt: `alertStep=350`, `alertBundlesOk=3`, `alertBundlesFailed=0`, `soundBusErrors=0`.
- Keine Alert-Queue-, Sound-Queue-, Bundle-, SoundBus-, Overlay-Bus-only- oder DB-Logik geändert.

## STEP340 – Alert-System Bus Dev-Migration + SoundBus-Korrelation – 2026-05-24

- Alert-System, Alert-SoundBundle und SoundBus über Korrelationsdaten verbunden.
- `/api/alerts/status` um `alertSoundCorrelation` ergänzt.
- `/api/sound/status` um `soundBus.correlation` ergänzt.
- Sound Dashboard Bus-Monitor mit Alert/SoundBus-Korrelation erweitert.
- Test bestätigt: 3 Bundles vorbereitet, gepostet und erfolgreich verarbeitet; keine Fehler.

## STEP330 – Sound Dashboard UI/Control Stabilisierung – 2026-05-24

- Medien-/Preview-Bleed-Guard für Sound-Dashboard ergänzt.
- Hidden-Section-Regeln verschärft.
- Sound-Liste mit internem Scrollbereich abgesichert.
- Sound Control Center in Status, Playback und Gefahrzone gruppiert.
- Stop/Skip/Clear deaktivieren sich bei leerem Zielzustand.
- Keine Backend-/Queue-/Bundle-/SoundBus-Logik geändert.

## STEP320 – Sound Dashboard Control Center – 2026-05-24

- Sound Control Center in Sound-Dashboard eingebaut.
- Pause, Resume, Stop, Skip, Queue leeren und Status aktualisieren über bestehende APIs vorbereitet.
- Queue- und Current-Sound-Kontext erweitert.

## STEP310 – SoundBus Consumer Integration Block – 2026-05-24

- SoundBus-Events um normalisierten Kontext erweitert.
- Quellen/Kategorien/User/Bundle-Rollen im Dashboard sichtbar gemacht.
- Große V5-Testbasis bestätigte SoundAlerts, Mod-/VIP-Sounds, normales TTS, Alerts mit TTS.
