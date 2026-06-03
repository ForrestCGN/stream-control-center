# FILES

## Aktueller Arbeitsstand CAN-36.4

Wichtige geaenderte/zuletzt relevante Dateien:

```text
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/CHANGELOG.md
project-state/FILES.md
docs/current/CURRENT_CHAT_HANDOFF_CAN36_4.md
```

## CAN-36 ZIPs aus dem Chat

```text
CAN-36.2_message_rotator_module_docs_readonly_write_rules.zip
CAN-36.3_message_rotator_dashboard_readonly_diagnostics.zip
CAN-36.3b_message_rotator_remove_extra_readonly_tab.zip
CAN-36.3c_message_rotator_integrate_existing_diagnose.zip
CAN-36.3d_message_rotator_diagnose_insert_position_fix.zip
CAN-36.4_document_message_rotator_diagnose_position_test.zip
```

## CAN-36 relevante Runtime-/Dashboard-Dateien

```text
docs/modules/message_rotator.md
htdocs/dashboard/index.html
htdocs/dashboard/modules/message_rotator.js
htdocs/dashboard/modules/message_rotator.css
htdocs/dashboard/modules/message_rotator_diagnostics_ext.js
htdocs/dashboard/modules/message_rotator_diagnostics_ext.css
```

CAN-36.4 selbst ändert keine Runtime-/Dashboard-Datei.

## Bestätigter CAN-36.3d Sichttest

```text
Dashboard > Message-Rotator
Tab-Leiste bleibt direkt unter der Message-Rotator-Kopfkarte.
Tabs: Übersicht | Settings | Items | Nachrichten | Diagnose.
Kein Read-only-Tab.
Im Tab Diagnose steht zuerst die normale Diagnose.
Darunter kommt die erweiterte Read-only-Diagnose.
Keine produktive Aktion ausgelöst.
```

## Sicherheitsnotiz

```text
Keine Message.
Kein Rotator-Start/Stop.
Kein Tick.
Kein Next/Manual.
Keine Preview.
Kein Reload.
Keine Live-Status-Force-Abfrage.
Keine Settings-/Textvarianten-Änderung.
Keine DB-Migration.
Keine Twitch-/Chat-Nachricht.
Keine OBS-/Sound-/Queue-Aktion.
```

## Lokale Pfade

```text
Repo: D:\Git\stream-control-center
Live: D:\Streaming\stramAssets
Message-Rotator Backend: D:\Streaming\stramAssets\backend\modules\message_rotator.js
Message-Rotator Dashboard: D:\Streaming\stramAssets\htdocs\dashboard\modules\message_rotator.js
```
