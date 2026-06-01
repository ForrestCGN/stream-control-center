# CHANGELOG – CAN-6.1 Manuelle Recovery-Aktionsmatrix

Stand: 2026-06-01
Marker: STEP_CAN6_1_MANUAL_RECOVERY_ACTION_MATRIX

## Geändert

- `docs/system-inspection/EVENTBUS_CAN6_1_MANUAL_RECOVERY_ACTION_MATRIX.md` neu ergänzt.
- `docs/current/CURRENT_CHAT_HANDOFF_CAN6_1.md` neu ergänzt.
- `project-state/CURRENT_STATUS.md` um CAN-6.1 Abschluss-/Übergabestand ergänzt.
- `project-state/NEXT_STEPS.md` auf nächsten Arbeitsblock CAN-6.2 aktualisiert.
- `project-state/TODO.md` CAN-6.1 Aufgaben abgeschlossen und CAN-6.2 Aufgaben ergänzt.
- `project-state/FILES.md` um CAN-6.1 Dateien ergänzt.

## Bestätigter Stand

- CAN-6.1 ist reine Planung/Dokumentation.
- Die manuelle Recovery-Aktionsmatrix ist definiert.
- Es wurden keine produktiven Flows freigeschaltet.
- Das Dashboard bleibt read-only.

## Nicht geändert

- Keine Backend-Logik geändert.
- Keine API-Logik geändert.
- Keine Dashboard-Buttons ergänzt.
- Keine Recovery-Automatik aktiviert.
- Keine Queue-/Sound-/Overlay-Logik geändert.
- Keine DB-/Config-Migration.
- Keine Code-Dateien geändert.

## Nächster Block

- CAN-6.2: Backend-Schutzvertrag fuer manuelle Recovery planen.

---

# CHANGELOG – CAN-6.0 Dokumentationsabschluss

Stand: 2026-06-01

## Geändert

- `project-state/CURRENT_STATUS.md` um konsolidierten CAN-6.0 Übergabestand ergänzt.
- `project-state/NEXT_STEPS.md` um nächsten Arbeitsblock CAN-6.1 ergänzt.
- `TODO.md` um offene CAN-6.1 Aufgaben ergänzt.
- `FILES.md` um relevante CAN-5/CAN-6 Diagnose- und Dashboard-Dateien ergänzt.
- `docs/current/CURRENT_CHAT_HANDOFF_CAN6_0.md` als Übergabedatei für den nächsten Chat ergänzt.

## Bestätigter Stand

- CAN-5.5 bis CAN-5.10 bilden einen stabilen read-only Diagnose-Stand.
- CAN-6.0 ist reine Planung für später mögliche manuelle Recovery.
- Es wurden keine produktiven Flows freigeschaltet.

## Nicht geändert

- Keine Backend-Logik geändert.
- Keine API-Logik geändert.
- Keine Dashboard-Buttons ergänzt.
- Keine Recovery-Automatik aktiviert.
- Keine Queue-/Sound-/Overlay-Logik geändert.
- Keine DB-/Config-Migration.

## Nächster Block

- CAN-6.1: Manuelle Recovery-Aktionsmatrix definieren.

---

# CHANGELOG – STEP278 Vorbereitung

Stand: 2026-05-31 08:14 UTC

## Geändert

- `clip_system.json` für heutigen Test angepasst:
  - `clipShoutout.officialShoutout.enabled = true`
  - `clipShoutout.officialShoutout.liveGateEnabled = false`

## Nicht geändert

- Keine Script-Dateien geändert.
- Kein Overlay-Design geändert.
- Keine Datenbank geändert.
- Keine Queue gelöscht.
- Keine Funktionalität entfernt.

## Grund

Die Official-Queue blieb auf `waiting_stream_live_offline`, obwohl Shoutouts während des Streams beobachtet werden sollen. Für den heutigen Test wird die interne Live-Gate-Sperre deaktiviert. Twitch selbst kann weiterhin ablehnen, wenn ein offizieller Shoutout nicht erlaubt ist.

## Beobachtung

Nach der Änderung zeigte der Status:

- `officialQueue.liveGate.enabled = false`
- `officialQueue.pending = 10`
- `officialShoutout.globalCooldownMs = 120000`
- `officialShoutout.targetCooldownMs = 3600000`
- `state.officialShoutout.lastBusEvent.action = shoutout.official.waiting_cooldown`
