# CAN-44.6.1 AutoShoutout Tab Stability Hotfix

Stream-sicherer Hotfix gegen wechselnd sichtbaren Auto-Shoutout-Tab.

## Ursache
Der normale Shoutout-Dashboard-Auto-Refresh rendert die Tab-Leiste neu. Der Auto-Shoutout-Tab wurde danach erneut ergänzt, wodurch er im Wechsel sichtbar/unsichtbar war.

## Änderung
- AutoShoutout bleibt als Tab im Shoutout-System.
- Kein MutationObserver.
- Solange das Shoutout-System geöffnet ist, wird der Haupt-Auto-Refresh des Shoutout-Dashboards pausiert, damit die Tab-Leiste nicht neu aufgebaut wird.
- Der AutoShoutout-eigene Refresh bleibt aktiv und pausiert weiterhin bei Formularbearbeitung.
- Manuelles Aktualisieren im Shoutout-Dashboard bleibt möglich.

## Dateien
- htdocs/dashboard/modules/auto_shoutout.js

## Test
```powershell
node -c htdocs\dashboard\modules\auto_shoutout.js
.\stepdone.cmd "CAN-44.6.1 AutoShoutout Tab Stability Hotfix"
```
