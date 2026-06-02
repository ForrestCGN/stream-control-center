# FILES

## Aktueller Arbeitsstand CAN-35.3

Wichtige geaenderte/zuletzt relevante Dateien:

```text
htdocs/dashboard/index.html
htdocs/dashboard/modules/tagebuch_readonly_diagnostics.js
htdocs/dashboard/modules/tagebuch_readonly_diagnostics.css
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/CHANGELOG.md
project-state/FILES.md
docs/current/CURRENT_CHAT_HANDOFF_CAN35_3.md
```

## CAN-35 ZIPs aus dem Chat

```text
CAN-35.2_tagebuch_module_docs_readonly_write_rules.zip
CAN-35.3_tagebuch_dashboard_readonly_diagnostics.zip
```

## Wichtige Sicherheitsnotiz

```text
htdocs/dashboard/modules/tagebuch.js bleibt unverändert.
backend/modules/tagebuch.js bleibt unverändert.
Die neue Karte nutzt nur read-only GET-Routen.
Kein MutationObserver.
Kein Dauer-Rendering.
```

## Prüfung

```text
Dashboard > Tagebuch
Tabs: Übersicht | Settings | Texte | Statistik | Diagnose
Tagebuch Read-only Diagnose nur im Diagnose-Tab sichtbar.
Diagnose in mehrere Abschnitte/Karten getrennt.
```

## Lokale Pfade

```text
Repo: D:\Git\stream-control-center
Live: D:\Streaming\stramAssets
Tagebuch Backend: D:\Streaming\stramAssets\backend\modules\tagebuch.js
Tagebuch Dashboard: D:\Streaming\stramAssets\htdocs\dashboard\modules\tagebuch.js
```
