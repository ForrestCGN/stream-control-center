## CAN-7.4 / CAN-7.5 Recovery-UX

- [x] Recovery-Tab mit internen Untertabs aufräumen.
- [x] Alle CAN-7.3-Informationen erhalten.
- [x] Keine Recovery-Buttons ergänzen.
- [x] Keine Simulation-Buttons ergänzen.
- [ ] CAN-7.5 Live-Test im Dashboard durchführen.
- [ ] Prüfen: Übersicht, Details, Readiness, Sperren & Simulation.
- [ ] Prüfen: Keine produktive Flow-Änderung.

## CAN-7 / Recovery-Readiness Dashboard

- [x] CAN-7.1 Recovery-Readiness Statusfelder im Backend read-only ergaenzen.
- [x] CAN-7.2 Live-Test und Abnahmegrenze dokumentieren.
- [x] CAN-7.2.1 Testfelder korrigieren.
- [x] CAN-7.3 Recovery-Readiness im Dashboard read-only anzeigen.
- [ ] CAN-7.4 Dashboard-Anzeige live testen und dokumentieren.
- [ ] Keine Recovery-Buttons ohne separaten Planungs- und Sicherheitsstep.

## CAN-7 / Recovery-Readiness Dashboard

- [x] CAN-7.1 Recovery-Readiness Statusfelder backendseitig read-only ergänzen.
- [x] CAN-7.1 live testen und abnehmen.
- [x] CAN-7.2 Test-/Abnahme-Doku korrigieren.
- [ ] Für CAN-7.3 vollständige echte Datei `htdocs/dashboard/modules/bus_diagnostics.js` prüfen.
- [ ] CAN-7.3 Dashboard-Read-only-Anzeige von `recoveryReadiness` planen/umsetzen.
- [ ] Sicherstellen: keine Buttons, keine POSTs, keine Commands, keine Recovery-Auslösung.

## CAN-7.2 / CAN-7.3

- [ ] CAN-7.2 Live-Test ausführen: `node -c backend\modules\bus_diagnostics.js`.
- [ ] `/api/bus-diagnostics/status` auf `version=1.2.5` prüfen.
- [ ] `recoveryReadiness` im Status prüfen.
- [ ] Alle produktiven Touch-Flags müssen false bleiben.
- [ ] Vor CAN-7.3 vollständige echte Datei `htdocs/dashboard/modules/bus_diagnostics.js` prüfen oder anfordern.
- [ ] CAN-7.3 nur read-only Dashboard-Anzeige planen/umsetzen, keine Buttons.

# TODO – CAN-7.1 / CAN-7.2 Übergang

Stand: 2026-06-01

## CAN-7.1 erledigt

- [x] `backend/modules/bus_diagnostics.js` vollstaendig gelesen.
- [x] Version auf `1.2.5` erhoeht.
- [x] Build-Marker `STEP_CAN7_1` gesetzt.
- [x] `recoveryReadiness` als read-only Statusfeld ergaenzt.
- [x] Keine neuen Routen gebaut.
- [x] Keine Recovery-Ausfuehrung gebaut.
- [x] Syntax mit `node -c` geprueft.

## CAN-7.2 offen

- [ ] Echte aktuelle `htdocs/dashboard/modules/bus_diagnostics.js` vollstaendig pruefen.
- [ ] Bestehenden Recovery-Tab als Single Source nehmen.
- [ ] `recoveryReadiness` nur anzeigen.
- [ ] Keine Buttons ergaenzen.
- [ ] Keine Actions/POST/Command-Aufrufe ergaenzen.
- [ ] Dashboard-Test mit bestehender Statusroute planen.

## Dauerhaft blockiert

- [ ] Keine automatische Recovery.
- [ ] Kein Alert-Replay.
- [ ] Kein Sound-Replay.
- [ ] Kein Auto-Retry.
- [ ] Keine produktive Queue-/Sound-/Overlay-Beruehrung.

---

# TODO – CAN-6.10 / CAN-7.0 Übergang

Stand: 2026-06-01

## CAN-6.x Abschluss

- [x] CAN-6.1 manuelle Recovery-Aktionsmatrix definiert.
- [x] CAN-6.2 Backend-Schutzvertrag dokumentiert.
- [x] CAN-6.3 Audit- und Bestaetigungs-Code-Konzept dokumentiert.
- [x] CAN-6.4 Read-only Preflight-API-Konzept dokumentiert.
- [x] CAN-6.5 Dashboard-Read-only-UX dokumentiert.
- [x] CAN-6.6 Recovery-Ausfuehrungs-Command-Konzept dokumentiert.
- [x] CAN-6.7 Recovery-Command-Audit-State-Mapping dokumentiert.
- [x] CAN-6.8 Safety-Stop- und Clear-Regelwerk dokumentiert.
- [x] CAN-6.9 Implementierungsreihenfolge und Code-Grenzen dokumentiert.
- [x] CAN-6.10 Abschlusscheck und CAN-7.0 Startgrenze dokumentiert.

## CAN-7.0 offen

- [ ] Echte aktuelle Dateien aus GitHub/dev erneut pruefen.
- [ ] `backend/modules/bus_diagnostics.js` vollstaendig lesen.
- [ ] `backend/modules/communication_bus.js` vollstaendig lesen.
- [ ] Relevante Alert-/Sound-/Overlay-Dateien nur read-only pruefen.
- [ ] Read-only Recovery-Readiness-Felder konkret planen.
- [ ] Tests fuer `productiveActions=false` und `automationEnabled=false` festlegen.
- [ ] Vor jeder Umsetzung erneut Ziel/Dateien/Aenderung/Nicht geaendert/Tests nennen und auf Go warten.

---

## CAN-6.10 / Abschlusscheck und Übergabe nach CAN-7.0

- [x] CAN-6.9 Recovery-Implementierungsreihenfolge und Code-Grenzen dokumentieren.
- [ ] CAN-6.10 CAN-6.x Abschlusscheck vorbereiten.
- [ ] CAN-6.1 bis CAN-6.9 zusammenfassen.
- [ ] Weiterhin hart blockierte Aktionen erneut bestaetigen.
- [ ] CAN-7.0 Startbedingungen definieren.
- [ ] Echte Dateien fuer CAN-7.0 Pruefung benennen.
- [ ] Sicherstellen: CAN-7.0 startet maximal read-only.
- [ ] Chat-Handoff fuer CAN-7.0 vorbereiten.

## CAN-6.9 / Recovery-Implementierungsreihenfolge und erste Code-Step-Grenzen

- [x] CAN-6.8 Recovery-Safety-Stop- und Clear-Regelwerk dokumentieren.
- [x] CAN-6.9 Implementierungsreihenfolge und erste Code-Step-Grenzen planen.
- [x] Echte Backend-Dateien fuer spaetere Pruefung benennen.
- [x] Ersten maximal erlaubten read-only Code-Step abgrenzen.
- [x] Spaeter betroffene Dashboard-Datei benennen.
- [x] Tests vor jedem Code-Step festlegen.
- [x] Verbotene erste Code-Schritte explizit dokumentieren.
- [x] Sicherstellen: keine Recovery-Ausfuehrung im ersten Code-Step.

## CAN-6.9 / Recovery-Implementierungsreihenfolge und erste Code-Step-Grenzen

- [x] CAN-6.8 Recovery-Safety-Stop- und Clear-Regelwerk dokumentieren.
- [ ] CAN-6.9 Implementierungsreihenfolge und erste Code-Step-Grenzen planen.
- [ ] Echte Backend-Dateien fuer spaetere Pruefung benennen.
- [ ] Ersten maximal erlaubten read-only Code-Step abgrenzen.
- [ ] Spaeter betroffene Dashboard-Datei benennen.
- [ ] Tests vor jedem Code-Step festlegen.
- [ ] Verbotene erste Code-Schritte explizit dokumentieren.
- [ ] Sicherstellen: keine Recovery-Ausfuehrung im ersten Code-Step.

## CAN-6.8 / Recovery-Safety-Stop- und Clear-Regelwerk

- [x] CAN-6.7 Recovery-Command-Audit-/State-Mapping dokumentieren.
- [x] CAN-6.8 Recovery-Safety-Stop- und Clear-Regelwerk planen.
- [x] Globale Safety-Stop-Arten definieren.
- [x] Modulbezogene Stopps definieren.
- [x] Clear-/Review-/Rollback-Hinweise voneinander trennen.
- [x] Low-Risk-Clear-Aktionen konzeptionell abgrenzen.
- [x] Weiterhin hart blockierte Clear-/Recovery-Aktionen definieren.
- [x] Sicherstellen: Clear darf keine produktive Ausgabe automatisch starten.

## CAN-6.8 / Recovery-Safety-Stop- und Clear-Regelwerk

- [x] CAN-6.7 Recovery-Command-Audit-/State-Mapping dokumentieren.
- [ ] CAN-6.8 Recovery-Safety-Stop- und Clear-Regelwerk planen.
- [ ] Globale Safety-Stop-Arten definieren.
- [ ] Modulbezogene Stopps definieren.
- [ ] Clear-/Review-/Rollback-Hinweise voneinander trennen.
- [ ] Low-Risk-Clear-Aktionen konzeptionell abgrenzen.
- [ ] Weiterhin hart blockierte Clear-/Recovery-Aktionen definieren.
- [ ] Sicherstellen: Clear darf keine produktive Ausgabe automatisch starten.

## CAN-6.7 / Recovery-Command-Audit-/State-Mapping

- [x] CAN-6.6 Recovery-Ausfuehrungs-Command-Konzept dokumentieren.
- [x] CAN-6.7 Recovery-Command-Audit-/State-Mapping planen.
- [x] Command-Zustaende definieren.
- [x] Audit-Events pro Command-Zustand definieren.
- [x] State-Felder fuer spaetere Anzeige und Diagnose festlegen.
- [x] Blockierungsgruende standardisieren.
- [x] Dashboard-Anzeige nach blockiertem Command planen.
- [x] Rollback-/Clear-Anzeige ohne automatische Ausfuehrung planen.
- [x] Sicherstellen: keine produktive Recovery ohne separaten Code-Step.

## CAN-6.7 / Recovery-Command-Audit-/State-Mapping

- [x] CAN-6.6 Recovery-Ausfuehrungs-Command-Konzept dokumentieren.
- [ ] CAN-6.7 Recovery-Command-Audit-/State-Mapping planen.
- [ ] Command-Zustaende definieren.
- [ ] Audit-Events pro Command-Zustand definieren.
- [ ] State-Felder fuer spaetere Anzeige und Diagnose festlegen.
- [ ] Blockierungsgruende standardisieren.
- [ ] Dashboard-Anzeige nach blockiertem Command planen.
- [ ] Rollback-/Clear-Anzeige ohne automatische Ausfuehrung planen.
- [ ] Sicherstellen: keine produktive Recovery ohne separaten Code-Step.

## CAN-6.6 / Recovery-Ausfuehrungs-Command-Konzept

- [x] CAN-6.5 Dashboard-Preflight-Anzeige und UX-Regeln dokumentieren.
- [x] CAN-6.6 Recovery-Ausfuehrungs-Command-Konzept planen.
- [x] Preflight und Command strikt trennen.
- [x] Command-Request- und Response-Felder definieren.
- [x] Guard-Reihenfolge fuer spaetere Ausfuehrung definieren.
- [x] Low-Risk-Aktionen von hart blockierten Aktionen abgrenzen.
- [x] Idempotenz und Duplikat-Sperre planen.
- [x] Audit-Pflichtpunkte fuer Command-Versuche definieren.
- [x] Rollback-/Clear-Regeln planen.
- [x] Sicherstellen: keine Route, keine Buttons, keine produktive Aktion.

## CAN-6.6 / Read-only Dashboard-Preflight-Anzeige Code-Step planen

- [x] CAN-6.5 Dashboard-Preflight-Anzeige und UX-Regeln dokumentieren.
- [ ] Echte aktuelle Dashboard-Datei `htdocs/dashboard/modules/bus_diagnostics.js` prüfen.
- [ ] Echte aktuelle Backend-Datei `backend/modules/bus_diagnostics.js` prüfen.
- [ ] Bestehende Tab-/Render-Muster im Dashboard prüfen.
- [ ] Festlegen, ob CAN-6.6 nur Planung bleibt oder erster read-only UI-Code-Step wird.
- [ ] Sicherstellen: keine Recovery-Buttons, keine Simulation-Buttons, keine produktiven Actions.
- [ ] Tests fuer Dashboard-Laden und fehlende Action-Handler definieren.

## CAN-6.5 / Dashboard-Preflight-Anzeige und UX-Regeln

- [x] CAN-6.4 Read-only Recovery-Preflight-API-Konzept dokumentieren.
- [x] CAN-6.5 Dashboard-Preflight-Anzeige und UX-Regeln planen.
- [x] Sichtbare Preflight-Felder fuer Dashboard festlegen.
- [x] Darstellung fuer blockiert/erlaubt/Warnung definieren.
- [x] Read-only-Hinweise und Sicherheitsformulierungen definieren.
- [x] Verbotene UI-Elemente fuer CAN-6.5 festlegen.
- [x] Rollen-/Rechte-Hinweise fuer Dashboard planen.
- [x] Sicherstellen: keine Recovery-Buttons, keine Simulation-Buttons, keine produktiven Aktionen.

## CAN-6.5 / Dashboard-Preflight-Anzeige und UX-Regeln

- [x] CAN-6.4 Read-only Recovery-Preflight-API-Konzept dokumentieren.
- [ ] CAN-6.5 Dashboard-Preflight-Anzeige und UX-Regeln planen.
- [ ] Sichtbare Preflight-Felder fuer Dashboard festlegen.
- [ ] Darstellung fuer blockiert/erlaubt/Warnung definieren.
- [ ] Read-only-Hinweise und Sicherheitsformulierungen definieren.
- [ ] Verbotene UI-Elemente fuer CAN-6.5 festlegen.
- [ ] Rollen-/Rechte-Hinweise fuer Dashboard planen.
- [ ] Sicherstellen: keine Recovery-Buttons, keine Simulation-Buttons, keine produktiven Aktionen.

## CAN-6.4 / Read-only Recovery-Preflight-API-Konzept

- [x] CAN-6.3 Recovery-Audit- und Bestätigungs-Code-Konzept dokumentieren.
- [x] CAN-6.4 Read-only Recovery-Preflight-API-Konzept planen.
- [x] Preflight-Antwortfelder fuer spaetere API finalisieren.
- [x] Guard-Pruefungen fuer read-only Preflight definieren.
- [x] Bestätigungs-Code-Erzeugung im Preflight konzeptionell abgrenzen.
- [x] Blockierungsgruende fuer Preflight-Antworten definieren.
- [x] Sicherstellen: Preflight aendert keine Queues, Locks, Sounds, Alerts oder Overlays.
- [x] Sicherstellen: keine neue Route ohne separaten Code-Step.

## CAN-6.4 / Read-only Recovery-Preflight-API-Konzept

- [x] CAN-6.3 Recovery-Audit- und Bestätigungs-Code-Konzept dokumentieren.
- [ ] CAN-6.4 Read-only Recovery-Preflight-API-Konzept planen.
- [ ] Preflight-Antwortfelder fuer spaetere API finalisieren.
- [ ] Guard-Pruefungen fuer read-only Preflight definieren.
- [ ] Bestätigungs-Code-Erzeugung im Preflight konzeptionell abgrenzen.
- [ ] Blockierungsgruende fuer Preflight-Antworten definieren.
- [ ] Sicherstellen: Preflight aendert keine Queues, Locks, Sounds, Alerts oder Overlays.
- [ ] Sicherstellen: keine neue Route ohne separaten Code-Step.

## CAN-6.3 / Audit und Bestätigungs-Code

- [x] CAN-6.2 Backend-Schutzvertrag fuer manuelle Recovery dokumentieren.
- [x] CAN-6.3 Recovery-Audit- und Bestätigungs-Code-Konzept planen.
- [x] Audit-Eventtypen fuer Preflight, Confirm, Block, Erfolg und Fehler definieren.
- [x] Bestätigungs-Code-Lebenszyklus definieren: erzeugen, binden, anzeigen, bestaetigen, verbrauchen, ablaufen lassen.
- [x] Pflichtfelder fuer Preflight-Antwort festlegen.
- [x] Bestätigungs-Code-Wiederverwendung hart blockieren.
- [x] Rollen-/User-/Action-/ID-Bindung fuer Bestätigungs-Code festlegen.
- [x] Spaetere DB-/Storage-Struktur nur planen, keine produktive DB blind migrieren.

# TODO

Stand: 2026-06-01

## Doku / Projektstand

- [x] Project-State-/Dokumentations-Cleanup STEP553–STEP588 abschließen.
- [x] `project-state/GENERAL_PROJECT_PROMPT.md` auf neue Arbeitsweise aktualisieren.
- [x] Zentrale Statusdateien auf STEP588/STEP589 nachziehen.
- [ ] Routen-/Modul-Doku mit echten Backend-Dateien verifizieren.
- [ ] Bei Chatwechsel erneut `dokumentieren und aktualisieren` durchführen.
- [ ] Nach Routenprüfung ggf. `docs/backend/ROUTES.md` oder Modul-Dokus aktualisieren.

## CAN-7 / Recovery-Readiness

- [x] CAN-7.0 echte relevante Dateien fuer Recovery-Readiness geprueft.
- [x] CAN-7.0 Startgrenze fuer CAN-7.1 dokumentiert.
- [ ] CAN-7.1 `backend/modules/bus_diagnostics.js` vollstaendig lesen.
- [ ] CAN-7.1 additive `recoveryReadiness`-Felder planen.
- [ ] CAN-7.1 Versionserhoehung pruefen, aber nicht blind aendern.
- [ ] CAN-7.1 Tests vor Umsetzung nennen.
- [ ] Weiterhin pruefen: keine POST-/Command-Route, keine Buttons, keine produktive Flow-Aenderung.


## CAN-6 / Manuelle Recovery

- [x] CAN-5.5 bis CAN-5.10 als stabilen read-only Diagnose-Stand dokumentieren.
- [x] CAN-6.0 als reine Planung für abgesicherte manuelle Recovery dokumentieren.
- [x] CAN-6.1 manuelle Recovery-Aktionsmatrix definieren.
- [x] Pro Recovery-Zustand festlegen: Diagnose-only, manuell erlaubt oder hart blockiert.
- [x] Pflichtrechte pro späterer manueller Aktion festlegen: Owner/Admin.
- [x] Bestätigungsdialoge für spätere manuelle Aktionen planen.
- [x] Audit-Log-Pflicht pro Aktion definieren.
- [x] Duplikat-Sperren für Alert-/Sound-/Overlay-Recovery entwerfen.
- [x] Safety-Stop/Rollback/Clear-Regel definieren.
- [x] CAN-6.2 Backend-Schutzvertrag fuer manuelle Recovery planen.
- [x] Auth-/Owner-Admin-Pruefung fuer spaetere Recovery-Aktionen festlegen.
- [x] Audit-Log-Anbindung fuer Recovery-Aktionen technisch planen.
- [x] Globalen Recovery-Safety-Stop und Modul-Safety-Stops planen.
- [x] Status-Guards fuer Alert/Sound/Overlay/Bundle/Queue definieren.
- [x] Confirm-/Bestätigungsmechanik fuer spaetere Dashboard-Aktionen planen.
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

