# TODO

Stand: 2026-05-30

## Doku / Projektstand

- [x] Project-State-/Dokumentations-Cleanup STEP553–STEP588 abschließen.
- [x] `project-state/GENERAL_PROJECT_PROMPT.md` auf neue Arbeitsweise aktualisieren.
- [x] Zentrale Statusdateien auf STEP588/STEP589 nachziehen.
- [ ] Routen-/Modul-Doku mit echten Backend-Dateien verifizieren.
- [ ] Bei Chatwechsel erneut `dokumentieren und aktualisieren` durchführen.
- [ ] Nach Routenprüfung ggf. `docs/backend/ROUTES.md` oder Modul-Dokus aktualisieren.

## CAN-6 / Manuelle Recovery

- [x] CAN-5.5 bis CAN-5.10 als stabilen read-only Diagnose-Stand dokumentieren.
- [x] CAN-6.0 als reine Planung für abgesicherte manuelle Recovery dokumentieren.
- [ ] CAN-6.1 manuelle Recovery-Aktionsmatrix definieren.
- [ ] Pro Recovery-Zustand festlegen: Diagnose-only, manuell erlaubt oder hart blockiert.
- [ ] Pflichtrechte pro späterer manueller Aktion festlegen: Owner/Admin.
- [ ] Bestätigungsdialoge für spätere manuelle Aktionen planen.
- [ ] Audit-Log-Pflicht pro Aktion definieren.
- [ ] Duplikat-Sperren für Alert-/Sound-/Overlay-Recovery entwerfen.
- [ ] Safety-Stop/Rollback/Clear-Regel definieren.
- [ ] Vor jedem Code-Step prüfen: keine automatische Recovery, kein Auto-Retry, kein Replay ohne harte Schutzmechanik.


## Channelpoints

- [ ] Nach STEP527 prüfen, ob `channelpoints.js` wieder geladen wird.
- [ ] Neuen Reward anlegen und bestätigen: Twitch wird erstellt, aber inaktiv.
- [ ] Twitch Aktiv/Inaktiv-Schalter in Übersicht testen.
- [ ] Bestehenden aktiven Reward bearbeiten und prüfen: Aktivstatus bleibt erhalten.
- [ ] Bestehenden inaktiven Reward bearbeiten und prüfen: bleibt inaktiv.
- [ ] Offline-Twitch-Meldung bei Rewards mit `max_per_stream > 0` dokumentiert halten.

## Sound / Media

- [ ] `/api/sound/status` prüfen: `defaults.outputTarget=device`.
- [ ] Media-Dateinamen-Fix nur mit Real-STEP524 verwenden.
- [ ] Alte Mojibake-Dateinamen nur gezielt reparieren, nicht pauschal löschen/verschieben.
- [ ] Verwaisten `activeBundleLock` im Sound-System als separaten Fix-Block planen/testen.

## Routen / Module

- [ ] STEP591 Routes and Module Docs Verification Scan durchführen.
- [ ] Fehlende Modul-Dokus ergänzen.
- [ ] Veraltete Routen in docs/modules/*.md korrigieren.
- [ ] Dashboard-/Overlay-/Streamer.bot-relevante Routen markieren.
- [ ] PowerShell-Testausgaben künftig kurz und feldgenau halten.

## EventBus / Communication Bus

- [ ] Communication-Bus-Vertrag bei neuen Modulanbindungen zuerst prüfen.
- [ ] EventBus nur ergänzend nutzen, produktive Flows nicht ungeplant ersetzen.
- [ ] Bus-/Shadow-Adapter für Alerts später separat testen, bevor produktive Umschaltung geplant wird.

## Overlay Health/Refresh

- [ ] Echte aktuelle Dateien prüfen: obs.js, scene_control.js, overlay_data.js, sound_system.js, ws-client.js, relevante Overlays.
- [ ] Vorhandene OBS-Refresh-Möglichkeiten ermitteln.
- [ ] Overlay-Heartbeat-Konzept definieren.
- [ ] Dashboard-Statuskarte für Overlay-Gesundheit planen.
- [ ] Refresh-Routen für einzelne Sources und Gruppen planen.
- [ ] Konfiguration für Overlay-Gruppen statt hart codierter Namen planen.
- [ ] Streamer.bot-kompatible GET-Fallbacks prüfen.

<!-- STEP615_CLEANUP_FREEZE_START -->
## STEP615 Cleanup Freeze

Status: abgeschlossen / eingefroren

Keine weiteren Mini-Cleanup-Steps fuer reine Ordnungsfragen.

Nur noch bei konkretem Bedarf:

- FINAL_CLEANUP_SCAN
- FINAL_ARCHIVE_PLAN
- FINAL_ARCHIVE_APPLY
- FINAL_VERIFY

Aktueller Fokus: produktive Projektarbeit.
<!-- STEP615_CLEANUP_FREEZE_END -->

