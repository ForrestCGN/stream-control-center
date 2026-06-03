# CHANGELOG

## CAN-36.4

- Erfolgreiche Sicht- und Positionstest-Prüfung von CAN-36.3d dokumentiert.
- Bestätigt:
  - Tab-Leiste bleibt direkt unter der Message-Rotator-Kopfkarte.
  - Tabs bleiben: Übersicht | Settings | Items | Nachrichten | Diagnose.
  - Kein zusätzlicher Read-only-Tab.
  - Im Tab Diagnose steht zuerst die normale Diagnose.
  - Darunter kommt die erweiterte Read-only-Diagnose.
  - Keine Start-/Stop-/Tick-/Next-/Manual-/Reload-Aktion ausgelöst.
- Keine Codeänderung in CAN-36.4.

## CAN-36.3d

- Fix für CAN-36.3c:
  - Erweiterte Diagnose wird nicht mehr vor der Tab-Leiste eingefügt.
  - Erweiterte Diagnose wird im vorhandenen Diagnose-Tab hinter der bestehenden Diagnosekarte eingefügt.
- Keine Backend-Änderung.
- Keine produktive Aktion.

## CAN-36.3c

- Erweiterte Message-Rotator Read-only-Diagnose in den vorhandenen Tab `Diagnose` integriert.
- Kein zusätzlicher Tab.
- Neue Dateien:
  - `htdocs/dashboard/modules/message_rotator_diagnostics_ext.js`
  - `htdocs/dashboard/modules/message_rotator_diagnostics_ext.css`

## CAN-36.3b

- Zusätzlicher sichtbarer Message-Rotator-Tab `Read-only` entfernt.
- Grund: Das Modul besitzt bereits einen sichtbaren Tab `Diagnose`.

## CAN-36.2

- Message-Rotator-Modul-Doku ergänzt:
  - `docs/modules/message_rotator.md`
