# Current Chat Handoff - CAN36.3d

## Stand

CAN-36.3d vorbereitet: Fix für die Einfügeposition der erweiterten Message-Rotator-Diagnose.

## Fehler

Die Erweiterung wurde vor der Tab-Leiste eingefügt und hat dadurch die Navigation nach unten gedrückt.

## Fix

Die Erweiterung wird nur im vorhandenen Tab `Diagnose` hinter der bestehenden Diagnosekarte eingefügt.

## Geändert

```text
htdocs/dashboard/modules/message_rotator_diagnostics_ext.js
```

## Nicht geändert

```text
backend/modules/message_rotator.js
htdocs/dashboard/modules/message_rotator.js
```

## Test

```powershell
cd D:\Git\stream-control-center
.\stepdone.cmd "CAN-36.3d Message Rotator Diagnose Position Fix"
```
