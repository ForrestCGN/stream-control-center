# CURRENT_SYSTEM_STATUS – STEP396_APPEND

## Alert Direct Overlay Stable

Bestätigter Status aus STEP394/STEP395:

- `/overlays/_overlay-alerts-v2.html` ist erreichbar.
- `overlayClients=1`.
- `alert_overlay_v2_shadow` ist als Communication-Bus-Client online.
- `BridgeClientOnline=False`.
- OverlayWatchdog: `issues=0`, `missingFinishAck=0`, `noClient=0`.
- CommunicationWatchdog: `issueCount=0`.

## Commit-Sicherheit

Der Repo-Status enthält alte Diagnose-, Backup- und Bridge-Testdateien. Vor Commit darf nicht breit gestaged werden.

Ausschließen:

- `_trace/`
- `*.bak`
- `*.step*.bak`
- `STEP386*` außer wenn ausdrücklich als verworfen dokumentiert
- `_overlay-alerts-v2-bus.html` als produktive Änderung
- ZIP/7z/DB/Secrets/Tokens

