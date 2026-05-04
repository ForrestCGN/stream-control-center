# STEP026 - VIP Twitch-Rollenhelper

Stand: 2026-05-04

## Ziel

`!vip @araglor` soll automatisch als Mod-Sound verarbeitet werden, wenn Twitch den Zieluser als Moderator des Kanals erkennt.

Die lokale Datei `config/vip_sound_roles.json` bleibt erhalten, aber nur noch als Fallback/Override, falls die Twitch-Abfrage nicht möglich ist oder bewusst lokale Zuordnung gebraucht wird.

## Geänderte Dateien

- `backend/modules/vip_sound_overlay.js`
- `backend/modules/helpers/helper_twitch_roles.js`
- `config/vip_sound_roles.json`
- `project-state/CURRENT_STATUS.md`
- `project-state/NEXT_STEPS.md`
- `project-state/FILES.md`
- `project-state/CHANGELOG.md`

## VIP-Modul

`backend/modules/vip_sound_overlay.js` wurde auf Version `1.7.4` vorbereitet.

Änderungen:

- Import von `./helpers/helper_twitch_roles`
- `detectSoundTypeForTarget()` ist jetzt `async`
- Bei Target-Erkennung wird zuerst Twitch geprüft
- Wenn Twitch `true` liefert, wird `soundType = "mod"`
- Wenn Twitch `false` liefert, bleibt der angefragte Typ erhalten, außer lokale Config greift
- Wenn Twitch `null` liefert, greift weiterhin `config/vip_sound_roles.json`

## Neuer Helper

`backend/modules/helpers/helper_twitch_roles.js`

Aufgaben:

- `TWITCH_CLIENT_ID` aus ENV lesen
- User-Token aus `D:/Streaming/stramAssets/secrets/tokens/twitch_user.json` lesen
- `TWITCH_BROADCASTER_ID` nutzen, Fallback `127709954`
- Target-Login über `/helix/users` zu User-ID auflösen
- Moderatorstatus über `/helix/moderation/moderators` prüfen
- Ergebnisse 10 Minuten cachen
- Rückgabe:
  - `true` = Target ist Moderator
  - `false` = Target ist kein Moderator
  - `null` = Twitch-Prüfung nicht möglich

## Fallback-Config

`config/vip_sound_roles.json` bleibt aktiv.

Aktueller Inhalt enthält `araglor` weiterhin unter `mods`. Das ist bewusst so, damit der bisherige Workaround als Fallback erhalten bleibt.

## Voraussetzungen

Der User-Token muss den Scope `moderation:read` haben.

Token-Datei:

```text
D:\Streaming\stramAssets\secrets\tokens\twitch_user.json
```

Diese Datei darf nicht angezeigt, nicht hochgeladen und nicht committed werden.

## Test nach Deploy

```powershell
Set-Location "D:\Streaming\stramAssets"

Invoke-RestMethod "http://127.0.0.1:8080/api/vip-sound/status" | ConvertTo-Json -Depth 20
Invoke-RestMethod "http://127.0.0.1:8080/api/sound/status" | ConvertTo-Json -Depth 20
```

Dann im Twitch-Chat:

```text
!vip @araglor
```

Erwartung während Sound läuft:

```text
sound_system.current.category = crew
sound_system.current.visual.module = vip_sound_overlay
sound_system.current.visual.type = mod
sound_system.current.visual.title = Mod-Sound
```

## Validierung

Vor Commit:

```powershell
Set-Location "D:\Git\stream-control-center"

node -c ".\backend\modules\helpers\helper_twitch_roles.js"
node -c ".\backend\modules\vip_sound_overlay.js"

git diff -- backend\modules\vip_sound_overlay.js backend\modules\helpers\helper_twitch_roles.js config\vip_sound_roles.json project-state\STEP026_VIP_TWITCH_ROLE_HELPER_2026-05-04.md project-state\CURRENT_STATUS.md project-state\NEXT_STEPS.md project-state\FILES.md project-state\CHANGELOG.md
```

## Commit-Vorschlag

```powershell
git add backend\modules\vip_sound_overlay.js backend\modules\helpers\helper_twitch_roles.js config\vip_sound_roles.json project-state\STEP026_VIP_TWITCH_ROLE_HELPER_2026-05-04.md project-state\CURRENT_STATUS.md project-state\NEXT_STEPS.md project-state\FILES.md project-state\CHANGELOG.md

git commit -m "feat: detect VIP target moderator role via Twitch"
git push origin dev
```

## Rollback

Falls der Live-Test Probleme macht:

```powershell
git checkout -- backend\modules\vip_sound_overlay.js backend\modules\helpers\helper_twitch_roles.js config\vip_sound_roles.json project-state\CURRENT_STATUS.md project-state\NEXT_STEPS.md project-state\FILES.md project-state\CHANGELOG.md
```

Danach Backend aus letztem stabilen Stand deployen/neustarten.
