# CHANGELOG – CAN-6.5 Dashboard-Preflight-Anzeige und UX-Regeln

Stand: 2026-06-01

## Geändert

- `docs/system-inspection/EVENTBUS_CAN6_5_DASHBOARD_PREFLIGHT_READONLY_UX_CONCEPT.md` ergänzt.
- `docs/current/CURRENT_CHAT_HANDOFF_CAN6_5.md` ergänzt.
- `project-state/CURRENT_STATUS.md` um CAN-6.5 Abschlussstand erweitert.
- `project-state/NEXT_STEPS.md` um CAN-6.6 als nächsten Arbeitsblock erweitert.
- `project-state/TODO.md` um CAN-6.5/CAN-6.6 Aufgaben erweitert.
- `project-state/FILES.md` um CAN-6.5 Dateien erweitert.

## Definiert

- Sichtbare Preflight-Felder fuer eine spaetere Dashboard-Anzeige.
- Anzeigegruppen fuer Kopfbereich, Sicherheitsstatus, Rechte/Freigabe, Blockaden, Warnungen und Read-only-Hinweise.
- Status-Einstufungen: diagnose_only, blocked, warning, preflight_ok, not_available, unknown.
- Pflichttexte gegen Fehlbedienung.
- Verbotene UI-Elemente fuer CAN-6.5.
- Regeln fuer Bestätigungs-Code nur als Verfügbarkeitsstatus.
- CAN-6.1-Aktionen aus Dashboard-Sicht.

## Nicht geändert

- Keine Backend-Logik geändert.
- Keine API-Route ergänzt.
- Keine Dashboard-Datei geändert.
- Keine Recovery-Buttons ergänzt.
- Keine Simulation-Buttons ergänzt.
- Keine Recovery-Automatik aktiviert.
- Keine Queue-/Sound-/Overlay-Logik geändert.
- Keine DB-/Config-Migration.

## Nächster Block

- CAN-6.6: Read-only Dashboard-Preflight-Anzeige als Code-Step planen.

---

# CHANGELOG – CAN-6.4 Read-only Recovery-Preflight-API-Konzept

Stand: 2026-06-01

## Geändert

- `docs/system-inspection/EVENTBUS_CAN6_4_READONLY_RECOVERY_PREFLIGHT_API_CONCEPT.md` ergänzt.
- `docs/current/CURRENT_CHAT_HANDOFF_CAN6_4.md` ergänzt.
- `project-state/CURRENT_STATUS.md` um CAN-6.4 Abschlussstand erweitert.
- `project-state/NEXT_STEPS.md` um CAN-6.5 als nächsten Arbeitsblock erweitert.
- `project-state/TODO.md` um CAN-6.4/CAN-6.5 Aufgaben erweitert.
- `project-state/FILES.md` um CAN-6.4 Dateien erweitert.

## Definiert

- Konzept einer späteren read-only Recovery-Preflight-API.
- Request-/Response-Felder.
- Read-only Guard-Prüfungen.
- Blockierungs- und Warnungsgründe.
- Bestätigungs-Code-Verfügbarkeit im Preflight.
- Read-only-Garantie ohne Queue-/Lock-/Sound-/Alert-/Overlay-Mutation.

## Nicht geändert

- Keine Backend-Logik geändert.
- Keine API-Route ergänzt.
- Keine Dashboard-Buttons ergänzt.
- Keine Recovery-Automatik aktiviert.
- Keine Queue-/Sound-/Overlay-Logik geändert.
- Keine DB-/Config-Migration.

## Nächster Block

- CAN-6.5: Dashboard-Preflight-Anzeige und UX-Regeln planen.

---

# CHANGELOG – CAN-6.3 Recovery-Audit- und Bestätigungs-Code-Konzept

Stand: 2026-06-01

## Geändert

- `docs/system-inspection/EVENTBUS_CAN6_3_RECOVERY_AUDIT_CONFIRMATION_CONCEPT.md` neu ergänzt.
- `docs/current/CURRENT_CHAT_HANDOFF_CAN6_3.md` neu ergänzt.
- `project-state/CURRENT_STATUS.md` um CAN-6.3 Abschluss-/Übergabestand ergänzt.
- `project-state/NEXT_STEPS.md` um CAN-6.4 als nächsten Arbeitsblock ergänzt.
- `project-state/TODO.md` um CAN-6.4 Preflight-Konzept-Aufgaben ergänzt.
- `project-state/FILES.md` um CAN-6.3 relevante Dateien ergänzt.

## Bestätigter Stand

- CAN-6.3 definiert nur Audit- und Bestätigungs-Code-Konzept.
- Bestätigungs-Code ersetzen keine Guard-Pruefungen.
- Preflight ist nur Vorschau und darf nicht produktiv wirken.
- Keine produktive Recovery aktiviert.

## Nicht geändert

- Keine Backend-Logik geändert.
- Keine API-Logik geändert.
- Keine Dashboard-Buttons ergänzt.
- Keine neuen Routen ergänzt.
- Keine Recovery-Automatik aktiviert.
- Keine Queue-/Sound-/Overlay-Logik geändert.
- Keine DB-/Config-Migration.
- Keine Code-Dateien geändert.

## Nächster Block

- CAN-6.4: Read-only Recovery-Preflight-API-Konzept planen.

---

# CHANGELOG – CAN-6.2 Backend-Schutzvertrag

Stand: 2026-06-01

## Geändert

- `docs/system-inspection/EVENTBUS_CAN6_2_BACKEND_RECOVERY_GUARD_CONTRACT.md` neu ergänzt.
- `docs/current/CURRENT_CHAT_HANDOFF_CAN6_2.md` neu ergänzt.
- `project-state/CURRENT_STATUS.md` um CAN-6.2 Abschluss-/Übergabestand ergänzt.
- `project-state/NEXT_STEPS.md` um CAN-6.3 als nächsten Arbeitsblock ergänzt.
- `project-state/TODO.md` um CAN-6.3 Audit-/Bestätigungs-Code-Aufgaben ergänzt.
- `project-state/FILES.md` um CAN-6.2 relevante Dateien ergänzt.

## Bestätigter Stand

- CAN-6.2 definiert nur den Backend-Schutzvertrag.
- Guard-Kette definiert: Auth, Matrix, Confirm, State, Safety-Stop, Status, Duplicate, RateLimit, Audit, Rollback.
- Keine produktive Recovery aktiviert.

## Nicht geändert

- Keine Backend-Logik geändert.
- Keine API-Logik geändert.
- Keine Dashboard-Buttons ergänzt.
- Keine neuen Routen ergänzt.
- Keine Recovery-Automatik aktiviert.
- Keine Queue-/Sound-/Overlay-Logik geändert.
- Keine DB-/Config-Migration.

## Nächster Block

- CAN-6.3: Recovery-Audit- und Bestätigungs-Code-Konzept planen.

---

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
