# Current System Status – stream-control-center

Stand: 2026-05-18

## Loyalty / Kekskrümel

Loyalty läuft im Shadow-Modus. Aktuelle Version: `0.1.10`.

STEP207 ergänzt AutoRunner Boot Recovery:

- Stream-State liegt persistent in der Datenbank.
- AutoRunner-Timer liegt nur im Node-Prozessspeicher.
- Wenn Node/Backend während eines aktiven Streams neu startet, prüft Loyalty beim Modul-Init den gespeicherten Stream-State.
- Wenn `effective.live = true` und `autoRunner.startOnStreamStateStart = true`, wird der AutoRunner automatisch wieder gestartet.
- Recovery wird über `runner_auto_started_on_boot_live_state` geloggt.

Bewusst unverändert:

- Watch-Punkte-Logik
- Event-Boni
- GiftSub/GiftBomb-Verhalten
- Sub/Resub-Dedupe
- DB-Schema
- Twitch-API Auto-Offline-Stop

## DeathCounter V2

Der DeathCounter V2 ist auf produktiven DB-Storage umgestellt und als stabil bestätigt.

Aktiver Zustand:

- `activeStorage: database`
- `dualWriteEnabled: false`
- JSON nur noch manuell per Backup/Export
- `!dcount backup` erstellt Timestamp-Backup
- `!dcount export` schreibt die Haupt-JSON aus dem aktuellen DB-Stand

Overlay:

- `_overlay-deathcounter-v2.html` nutzt weiterhin `/api/deathcounter/v2/state` und `/api/deathcounter/v2/overlay`.
- STEP262 hat den DeathCounter optisch an den Alert-Außenrahmen angepasst.
- STEP263 hat die Slide-/Fade-Transition minimal verlangsamt.
- Keine Overlay-Funktionalität wurde entfernt.
