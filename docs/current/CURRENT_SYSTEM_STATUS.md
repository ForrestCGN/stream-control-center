# Current System Status – stream-control-center

Stand: 2026-05-20

## STEP238 - Message-Rotator Output-Mode

Aktueller Zusatzstand:

- Message-Rotator kann die Ausgabeart jetzt konfigurierbar liefern:
  - `chat`
  - `announcement`
- Globale Settings:
  - `messageOptions.outputMode`
  - `messageOptions.announcementColor`
- Item-Overrides:
  - `items[].outputMode`
  - `items[].announcementColor`
- Dashboard kann Ausgabeart und Announcement-Farbe bearbeiten.
- `/api/message-rotator/next` und `/api/message-rotator/manual` liefern Streamer.bot-Steuerfelder:
  - `streamerbot_action`
  - `streamerbot_output_mode`
  - `streamerbot_announcement_color`
  - `streamerbot_message`
- Bestehender Default bleibt `chat`.
- Das Backend sendet in diesem STEP keine Announcement selbst; Streamer.bot muss anhand der Response normal senden oder Announcement senden.
- Keine DB-Datei, keine Config-Datei und keine anderen Module wurden geaendert.

# Current System Status – stream-control-center

Stand: 2026-05-18

## Loyalty / Kekskrümel

Loyalty läuft im Shadow-Modus. Aktuelle Version: `0.1.11`.

### AutoRunner / Stream-State

STEP207 ergänzt AutoRunner Boot Recovery:

- Stream-State liegt persistent in der Datenbank.
- AutoRunner-Timer liegt nur im Node-Prozessspeicher.
- Wenn Node/Backend während eines aktiven Streams neu startet, prüft Loyalty beim Modul-Init den gespeicherten Stream-State.
- Wenn `effective.live = true` und `autoRunner.startOnStreamStateStart = true`, wird der AutoRunner automatisch wieder gestartet.
- Recovery wird über `runner_auto_started_on_boot_live_state` geloggt.

### Subscribe/Resub-Dedupe

STEP208 ergänzt Subscribe/Resub-Dedupe:

- Twitch kann bei einem echten Resub kurz nacheinander `subscribe` und `resub` liefern.
- Wenn ein `resub` innerhalb des konfigurierten Fensters nach einem `subscribe` für denselben User/Provider/Tier kommt, wird der Subscribe kompensiert.
- Standard-Zeitfenster: 60 Sekunden.
- Der vorherige Subscribe wird als `replaced_by_resub` markiert.
- Eine negative `event_dedupe_adjustment`-Transaktion gleicht die Subscribe-Punkte aus.
- Der Resub bleibt normal verarbeitet.

Bewusst unverändert:

- Watch-Punkte-Logik
- GiftSub/GiftBomb-Verhalten
- Runner-/Stream-State-Start/Stop-Logik aus STEP207
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
