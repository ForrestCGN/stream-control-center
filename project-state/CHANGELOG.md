# CHANGELOG

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
