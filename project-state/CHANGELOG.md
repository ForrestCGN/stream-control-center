# CHANGELOG

## CAN-26.5

- Deploy-Script `tools/deploy_repo_to_streamassets.ps1` vorbereitet, damit Doku-/Projektstandsdateien kuenftig nach Live synchronisiert werden.
- Backup-/Deploy-Pfade ergaenzt fuer:
  - `docs/current`
  - `docs/system-inspection`
  - `docs/modules`
  - `project-state`
- Keine Backend-Logik geaendert.
- Kein Dashboard-Code geaendert.
- Keine DB-Migration.
- Keine produktive Aktion ausgefuehrt.


## CAN-26.4

- Reiner Doku-/Sync-Schritt vorbereitet.
- `project-state/NEXT_STEPS.md` bereinigt: direkter naechster Schritt ist jetzt CAN-27.0 Planung.
- Fehlende Live-Handoff-Datei `docs/current/CURRENT_CHAT_HANDOFF_CAN26_3.md` ist in der ZIP enthalten.
- Keine Runtime-Dateien geaendert.
- Keine Backend-Logik geaendert.
- Keine Dashboard-Logik geaendert.
- Keine produktive Aktion ausgefuehrt.

## CAN-26.3

- Dokumentation und Handoff auf abgeschlossenen CAN-26 Stand aktualisiert.
- Dashboard-Sichtpruefung dokumentiert.
- SYSTEME-Bereich ist lesbar.
- Keine langen Detailbloecke in Tabellenzellen sichtbar.
- Overlay-Monitor zeigt 0 Warnungen / 0 Fehler.
- `overlay:frame_overlay` wird in Szene ohne Rahmen korrekt als `EXPECTED_INACTIVE` angezeigt.
- Sicherheitsgrenze weiterhin read-only: keine Aktion wird ausgefuehrt.
- Keine Code-Logik geaendert.
- Keine produktive Aktion ausgefuehrt.

## CAN-26.2

- Overlay-Monitor `client-control/status` um Top-Level-Diagnosefelder ergaenzt.
- Sichtbar sind jetzt u. a.:
  - `currentProgramSceneName`
  - `currentPreviewSceneName`
  - `currentProgramSceneKnown`
  - `sceneAwarenessMode`
  - `inventoryUpdatedAt`
  - `inventoryFromCache`
  - `inventoryFromMemory`
- `overlay_monitor` Version auf 0.1.8 / Status API 1.0.8 erhoeht.
- Keine OBS-Reparatur, kein Source-Refresh, keine DB-Migration.

## CAN-26.1

- Overlay-Monitor Scene-Awareness robuster gemacht.
- `currentProgramSceneName` faellt nicht mehr blind auf `sceneNames[0]` zurueck.
- Bei fehlender/unklarer Program-Szene wird safe-inactive bewertet und kein Overlay automatisch als `activeExpected` markiert.
- `overlay:frame_overlay` wurde in einer Szene ohne Rahmen korrekt als `expected_inactive` getestet.
- `overlay_monitor` Version auf 0.1.7 / Status API 1.0.7 erhoeht.
- Keine produktive Aktion ausgefuehrt.

## CAN-26.0

- GitHub/dev und Live-System bewusst abgeglichen.
- Runtime-relevante Dateien fuer Bus-/Overlay-Diagnose waren identisch.
- Doku-Dateien im Live-System wichen ab bzw. Handoff fehlte dort; Doku-Stand wird mit CAN-26.3 aktualisiert.
- Bus-Diagnose und Overlay-Monitor final gegenprueft.
- Urspruenglicher Befund: Rahmen-Overlay wurde bei unklarer Szenen-/Inventarbewertung als activeExpected behandelt.
- Daraus entstanden CAN-26.1 und CAN-26.2.

## CAN-25.25b

- Bus-Matrix SYSTEME-Bereich im Dashboard wieder wirklich kompakt gemacht.
- Lange Command/ACK-Detailbloecke aus der Tabellenzelle entfernt.
- Anzeige reduziert auf kurze Summary-Werte: ACK/Legacy, Cmd/Contract/Lifecycle, Queue, Overlay online/info/warn/error.
- Visueller Test per Screenshot: SYSTEME-Bereich wieder lesbar.
- Keine Backend-Logik geaendert.
- Keine produktive Aktion ausgefuehrt.

## CAN-25.24

- Dashboard an scene-aware Overlay-Monitor-Felder angepasst.
- Overlay-Monitor Anzeige nutzt activeExpected, expectedInactive, expectedIdle und expectedNotActive.
- Dashboard unterscheidet Info/Idle/Inaktiv von echten Warnungen.
- Erste Version verursachte Layout-Regression im SYSTEME-Bereich; in CAN-25.25b korrigiert.

## CAN-25.22 / CAN-25.23

- Overlay-Monitor Backend scene-aware erweitert.
- Browserquellen, die durch OBS/Szenenaktivitaet erwartbar inaktiv sind, werden nicht mehr als echte Warning behandelt.
- Summary-Felder getrennt:
  - activeExpected
  - expectedInactive
  - expectedIdle
  - expectedNotActive
- Test bestaetigte warning=0 und error=0 bei erwartbar inaktiven/idle Overlays.

## CAN-25.19

- Alert-System Dry-Run Route repariert.
- Fehlender Helper `objectValue` in `backend/modules/alert_system.js` ergaenzt.
- Dry-Run validiert Payload ohne Alert, Sound, Overlay, Queue oder EventBus-Emission auszufuehren.

## CAN-25.17

- Overlay-Monitor Client-Control Zeit-/Risk-Bewertung repariert.
- ISO-Zeitstrings fuer Heartbeats korrekt ausgewertet.
- Thresholds aus `config.thresholds` genutzt.
- Stale/Dead/Risk wieder konsistent.

## CAN-25.15

- Overlay-Monitor `MODULE_VERSION` Fix.
- Unterrouten fuer Client-Control, Classification und Identity-Contract funktionierten danach wieder.

## CAN-25.5 bis CAN-25.13

- Sound-Shadow Summary Card an echte Bus-Matrix Row-Struktur angepasst.
- Sound-Shadow Statusklarheit fuer deaktivierten Auto-Hook ergaenzt.
- Bus-Matrix Systeme, Details, Rohdaten, Sichtfilter und Diagnose-Zusammenfassungen mehrfach verbessert.
- Alert-System und Overlay-Monitor Diagnose-Zusammenfassungen im Dashboard ergaenzt.

## CAN-25.4

- Dokumentation fuer Chatwechsel konsolidiert.
- CAN-25.3 Testergebnis dokumentiert.
- Bekannten Fehler der Sound-Shadow Summary Card dokumentiert.
- TODO, NEXT_STEPS, CURRENT_STATUS und FILES aktualisiert.
- Neue Chat-Handoff-Datei erstellt.
- Keine Code-Logik geaendert.
- Keine produktive Aktion ausgefuehrt.
