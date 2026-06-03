# FILES

## Aktueller Arbeitsstand CAN-36.3b

Wichtige geaenderte/zuletzt relevante Dateien:

```text
htdocs/dashboard/index.html
htdocs/dashboard/modules/message_rotator_readonly_diagnostics.js
htdocs/dashboard/modules/message_rotator_readonly_diagnostics.css
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/CHANGELOG.md
project-state/FILES.md
docs/current/CURRENT_CHAT_HANDOFF_CAN36_3b.md
```

## CAN-36 ZIPs aus dem Chat

```text
CAN-36.2_message_rotator_module_docs_readonly_write_rules.zip
CAN-36.3_message_rotator_dashboard_readonly_diagnostics.zip
CAN-36.3b_message_rotator_remove_extra_readonly_tab.zip
```

## Zielzustand Dashboard

```text
Dashboard > Message-Rotator
Tabs: Übersicht | Settings | Items | Nachrichten | Diagnose
Kein zusätzlicher Read-only-Tab.
```

## Sicherheitsnotiz

```text
backend/modules/message_rotator.js bleibt unverändert.
htdocs/dashboard/modules/message_rotator.js bleibt unverändert.
Keine Message.
Kein Start/Stop.
Kein Tick.
Kein Next/Manual.
Keine Preview.
Kein Reload.
Keine Live-Status-Force-Abfrage.
Keine Settings-/Textvarianten-Änderung.
Keine DB-Migration.
```
