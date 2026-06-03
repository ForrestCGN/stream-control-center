# CURRENT_STATUS

## Stand: CAN-36.3d vorbereitet

CAN-36.3d behebt die Einfügeposition der Message-Rotator-Diagnose-Erweiterung.

## Fehlerbild

Die erweiterte Diagnose wurde vor der Tab-Leiste eingefügt. Dadurch rutschte die Navigation nach unten.

## Fix

Die Erweiterung wird jetzt nur noch im vorhandenen Tab `Diagnose` hinter der bestehenden Diagnosekarte eingefügt.

## Geändert

```text
htdocs/dashboard/modules/message_rotator_diagnostics_ext.js
project-state/*
docs/current/CURRENT_CHAT_HANDOFF_CAN36_3d.md
```

Nicht geändert:

```text
backend/modules/message_rotator.js
htdocs/dashboard/modules/message_rotator.js
```
