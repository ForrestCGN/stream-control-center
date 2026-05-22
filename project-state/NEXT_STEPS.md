# NEXT_STEPS

## Direkt nach STEP273A

1. ZIP nach `D:\Git\stream-control-center` entpacken.
2. Hook anwenden:

```bat
node tools\easy\STEP273A_APPLY_TWITCH_PRESENCE_COMMAND_HOOK.cjs
```

3. Syntax prüfen:

```bat
node --check backend\modules\commands.js
node --check backend\modules\twitch_presence.js
node --check tools\easy\STEP273A_APPLY_TWITCH_PRESENCE_COMMAND_HOOK.cjs
```

4. Backend neu starten.

5. API prüfen:

```bat
curl "http://127.0.0.1:8080/api/commands/status"
curl "http://127.0.0.1:8080/api/commands/list"
curl "http://127.0.0.1:8080/api/commands/test?message=!rip%20@ForrestCGN&user=forrestcgn"
curl "http://127.0.0.1:8080/api/commands/test?message=!dcount%20show&user=forrestcgn&role=mod"
```

6. Danach im Twitch-Chat vorsichtig testen:

```text
!tode
!rip @ForrestCGN
```

## STEP273B – Dashboard

- Dashboard-Modul `commands` aktivieren.
- `htdocs/dashboard/modules/commands.js` ergänzen.
- `htdocs/dashboard/modules/commands.css` ergänzen.
- `htdocs/dashboard/index.html` um CSS/JS/Panel erweitern.
- `htdocs/dashboard/app.js` um aktives Commands-Modul erweitern.
- Commands editierbar machen:
  - aktiv/inaktiv
  - Trigger
  - Aliase
  - Modul/Ziel
  - Permission-Level
  - Cooldowns
  - Testausführung

## Spätere sinnvolle Steps

- Hug/Clip/TTS/SoundAlerts ebenfalls über Command-Registry anbinden.
- Streamer.bot-Commands schrittweise deaktivieren.
- Rechte-/Rollen-System mit Dashboard-Userverwaltung koppeln.
- Command-Antworttexte über DB-Textvarianten dashboardfähig machen.
