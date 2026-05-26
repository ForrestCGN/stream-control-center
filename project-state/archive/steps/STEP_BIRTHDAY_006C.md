# STEP_BIRTHDAY_006C – Overlay Intro Hide + Chat Command Fallback

## Ziel

- Birthday-Overlay bleibt während der Intro-Video-Phase komplett unsichtbar.
- Overlay blendet erst bei `phase=party` ein.
- `!birthday set 16.08.1974` und weitere Birthday-Commands bekommen einen zusätzlichen Chat-Fallback, falls der zentrale Command-Hook im Twitch-Chat nicht bis zum Modul durchreicht.

## Geändert

- `htdocs/overlays/_overlay-birthday.html`
- `backend/modules/birthday.js`

## Wichtig

Die Sound-System-/Queue-/Bundle-Logik bleibt unverändert. Der Fallback greift nur, wenn der zentrale Command-Handler den Birthday-Command nicht bereits verarbeitet hat.

## Tests

```powershell
node --check backend\modules\birthday.js
Invoke-RestMethod "http://127.0.0.1:8080/api/birthday/status"
```

Live-Chat-Test:

```text
!birthday set 16.08.1974
!birthday show
```
