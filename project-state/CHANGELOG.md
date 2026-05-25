# CHANGELOG

## STEP405 – VIP Bus Preview Flow Stable Cleanup – 2026-05-25

- VIP-/Communication-Bus-Stand nach STEP404C als aktuellen Zusatzstand eingeordnet.
- Bestätigt: Produktiver VIP-/Mod-Soundpfad bleibt weiterhin Sound-System-getrieben.
- Bestätigt: `vip.overlay.show/hide/update` bleibt vorerst Preview-/Diagnosepfad.
- Bestätigt: `vip.overlay.test` bleibt Shadow-only.
- Dokumentiert: STEP399, STEP401, STEP403A und STEP404C sind gültig/PASS.
- Dokumentiert: STEP404, STEP404A und STEP404B nicht als technische Wahrheit verwenden.
- Ergebnis: Keine Codeänderung, keine Sound-/Queue-/DB-/Dashboard-Änderung.
- Nächster sinnvoller Schritt: STEP406 – VIP Productive Bus Event Audit.

## STEP354 – SoundBus Final Check – 2026-05-24

- Sound-System/SoundBus-Abschlussstand dokumentiert.
- Bestätigt: Overlay-Sound über `outputTarget=overlay` erzeugt `item_starting`, `item_started`, `play_stream`, `client.audio_started`, `client_audio_ended` und `item_finished`.
- Bestätigt: Sound-Overlay meldet tatsächlichen Playback-Start und Playback-Ende mit gleicher `requestId` zurück.
- Ergebnis: SoundBus ist bereit, damit danach das Alert-System als erstes System angebunden werden kann.
- Keine Codeänderungen in STEP354.
- Kein Dashboard.

## STEP353 – Sound Overlay WebSocket Play-Signal Fix – 2026-05-24

- `htdocs/overlays/sound_system_overlay.html` repariert.
- WebSocket-Nachrichten des Sound-Systems werden wieder korrekt als komplette Nachricht gelesen.
- Das Sound-Overlay verarbeitet `item_started` / `play_stream` wieder korrekt.
- Browserquelle meldet danach `client.audio_started` und `client_audio_ended` zurück.
- Keine Backend-, Queue-, Bundle-, Alert-, Dashboard- oder DB-Änderung.

## STEP352 – SoundBus Client Event Context – 2026-05-24

- `backend/modules/sound_system.js` auf STEP352 gesetzt.
- Client-Events `client_audio_started`, `client_audio_ended` und `client_error` erhalten sauberen SoundBus-Kontext.
- Kontext enthält u. a. `requestId`, aktives Item, Match-Status und Medieninformationen.
- Keine Queue-, Bundle-, `activeBundleLock`-, Alert-, Dashboard- oder DB-Änderung.

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
